import Callback from "./callback";
import Lookup, { AnyExitArgument } from "../../lookup";
import { Agent } from "../../agent";
import { AnyArgument } from "../../rootAstNodesBuilder";

/**
 * An EXIT callback which defines an agent function to call when the associated node is updated and moves to a finished state or is aborted.
 */
export default class Exit extends Callback {
    /**
     * @param functionName The name of the agent function to call.
     * @param args The array of callback argument definitions.
     */
    constructor(private functionName: string, args: AnyArgument[]) {
        super("exit", args);
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
     * @param isSuccess Whether the decorated node was left with a success state.
     * @param isAborted Whether the decorated node was aborted.
     */
    callAgentFunction = (agent: Agent, isSuccess: boolean, isAborted: boolean) => {
        // Attempt to get the invoker for the callback function.
        const callbackFuncInvoker = Lookup.getFuncInvoker(agent, this.functionName);

        // The callback function should be defined.
        if (callbackFuncInvoker === null) {
            throw new Error(
                `cannot call exit function '${this.functionName}' as is not defined on the agent and has not been registered`
            );
        }

        // Call the callback function
        callbackFuncInvoker(([{ value: { succeeded: isSuccess, aborted: isAborted } }, ...this.args]));
    };
}
