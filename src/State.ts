/**
 * Enumeration of node state types.
 */
export enum State {
    /**
     * The state that a node will be in when it has not been visited yet in the execution of the tree.
     */
    READY = "mistreevous.ready",
    /**
     * The state that a node will be in when it is still being processed and will usually represent or encompass a long-running action.
     */
    RUNNING = "mistreevous.running",
    /**
     * The state that a node will be in when it is no longer being processed and has succeeded.
     */
    SUCCEEDED = "mistreevous.succeeded",
    /**
     * The state that a node will be in when it is no longer being processed but has failed.
     */
    FAILED = "mistreevous.failed"
}

export { State as default };

export type CompleteState = State.SUCCEEDED | State.FAILED;
export type AnyState = State.READY | State.RUNNING | CompleteState;
