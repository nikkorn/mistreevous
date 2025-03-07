import { AnyArgument } from "./MDSLArguments";
import { StringLiteralPlaceholders } from "./MDSLUtilities";
/**
 * Parse an array of argument definitions from the specified tokens array.
 * @param tokens The array tokens to parse the argument definitions from.
 * @param stringArgumentPlaceholders The mapping of string literal node argument placeholders to original values.
 * @param argumentValidator The argument validator function.
 * @param validationFailedMessage  The exception message to throw if argument validation fails.
 * @returns An array of argument definitions parsed from the specified tokens array.
 */
export declare function parseArgumentTokens(tokens: string[], stringArgumentPlaceholders: StringLiteralPlaceholders): AnyArgument[];
