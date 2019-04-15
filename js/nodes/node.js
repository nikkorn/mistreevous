
/**
 * A basic behaviour tree node.
 */
class BehaviourTreeNode {

    /**
     * Create a new instance of the BehaviourTreeNode class.
     * @param uid The unique node id.
     * @param type The node type.
     */
    constructor (uid, type) {
        this.uid   = uid;
        this.type  = type;
        this.state = Mistreevous.State.READY;
    }

    /**
     * Gets the state of the node.
     * @returns The state of the node.
     */
    getState = () => this.state;

    /**
     * Gets the type of the node.
     * @returns The type of the node.
     */
    getType = () => this.type;

    /**
     * Gets the unique id of the node.
     * @returns The unique id of the node.
     */
    getUid = () => this.uid;

    /**
     * Gets the child nodes of the node.
     */
    getChildren = () => null;

     /**
     * Reset the state of the node.
     */
    reset() {
        // Reset the state of this node.
        this.state = Mistreevous.State.READY;
    };
}