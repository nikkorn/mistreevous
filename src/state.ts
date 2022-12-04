/**
 * Enumeration of node state types.
 */
const State = {
    READY: Symbol("mistreevous.ready"),
    RUNNING: Symbol("mistreevous.running"),
    SUCCEEDED: Symbol("mistreevous.succeeded"),
    FAILED: Symbol("mistreevous.failed")
};

export { State as default };

export type CompleteState = typeof State.SUCCEEDED | typeof State.FAILED;
// TODO: Nicer as an enum...
export type AnyState = typeof State.READY | typeof State.RUNNING | CompleteState;
