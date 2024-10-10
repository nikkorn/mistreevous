/**
 * A type defining an object that holds a reference to substituted string literals parsed from the definition.
 */
export type StringLiteralPlaceholders = { [key: string]: string };

/**
 * An object representing the result of tokenising an MDSL definition.
 */
export type TokeniseResult = {
    /**
     * The array of tokens parsed from the definition.
     */
    tokens: string[];
    /*
     * An object that holds a reference to substituted string literals parsed from the definition.
     */
    placeholders: StringLiteralPlaceholders;
};

/**
 * Pop the next raw token from the specified array of tokens and throw an error if it wasn't the expected one.
 * @param tokens The array of tokens.
 * @param expected An optional string or array or items, one of which must match the next popped token.
 * @returns The popped token.
 */
export function popAndCheck(tokens: string[], expected?: string | string[]): string {
    // Get and remove the next token.
    const popped = tokens.shift();

    // We were expecting another token but there aren't any.
    if (popped === undefined) {
        throw new Error("unexpected end of definition");
    }

    // Do we have an expected token/tokens array?
    if (expected != undefined) {
        // Get an array of expected values, if the popped token matches any then we are all good.
        const expectedValues = typeof expected === "string" ? [expected] : expected;

        // Check whether the popped token matches at least one of our expected items.
        const tokenMatchesExpectation = expectedValues.some((item) => popped.toUpperCase() === item.toUpperCase());

        // Throw an error if the popped token didn't match any of our expected items.
        if (!tokenMatchesExpectation) {
            const expectationString = expectedValues.map((item) => "'" + item + "'").join(" or ");
            throw new Error("unexpected token found. Expected " + expectationString + " but got '" + popped + "'");
        }
    }

    // Return the popped token.
    return popped;
}

/**
 * Parse the MDSL definition into an array of raw tokens.
 * @param definition The MDSL definition.
 * @returns An object representing the result of tokenising the MDSL definition.
 */
export function tokenise(definition: string): TokeniseResult {
    // Clean the definition by removing any comments.
    definition = definition.replace(/\/\*(.|\n)*?\*\//g, "");

    // Swap out any node/attribute argument string literals with a placeholder and get a mapping of placeholders to original values as well as the processed definition.
    const { placeholders, processedDefinition } = substituteStringLiterals(definition);

    // Add some space around various important characters so that they can be plucked out easier as individual tokens.
    definition = processedDefinition.replace(/\(/g, " ( ");
    definition = definition.replace(/\)/g, " ) ");
    definition = definition.replace(/\{/g, " { ");
    definition = definition.replace(/\}/g, " } ");
    definition = definition.replace(/\]/g, " ] ");
    definition = definition.replace(/\[/g, " [ ");
    definition = definition.replace(/,/g, " , ");

    return {
        // Split the definition into raw token form.
        tokens: definition.replace(/\s+/g, " ").trim().split(" "),
        // The placeholders for string literals that were found in the definition.
        placeholders
    };
}

/**
 * Swaps out any node/attribute argument string literals with placeholders.
 * @param definition The definition.
 * @returns An object containing a mapping of placeholders to original string values as well as the processed definition string.
 */
function substituteStringLiterals(definition: string): {
    placeholders: StringLiteralPlaceholders;
    processedDefinition: string;
} {
    // Create an object to hold the mapping of placeholders to original string values.
    const placeholders: StringLiteralPlaceholders = {};

    // Replace any string literals wrapped with double quotes in our definition with placeholders to be processed later.
    const processedDefinition = definition.replace(/"(\\.|[^"\\])*"/g, (match) => {
        const strippedMatch = match.substring(1, match.length - 1);
        let placeholder = Object.keys(placeholders).find((key) => placeholders[key] === strippedMatch);

        // If we have no existing string literal match then create a new placeholder.
        if (!placeholder) {
            placeholder = `@@${Object.keys(placeholders).length}@@`;
            placeholders[placeholder] = strippedMatch;
        }

        return placeholder;
    });

    return { placeholders, processedDefinition };
}
