import Node from './node'

/**
 * A composite node that wraps child nodes.
 * @param type The node type.
 * @param decorators The node decorators.
 * @param children The child nodes. 
 */
export default function Composite(type, decorators, children) {
    Node.call(this, type, decorators);

    /**
     * Gets whether this node is a leaf node.
     */
    this.isLeafNode = () => false;

    /**
     * Gets the children of this node.
     */
    this.getChildren = () => children;

    /**
     * Reset the state of the node.
     */
    this.reset = () => {
        // Reset the state of this node.
        this.setState(Mistreevous.State.READY);

        // Reset the state of any child nodes.
        this.getChildren().forEach(child => child.reset());
    };

    /**
     * Abort the running of this node.
     * @param board The board.
     */
    this.abort = (board) => {
        // There is nothing to do if this node is not in the running state.
        if (!this.is(Mistreevous.State.RUNNING)) {
            return;
        }

        // Abort any child nodes.
        this.getChildren().forEach(child => child.abort(board));

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

Composite.prototype = Object.create(Node.prototype);