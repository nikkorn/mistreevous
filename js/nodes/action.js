/**
 * An Action node.
 * This represents an immediate or ongoing state of behaviour.
 * @param uid The unique node it.
 * @param actionName The action name.
 */
function Action(uid, actionName) {
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

        // An action node should be updated until it fails or succeeds.
        if (state === Mistreevous.State.READY || state === Mistreevous.State.RUNNING) {
            // Get the corresponding action object.
            const action = board[actionName];

            // Validate the action.
            this._validateAction(action);

            // If the state of this node is 'READY' then this is the fist time that we are updating this node, so call onStart if it exists.
            if (state === Mistreevous.State.READY && typeof action.onStart === "function") {
                action.onStart();
            }

            // Call the action update, the result of which will be the new state of this action node, or 'RUNNING' if undefined.
            state = action.onUpdate() || Mistreevous.State.RUNNING;

            // If the new action node state is either 'SUCCEEDED' or 'FAILED' then we are finished, so call onFinish if it exists.
            if ((state === Mistreevous.State.SUCCEEDED || state === Mistreevous.State.FAILED) && typeof action.onFinish === "function") {
                action.onFinish(state === Mistreevous.State.SUCCEEDED, false);
            }
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
    this.getName = () => actionName;

    /**
     * Gets the state of the node.
     */
    this.getChildren = () => null;

    /**
     * Gets the type of the node.
     */
    this.getType = () => "action";

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
    };

    /**
     * Validate an action.
     * @param action The action to validate.
     */
    this._validateAction = (action) => {
        // The action should be defined.
        if (!action) {
            throw `cannot update action node as action '${actionName}' is not defined in the blackboard`;
        }

        // The action should at the very least have a onUpdate function defined.
        if (typeof action.onUpdate !== "function") {
            throw `action '${actionName}' does not have an 'onUpdate()' function defined`;
        }
    };
};