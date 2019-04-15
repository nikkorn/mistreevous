/**
 * A Root node.
 * The root node will have a single child.
 * @param uid The unique node it.
 * @param child The child node. 
 */
function Root(uid, child) {
    /**
     * The node state.
     */
    let state = Mistreevous.State.READY;
   
    /**
     * Update the node and get whether the node state has changed.
     * @param board The board.
     * @returns Whether the state of this node has changed as part of the update.
     */
    this.update = function(board) {
        // Get the pre-update node state.
        const initialState = state;

        // If the child has never been updated or is running then we will need to update it now.
        if (child.getState() === Mistreevous.State.READY || child.getState() === Mistreevous.State.RUNNING) {
            child.update(board);
        }

        // The state of the root node is the state of its child.
        state = child.getState();

        // Return whether the state of this node has changed.
        return state !== initialState;
    };

    /**
     * Gets the state of the node.
     */
    this.getState = () => state;

    /**
     * Gets the name of the node.
     */
    this.getName = () => "ROOT";

    /**
     * Gets the state of the node.
     */
    this.getChildren = () => [child];

    /**
     * Gets the type of the node.
     */
    this.getType = () => "root";

    /**
     * Gets the unique id of the node.
     */
    this.getUid = () => uid;

    /**
     * Reset the state of the node.
     */
    this.reset = () => {
        // Reset the state of this node.
        state = Mistreevous.State.READY;

        // Reset the child node.
        child.reset();
    };
};