import Node from "../node";
import Decorator from "./decorator";
import State from "../../state";
import { Agent } from "../../agent";
import Attribute from "../../attributes/attribute";

/**
 * A REPEAT node.
 * The node has a single child which can have:
 * -- A number of iterations for which to repeat the child node.
 * -- An infinite repeat loop if neither an iteration count or a condition function is defined.
 * The REPEAT node will stop and have a 'FAILED' state if its child is ever in a 'FAILED' state after an update.
 * The REPEAT node will attempt to move on to the next iteration if its child is ever in a 'SUCCEEDED' state.
 */
export default class Repeat extends Decorator {
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
        super("repeat", attributes, child);
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
     * Update the node.
     * @param agent The agent.
     * @returns The result of the update.
     */
    onUpdate = (agent: Agent) => {
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

            // We may have already completed an iteration, meaning that the child node will be in the SUCCEEDED state.
            // If this is the case then we will have to reset the child node now.
            if (this.child.getState() === State.SUCCEEDED) {
                this.child.reset();
            }

            // Update the child of this node.
            this.child.update(agent);

            // If the child moved into the FAILED state when we updated it then there is nothing left to do and this node has also failed.
            // If it has moved into the SUCCEEDED state then we have completed the current iteration.
            if (this.child.getState() === State.FAILED) {
                // The child has failed, meaning that this node has failed.
                this.setState(State.FAILED);

                return;
            } else if (this.child.getState() === State.SUCCEEDED) {
                // We have completed an iteration.
                this.currentIterationCount += 1;
            }
        } else {
            // This node is in the 'SUCCEEDED' state as we cannot iterate any more.
            this.setState(State.SUCCEEDED);
        }
    };

    /**
     * Gets the name of the node.
     */
    getName = () => {
        if (this.iterations !== null) {
            return `REPEAT ${
                this.maximumIterations ? this.iterations + "x-" + this.maximumIterations + "x" : this.iterations + "x"
            }`;
        }

        // Return the default repeat node name.
        return "REPEAT";
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
    private canIterate = () => {
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
    private setTargetIterationCount = () => {
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
