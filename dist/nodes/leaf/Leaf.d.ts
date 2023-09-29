import Node from "../Node";
/**
 * A leaf node.
 */
export default abstract class Leaf extends Node {
    /**
     * Gets whether this node is a leaf node.
     */
    isLeafNode: () => boolean;
}
