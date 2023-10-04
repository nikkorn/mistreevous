import { StringLiteralPlaceholders } from "./MDSLUtilities";
export type Argument<T> = {
    /** The argument value. */
    value: T;
    /** The argument type, used for validation. */
    type: string;
};
export type NullArgument = Argument<null> & {
    type: "null";
};
export type BooleanArgument = Argument<boolean> & {
    type: "boolean";
};
export type NumberArgument = Argument<number> & {
    type: "number";
    isInteger: boolean;
};
export type StringPlaceholderArgument = Argument<string> & {
    type: "string";
};
export type IdentifierArgument = Argument<string> & {
    type: "identifier";
};
export type AnyArgument = NullArgument | BooleanArgument | NumberArgument | StringPlaceholderArgument | IdentifierArgument;
/**
 * Parse an array of argument definitions from the specified tokens array.
 * @param tokens The array tokens to parse the argument definitions from.
 * @param stringArgumentPlaceholders The mapping of string literal node argument placeholders to original values.
 * @param argumentValidator The argument validator function.
 * @param validationFailedMessage  The exception message to throw if argument validation fails.
 * @returns An array of argument definitions parsed from the specified tokens array.
 */
export declare function parseArgumentTokens(tokens: string[], stringArgumentPlaceholders: StringLiteralPlaceholders): AnyArgument[];
