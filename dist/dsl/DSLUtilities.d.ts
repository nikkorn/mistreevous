/**
 * Pop the next raw token from the specified array of tokens and throw an error if it wasn't the expected one.
 * @param tokens The array of tokens.
 * @param expected An optional string or array or items, one of which must match the next popped token.
 * @returns The popped token.
 */
export declare function popAndCheck(tokens: string[], expected?: string | string[]): string;
