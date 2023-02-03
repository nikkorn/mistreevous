import Decorator from "./Decorator";
import State from "../../State";
import Node from "../Node";
import { Agent } from "../../Agent";
import Attribute from "../../attributes/Attribute";
import { BehaviourTreeOptions } from "../../BehaviourTreeOptions";

/**
 * A Flip node.
 * This node wraps a single child and will flip the state of the child state.
 */
export default class Flip extends Decorator {
    /**
     * @param attributes The node attributes.
     * @param child The child node.
     */
    constructor(attributes: Attribute[], child: Node) {
        super("flip", attributes, child);
    }

    /**
     * Called when the node is being updated.
     * @param agent The agent.
     * @param options The behaviour tree options object.
     */
    protected onUpdate(agent: Agent, options: BehaviourTreeOptions): void {
        // If the child has never been updated or is running then we will need to update it now.
        if (this.child.getState() === State.READY || this.child.getState() === State.RUNNING) {
            this.child.update(agent, options);
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
    }

    /**
     * Gets the name of the node.
     */
    getName = () => "FLIP";
}
