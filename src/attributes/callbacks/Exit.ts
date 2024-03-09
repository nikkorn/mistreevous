import Callback from "./Callback";
import Lookup from "../../Lookup";
import { Agent } from "../../Agent";

/**
 * An EXIT callback which defines an agent function to call when the associated node is updated and moves to a finished state or is aborted.
 */
export default class Exit extends Callback {
    /**
     * @param functionName The name of the agent function to call.
     * @param args The array of callback argument definitions.
     */
    constructor(functionName: string, args: any[]) {
        super("exit", args, functionName);
    }

    /**
     * Attempt to call the agent function that this callback refers to.
     * @param agent The agent.
     * @param isSuccess Whether the decorated node was left with a success state.
     * @param isAborted Whether the decorated node was aborted.
     */
    callAgentFunction = (agent: Agent, isSuccess: boolean, isAborted: boolean) => {
        // Attempt to get the invoker for the callback function.
        const callbackFuncInvoker = Lookup.getFuncInvoker(agent, this.getFunctionName());

        // The callback function should be defined.
        if (callbackFuncInvoker === null) {
            throw new Error(
                `cannot call exit function '${this.getFunctionName()}' as is not defined on the agent and has not been registered`
            );
        }

        // Call the callback function
        callbackFuncInvoker([{ succeeded: isSuccess, aborted: isAborted }, ...this.args]);
    };
}
