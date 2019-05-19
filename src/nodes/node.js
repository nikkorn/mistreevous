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
   * Gets the node decorator with the specified type, or null if it does not exist.
   */
  this.getDecorator = (type) => this.getDecorators().filter((decorator) => decorator.getType().toUpperCase() === type.toUpperCase())[0] || null;

  /**
   * Gets the node decorators.
   */
  this.getGuardDecorators = () => this.getDecorators().filter((decorator) => decorator.isGuard());

  /**
   * Gets whether this node is in the specified state.
   * @param value The value to compare to the node state.
   */
  this.is = (value) => {
    return state === value;
  };

  /**
   * Reset the state of the node.
   */
  this.reset = () => {
    // Reset the state of this node.
    this.setState(Mistreevous.State.READY);
  };

  /**
   * Abort the running of this node.
   * @param board The board.
   */
  this.abort = (board) => {
    // There is nothing to do if this node is not in the running state.
    if (!this.is(Mistreevous.State.RUNNING)) {
      return;
    }

    // Reset the state of this node.
    this.reset();

    // Try to get the exit decorator for this node.
    const exitDecorator = this.getDecorator("exit");

    // Call the exit decorator function if it exists.
    if (exitDecorator) {
      exitDecorator.callBlackboardFunction(board, false, true);
    }
  };

  /**
   * Any pre-update logic.
   * @param board The board.
   */
  this.onBeforeUpdate = (board) => {};

  /**
   * Update the node.
   * @param board The board.
   * @returns The result of the update.
   */
  this.update = (board) => {
    // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
    if (this.is(Mistreevous.State.SUCCEEDED) || this.is(Mistreevous.State.FAILED)) {
        // We have not changed state.
        return {};
    }

    // Do any pre-update logic.
    this.onBeforeUpdate(board);

    // If this node is in the READY state then call the ENTRY decorator for this node if it exists.
    if (this.is(Mistreevous.State.READY)) {
      const entryDecorator = this.getDecorator("entry");

      // Call the entry decorator function if it exists.
      if (entryDecorator) {
        entryDecorator.callBlackboardFunction(board);
      }
    }

    // Try to get the step decorator for this node.
    const stepDecorator = this.getDecorator("step");

    // Call the step decorator function if it exists.
    if (stepDecorator) {
      stepDecorator.callBlackboardFunction(board);
    }

    // Do the actual update and grab the result.
    const updateResult = this.onUpdate(board);

    // If this node is now in a 'SUCCEEDED' or 'FAILED' state then call the EXIT decorator for this node if it exists.
    if (this.is(Mistreevous.State.SUCCEEDED) || this.is(Mistreevous.State.FAILED)) {
      const exitDecorator = this.getDecorator("exit");

      // Call the exit decorator function if it exists.
      if (exitDecorator) {
        exitDecorator.callBlackboardFunction(board, this.is(Mistreevous.State.SUCCEEDED), false);
      }
    }

    // Return the update result, or an empty object if nothing was returned.
    return updateResult || {};
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