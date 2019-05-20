import * as BT from './behaviourtree';

export const State = {
    READY: Symbol("mistreevous.ready"),
    RUNNING: Symbol("mistreevous.running"),
    SUCCEEDED: Symbol("mistreevous.succeeded"),
    FAILED: Symbol("mistreevous.failed")
};

// TODO Find a fix for not being able to directly export BehaviourTree correctly.
export const BehaviourTree = BT.BehaviourTree;