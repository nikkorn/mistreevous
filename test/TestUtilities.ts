import { BehaviourTree, NodeDetails } from "../src/index";
import { AnyNodeDefinition } from "../src/BehaviourTreeDefinition";

/**
 * Get the details for the specified node type and caption from the given behaviour tree instance, or error if it doesn't exist.
 * @param tree The behaviour tree instance.
 * @param type The type of the node to get.
 * @param name The name of the node to get.
 * @returns The details for the specified node type and caption from the given behaviour tree instance.
 */
export function findNode(tree: BehaviourTree, type: AnyNodeDefinition["type"], name?: string): NodeDetails {
    const findNodeFromDetails = (node: NodeDetails): NodeDetails | null => {
        if (node.type === type && (!name || node.name === name)) {
            return node;
        }

        return (node.children ?? []).map(findNodeFromDetails).find((childNode) => !!childNode) ?? null;
    };

    const targetNode = findNodeFromDetails(tree.getTreeNodeDetails());

    if (!targetNode) {
        throw new Error(
            name
                ? `cannot find flattened tree node with type: '${type}' caption: '${name}'`
                : `cannot find flattened tree node with type: '${type}'`
        );
    }

    return targetNode;
}
