import {
    NodeDefinition,
    RootNodeDefinition,
    DecoratorNodeDefinition,
    CompositeNodeDefinition,
    AnyNodeDefinition,
    BranchNodeDefinition
} from "./BehaviourTreeDefinition";

/**
 * A type guard function that returns true if the specified node satisfies the RootNodeDefinition type.
 * @param node The node.
 * @returns A value of true if the specified node satisfies the RootNodeDefinition type.
 */
export function isRootNodeDefinition(node: NodeDefinition): node is RootNodeDefinition {
    return node.type === "root";
}

/**
 * A type guard function that returns true if the specified node satisfies the BranchNodeDefinition type.
 * @param node The node.
 * @returns A value of true if the specified node satisfies the BranchNodeDefinition type.
 */
export function isBranchNodeDefinition(node: NodeDefinition): node is BranchNodeDefinition {
    return node.type === "branch";
}

/**
 * A type guard function that returns true if the specified node satisfies the NodeDefinition type.
 * @param node The node.
 * @returns A value of true if the specified node satisfies the NodeDefinition type.
 */
export function isLeafNodeDefinition(node: NodeDefinition): node is NodeDefinition {
    return ["branch", "action", "condition", "wait"].includes(node.type);
}

/**
 * A type guard function that returns true if the specified node satisfies the DecoratorNodeDefinition type.
 * @param node The node.
 * @returns A value of true if the specified node satisfies the DecoratorNodeDefinition type.
 */
export function isDecoratorNodeDefinition(node: NodeDefinition): node is DecoratorNodeDefinition {
    return ["root", "repeat", "retry", "flip", "succeed", "fail"].includes(node.type);
}

/**
 * A type guard function that returns true if the specified node satisfies the CompositeNodeDefinition type.
 * @param node The node.
 * @returns A value of true if the specified node satisfies the CompositeNodeDefinition type.
 */
export function isCompositeNodeDefinition(node: NodeDefinition): node is CompositeNodeDefinition {
    return ["sequence", "selector", "lotto", "parallel", "race", "all"].includes(node.type);
}

/**
 * Flatten a node definition into an array of all of its nested node definitions.
 * @param nodeDefinition The node definition to flatten.
 * @returns An array of all of nested node definitions.
 */
export function flattenDefinition(nodeDefinition: AnyNodeDefinition): AnyNodeDefinition[] {
    const nodes: AnyNodeDefinition[] = [];

    const processNode = (currentNodeDefinition: AnyNodeDefinition) => {
        nodes.push(currentNodeDefinition);

        if (isCompositeNodeDefinition(currentNodeDefinition)) {
            currentNodeDefinition.children.forEach(processNode);
        } else if (isDecoratorNodeDefinition(currentNodeDefinition)) {
            processNode(currentNodeDefinition.child);
        }
    };

    processNode(nodeDefinition);

    return nodes;
}

/**
 * Determines whether the passed value is an integer.
 * @param value The value to check.
 * @returns Whether the passed value is an integer.
 */
export function isInteger(value: unknown): boolean {
    return typeof value === "number" && Math.floor(value) === value;
}

/**
 * Determines whether the passed value is null or undefined.
 * @param value The value to check.
 * @returns Whether the passed value is null or undefined.
 */
export function isNullOrUndefined(value: unknown): boolean {
    return typeof value === "undefined" || value === null;
}
