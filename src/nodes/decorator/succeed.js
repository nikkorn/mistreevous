import Decorator from "./decorator";
import State from "../../State";

/**
 * A Succeed node.
 * This node wraps a single child and will always move to the 'SUCCEEDED' state when the child moves to a 'SUCCEEDED' or 'FAILED' state.
 * @param decorators The node decorators.
 * @param child The child node.
 */
export default function Succeed(decorators, child) {
    Decorator.call(this, "succeed", decorators, child);

    /**
     * Update the node.
     * @param agent The agent.
     * @param options The behaviour tree options object.
     * @returns The result of the update.
     */
    this.onUpdate = function (agent, options) {
        // If the child has never been updated or is running then we will need to update it now.
        if (child.getState() === State.READY || child.getState() === State.RUNNING) {
            child.update(agent, options);
        }

        // The state of this node will depend in the state of its child.
        switch (child.getState()) {
            case State.RUNNING:
                this.setState(State.RUNNING);
                break;

            case State.SUCCEEDED:
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
    this.getName = () => "SUCCEED";
}

Succeed.prototype = Object.create(Decorator.prototype);
