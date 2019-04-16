/**
 * A Flip node.
 * This node wraps a single child and will flip the state of the child state.
 * @param uid The unique node it.
 * @param child The child node. 
 */
export default function Flip(uid, child) {
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
        return state !== initialState;
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
     * Gets the type of the node.
     */
    this.getType = () => "flip";

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