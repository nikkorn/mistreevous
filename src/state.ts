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
