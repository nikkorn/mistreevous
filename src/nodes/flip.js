import Composite from './composite'

/**
 * A Flip node.
 * This node wraps a single child and will flip the state of the child state.
 * @param guard The node guard.
 * @param child The child node. 
 */
export default function Flip(guard, child) {
    Composite.call(this, "flip", guard, [child]);
   
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
                        failedGuardNode: updateResult.failedGuardNode
                    };
                }
            }
        }

        // The state of this node will depend in the state of its child.
        switch (child.getState()) {
            case Mistreevous.State.RUNNING:
                this.setState(Mistreevous.State.RUNNING);
                break;

            case Mistreevous.State.SUCCEEDED:
                this.setState(Mistreevous.State.FAILED);
                break;

            case Mistreevous.State.FAILED:
                this.setState(Mistreevous.State.SUCCEEDED);
                break;

            default:
                this.setState(Mistreevous.State.READY);
        }

        // Return whether the state of this node has changed.
        return { hasStateChanged: this.getState() !== initialState };
    };
   
    /**
     * Gets the name of the node.
     */
    this.getName = () => "FLIP";
};

Flip.prototype = Object.create(Composite.prototype);