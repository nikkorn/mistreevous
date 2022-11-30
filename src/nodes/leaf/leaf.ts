import Node from "../node";

/**
 * A leaf node.
 * @param type The node type.
 * @param decorators The node decorators.
 * @param args The node argument definitions.
 */
export default abstract class Leaf extends Node {
    /**
     * Gets whether this node is a leaf node.
     */
    isLeafNode = () => true;
}
