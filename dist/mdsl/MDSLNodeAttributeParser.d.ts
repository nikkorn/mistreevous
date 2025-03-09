import { NodeAttributeDefinition, NodeGuardDefinition } from "../BehaviourTreeDefinition";
import { StringLiteralPlaceholders } from "./MDSLUtilities";
/**
 * A type defining the attribute definitions of a node.
 */
type NodeAttributes = {
    while?: NodeGuardDefinition;
    until?: NodeGuardDefinition;
    entry?: NodeAttributeDefinition;
    exit?: NodeAttributeDefinition;
    step?: NodeAttributeDefinition;
};
/**
 * Parse any node attribute definitions from the specified tokens array.
 * @param tokens The array of remaining tokens.
 * @param stringArgumentPlaceholders The mapping of string literal node argument placeholders to original values.
 * @returns An object of attribute definitions defined by any directly following tokens.
 */
export declare function parseAttributeTokens(tokens: string[], stringArgumentPlaceholders: StringLiteralPlaceholders): NodeAttributes;
export {};
