import Leaf from './leaf'

/**
 * A Condition leaf node.
 * This will succeed or fail immediately based on a board predicate, without moving to the 'RUNNING' state.
 * @param uid The unique node id.
 * @param condition The name of the condition function. 
 */
export default function Condition(uid, condition) {
    Leaf.call(this, uid, "condition", null);
   
    /**
     * Update the node.
     * @param board The board.
     * @returns The result of the update.
     */
    this.update = function(board) {
        // Get the pre-update node state.
        const initialState = state;

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (state === Mistreevous.State.SUCCEEDED || state === Mistreevous.State.FAILED) {
            // We have not changed state.
            return { hasStateChanged: false };
        }

        // Evaluate all of the guard path conditions for the current tree path and return result if any guard conditions fail.
        const guardPathEvaluationResult = this.getGuardPath().evaluate(board);
        if (guardPathEvaluationResult.hasFailedCondition) {
            // We have not changed state, but a node guard condition has failed.
            return {
                hasStateChanged: false,
                failedGuardNode: guardPathEvaluationResult.node
            };
        }

        // Call the condition function to determine the state of this node, but it must exist in the blackboard.
        if (typeof board[condition] === "function") {
            state = !!(board[condition]()) ? Mistreevous.State.SUCCEEDED : Mistreevous.State.FAILED;
        } else {
            throw `cannot update condition node as function '${condition}' is not defined in the blackboard`;
        }

        // Return whether the state of this node has changed.
        return { hasStateChanged: state !== initialState };
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => condition;
};

Condition.prototype = Object.create(Leaf.prototype);