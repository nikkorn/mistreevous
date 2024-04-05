import Composite from "./Composite";
import State from "../../State";
import Node from "../Node";
import { Agent } from "../../Agent";
import Attribute from "../../attributes/Attribute";
import { BehaviourTreeOptions } from "../../BehaviourTreeOptions";

/**
 * An ALL node.
 * The child nodes are executed concurrently until all child nodes move to a completed state.
 */
export default class All extends Composite {
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param children The child nodes.
     */
    constructor(attributes: Attribute[], options: BehaviourTreeOptions, children: Node[]) {
        super("all", attributes, options, children);
    }

    /**
     * Called when the node is being updated.
     * @param agent The agent.
     */
    protected onUpdate(agent: Agent): void {
        // Iterate over all of the children of this node, updating any that aren't in a settled state.
        for (const child of this.children) {
            // If the child has never been updated or is running then we will need to update it now.
            if (child.getState() === State.READY || child.getState() === State.RUNNING) {
                // Update the child of this node.
                child.update(agent);
            }
        }

        // An all node will move into a completed state if all child nodes move into a completed state.
        if (this.children.every((child) => child.is(State.SUCCEEDED) || child.is(State.FAILED))) {
            // If any of our child nodes have succeeded then this node has also succeeded, otherwise it has failed.
            this.setState(this.children.find((child) => child.is(State.SUCCEEDED)) ? State.SUCCEEDED : State.FAILED);

            return;
        }

        // If we didn't move to a succeeded or failed state then this node is still running.
        this.setState(State.RUNNING);
    }

    /**
     * Gets the name of the node.
     */
    getName = () => "ALL";
}
