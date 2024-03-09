import { StringLiteralPlaceholders } from "./MDSLUtilities";
/**
 * A type representing any node function argument.
 */
type Argument<T> = {
    /**
     * The argument value.
     */
    value: T;
    /**
     * The argument type, used for validation.
     */
    type: string;
};
type NullArgument = Argument<null> & {
    type: "null";
};
type BooleanArgument = Argument<boolean> & {
    type: "boolean";
};
type NumberArgument = Argument<number> & {
    type: "number";
    /**
     * A flag defining whether the number argument value is a valid integer. (used for validation)
     */
    isInteger: boolean;
};
type StringPlaceholderArgument = Argument<string> & {
    type: "string";
};
type IdentifierArgument = Argument<string> & {
    type: "identifier";
};
/**
 * A type representing a reference to any node function argument.
 */
type AnyArgument = NullArgument | BooleanArgument | NumberArgument | StringPlaceholderArgument | IdentifierArgument;
/**
 * Parse an array of argument definitions from the specified tokens array.
 * @param tokens The array tokens to parse the argument definitions from.
 * @param stringArgumentPlaceholders The mapping of string literal node argument placeholders to original values.
 * @param argumentValidator The argument validator function.
 * @param validationFailedMessage  The exception message to throw if argument validation fails.
 * @returns An array of argument definitions parsed from the specified tokens array.
 */
export declare function parseArgumentTokens(tokens: string[], stringArgumentPlaceholders: StringLiteralPlaceholders): AnyArgument[];
export {};
