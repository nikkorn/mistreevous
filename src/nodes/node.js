/**
 * A base node.
 * @param type The node type.
 * @param decorators The node decorators.
 */
export default function Node(type, decorators) {
  /**
   * The node uid.
   */
  const uid = createNodeUid();

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
   * Gets the node decorators.
   */
  this.getDecorators = () => decorators || [];

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

/**
 * Create a randomly generated node uid.
 * @returns A randomly generated node uid.
 */
function createNodeUid() {
  var S4 = function() {
      return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}