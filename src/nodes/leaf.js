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
     * Sets the guard path to evaluate as part of a node update.
     */
    this.setGuardPath = (value) => guardPath = value;

    /**
     * Gets whether this node is a leaf node.
     */
    this.isLeafNode = () => true;

    /**
     * Any pre-update logic.
     * @param board The board.
     */
    this.onBeforeUpdate = (board) => {
        // Evaluate all of the guard path conditions for the current tree path.
        guardPath.evaluate(board);
    };
};

Leaf.prototype = Object.create(Node.prototype);