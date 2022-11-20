/**
 * Parse the tree definition into an array of raw tokens.
 * @param definition The definition.
 * @returns An array of tokens parsed from the definition.
 */
export function parseTokensFromDefinition(definition) {
    // Add some space around various important characters so that they can be plucked out easier as individual tokens.
    definition = definition.replace(/\(/g, " ( ");
    definition = definition.replace(/\)/g, " ) ");
    definition = definition.replace(/\{/g, " { ");
    definition = definition.replace(/\}/g, " } ");
    definition = definition.replace(/\]/g, " ] ");
    definition = definition.replace(/\[/g, " [ ");
    definition = definition.replace(/\,/g, " , ");

    // Split the definition into raw token form and return it.
    return definition.replace(/\s+/g, " ").trim().split(" ");
}

/**
 * Pop the next raw token off of the stack and throw an error if it wasn't the expected one.
 * @param tokens The array of remaining tokens.
 * @param expected An optional string or array or items, one of which must match the next popped token.
 * @returns The popped token.
 */
export function popAndCheck(tokens, expected) {
    // Get and remove the next token.
    const popped = tokens.shift();

    // We were expecting another token.
    if (popped === undefined) {
        throw new Error("unexpected end of definition");
    }

    // Do we have an expected token/tokens array?
    if (expected !== undefined) {
        // Check whether the popped token matches at least one of our expected items.
        var tokenMatchesExpectation = [].concat(expected).some((item) => popped.toUpperCase() === item.toUpperCase());

        // Throw an error if the popped token didn't match any of our expected items.
        if (!tokenMatchesExpectation) {
            const expectationString = []
                .concat(expected)
                .map((item) => "'" + item + "'")
                .join(" or ");
            throw new Error("unexpected token found. Expected " + expected + " but got '" + popped + "'");
        }
    }

    // Return the popped token.
    return popped;
}

/**
 * Pull an argument definition list off of the token stack.
 * @param tokens The array of remaining tokens.
 * @param stringArgumentPlaceholders The mapping of string literal node argument placeholders to original values.
 * @param argumentValidator The argument validator function.
 * @param validationFailedMessage  The exception message to throw if argument validation fails.
 * @returns The argument definition list.
 */
export function getArguments(tokens, stringArgumentPlaceholders, argumentValidator, validationFailedMessage) {
    // Any lists of arguments will always be wrapped in '[]' for node arguments or '()' for decorator arguments.
    // We are looking for a '[' or '(' opener that wraps the argument tokens and the relevant closer.
    const closer = popAndCheck(tokens, ["[", "("]) === "[" ? "]" : ")";

    const argumentListTokens = [];
    const argumentList = [];

    // Grab all tokens between the '[' and ']' or '(' and ')'.
    while (tokens.length && tokens[0] !== closer) {
        // The next token is part of our arguments list.
        argumentListTokens.push(tokens.shift());
    }

    // Validate the order of the argument tokens. Each token must either be a ',' or a single argument that satisfies the validator.
    argumentListTokens.forEach((token, index) => {
        // Get whether this token should be an actual argument.
        const shouldBeArgumentToken = !(index & 1);

        // If the current token should be an actual argument then validate it,otherwise it should be a ',' token.
        if (shouldBeArgumentToken) {
            // Get the argument definition.
            const argumentDefinition = getArgumentDefinition(token, stringArgumentPlaceholders);

            // Try to validate the argument.
            if (argumentValidator && !argumentValidator(argumentDefinition)) {
                throw new Error(validationFailedMessage);
            }

            // This is a valid argument!
            argumentList.push(argumentDefinition);
        } else {
            // The current token should be a ',' token.
            if (token !== ",") {
                throw new Error(`invalid argument list, expected ',' or ']' but got '${token}'`);
            }
        }
    });

    // The arguments list should terminate with a ']' or ')' token, depending on the opener.
    popAndCheck(tokens, closer);

    // Return the argument list.
    return argumentList;
}

/**
 * Gets an argument value definition.
 * @param token The argument token.
 * @param stringArgumentPlaceholders The mapping of string literal node argument placeholders to original values.
 * @returns An argument value definition.
 */
function getArgumentDefinition(token, stringArgumentPlaceholders) {
    // Check whether the token represents a null value.
    if (token === "null") {
        return {
            value: null,
            type: "null",
            toString: function () {
                return this.value;
            }
        };
    }

    // Check whether the token represents a boolean value.
    if (token === "true" || token === "false") {
        return {
            value: token === "true",
            type: "boolean",
            toString: function () {
                return this.value;
            }
        };
    }

    // Check whether the token represents a number value.
    if (!isNaN(token)) {
        return {
            value: parseFloat(token, 10),
            isInteger: parseFloat(token, 10) === parseInt(token, 10),
            type: "number",
            toString: function () {
                return this.value;
            }
        };
    }

    // Check whether the token is a placeholder (e.g. @@0@@) representing a string literal.
    if (token.match(/^@@\d+@@$/g)) {
        return {
            value: stringArgumentPlaceholders[token].replace('\\"', '"'),
            type: "string",
            toString: function () {
                return '"' + this.value + '"';
            }
        };
    }

    // The only remaining option is that the argument value is an identifier.
    return {
        value: token,
        type: "identifier",
        toString: function () {
            return this.value;
        }
    };
}
