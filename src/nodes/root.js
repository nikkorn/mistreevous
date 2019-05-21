import Composite from './composite'
import State from "../state";

/**
 * A Root node.
 * The root node will have a single child.
 * @param decorators The node decorators.
 * @param child The child node. 
 */
export default function Root(decorators, child) {
    Composite.call(this, "root", decorators, [child]);
   
    /**
     * Update the node and get whether the node state has changed.
     * @param board The board.
     * @returns Whether the state of this node has changed as part of the update.
     */
    this.onUpdate = function(board) {
        // If the child has never been updated or is running then we will need to update it now.
        if (child.getState() === State.READY || child.getState() === State.RUNNING) {
            // Update the child of this node.
            child.update(board);
        }

        // The state of the root node is the state of its child.
        this.setState(child.getState());
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => "ROOT";
};

Root.prototype = Object.create(Composite.prototype);