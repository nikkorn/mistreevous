import { CompleteState } from "./State";
/**
 * A type representing an agent that a behavior tree instance would operate on.
 */
export type Agent = {
    [actionName: string]: AgentFunction;
};
export type ExitFunctionArg = {
    succeeded: boolean;
    aborted: boolean;
};
export type FunctionArg = number | string | boolean | null | ExitFunctionArg;
export type ActionResult = CompleteState | Promise<CompleteState> | boolean | void;
export type AgentFunction = (this: Agent, ...args: FunctionArg[]) => ActionResult;
export type GlobalFunction = (agent: Agent, ...args: FunctionArg[]) => ActionResult;
