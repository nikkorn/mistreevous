import { BehaviourTree, FlattenedTreeNode } from "../src/index";
import { AnyNodeDefinition } from "../src/BehaviourTreeDefinition";

/**
 * Get the flattened tree node for the specified node type and caption from the given behaviour tree instance, or error if it doesn't exist.
 * @param tree The behaviour tree instance.
 * @param type The type of the node to get.
 * @param caption The caption of the node to get.
 * @returns The flattened tree node for the specified node type and caption from the given behaviour tree instance.
 */
export function findNode(tree: BehaviourTree, type: AnyNodeDefinition["type"], caption?: string): FlattenedTreeNode {
    const node = tree
        .getFlattenedNodeDetails()
        .find((node) => node.type === type && (!caption || node.caption === caption));

    if (!node) {
        throw new Error(
            caption
                ? `cannot find flattened tree node with type: '${type}' caption: '${caption}'`
                : `cannot find flattened tree node with type: '${type}'`
        );
    }

    return node;
}
