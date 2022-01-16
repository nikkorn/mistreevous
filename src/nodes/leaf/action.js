import Leaf from './leaf';
import State from '../../state'

/**
 * An Action leaf node.
 * This represents an immediate or ongoing state of behaviour.
 * @param decorators The node decorators.
 * @param actionName The action name.
 * @param actionArguments The array of action argument definitions.
 */
export default function Action(decorators, actionName, actionArguments) {
    Leaf.call(this, "action", decorators, actionArguments);

    /**
     * Whether there is a pending update promise. 
     */
    let isUsingUpdatePromise = false;

    /**
     * The finished state result of an update promise.
     */
    let updatePromiseStateResult = null;
   
    /**
     * Update the node.
     * @param board The board.
     * @returns The result of the update.
     */
    this.onUpdate = function(board) {
        // Get the corresponding action object or function.
        const action = board[actionName];

        // If the result of this action depends on an update promise then there is nothing to do until
        // it resolves, unless there has been a value set as a result of the update promise resolving.
        if (isUsingUpdatePromise) {
            // Check whether the update promise has resolved with a state value.
            if (updatePromiseStateResult) {
                // Set the state of this node to match the state returned by the promise.
                this.setState(updatePromiseStateResult);
            }
            
            return;
        }

        // Validate the action.
        this._validateAction(action);

        // Call the action 'onUpdate' function, the result of which may be:
        // - The finished state of this action node.
        // - A promise to return a finished node state.
        // - Undefined if the node should remain in the running state.
        const updateResult = action.apply(board, actionArguments.map(arg => arg.value));

        if (updateResult instanceof Promise) {
            updateResult.then(
                (result) => {
                    // If 'isUpdatePromisePending' is null then the promise was cleared as it was resolving, probably via an abort of reset.
                    if (!isUsingUpdatePromise) {
                        return;
                    }

                    // Check to make sure the result is a valid finished state.
                    if (result !== State.SUCCEEDED && result !== State.FAILED) {
                        throw new Error("action node promise resolved with an invalid value, expected a State.SUCCEEDED or State.FAILED value to be returned");
                    }

                    // Set pending update promise state result to be processed on next update.
                    updatePromiseStateResult = result;
                }, 
                (reason) => {
                    // If 'isUpdatePromisePending' is null then the promise was cleared as it was resolving, probably via an abort of reset.
                    if (!isUsingUpdatePromise) {
                        return;
                    }

                    // Just throw whatever was returned as the rejection argument.
                    throw new Error(reason);
                }
            );

            // This node will be in the 'RUNNING' state until the update promise resolves.
            this.setState(State.RUNNING);

            // We are now waiting for the promise returned by the use to resolve before we know what state this node is in.
            isUsingUpdatePromise = true;
        } else {
            // Validate the returned value.
            this._validateUpdateResult(updateResult);

            // Set the state of this node, this may be undefined, which just means that the node is still in the 'RUNNING' state.
            this.setState(updateResult || State.RUNNING);
        }
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => actionName;

    /**
     * Reset the state of the node.
     */
    this.reset = () => {
        // Reset the state of this node.
        this.setState(State.READY);

        // There is no longer an update promise that we care about.
        isUsingUpdatePromise     = false;
        updatePromiseStateResult = null;
    };

    /**
     * Validate an action.
     * @param action The action to validate.
     */
    this._validateAction = (action) => {
        // The action should be defined.
        if (!action) {
            throw new Error(`cannot update action node as action '${actionName}' is not defined in the blackboard`);
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
            case State.SUCCEEDED:
            case State.FAILED:
            case undefined:
                return;
            default:
                throw new Error(`action '${actionName}' 'onUpdate' returned an invalid response, expected an optional State.SUCCEEDED or State.FAILED value to be returned`);
        }
    };
};

Action.prototype = Object.create(Leaf.prototype);