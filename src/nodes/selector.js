import Composite from './composite'

/**
 * A SELECTOR node.
 * The child nodes are executed in sequence until one succeeds or all fail.
 * @param uid The unique node id.
 * @param guard The node guard.
 * @param children The child nodes.
 */
export default function Selector(uid, guard, children) {
    Composite.call(this, uid, "selector", guard, children);

    /**
     * Update the node and get whether the node state has changed.
     * @param board The board.
     * @returns Whether the state of this node has changed as part of the update.
     */
    this.update = function(board) {
        // Get the pre-update node state.
        const initialState = this.getState();

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (this.is(Mistreevous.State.SUCCEEDED) || this.is(Mistreevous.State.FAILED)) {
            // We have not changed state.
            return { hasStateChanged: false };
        }

        // Iterate over all of the children of this node.
        for (const child of children) {
            // If the child has never been updated or is running then we will need to update it now.
            if (child.getState() === Mistreevous.State.READY || child.getState() === Mistreevous.State.RUNNING) {
                // Update the child of this node and get the result.
                const updateResult = child.update(board);

                // Check to see whether a node guard condition failed during the child node update.
                if (updateResult.failedGuardNode) {
                    // Is this node the one with the failed guard condition?
                    if (updateResult.failedGuardNode === this) {
                        // We need to reset this node, passing a flag to say that this is an abort.
                        this.reset(true);
                        
                        // The guard condition for this node did not pass, so this node will move into the FAILED state.
                        this.setState(Mistreevous.State.FAILED);

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

            // If the current child has a state of 'SUCCEEDED' then this node is also a 'SUCCEEDED' node.
            if (child.getState() === Mistreevous.State.SUCCEEDED) {
                // This node is a 'SUCCEEDED' node.
                this.setState(Mistreevous.State.SUCCEEDED);

                // There is no need to check the rest of the selector nodes.
                return { hasStateChanged: this.getState() !== initialState };
            }

            // If the current child has a state of 'FAILED' then we should move on to the next child.
            if (child.getState() === Mistreevous.State.FAILED) {
                // Find out if the current child is the last one in the selector.
                // If it is then this sequence node has also failed.
                if (children.indexOf(child) === children.length - 1) {
                    // This node is a 'FAILED' node.
                    this.setState(Mistreevous.State.FAILED);

                    // There is no need to check the rest of the selector as we have completed it.
                    return { hasStateChanged: this.getState() !== initialState };
                } else {
                    // The child node failed, try the next one.
                    continue;
                }
            }

            // The node should be in the 'RUNNING' state.
            if (child.getState() === Mistreevous.State.RUNNING) {
                // This node is a 'RUNNING' node.
                this.setState(Mistreevous.State.RUNNING);

                // There is no need to check the rest of the selector as the current child is still running.
                return { hasStateChanged: this.getState() !== initialState };
            }

            // The child node was not in an expected state.
            throw "Error: child node was not in an expected state.";
        }
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => "SELECTOR";
};

Selector.prototype = Object.create(Composite.prototype);