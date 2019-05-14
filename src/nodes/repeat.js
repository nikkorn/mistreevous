import Composite from './composite'

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
    Composite.call(this, uid, "repeat", guard, [child]);

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
     * @param board The board.
     * @param guardScope The guard scope.
     * @returns The result of the update.
     */
    this.update = function(board, guardScope) {
        // Get the pre-update node state.
        const initialState = state;

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (state === Mistreevous.State.SUCCEEDED || state === Mistreevous.State.FAILED) {
            // We have not changed state.
            return { hasStateChanged: false };
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

            // Update the child of this node and get the result.
            const updateResult = child.update(board, guardScope.createScope(guard, this));

            // Check to see whether a node guard condition failed during the child node update.
            if (updateResult.failedGuardNode) {
                // Is this node the one with the failed guard condition?
                if (updateResult.failedGuardNode === this) {
                    // We need to reset this node, passing a flag to say that this is an abort.
                    this.reset(true);
                    
                    // The guard condition for this node did not pass, so this node will move into the FAILED state.
                    state = Mistreevous.State.FAILED;

                    // Return whether the state of this node has changed.
                    return { hasStateChanged: true };
                } else {
                    // A node guard condition has failed higher up the tree.
                    return {
                        hasStateChanged: false,
                        failedGuardNode: guardScopeEvaluationResult.node
                    };
                }
            }

            // If the child moved into the FAILED state when we updated it then there is nothing left to do and this node has also failed.
            // If it has moved into the SUCCEEDED state then we have completed the current iteration.
            if (child.getState() === Mistreevous.State.FAILED) {
                // The child has failed, meaning that this node has failed.
                state = Mistreevous.State.FAILED;

                // Return whether the state of this node has changed.
                return { hasStateChanged: state !== initialState };
            } else if (child.getState() === Mistreevous.State.SUCCEEDED) {
                // We have completed an iteration.
                currentIterationCount += 1;
            }
        } else {
            // This node is in the 'SUCCEEDED' state as we cannot iterate any more.
            state = Mistreevous.State.SUCCEEDED;
        }

        // Return whether the state of this node has changed.
        return { hasStateChanged: state !== initialState };
    };

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
     * Reset the state of the node.
     * @param isAbort Whether the reset is part of an abort.
     */
    this.reset = (isAbort) => {
        // Reset the state of this node.
        state = Mistreevous.State.READY;

        // Reset the current iteration count.
        currentIterationCount = 0;

        // Reset the child node.
        child.reset(isAbort);
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

Repeat.prototype = Object.create(Composite.prototype);