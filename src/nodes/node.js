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
   * Gets the state of the node.
   */
  this.getState = () => state;

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
   * Reset the state of the node.
   * @param isAbort Whether the reset is part of an abort.
   */
  this.reset = (isAbort) => {
      // Reset the state of this node.
      state = Mistreevous.State.READY;
  };
};