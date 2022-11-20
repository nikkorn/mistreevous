import Decorator from "./decorator";
import State from "../../State";

/**
 * A RETRY node.
 * The node has a single child which can have:
 * -- A number of iterations for which to repeat the child node.
 * -- An infinite repeat loop if neither an iteration count or a condition function is defined.
 * The RETRY node will stop and have a 'SUCCEEDED' state if its child is ever in a 'SUCCEEDED' state after an update.
 * The RETRY node will attempt to move on to the next iteration if its child is ever in a 'FAILED' state.
 * @param decorators The node decorators.
 * @param iterations The number of iterations to repeat the child node, or the minimum number of iterations if maximumIterations is defined.
 * @param maximumIterations The maximum number of iterations to repeat the child node.
 * @param child The child node.
 */
export default function Retry(decorators, iterations, maximumIterations, child) {
    Decorator.call(this, "retry", decorators, child);

    /**
     * The number of target iterations to make.
     */
    let targetIterationCount = null;

    /**
     * The current iteration count.
     */
    let currentIterationCount = 0;

    /**
     * Update the node.
     * @param agent The agent.
     * @returns The result of the update.
     */
    this.onUpdate = function (agent) {
        // If this node is in the READY state then we need to reset the child and the target iteration count.
        if (this.is(State.READY)) {
            // Reset the child node.
            child.reset();

            // Set the target iteration count.
            this._setTargetIterationCount();
        }

        // Do a check to see if we can iterate. If we can then this node will move into the 'RUNNING' state.
        // If we cannot iterate then we have hit our target iteration count, which means that the node has succeeded.
        if (this._canIterate()) {
            // This node is in the running state and can do its initial iteration.
            this.setState(State.RUNNING);

            // We may have already completed an iteration, meaning that the child node will be in the FAILED state.
            // If this is the case then we will have to reset the child node now.
            if (child.getState() === State.FAILED) {
                child.reset();
            }

            // Update the child of this node.
            child.update(agent);

            // If the child moved into the SUCCEEDED state when we updated it then there is nothing left to do and this node has also succeeded.
            // If it has moved into the FAILED state then we have completed the current iteration.
            if (child.getState() === State.SUCCEEDED) {
                // The child has succeeded, meaning that this node has succeeded.
                this.setState(State.SUCCEEDED);

                return;
            } else if (child.getState() === State.FAILED) {
                // We have completed an iteration.
                currentIterationCount += 1;
            }
        } else {
            // This node is in the 'FAILED' state as we cannot iterate any more.
            this.setState(State.FAILED);
        }
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => {
        if (iterations !== null) {
            return `RETRY ${maximumIterations ? iterations + "x-" + maximumIterations + "x" : iterations + "x"}`;
        }

        // Return the default retry node name.
        return "RETRY";
    };

    /**
     * Reset the state of the node.
     */
    this.reset = () => {
        // Reset the state of this node.
        this.setState(State.READY);

        // Reset the current iteration count.
        currentIterationCount = 0;

        // Reset the child node.
        child.reset();
    };

    /**
     * Gets whether an iteration can be made.
     * @returns Whether an iteration can be made.
     */
    this._canIterate = () => {
        if (targetIterationCount !== null) {
            // We can iterate as long as we have not reached our target iteration count.
            return currentIterationCount < targetIterationCount;
        }

        // If neither an iteration count or a condition function were defined then we can iterate indefinitely.
        return true;
    };

    /**
     * Sets the target iteration count.
     */
    this._setTargetIterationCount = () => {
        // Are we dealing with a finite number of iterations?
        if (typeof iterations === "number") {
            // If we have maximumIterations defined then we will want a random iteration count bounded by iterations and maximumIterations.
            targetIterationCount =
                typeof maximumIterations === "number"
                    ? Math.floor(Math.random() * (maximumIterations - iterations + 1) + iterations)
                    : iterations;
        } else {
            targetIterationCount = null;
        }
    };
}

Retry.prototype = Object.create(Decorator.prototype);
