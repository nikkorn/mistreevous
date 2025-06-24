import { AnyArgument } from "./MDSLArguments";
import { StringLiteralPlaceholders, popAndCheck } from "./MDSLUtilities";

/**
 * Parse an array of argument definitions from the specified tokens array.
 * @param tokens The array tokens to parse the argument definitions from.
 * @param stringArgumentPlaceholders The mapping of string literal node argument placeholders to original values.
 * @param argumentValidator The argument validator function.
 * @param validationFailedMessage  The exception message to throw if argument validation fails.
 * @returns An array of argument definitions parsed from the specified tokens array.
 */
export function parseArgumentTokens(
    tokens: string[],
    stringArgumentPlaceholders: StringLiteralPlaceholders
): AnyArgument[] {
    const argumentList: AnyArgument[] = [];

    // If the next token is not a '[' or '(' then we have no arguments to parse.
    if (!["[", "("].includes(tokens[0])) {
        return argumentList;
    }

    // Any lists of arguments will always be wrapped in '[]' for node arguments or '()' for attribute arguments.
    // We are looking for a '[' or '(' opener that wraps the argument tokens and the relevant closer.
    const closingToken = popAndCheck(tokens, ["[", "("]) === "[" ? "]" : ")";

    const argumentListTokens: string[] = [];

    // Grab all tokens between the '[' and ']' or '(' and ')'.
    while (tokens.length && tokens[0] !== closingToken) {
        // The next token is part of our arguments list.
        argumentListTokens.push(tokens.shift()!);
    }

    // Validate the order of the argument tokens. Each token must either be a ',' or a single argument that satisfies the validator.
    argumentListTokens.forEach((token, index) => {
        // Get whether this token should be an actual argument.
        const shouldBeArgumentToken = !(index & 1);

        // If the current token should be an actual argument then validate it, otherwise it should be a ',' token.
        if (shouldBeArgumentToken) {
            // Get the argument definition.
            const argumentDefinition = getArgumentDefinition(token, stringArgumentPlaceholders);

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
    popAndCheck(tokens, closingToken);

    // Return the arguments.
    return argumentList;
}

/**
 * Gets an argument value definition.
 * @param token The argument token.
 * @param stringArgumentPlaceholders The mapping of string literal node argument placeholders to original values.
 * @returns An argument value definition.
 */
function getArgumentDefinition(token: string, stringArgumentPlaceholders: StringLiteralPlaceholders): AnyArgument {
    // Check whether the token represents a null value.
    if (token === "null") {
        return {
            value: null,
            type: "null"
        };
    }

    // Check whether the token represents a boolean value.
    if (token === "true" || token === "false") {
        return {
            value: token === "true",
            type: "boolean"
        };
    }

    // Check whether the token represents a number value.
    // TODO: Relies on broken isNaN - see MDN.
    // if (!Number.isNaN(token)) {
    if (!isNaN(token as any)) {
        return {
            value: parseFloat(token),
            isInteger: parseFloat(token) === parseInt(token, 10),
            type: "number"
        };
    }

    // Check whether the token is a placeholder (e.g. @@0@@) representing a string literal.
    if (token.match(/^@@\d+@@$/g)) {
        return {
            value: stringArgumentPlaceholders[token].replace('\\"', '"'),
            type: "string"
        };
    }

    // Check whether the token is a valid javascript identifier with the '$' prefix (e.g. $someProperty, $another_Property_123) which references an agent property.
    if (token.match(/^\$[_a-zA-Z][_a-zA-Z0-9]*/g)) {
        return {
            // The value is the identifier name with the '$' prefix removed.
            value: token.slice(1),
            type: "property_reference"
        };
    }

    // The only remaining option is that the argument value is an identifier.
    return {
        value: token,
        type: "identifier"
    };
}
