import { Agent } from "../../Agent";
import Attribute, { AttributeDetails } from "../Attribute";

/**
 * Details of a node callback attribute.
 */
export type CallbackAttributeDetails = {
    /** The name of the agent function that is called. */
    calls: string;

    /** The callback function arguments. */
    args: any[];
} & AttributeDetails;

/**
 * A base node callback attribute.
 */
export default abstract class Callback extends Attribute<CallbackAttributeDetails> {
    /**
     * @param type The node attribute type.
     * @param functionName The name of the agent function to call.
     * @param args The array of callback function arguments.
     */
    constructor(type: string, private functionName: string, private args: any[]) {
        super(type);
    }

    /**
     * Gets the name of the agent function to call.
     */
    getFunctionName = () => this.functionName;

    /**
     * Gets the attribute details.
     */
    getDetails(): CallbackAttributeDetails {
        return {
            type: this.type,
            args: this.args,
            calls: this.getFunctionName()
        };
    }

    /**
     * Attempt to call the agent function that this callback refers to.
     * @param agent The agent.
     */
    abstract callAgentFunction(agent: Agent, isSuccess: boolean, isAborted: boolean): void;
}
