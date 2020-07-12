/**
 * Enumeration of node states.
 */
const StateNameEnum = {
    READY: "mistreevous.ready",
    RUNNING: "mistreevous.running",
    SUCCEEDED: "mistreevous.succeeded",
    FAILED: "mistreevous.failed"
}

const State = {
    READY: Symbol(StateNameEnum.READY),
    RUNNING: Symbol(StateNameEnum.RUNNING),
    SUCCEEDED: Symbol(StateNameEnum.SUCCEEDED),
    FAILED: Symbol(StateNameEnum.FAILED)
};

export {
    StateNameEnum,
    State as default
};
