/**
 * A Condition node.
 * This acts as a guard and will succeed or fail immediately based on a board predicate, without moving to the 'RUNNING' state.
 * @param uid The unique node id.
 * @param condition The name of the condition function. 
 */
export default function Condition(uid, condition) {
    /**
     * The node state.
     */
    let state = Mistreevous.State.READY;
   
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

        // Evaluate all of the guard scope conditions for the current tree path and return result if any guard conditions fail.
        const guardScopeEvaluationResult = guardScope.evaluate(board);
        if (guardScopeEvaluationResult.hasFailedCondition) {
            // We have not changed state, but a node guard condition has failed.
            return {
                hasStateChanged: false,
                failedGuardNode: guardScopeEvaluationResult.node
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
     * Gets the state of the node.
     */
    this.getState = () => state;

    /**
     * Gets the name of the node.
     */
    this.getName = () => condition;

    /**
     * Gets the state of the node.
     */
    this.getChildren = () => null;

    /**
     * Gets the guard of the node.
     */
    this.getGuard = () => null;

    /**
     * Gets the type of the node.
     */
    this.getType = () => "condition";

    /**
     * Gets the unique id of the node.
     */
    this.getUid = () => uid;

    /**
     * Reset the state of the node.
     * @param isAbort Whether the reset is part of an abort.
     */
    this.reset = (isAbort) => {
        // Reset the state of this node.
        state = Mistreevous.State.READY;
    };
};