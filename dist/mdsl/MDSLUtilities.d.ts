/**
 * A type defining an object that holds a reference to substituted string literals parsed from the definition.
 */
export type StringLiteralPlaceholders = {
    [key: string]: string;
};
/**
 * An object representing the result of tokenising an MDSL definition.
 */
export type TokeniseResult = {
    /**
     * The array of tokens parsed from the definition.
     */
    tokens: string[];
    placeholders: StringLiteralPlaceholders;
};
/**
 * Pop the next raw token from the specified array of tokens and throw an error if it wasn't the expected one.
 * @param tokens The array of tokens.
 * @param expected An optional string or array or items, one of which must match the next popped token.
 * @returns The popped token.
 */
export declare function popAndCheck(tokens: string[], expected?: string | string[]): string;
/**
 * Parse the MDSL definition into an array of raw tokens.
 * @param definition The MDSL definition.
 * @returns An object representing the result of tokenising the MDSL definition.
 */
export declare function tokenise(definition: string): TokeniseResult;
