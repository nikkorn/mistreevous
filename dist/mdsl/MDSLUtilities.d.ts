import { CompositeNodeDefinition, DecoratorNodeDefinition, NodeDefinition, RootNodeDefinition } from "../BehaviourTreeDefinition";
/**
 * A type defining an object that holds a reference to substitued string literals parsed from the definition.
 */
export type StringLiteralPlaceholders = {
    [key: string]: string;
};
/**
 * A type guard function that returns true if the specified node satisfies the RootNodeDefinition type.
 * @param node The node.
 * @returns A value of true if the specified node satisfies the RootNodeDefinition type.
 */
export declare function isRootNode(node: NodeDefinition): node is RootNodeDefinition;
/**
 * A type guard function that returns true if the specified node satisfies the NodeDefinition type.
 * @param node The node.
 * @returns A value of true if the specified node satisfies the NodeDefinition type.
 */
export declare function isLeafNode(node: NodeDefinition): node is NodeDefinition;
/**
 * A type guard function that returns true if the specified node satisfies the DecoratorNodeDefinition type.
 * @param node The node.
 * @returns A value of true if the specified node satisfies the DecoratorNodeDefinition type.
 */
export declare function isDecoratorNode(node: NodeDefinition): node is DecoratorNodeDefinition;
/**
 * A type guard function that returns true if the specified node satisfies the CompositeNodeDefinition type.
 * @param node The node.
 * @returns A value of true if the specified node satisfies the CompositeNodeDefinition type.
 */
export declare function isCompositeNode(node: NodeDefinition): node is CompositeNodeDefinition;
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
