import { CompleteState } from "./State";

export type Agent = {
    [actionName: string]: AgentFunction;
};

/*
    Mistreevous supports users defining a variety of callback functions. There
    are different categories of these functions, such as:
    - Actions - which should return a State (sometimes as a promise).
    - Exit* actions - which receive their own special type of non-literal
      object.
    - Conditions - Which should return a boolean.
    
    While initially they seem homogenous looking through the codebase, you may
    find that in practice there are some differences, and when we call these
    functions, there isn't much that caters to those differences differences.
    It's mostly scout's honour for the user to do the logical thing (for
    example, not taking a condition function and re-using it as an exit
    function).

    Rather than try to enforce some constraints to restrict these
    inconsistencies, we are instead reflecting some of those ambigiouties.
    This hopefully:
    - Keeps these types simple.
    - Reduces the complexity burden on code calling this API.
    - Avoids messy type erasure and inconsistencies in our code.
    - Might allow the user to do something smart - like overload action types
      or register global conditions (which isn't documented, but seems to be
      supported).
*/

export type ExitFunctionArg = { succeeded: boolean; aborted: boolean };
export type FunctionArg = number | string | boolean | null | ExitFunctionArg;
export type ActionResult = CompleteState | Promise<CompleteState> | boolean;
export type AgentFunction = (this: Agent, ...args: FunctionArg[]) => ActionResult;
export type GlobalFunction = (agent: Agent, ...args: FunctionArg[]) => ActionResult;
