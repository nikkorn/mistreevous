import Node from './node'

/**
 * A leaf node.
 * @param type The node type.
 * @param decorators The node decorators.
 */
export default function Leaf(type, decorators) {
    Node.call(this, type, decorators);

    /**
     * Gets whether this node is a leaf node.
     */
    this.isLeafNode = () => true;
};

Leaf.prototype = Object.create(Node.prototype);