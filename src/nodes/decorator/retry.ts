import Node from "../node";
import Decorator from "./decorator";
import State from "../../state";
import { Agent } from "../../agent";
import Attribute from "../../attributes/attribute";
import { BehaviourTreeOptions } from "../../behaviourTreeOptions";

/**
 * A RETRY node.
 * The node has a single child which can have:
 * -- A number of iterations for which to repeat the child node.
 * -- An infinite repeat loop if neither an iteration count or a condition function is defined.
 * The RETRY node will stop and have a 'SUCCEEDED' state if its child is ever in a 'SUCCEEDED' state after an update.
 * The RETRY node will attempt to move on to the next iteration if its child is ever in a 'FAILED' state.
 */
export default class Retry extends Decorator {
    /**
     * @param attributes The node attributes.
     * @param iterations The number of iterations to repeat the child node, or the minimum number of iterations if maximumIterations is defined.
     * @param maximumIterations The maximum number of iterations to repeat the child node.
     * @param child The child node.
     */
    constructor(
        attributes: Attribute[],
        private iterations: number | null,
        private maximumIterations: number | null,
        child: Node
    ) {
        super("retry", attributes, child);
    }

    /**
     * The number of target iterations to make.
     */
    private targetIterationCount: number | null = null;

    /**
     * The current iteration count.
     */
    private currentIterationCount: number = 0;

    /**
     * Called when the node is being updated.
     * @param agent The agent.
     * @param options The behaviour tree options object.
     */
    protected onUpdate(agent: Agent, options: BehaviourTreeOptions): void {
        // If this node is in the READY state then we need to reset the child and the target iteration count.
        if (this.is(State.READY)) {
            // Reset the child node.
            this.child.reset();

            // Set the target iteration count.
            this.setTargetIterationCount();
        }

        // Do a check to see if we can iterate. If we can then this node will move into the 'RUNNING' state.
        // If we cannot iterate then we have hit our target iteration count, which means that the node has succeeded.
        if (this.canIterate()) {
            // This node is in the running state and can do its initial iteration.
            this.setState(State.RUNNING);

            // We may have already completed an iteration, meaning that the child node will be in the FAILED state.
            // If this is the case then we will have to reset the child node now.
            if (this.child.getState() === State.FAILED) {
                this.child.reset();
            }

            // Update the child of this node.
            this.child.update(agent, options);

            // If the child moved into the SUCCEEDED state when we updated it then there is nothing left to do and this node has also succeeded.
            // If it has moved into the FAILED state then we have completed the current iteration.
            if (this.child.getState() === State.SUCCEEDED) {
                // The child has succeeded, meaning that this node has succeeded.
                this.setState(State.SUCCEEDED);

                return;
            } else if (this.child.getState() === State.FAILED) {
                // We have completed an iteration.
                this.currentIterationCount += 1;
            }
        } else {
            // This node is in the 'FAILED' state as we cannot iterate any more.
            this.setState(State.FAILED);
        }
    }

    /**
     * Gets the name of the node.
     */
    getName = () => {
        if (this.iterations !== null) {
            return `RETRY ${
                this.maximumIterations ? this.iterations + "x-" + this.maximumIterations + "x" : this.iterations + "x"
            }`;
        }

        // Return the default retry node name.
        return "RETRY";
    };

    /**
     * Reset the state of the node.
     */
    reset = () => {
        // Reset the state of this node.
        this.setState(State.READY);

        // Reset the current iteration count.
        this.currentIterationCount = 0;

        // Reset the child node.
        this.child.reset();
    };

    /**
     * Gets whether an iteration can be made.
     * @returns Whether an iteration can be made.
     */
    canIterate = () => {
        if (this.targetIterationCount !== null) {
            // We can iterate as long as we have not reached our target iteration count.
            return this.currentIterationCount < this.targetIterationCount;
        }

        // If neither an iteration count or a condition function were defined then we can iterate indefinitely.
        return true;
    };

    /**
     * Sets the target iteration count.
     */
    setTargetIterationCount = () => {
        // Are we dealing with a finite number of iterations?
        if (typeof this.iterations === "number") {
            // If we have maximumIterations defined then we will want a random iteration count bounded by iterations and maximumIterations.
            this.targetIterationCount =
                typeof this.maximumIterations === "number"
                    ? Math.floor(Math.random() * (this.maximumIterations - this.iterations + 1) + this.iterations)
                    : this.iterations;
        } else {
            this.targetIterationCount = null;
        }
    };
}
