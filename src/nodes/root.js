import Composite from './composite'

/**
 * A Root node.
 * The root node will have a single child.
 * @param decorators The node decorators.
 * @param child The child node. 
 */
export default function Root(decorators, child) {
    Composite.call(this, "root", decorators, [child]);
   
    /**
     * Update the node and get whether the node state has changed.
     * @param board The board.
     * @returns Whether the state of this node has changed as part of the update.
     */
    this.onUpdate = function(board) {
        // If the child has never been updated or is running then we will need to update it now.
        if (child.getState() === Mistreevous.State.READY || child.getState() === Mistreevous.State.RUNNING) {
            // Update the child of this node and get the result.
            const updateResult = child.update(board);

            // Check to see whether a node guard condition failed during the child node update.
            if (updateResult.failedGuardNode) {
                // Is this node the one with the failed guard condition?
                if (updateResult.failedGuardNode === this) {
                    // We need to abort this node.
                    this.abort(board);
                    
                    // The guard condition for this node did not pass, so this node will move into the FAILED state.
                    this.setState(Mistreevous.State.FAILED);
    
                    return;
                } else {
                    // As this is the tree root node, it should not be possible for the failed guard node not to have handle the failed condition by now.
                    throw "Guard condition failed but no node was found to handle it";
                }
            }
        }

        // The state of the root node is the state of its child.
        this.setState(child.getState());
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => "ROOT";
};

Root.prototype = Object.create(Composite.prototype);