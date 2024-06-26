import { NodeDefinition, RootNodeDefinition, DecoratorNodeDefinition, CompositeNodeDefinition, AnyNodeDefinition, BranchNodeDefinition } from "./BehaviourTreeDefinition";
/**
 * A type guard function that returns true if the specified node satisfies the RootNodeDefinition type.
 * @param node The node.
 * @returns A value of true if the specified node satisfies the RootNodeDefinition type.
 */
export declare function isRootNodeDefinition(node: NodeDefinition): node is RootNodeDefinition;
/**
 * A type guard function that returns true if the specified node satisfies the BranchNodeDefinition type.
 * @param node The node.
 * @returns A value of true if the specified node satisfies the BranchNodeDefinition type.
 */
export declare function isBranchNodeDefinition(node: NodeDefinition): node is BranchNodeDefinition;
/**
 * A type guard function that returns true if the specified node satisfies the NodeDefinition type.
 * @param node The node.
 * @returns A value of true if the specified node satisfies the NodeDefinition type.
 */
export declare function isLeafNodeDefinition(node: NodeDefinition): node is NodeDefinition;
/**
 * A type guard function that returns true if the specified node satisfies the DecoratorNodeDefinition type.
 * @param node The node.
 * @returns A value of true if the specified node satisfies the DecoratorNodeDefinition type.
 */
export declare function isDecoratorNodeDefinition(node: NodeDefinition): node is DecoratorNodeDefinition;
/**
 * A type guard function that returns true if the specified node satisfies the CompositeNodeDefinition type.
 * @param node The node.
 * @returns A value of true if the specified node satisfies the CompositeNodeDefinition type.
 */
export declare function isCompositeNodeDefinition(node: NodeDefinition): node is CompositeNodeDefinition;
/**
 * Flatten a node definition into an array of all of its nested node definitions.
 * @param nodeDefinition The node definition to flatten.
 * @returns An array of all of nested node definitions.
 */
export declare function flattenDefinition(nodeDefinition: AnyNodeDefinition): AnyNodeDefinition[];
/**
 * Determines whether the passed value is an integer.
 * @param value The value to check.
 * @returns Whether the passed value is an integer.
 */
export declare function isInteger(value: unknown): boolean;
/**
 * Determines whether the passed value is null or undefined.
 * @param value The value to check.
 * @returns Whether the passed value is null or undefined.
 */
export declare function isNullOrUndefined(value: unknown): boolean;
