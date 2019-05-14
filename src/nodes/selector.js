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
     * @param guardScope The guard scope.
     * @returns Whether the state of this node has changed as part of the update.
     */
    this.update = function(board, guardScope) {
        // Get the pre-update node state.
        const initialState = state;

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (state === Mistreevous.State.SUCCEEDED || state === Mistreevous.State.FAILED) {
            // We have not changed state.
            return false;
        }

        // Iterate over all of the children of this node.
        for (const child of children) {
            // If the child has never been updated or is running then we will need to update it now.
            if (child.getState() === Mistreevous.State.READY || child.getState() === Mistreevous.State.RUNNING) {
                child.update(board, guardScope.createScope(guard, this));
            }

            // If the current child has a state of 'SUCCEEDED' then this node is also a 'SUCCEEDED' node.
            if (child.getState() === Mistreevous.State.SUCCEEDED) {
                // This node is a 'SUCCEEDED' node.
                state = Mistreevous.State.SUCCEEDED;

                // There is no need to check the rest of the selector nodes.
                return state !== initialState;
            }

            // If the current child has a state of 'FAILED' then we should move on to the next child.
            if (child.getState() === Mistreevous.State.FAILED) {
                // Find out if the current child is the last one in the selector.
                // If it is then this sequence node has also failed.
                if (children.indexOf(child) === children.length - 1) {
                    // This node is a 'FAILED' node.
                    state = Mistreevous.State.FAILED;

                    // There is no need to check the rest of the selector as we have completed it.
                    return state !== initialState;
                } else {
                    // The child node failed, try the next one.
                    continue;
                }
            }

            // The node should be in the 'RUNNING' state.
            if (child.getState() === Mistreevous.State.RUNNING) {
                // This node is a 'RUNNING' node.
                state = Mistreevous.State.RUNNING;

                // There is no need to check the rest of the selector as the current child is still running.
                return state !== initialState;
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