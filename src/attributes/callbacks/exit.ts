import Callback from "./callback";
// @ts-ignore
import Lookup from "../../Lookup";

/**
 * An EXIT callback which defines an agent function to call when the associated node is updated and moves to a finished state or is aborted.
 * @param functionName The name of the agent function to call.
 * @param args The array of callback argument definitions.
 */
export default class Exit extends Callback {
    constructor(private functionName: string, args: any[]) {
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
    callAgentFunction = (agent: any, isSuccess: boolean, isAborted: boolean) => {
        // Attempt to get the invoker for the callback function.
        const callbackFuncInvoker = Lookup.getFuncInvoker(agent, this.functionName);

        // The callback function should be defined.
        if (callbackFuncInvoker === null) {
            throw new Error(
                `cannot call exit function '${this.functionName}' as is not defined on the agent and has not been registered`
            );
        }

        // Call the callback function.
        callbackFuncInvoker([{ value: { succeeded: isSuccess, aborted: isAborted } }].concat(this.args));
    };
}
