/**
 * A base node.
 * @param uid The unique node id.
 * @param type The node type.
 * @param guard The node guard.
 */
export default function Node(uid, type, guard) {
  /**
   * The node state.
   */
  let state = Mistreevous.State.READY;

  /**
   * Gets/Sets the state of the node.
   */
  this.getState = () => state;
  this.setState = (value) => state = value;

  /**
   * Gets the unique id of the node.
   */
  this.getUid = () => uid;

  /**
   * Gets the type of the node.
   */
  this.getType = () => type;

  /**
   * Gets the guard of the node.
   */
  this.getGuard = () => guard;

  /**
   * Gets whether this node is in the specified state.
   * @param value The value to compare to the node state.
   */
  this.is = (value) => {
    return state === value;
  };

  /**
   * Reset the state of the node.
   * @param isAbort Whether the reset is part of an abort.
   */
  this.reset = (isAbort) => {
    // Reset the state of this node.
    this.setState(Mistreevous.State.READY);
  };
};