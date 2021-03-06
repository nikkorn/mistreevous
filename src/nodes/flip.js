import Composite from './composite'
import State from "../state";

/**
 * A Flip node.
 * This node wraps a single child and will flip the state of the child state.
 * @param decorators The node decorators.
 * @param child The child node. 
 */
export default function Flip(decorators, child) {
    Composite.call(this, "flip", decorators, [child]);
   
    /**
     * Update the node.
     * @param board The board.
     * @returns The result of the update.
     */
    this.onUpdate = function(board) {
        // If the child has never been updated or is running then we will need to update it now.
        if (child.getState() === State.READY || child.getState() === State.RUNNING) {
            child.update(board);
        }

        // The state of this node will depend in the state of its child.
        switch (child.getState()) {
            case State.RUNNING:
                this.setState(State.RUNNING);
                break;

            case State.SUCCEEDED:
                this.setState(State.FAILED);
                break;

            case State.FAILED:
                this.setState(State.SUCCEEDED);
                break;

            default:
                this.setState(State.READY);
        }
    };
   
    /**
     * Gets the name of the node.
     */
    this.getName = () => "FLIP";
};

Flip.prototype = Object.create(Composite.prototype);