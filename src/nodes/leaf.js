import Node from './node'

/**
 * A leaf node.
 * @param uid The unique node id.
 * @param type The node type.
 * @param guard The node guard.
 */
export default function Leaf(uid, type, guard) {
    Node.call(this, uid, type, guard);

    /**
     * The guard path to evaluate as part of a node update.
     */
    let guardPath;

    /**
     * Gets/Sets the guard path to evaluate as part of a node update.
     */
    this.getGuardPath = () => guardPath;
    this.setGuardPath = (value) => guardPath = value;

    /**
     * Gets whether this node is a leaf node.
     */
    this.isLeafNode = () => true;
};

Leaf.prototype = Object.create(Node.prototype);