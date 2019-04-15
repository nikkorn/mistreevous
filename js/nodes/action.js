/**
 * An Action node.
 * This represents an immediate or ongoing state of behaviour.
 */
class Action extends BehaviourTreeNode {
    
    /**
     * Create a new instance of the Action class.
     * @param uid The unique node it.
     * @param actionName The action name.
     */
    constructor(uid, actionName) {
        super(uid, "action");
        this.actionName = actionName;
    }

    /**
     * Update the node and get whether the node state has changed.
     * @param board The board.
     * @returns Whether the state of this node has changed as part of the update.
     */
    update(board) {
        // Get the pre-update node state.
        const initialState = this.state;

        // An action node should be updated until it fails or succeeds.
        if (this.state === Mistreevous.State.READY || this.state === Mistreevous.State.RUNNING) {
            // Get the corresponding action object.
            const action = board[this.actionName];

            // Validate the action.
            this._validateAction(action);

            // If the state of this node is 'READY' then this is the fist time that we are updating this node, so call onStart if it exists.
            if (this.state === Mistreevous.State.READY && typeof action.onStart === "function") {
                action.onStart();
            }

            // Call the action update, the result of which will be the new state of this action node, or 'RUNNING' if undefined.
            this.state = action.onUpdate() || Mistreevous.State.RUNNING;

            // If the new action node state is either 'SUCCEEDED' or 'FAILED' then we are finished, so call onFinish if it exists.
            if ((this.state === Mistreevous.State.SUCCEEDED || this.state === Mistreevous.State.FAILED) && typeof action.onFinish === "function") {
                action.onFinish(this.state === Mistreevous.State.SUCCEEDED, false);
            }
        }

        // Return whether the state of this node has changed.
        return this.state !== initialState;
    };

    /**
     * Gets the name of the node.
     */
    getName = () => this.actionName;

    /**
     * Validate an action.
     * @param action The action to validate.
     */
    _validateAction = (action) => {
        // The action should be defined.
        if (!action) {
            throw `cannot update action node as action '${this.actionName}' is not defined in the blackboard`;
        }

        // The action should at the very least have a onUpdate function defined.
        if (typeof action.onUpdate !== "function") {
            throw `action '${this.actionName}' does not have an 'onUpdate()' function defined`;
        }
    };
};