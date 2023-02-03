import { Agent } from "../../Agent";
import { AnyArgument } from "../../RootAstNodesBuilder";
import Attribute, { AttributeDetails } from "../Attribute";
export type CallbackAttributeDetails = {
    /** The name of the agent function that is called. */
    functionName: string;
} & AttributeDetails;
/**
 * A base node callback attribute.
 */
export default abstract class Callback extends Attribute<CallbackAttributeDetails> {
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
     * Gets the attribute details.
     */
    getDetails(): CallbackAttributeDetails;
    /**
     * Attempt to call the agent function that this callback refers to.
     * @param agent The agent.
     */
    abstract callAgentFunction: (agent: Agent, isSuccess: boolean, isAborted: boolean) => void;
}
