import Decorator from "./Decorator";
import State from "../../State";
import Node from "../Node";
import { Agent } from "../../Agent";
import Attribute from "../../attributes/Attribute";
import { BehaviourTreeOptions } from "../../BehaviourTreeOptions";

/**
 * A Timeout node.
 * This node wraps a single child and will:
 * -- Inherit the state of the child if the child moves into a 'SUCCEEDED' or 'FAILED' state before the specified timeout expires.
 * -- Move into the 'FAILED' state if the duration in which the child remains in the 'RUNNING' state exceeds the specified timeout.
 */
export default class Timeout extends Decorator {
    /**
     * The time in milliseconds at which this node was first updated.
     */
    private initialUpdateTime: number = 0;

    /**
     * The duration in milliseconds that this node has been running for.
     */
    private runningDuration: number = 0;

    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param duration The timeout duration.
     * @param child The child node.
     */
    constructor(
        attributes: Attribute[], 
        options: BehaviourTreeOptions, 
        private duration: number,
        child: Node
    ) {
        super("timeout", attributes, options, child);
    }

    /**
     * Called when the node is being updated.
     * @param agent The agent.
     */
    protected onUpdate(agent: Agent): void {
        // If this node is in the READY state then we need to set the initial update time.
        if (this.is(State.READY)) {
            // Set the initial update time.
            this.initialUpdateTime = new Date().getTime();

            // Set the initial running duration.
            this.runningDuration = 0;

            // The node is now running.
            this.setState(State.RUNNING);
        }

        // If the child has never been updated or is running then we will need to update it now.
        if (this.child.getState() === State.READY || this.child.getState() === State.RUNNING) {
            this.child.update(agent);
        }

        // The state of this node will depend in the state of its child.
        switch (this.child.getState()) {
            case State.RUNNING:
                // If we have a 'getDeltaTime' function defined as part of our options then we will use it to figure out how long we have been running for.
                if (typeof this.options.getDeltaTime === "function") {
                    // Get the delta time.
                    const deltaTime = this.options.getDeltaTime();

                    // Our delta time must be a valid number and cannot be NaN.
                    if (typeof deltaTime !== "number" || isNaN(deltaTime)) {
                        throw new Error("The delta time must be a valid number and not NaN.");
                    }

                    // Update the amount of time that this node has been running for based on the delta time.
                    this.runningDuration += deltaTime * 1000;
                } else {
                    // We are not using a delta time, so we will just work out hom much time has passed since the first update.
                    this.runningDuration = new Date().getTime() - this.initialUpdateTime;
                }

                // If the child is still in the running state and our timeout has been reached then this node should move into the failed state.
                this.setState(this.runningDuration >= this.duration ? State.FAILED : State.RUNNING);
                break;

            case State.SUCCEEDED:
            case State.FAILED:
                this.setState(this.child.getState());
                break;

            default:
                this.setState(State.READY);
        }
    }

    /**
     * Gets the name of the node.
     */
    getName = () => `TIMEOUT ${this.duration}ms`;
}
