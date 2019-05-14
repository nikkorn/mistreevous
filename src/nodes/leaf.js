import Node from './node'

/**
 * A leaf node.
 * @param uid The unique node id.
 * @param guard The node guard.
 */
export default function Leaf(uid, guard) {
    Node.call(this, uid, guard);

    /**
     * Gets whether this node is a leaf node.
     */
    this.isLeafNode = () => true;
};

Leaf.prototype = Object.create(Node.prototype);