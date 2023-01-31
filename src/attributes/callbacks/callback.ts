import { Agent } from "../../agent";
import { AnyArgument } from "../../rootAstNodesBuilder";
import Attribute from "../attribute";

/**
 * A base node callback attribute.
 */
export default abstract class Callback extends Attribute {
    /**
     * @param type The node attribute type.
     * @param args The array of decorator argument definitions.
     * @param functionName The name of the agent function to call.
     */
    constructor(type: string, args: AnyArgument[], private functionName: string) {
        super(type, args);
    }

    /**
     * Gets the name of the agent function to call.
     */
    getFunctionName = () => this.functionName;

    /**
     * Gets whether this attribute is a guard.
     */
    isGuard = () => false;

    /**
     * Gets the callback details.
     */
    getDetails = () => {
        return {
            type: this.getType(),
            args: this.getArguments(),
            functionName: this.getFunctionName()
        };
    };

    /**
     * Attempt to call the agent function that this callback refers to.
     * @param agent The agent.
     */
    abstract callAgentFunction: (agent: Agent, isSuccess: boolean, isAborted: boolean) => void;
}
