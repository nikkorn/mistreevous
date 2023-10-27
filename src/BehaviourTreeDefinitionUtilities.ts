import { NodeDefinition, RootNodeDefinition, DecoratorNodeDefinition, CompositeNodeDefinition, AnyNode, BranchNodeDefinition } from "./BehaviourTreeDefinition";

/**
 * A type guard function that returns true if the specified node satisfies the RootNodeDefinition type.
 * @param node The node.
 * @returns A value of true if the specified node satisfies the RootNodeDefinition type.
 */
export function isRootNode(node: NodeDefinition): node is RootNodeDefinition {
    return node.type === "root";
}

/**
 * A type guard function that returns true if the specified node satisfies the BranchNodeDefinition type.
 * @param node The node.
 * @returns A value of true if the specified node satisfies the BranchNodeDefinition type.
 */
export function isBranchNode(node: NodeDefinition): node is BranchNodeDefinition {
    return node.type === "branch";
}

/**
 * A type guard function that returns true if the specified node satisfies the NodeDefinition type.
 * @param node The node.
 * @returns A value of true if the specified node satisfies the NodeDefinition type.
 */
export function isLeafNode(node: NodeDefinition): node is NodeDefinition {
    return ["branch", "action", "condition", "wait"].includes(node.type);
}

/**
 * A type guard function that returns true if the specified node satisfies the DecoratorNodeDefinition type.
 * @param node The node.
 * @returns A value of true if the specified node satisfies the DecoratorNodeDefinition type.
 */
export function isDecoratorNode(node: NodeDefinition): node is DecoratorNodeDefinition {
    return ["root", "repeat", "retry", "flip", "succeed", "fail"].includes(node.type);
}

/**
 * A type guard function that returns true if the specified node satisfies the CompositeNodeDefinition type.
 * @param node The node.
 * @returns A value of true if the specified node satisfies the CompositeNodeDefinition type.
 */
export function isCompositeNode(node: NodeDefinition): node is CompositeNodeDefinition {
    return ["sequence", "selector", "lotto", "parallel"].includes(node.type);
}

/**
 * Flatten a node definition into an array of all of its nested node definitions.
 * @param nodeDefinition The node definition to flatten.
 * @returns An array of all of nested node definitions.
 */
export function flattenDefinition(nodeDefinition: AnyNode): AnyNode[] {
    const nodes: AnyNode[] = [];

    const processNode = (currentNodeDefinition: AnyNode) => {
        nodes.push(currentNodeDefinition);

        if (isCompositeNode(currentNodeDefinition)) {
            currentNodeDefinition.children.forEach(processNode);
        } else if (isDecoratorNode(currentNodeDefinition)) {
            processNode(currentNodeDefinition.child);
        }
    };

    processNode(nodeDefinition);

    return nodes;
}
