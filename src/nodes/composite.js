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
     * @param isAbort Whether the reset is part of an abort.
     */
    this.reset = (isAbort) => {
        // Reset the state of this node.
        this.setState(Mistreevous.State.READY);

        // Reset the state of any child nodes.
        this.getChildren().forEach(child => child.reset(isAbort));
    };
};

Composite.prototype = Object.create(Node.prototype);