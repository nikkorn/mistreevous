import Callback from "./Callback";
import Lookup from "../../Lookup";
import { Agent } from "../../Agent";
import { AnyArgument } from "../../RootAstNodesBuilder";

/**
 * An ENTRY callback which defines an agent function to call when the associated node is updated and moves out of running state.
 */
export default class Entry extends Callback {
    /**
     * @param functionName The name of the agent function to call.
     * @param args The array of callback argument definitions.
     */
    constructor(functionName: string, args: AnyArgument[]) {
        super("entry", args, functionName);
    }

    /**
     * Attempt to call the agent function that this callback refers to.
     * @param agent The agent.
     */
    callAgentFunction = (agent: Agent) => {
        // Attempt to get the invoker for the callback function.
        const callbackFuncInvoker = Lookup.getFuncInvoker(agent, this.getFunctionName());

        // The callback function should be defined.
        if (callbackFuncInvoker === null) {
            throw new Error(
                `cannot call entry function '${this.getFunctionName()}' as is not defined on the agent and has not been registered`
            );
        }

        // Call the callback function.
        callbackFuncInvoker(this.args);
    };
}
