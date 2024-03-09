import State, { CompleteState } from "./State";
/**
 * A type representing an agent that a behavior tree instance would operate on.
 */
export type Agent = {
    [propertyName: string]: AgentFunction | unknown;
};
export type ExitFunctionArg = {
    succeeded: boolean;
    aborted: boolean;
};
export type FunctionArg = any | ExitFunctionArg;
export type ActionResult = CompleteState | Promise<CompleteState> | State.RUNNING | void;
export type AgentFunction = (this: Agent, ...args: FunctionArg[]) => ActionResult | boolean;
export type GlobalFunction = (agent: Agent, ...args: FunctionArg[]) => ActionResult | boolean;
