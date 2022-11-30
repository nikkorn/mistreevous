import Callback from "./callback";
import Lookup from "../../lookup";

/**
 * A STEP callback which defines an agent function to call when the associated node is updated.
 * @param functionName The name of the agent function to call.
 * @param args The array of callback argument definitions.
 */
export default class Step extends Callback {
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
     */
    callAgentFunction = (agent: any) => {
        // Attempt to get the invoker for the callback function.
        const callbackFuncInvoker = Lookup.getFuncInvoker(agent, this.functionName);

        // The callback function should be defined.
        if (callbackFuncInvoker === null) {
            throw new Error(
                `cannot call step function '${this.functionName}' as is not defined on the agent and has not been registered`
            );
        }

        // Call the callback function.
        callbackFuncInvoker(this.args);
    };
}
