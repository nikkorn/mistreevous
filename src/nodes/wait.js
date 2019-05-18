import Leaf from './leaf'

/**
 * A WAIT node.
 * The state of this node will change to SUCCEEDED after a duration of time.
 * @param decorators The node decorators.
 * @param duration The duration that this node will wait to succeed in milliseconds, or the earliest if longestDuration is defined.
 * @param longestDuration The longest possible duration in milliseconds that this node will wait to succeed.
 */
export default function Wait(decorators, duration, longestDuration) {
    Leaf.call(this, "wait", decorators);

    /** 
     * The time in milliseconds at which this node was first updated.
     */
    let initialUpdateTime;

    /**
     * The duration in milliseconds that this node will be waiting for. 
     */
    let waitDuration;
   
    /**
     * Update the node.
     * @param board The board.
     * @returns The result of the update.
     */
    this.onUpdate = function(board) {
        // Evaluate guard path and return result if any guard conditions fail.
        const guardPathEvaluationResult = this.getGuardPath().evaluate(board);
        if (guardPathEvaluationResult.hasFailedCondition) {
            // Is this node the one with the failed guard condition?
            if (guardPathEvaluationResult.node === this) {
                // The guard condition for this node did not pass, so this node will move into the FAILED state.
                this.setState(Mistreevous.State.FAILED);

                return;
            } else {
                // A node guard condition has failed higher up the tree.
                return { failedGuardNode: guardPathEvaluationResult.node };
            }
        }

        // If this node is in the READY state then we need to set the initial update time.
        if (this.is(Mistreevous.State.READY)) {
            // Set the initial update time.
            initialUpdateTime = new Date().getTime();

            // If a longestDuration value was defined then we will be randomly picking a duration between the
            // shortest and longest duration. If it was not defined, then we will be just using the duration.
            waitDuration = longestDuration ? Math.floor(Math.random() * (longestDuration - duration + 1) + duration) : duration;

            // The node is now running until we finish waiting.
            this.setState(Mistreevous.State.RUNNING);
        }

        // Have we waited long enough?
        if (new Date().getTime() >= (initialUpdateTime + waitDuration)) {
            // We have finished waiting!
            this.setState(Mistreevous.State.SUCCEEDED);
        }
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => `WAIT ${ longestDuration ? duration + "ms-" + longestDuration + "ms" : duration + "ms" }`;
};

Wait.prototype = Object.create(Leaf.prototype);