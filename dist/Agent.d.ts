import { CompleteState } from "./State";
export type Agent = {
    [actionName: string]: AgentFunction;
};
export type ExitFunctionArg = {
    succeeded: boolean;
    aborted: boolean;
};
export type FunctionArg = number | string | boolean | null | ExitFunctionArg;
export type ActionResult = CompleteState | Promise<CompleteState> | boolean;
export type AgentFunction = (this: Agent, ...args: FunctionArg[]) => ActionResult;
export type GlobalFunction = (agent: Agent, ...args: FunctionArg[]) => ActionResult;
