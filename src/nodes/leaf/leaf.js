import Node from "../node";

/**
 * A leaf node.
 * @param type The node type.
 * @param decorators The node decorators.
 * @param args The node argument definitions.
 */
export default function Leaf(type, decorators, args) {
    Node.call(this, type, decorators, args);

    /**
     * Gets whether this node is a leaf node.
     */
    this.isLeafNode = () => true;
}

Leaf.prototype = Object.create(Node.prototype);
