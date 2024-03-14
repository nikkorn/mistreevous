import Composite from "./Composite";
import State from "../../State";
import Node from "../Node";
import { Agent } from "../../Agent";
import Attribute from "../../attributes/Attribute";
import { BehaviourTreeOptions } from "../../BehaviourTreeOptions";

/**
 * A RACE node.
 * The child nodes are executed concurrently until one succeeds or all fail.
 */
export default class Race extends Composite {
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param children The child nodes.
     */
    constructor(attributes: Attribute[], options: BehaviourTreeOptions, children: Node[]) {
        super("race", attributes, options, children);
    }

    /**
     * Called when the node is being updated.
     * @param agent The agent.
     * @param options The behaviour tree options object.
     */
    protected onUpdate(agent: Agent, options: BehaviourTreeOptions): void {
        // Iterate over all of the children of this node, updating any that aren't in a settled state.
        for (const child of this.children) {
            // If the child has never been updated or is running then we will need to update it now.
            if (child.getState() === State.READY || child.getState() === State.RUNNING) {
                // Update the child of this node.
                child.update(agent, options);
            }
        }

        // If any of our child nodes have succeeded then this node has also succeeded
        if (this.children.find((child) => child.is(State.SUCCEEDED))) {
            // This node is a 'SUCCEEDED' node.
            this.setState(State.SUCCEEDED);

            // Abort every running child.
            for (const child of this.children) {
                if (child.getState() === State.RUNNING) {
                    child.abort(agent);
                }
            }

            return;
        }

        // A race node will move into the failed state if all child nodes move into the failed state as none can succeed.
        if (this.children.every((child) => child.is(State.FAILED))) {
            // This node is a 'FAILED' node.
            this.setState(State.FAILED);

            return;
        }

        // If we didn't move to a succeeded or failed state then this node is still running.
        this.setState(State.RUNNING);
    }

    /**
     * Gets the name of the node.
     */
    getName = () => "RACE";
}
