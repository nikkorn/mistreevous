import Decorator from "./decorator";
import State from "../../State";

/**
 * A Flip node.
 * This node wraps a single child and will flip the state of the child state.
 * @param decorators The node decorators.
 * @param child The child node.
 */
export default function Flip(decorators, child) {
    Decorator.call(this, "flip", decorators, child);

    /**
     * Update the node.
     * @param agent The agent.
     * @returns The result of the update.
     */
    this.onUpdate = function (agent) {
        // If the child has never been updated or is running then we will need to update it now.
        if (child.getState() === State.READY || child.getState() === State.RUNNING) {
            child.update(agent);
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
}

Flip.prototype = Object.create(Decorator.prototype);
