/**
 * An Action node.
 * This represents an immediate or ongoing state of behaviour.
 * @param uid The unique node it.
 * @param actionName The action name.
 */
export default function Action(uid, actionName) {
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

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (state === Mistreevous.State.SUCCEEDED || state === Mistreevous.State.FAILED) {
            // We have not changed state.
            return false;
        }

        // Get the corresponding action object or function.
        const action = board[actionName];

        // Validate the action.
        this._validateAction(action);

        // If the state of this node is 'READY' then this is the first time that we are updating this node, so call onStart if it exists.
        if (state === Mistreevous.State.READY && typeof action === "object" && typeof action.onStart === "function") {
            action.onStart();
        }

        // Call the action 'onUpdate' function, the result of which will be the new state of this action node, or 'RUNNING' if undefined.
        const updateResult = typeof action === "function" ? action() : action.onUpdate();

        // Validate the returned value.
        this._validateUpdateResult(updateResult);

        // Set the state of this node, this may be undefined, which just means that the node is still in the 'RUNNING' state.
        state = updateResult || Mistreevous.State.RUNNING;

        // If the new action node state is either 'SUCCEEDED' or 'FAILED' then we are finished, so call onFinish if it exists.
        if ((state === Mistreevous.State.SUCCEEDED || state === Mistreevous.State.FAILED) && typeof action === "object" && typeof action.onFinish === "function") {
            action.onFinish(state === Mistreevous.State.SUCCEEDED);
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

        // The action will need to be a function or an object, anything else is not valid.
        if (typeof action !== "function" || typeof action !== "object") {
            return `action '${actionName}' must be a function or object`;
        }

        // The action should at the very least have a onUpdate function defined.
        // Unlike 'onStart' and 'onFinish', this function must be defined as it is critical in determining node state.
        if (typeof action === "object" && typeof action.onUpdate !== "function") {
            throw `action '${actionName}' does not have an 'onUpdate()' function defined`;
        }
    };

    /**
     * Validate the result of an update function call.
     * @param result The result of an update function call.
     */
    this._validateUpdateResult = (result) => {
        switch (result) {
            case Mistreevous.State.SUCCEEDED:
            case Mistreevous.State.FAILED:
            case undefined:
                return;
            default:
                throw `action '${actionName}' 'onUpdate' returned an invalid response, expected an optional Mistreevous.State.SUCCEEDED or Mistreevous.State.FAILED value to be returned`;
        }
    };
};