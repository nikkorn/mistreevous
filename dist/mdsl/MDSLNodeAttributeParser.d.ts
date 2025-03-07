import { StringLiteralPlaceholders } from "./MDSLUtilities";
import { AnyArgument } from "./MDSLArguments";
/**
 * A type defining any attribute definition of a node.
 */
export interface NodeAttribute {
    /**
     * The name of the agent function or globally registered function to invoke.
     */
    call: string;
    /**
     * An array of arguments to pass when invoking the agent function.
     */
    args?: AnyArgument[];
}
/**
 * A type defining the attribute definitions of a node.
 */
type NodeAttributes = {
    while?: NodeAttribute;
    until?: NodeAttribute;
    entry?: NodeAttribute;
    exit?: NodeAttribute;
    step?: NodeAttribute;
};
/**
 * Parse any node attribute definitions from the specified tokens array.
 * @param tokens The array of remaining tokens.
 * @param stringArgumentPlaceholders The mapping of string literal node argument placeholders to original values.
 * @returns An object of attribute definitions defined by any directly following tokens.
 */
export declare function parseAttributeTokens(tokens: string[], stringArgumentPlaceholders: StringLiteralPlaceholders): NodeAttributes;
export {};
