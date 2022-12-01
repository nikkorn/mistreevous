import State from "./state";
export type FunctionArg = number | string | boolean | null;
export type ActionResult = typeof State.SUCCEEDED | typeof State.FAILED | Promise<typeof State.SUCCEEDED> | Promise<typeof State.FAILED>;
export type ConditionFunction = (this: Agent, ...args: FunctionArg[]) => boolean;
export type ActionFunction = (this: Agent, ...args: FunctionArg[]) => ActionResult;
export type AgentFunction = ConditionFunction | ActionFunction;
export type Agent = {
    [actionName: string]: AgentFunction;
};
export type GlobalConditionFunction = (agent: Agent, ...args: FunctionArg[]) => boolean;
export type GlobalActionFunction = (agent: Agent, ...args: FunctionArg[]) => ActionResult;
export type GlobalFunction = GlobalConditionFunction | GlobalActionFunction;
