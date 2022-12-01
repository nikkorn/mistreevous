import Callback from "./callback";
import { Agent } from "../../agent";
/**
 * A STEP callback which defines an agent function to call when the associated node is updated.
 */
export default class Step extends Callback {
    private functionName;
    /**
     * @param functionName The name of the agent function to call.
     * @param args The array of callback argument definitions.
     */
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
     */
    callAgentFunction: (agent: Agent) => void;
}
