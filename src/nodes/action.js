import Leaf from './leaf'

/**
 * An Action leaf node.
 * This represents an immediate or ongoing state of behaviour.
 * @param uid The unique node id.
 * @param actionName The action name.
 */
export default function Action(uid, actionName) {
    Leaf.call(this, uid, "action", null);

    /**
     * The onFinish action function, if one was defined.
     */
    let onFinish;
   
    /**
     * Update the node.
     * @param board The board.
     * @returns The result of the update.
     */
    this.update = function(board) {
        // Get the pre-update node state.
        const initialState = this.getState();

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (this.is(Mistreevous.State.SUCCEEDED) || this.is(Mistreevous.State.FAILED)) {
            // We have not changed state.
            return { hasStateChanged: false };
        }

        // Get a reference to the onFinish action function if it exists so that we can call it outside of an update.
        if (this.is(Mistreevous.State.READY) && typeof action === "object" && typeof action.onFinish === "function") {
            onFinish = action.onFinish;
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

        // Get the corresponding action object or function.
        const action = board[actionName];

        // Validate the action.
        this._validateAction(action);

        // If the state of this node is 'READY' then this is the first time that we are updating this node, so call onStart if it exists.
        if (this.is(Mistreevous.State.READY) && typeof action === "object" && typeof action.onStart === "function") {
            action.onStart();
        }

        // Call the action 'onUpdate' function, the result of which will be the new state of this action node, or 'RUNNING' if undefined.
        const updateResult = typeof action === "function" ? action() : action.onUpdate();

        // Validate the returned value.
        this._validateUpdateResult(updateResult);

        // Set the state of this node, this may be undefined, which just means that the node is still in the 'RUNNING' state.
        this.setState(updateResult || Mistreevous.State.RUNNING);

        // If the new action node state is either 'SUCCEEDED' or 'FAILED' then we are finished, so call onFinish if it exists.
        if ((this.is(Mistreevous.State.SUCCEEDED) || this.is(Mistreevous.State.FAILED)) && onFinish) {
            onFinish({ succeeded: this.is(Mistreevous.State.SUCCEEDED), aborted: false });
        }

        // Return whether the state of this node has changed.
        return { hasStateChanged: this.getState() !== initialState };
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => actionName;

    /**
     * Reset the state of the node.
     * @param isAbort Whether the reset is part of an abort.
     */
    this.reset = (isAbort) => {
        // If the reset is due to an abort, and this node is running, call onFinish() if it is defined.
        if (isAbort && state === Mistreevous.State.RUNNING && onFinish) {
            onFinish({ succeeded: false, aborted: true });
        }

        // Reset the state of this node.
        this.setState(Mistreevous.State.READY);
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

Action.prototype = Object.create(Leaf.prototype);