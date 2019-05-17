import Node from './node'

/**
 * A leaf node.
 * @param type The node type.
 * @param decorators The node decorators.
 */
export default function Leaf(type, decorators) {
    Node.call(this, type, decorators);

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