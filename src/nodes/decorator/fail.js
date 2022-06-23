import Decorator from "./decorator";
import State from "../../state";

/**
 * A Fail node.
 * This node wraps a single child and will always move to the 'FAILED' state when the child moves to a 'SUCCEEDED' or 'FAILED' state.
 * @param decorators The node decorators.
 * @param child The child node.
 */
export default function Fail(decorators, child) {
    Decorator.call(this, "fail", decorators, child);

    /**
     * Update the node.
     * @param board The board.
     * @returns The result of the update.
     */
    this.onUpdate = function (board) {
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
            case State.FAILED:
                this.setState(State.FAILED);
                break;

            default:
                this.setState(State.READY);
        }
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => "FAIL";
}

Fail.prototype = Object.create(Decorator.prototype);
