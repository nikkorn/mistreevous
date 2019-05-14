import GuardScope from "../guards/guardScope";
import Composite from './composite'

/**
 * A Root node.
 * The root node will have a single child.
 * @param uid The unique node id.
 * @param guard The node guard.
 * @param child The child node. 
 */
export default function Root(uid, guard, child) {
    Composite.call(this, uid, "root", guard, [child]);
   
    /**
     * Update the node and get whether the node state has changed.
     * @param board The board.
     * @returns Whether the state of this node has changed as part of the update.
     */
    this.update = function(board) {
        // Get the pre-update node state.
        const initialState = state;

        // We will need to create the root guard scope here.
        const guardScope = new GuardScope(guard, this);

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (state === Mistreevous.State.SUCCEEDED || state === Mistreevous.State.FAILED) {
            // We have not changed state.
            return false;
        }

        // If a guard has been defined for the node, this node will move into the FAILED state if it is not satisfied.
        if (guard && !guard.isSatisfied(board)) {
            // The guard is not satisfied and therefore we are finished with the node.
            state = Mistreevous.State.FAILED;

            // The node has moved to the FAILED state.
            return true;
        }

        // If the child has never been updated or is running then we will need to update it now.
        if (child.getState() === Mistreevous.State.READY || child.getState() === Mistreevous.State.RUNNING) {
            child.update(board, guardScope);
        }

        // The state of the root node is the state of its child.
        state = child.getState();

        // Return whether the state of this node has changed.
        return state !== initialState;
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => "ROOT";
};

Root.prototype = Object.create(Composite.prototype);