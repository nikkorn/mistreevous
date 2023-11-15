/**
 * A type defining an object that holds a reference to substitued string literals parsed from the definition.
 */
export type StringLiteralPlaceholders = {
    [key: string]: string;
};
/**
 * Pop the next raw token from the specified array of tokens and throw an error if it wasn't the expected one.
 * @param tokens The array of tokens.
 * @param expected An optional string or array or items, one of which must match the next popped token.
 * @returns The popped token.
 */
export declare function popAndCheck(tokens: string[], expected?: string | string[]): string;
/**
 * Swaps out any node/attribute argument string literals with placeholders.
 * @param definition The definition.
 * @returns An object containing a mapping of placeholders to original string values as well as the processed definition string.
 */
export declare function substituteStringLiterals(definition: string): {
    placeholders: StringLiteralPlaceholders;
    processedDefinition: string;
};
/**
 * Parse the tree definition into an array of raw tokens.
 * @param definition The definition.
 * @returns An array of tokens parsed from the definition.
 */
export declare function parseTokensFromDefinition(definition: string): string[];
