/**
 * Enumeration of node state types.
 */
export const enum State {
    READY = "mistreevous.ready",
    RUNNING = "mistreevous.running",
    SUCCEEDED = "mistreevous.succeeded",
    FAILED = "mistreevous.failed"
};

export { State as default };

export type CompleteState = State.SUCCEEDED | State.FAILED;
export type AnyState = State.READY | State.RUNNING | CompleteState;
