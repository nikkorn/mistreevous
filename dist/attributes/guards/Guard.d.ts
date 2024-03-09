import { Agent } from "../../Agent";
import Attribute, { AttributeDetails } from "../Attribute";
export type GuardAttributeDetails = {
    /** The name of the condition function that determines whether the guard is satisfied. */
    condition: string;
} & AttributeDetails;
/**
 * A base node guard attribute.
 */
export default abstract class Guard extends Attribute<GuardAttributeDetails> {
    private condition;
    /**
     * @param type The node attribute type.
     * @param args The array of decorator argument definitions.
     * @param condition The name of the condition function that determines whether the guard is satisfied.
     */
    constructor(type: string, args: any[], condition: string);
    /**
     * Gets the name of the condition function that determines whether the guard is satisfied.
     */
    getCondition: () => string;
    /**
     * Gets whether this attribute is a guard.
     */
    isGuard: () => boolean;
    /**
     * Gets the attribute details.
     */
    getDetails(): GuardAttributeDetails;
    /**
     * Gets whether the guard is satisfied.
     * @param agent The agent.
     * @returns Whether the guard is satisfied.
     */
    abstract isSatisfied(agent: Agent): boolean;
}
