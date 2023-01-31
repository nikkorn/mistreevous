import { Agent } from "../../agent";
import { AnyArgument } from "../../rootAstNodesBuilder";
import Attribute from "../attribute";
/**
 * A base node callback attribute.
 */
export default abstract class Callback extends Attribute {
    private functionName;
    /**
     * @param type The node attribute type.
     * @param args The array of decorator argument definitions.
     * @param functionName The name of the agent function to call.
     */
    constructor(type: string, args: AnyArgument[], functionName: string);
    /**
     * Gets the name of the agent function to call.
     */
    getFunctionName: () => string;
    /**
     * Gets whether this attribute is a guard.
     */
    isGuard: () => boolean;
    /**
     * Gets the callback details.
     */
    getDetails: () => {
        type: string;
        args: AnyArgument[];
        functionName: string;
    };
    /**
     * Attempt to call the agent function that this callback refers to.
     * @param agent The agent.
     */
    abstract callAgentFunction: (agent: Agent, isSuccess: boolean, isAborted: boolean) => void;
}
