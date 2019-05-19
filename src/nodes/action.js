import Leaf from './leaf'

/**
 * An Action leaf node.
 * This represents an immediate or ongoing state of behaviour.
 * @param decorators The node decorators.
 * @param actionName The action name.
 */
export default function Action(decorators, actionName) {
    Leaf.call(this, "action", decorators);
   
    /**
     * Update the node.
     * @param board The board.
     * @returns The result of the update.
     */
    this.onUpdate = function(board) {
        // Get the corresponding action object or function.
        const action = board[actionName];

        // Validate the action.
        this._validateAction(action);

        // Call the action 'onUpdate' function, the result of which will be the new state of this action node, or 'RUNNING' if undefined.
        const updateResult = action();

        // Validate the returned value.
        this._validateUpdateResult(updateResult);

        // Set the state of this node, this may be undefined, which just means that the node is still in the 'RUNNING' state.
        this.setState(updateResult || Mistreevous.State.RUNNING);
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => actionName;

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
            return `action '${actionName}' must be a function`;
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