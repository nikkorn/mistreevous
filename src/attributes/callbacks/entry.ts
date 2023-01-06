import Callback from "./callback";
import Lookup from "../../lookup";
import { Agent } from "../../agent";
import { AnyArgument } from "../../rootAstNodesBuilder";

/**
 * An ENTRY callback which defines an agent function to call when the associated node is updated and moves out of running state.
 */
export default class Entry extends Callback {
    /**
     * @param functionName The name of the agent function to call.
     * @param args The array of callback argument definitions.
     */
    constructor(private functionName: string, args: AnyArgument[]) {
        super("entry", args);
    }

    /**
     * Gets the function name.
     */
    getFunctionName = () => this.functionName;

    /**
     * Gets the callback details.
     */
    getDetails = () => {
        return {
            type: this.getType(),
            isGuard: this.isGuard(),
            functionName: this.getFunctionName(),
            arguments: this.getArguments()
        };
    };

    /**
     * Attempt to call the agent function that this callback refers to.
     * @param agent The agent.
     */
    callAgentFunction = (agent: Agent) => {
        // Attempt to get the invoker for the callback function.
        const callbackFuncInvoker = Lookup.getFuncInvoker(agent, this.functionName);

        // The callback function should be defined.
        if (callbackFuncInvoker === null) {
            throw new Error(
                `cannot call entry function '${this.functionName}' as is not defined on the agent and has not been registered`
            );
        }

        // Call the callback function.
        callbackFuncInvoker(this.args);
    };
}
