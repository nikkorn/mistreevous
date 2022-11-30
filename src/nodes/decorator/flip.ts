import Decorator from "./decorator";
import State from "../../state";
import Node from "../node";

/**
 * A Flip node.
 * This node wraps a single child and will flip the state of the child state.
 * @param decorators The node decorators.
 * @param child The child node.
 */
export default class Flip extends Decorator {
    constructor(decorators: Decorator[] | null, child: Node) {
        super("flip", decorators, child)
    }

    /**
     * Update the node.
     * @param agent The agent.
     * @returns The result of the update.
     */
    onUpdate = (agent: any) => {
        // If the child has never been updated or is running then we will need to update it now.
        if (this.child.getState() === State.READY || this.child.getState() === State.RUNNING) {
            this.child.update(agent);
        }

        // The state of this node will depend in the state of its child.
        switch (this.child.getState()) {
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
    getName = () => "FLIP";
}
