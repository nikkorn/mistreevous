import { defaultCipherList } from "constants";

/**
 * A REPEAT node.
 * The node has a single child which can have:
 * -- A number of iterations for which to repeat the child node.
 * -- An infinite repeat loop if neither an iteration count or a condition function is defined.
 * The REPEAT node will stop and have a 'FAILED' state if its child is ever in a 'FAILED' state after an update.
 * The REPEAT node will attempt to move on to the next iteration if its child is ever in a 'SUCCEEDED' state.
 * @param uid The unique node id.
 * @param guard The node guard.
 * @param iterations The number of iterations to repeat the child node, or the minimum number of iterations if maximumIterations is defined.
 * @param maximumIterations The maximum number of iterations to repeat the child node.
 * @param child The child node. 
 */
export default function Repeat(uid, guard, iterations, maximumIterations, child) {
    /**
     * The node state.
     */
    let state = Mistreevous.State.READY;

    /**
     * The number of target iterations to make.
     */
    let targetIterationCount = null;

    /**
     * The current iteration count.
     */
    let currentIterationCount = 0;

    /**
     * Update the node and get whether the node state has changed.
     * @param board The board.
     * @param guardScope The guard scope.
     * @returns Whether the state of this node has changed as part of the update.
     */
    this.update = function(board, guardScope) {
        // Get the pre-update node state.
        const initialState = state;

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (state === Mistreevous.State.SUCCEEDED || state === Mistreevous.State.FAILED) {
            // We have not changed state.
            return false;
        }

        // If a guard has been defined for the node, this node will move into the FAILED state if it is not satisfied.
        if (guard && !guard.isSatisfied(board)) {
            // The guard is not satisfied and therefore we are finished with the node.
            state = Mistreevous.State.FAILED;

            // The node has moved to the FAILED state.
            return true;
        }

        // If this node is in the READY state then we need to reset the child and the target iteration count.
        if (state === Mistreevous.State.READY) {
            // Reset the child node.
            child.reset();

            // Set the target iteration count.
            this._setTargetIterationCount();
        }

        // Do a check to see if we can iterate. If we can then this node will move into the 'RUNNING' state.
        // If we cannot iterate then we have hit our target iteration count, which means that the node has succeeded.
        if (this._canIterate()) {
            // This node is in the running state and can do its initial iteration.
            state = Mistreevous.State.RUNNING;

            // We may have already completed an iteration, meaning that the child node will be in the SUCCEEDED state.
            // If this is the case then we will have to reset the child node now.
            if (child.getState() === Mistreevous.State.SUCCEEDED) {
                child.reset();
            }

            // Update the child node.
            child.update(board, guardScope.createScope(guard, this));

            // If the child moved into the FAILED state when we updated it then there is nothing left to do and this node has also failed.
            // If it has moved into the SUCCEEDED state then we have completed the current iteration.
            if (child.getState() === Mistreevous.State.FAILED) {
                // The child has failed, meaning that this node has failed.
                state = Mistreevous.State.FAILED;

                // Return whether the state of this node has changed.
                return state !== initialState;
            } else if (child.getState() === Mistreevous.State.SUCCEEDED) {
                // We have completed an iteration.
                currentIterationCount += 1;
            }
        } else {
            // This node is in the 'SUCCEEDED' state as we cannot iterate any more.
            state = Mistreevous.State.SUCCEEDED;
        }

        // Return whether the state of this node has changed.
        return state !== initialState;
    };

    /**
     * Gets the state of the node.
     */
    this.getState = () => state;

    /**
     * Gets the name of the node.
     */
    this.getName = () => {
        if (iterations !== null) {
            return `REPEAT ${ maximumIterations ? iterations + "x-" + maximumIterations + "x" : iterations + "x" }`;
        }

        // Return the default repeat node name.
        return "REPEAT";
    }

    /**
     * Gets the state of the node.
     */
    this.getChildren = () => [child];

    /**
     * Gets the guard of the node.
     */
    this.getGuard = () => guard;

    /**
     * Gets the type of the node.
     */
    this.getType = () => "repeat";

    /**
     * Gets the unique id of the node.
     */
    this.getUid = () => uid;

    /**
     * Reset the state of the node.
     */
    this.reset = () => {
        // Reset the state of this node.
        state = Mistreevous.State.READY;

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
            targetIterationCount = (typeof maximumIterations === "number") ? 
                Math.floor(Math.random() * (maximumIterations - iterations + 1) + iterations) : 
                iterations;
        } else {
            targetIterationCount = null;
        }
    }
};