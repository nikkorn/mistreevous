import Callback from "./callback";
/**
 * An EXIT callback which defines an agent function to call when the associated node is updated and moves to a finished state or is aborted.
 * @param functionName The name of the agent function to call.
 * @param args The array of callback argument definitions.
 */
export default class Exit extends Callback {
    private functionName;
    constructor(functionName: string, args: any[]);
    /**
     * Gets the function name.
     */
    getFunctionName: () => string;
    /**
     * Gets the callback details.
     */
    getDetails: () => {
        type: string;
        isGuard: boolean;
        functionName: string;
        arguments: any[];
    };
    /**
     * Attempt to call the agent function that this callback refers to.
     * @param agent The agent.
     * @param isSuccess Whether the decorated node was left with a success state.
     * @param isAborted Whether the decorated node was aborted.
     */
    callAgentFunction: (agent: any, isSuccess: boolean, isAborted: boolean) => void;
}
