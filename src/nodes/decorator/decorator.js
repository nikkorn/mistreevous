import Node from '../node'
import State from '../../state'

/**
 * A decorator node that wraps a single child node.
 * @param type The node type.
 * @param decorators The node decorators.
 * @param child The child node. 
 */
export default function Decorator(type, decorators, child) {
    Node.call(this, type, decorators);

    /**
     * Gets whether this node is a leaf node.
     */
    this.isLeafNode = () => false;

    /**
     * Gets the children of this node.
     */
    this.getChildren = () => [child];

    /**
     * Reset the state of the node.
     */
    this.reset = () => {
        // Reset the state of this node.
        this.setState(State.READY);

        // Reset the state of the child node.
        child.reset();
    };

    /**
     * Abort the running of this node.
     * @param board The board.
     */
    this.abort = (board) => {
        // There is nothing to do if this node is not in the running state.
        if (!this.is(State.RUNNING)) {
            return;
        }

        // Abort the child node.
        child.abort(board);

        // Reset the state of this node.
        this.reset();

        // Try to get the exit decorator for this node.
        const exitDecorator = this.getDecorator("exit");

        // Call the exit decorator function if it exists.
        if (exitDecorator) {
            exitDecorator.callBlackboardFunction(board, false, true);
        }
    };
};

Decorator.prototype = Object.create(Node.prototype);