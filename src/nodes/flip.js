/**
 * A Flip node.
 * This node wraps a single child and will flip the state of the child state.
 * @param uid The unique node id.
 * @param guard The node guard.
 * @param child The child node. 
 */
export default function Flip(uid, guard, child) {
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

        // If the child has never been updated or is running then we will need to update it now.
        if (child.getState() === Mistreevous.State.READY || child.getState() === Mistreevous.State.RUNNING) {
            // Update the child of this node and get the result.
            const updateResult = child.update(board, guardScope.createScope(guard, this));

            // Check to see whether we have a failed node guard condition.
            if (updateResult.failedGuardNode) {
                // Is this node the one with the failed guard condition?
                if (updateResult.failedGuardNode === this) {
                    // We need to reset this node, passing a flag to say that this is an abort.
                    this.reset(true);
                    
                    // The guard condition for this node did not pass, so this node will move into the FAILED state.
                    state = Mistreevous.State.FAILED;
    
                    // Return whether the state of this node has changed.
                    return { hasStateChanged: true };
                } else {
                    // A node guard condition has failed higher up the tree.
                    return {
                        hasStateChanged: false,
                        failedGuardNode: guardScopeEvaluationResult.node
                    };
                }
            }
        }

        // The state of this node will depend in the state of its child.
        switch (child.getState()) {
            case Mistreevous.State.RUNNING:
                state = Mistreevous.State.RUNNING;
                break;

            case Mistreevous.State.SUCCEEDED:
                state = Mistreevous.State.FAILED;
                break;

            case Mistreevous.State.FAILED:
                state = Mistreevous.State.SUCCEEDED;
                break;
            default:
                state = Mistreevous.State.READY;
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
    this.getName = () => "FLIP";

    /**
     * Gets the state of the node.
     */
    this.getChildren = () => [child];

    /**
     * Gets the guard of the node.
     */
    this.getGuard = () => guard;

    /**
     * Gets the type of the node.
     */
    this.getType = () => "flip";

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

        // Reset the child node.
        child.reset(isAbort);
    };
};