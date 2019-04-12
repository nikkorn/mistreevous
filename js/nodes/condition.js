/**
 * A Condition node.
 * This acts as a guard and will succeed or fail immediately based on a board predicate, without moving to the 'RUNNING' state.
 * @param uid The unique node it.
 * @param conditionFunction The condition function. 
 */
function Condition(uid, conditionFunction) {
    /**
     * The node state.
     */
    let state = Mistreevous.State.READY;
   
    /**
     * Update the node and get whether the node state has changed.
     * @param board The board.
     * @returns Whether the state of this node has changed as part of the update.
     */
    this.update = function(board) {
        // Get the pre-update node state.
        const initialState = state;

        // Call the condition function to determine the state of this node, but it must exist in the blackboard.
        if (typeof board[conditionFunction] === "function") {
            state = !!(board[conditionFunction]()) ? Mistreevous.State.SUCCEEDED : Mistreevous.State.FAILED;
        } else {
            throw `cannot update condition node as function '${conditionFunction}' is not defined in the blackboard`;
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
    this.getName = () => conditionFunction;

    /**
     * Gets the state of the node.
     */
    this.getChildren = () => null;

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
     */
    this.reset = () => {
        // Reset the state of this node.
        state = Mistreevous.State.READY;

        // Reset the child node.
        child.reset();
    };
};