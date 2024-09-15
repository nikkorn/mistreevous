import { Agent } from "../../Agent";
import State from "../../State";
import Attribute, { AttributeDetails } from "../Attribute";

/**
 * A base node guard attribute.
 */
export default abstract class Guard<TAttributeDetails extends AttributeDetails = AttributeDetails> extends Attribute<TAttributeDetails> {
    /**
     * @param type The guard node attribute type.
     */
    constructor(type: string) {
        super(type);
    }

    /**
     * Called when the state of the guarded node changes.
     * @param state The new node state.
     */
    onNodeStateChange(state: State): void { }

    /**
     * Gets the attribute details.
     */
    abstract getDetails(): TAttributeDetails;

    /**
     * Gets whether the guard is satisfied.
     * @param agent The agent.
     * @returns Whether the guard is satisfied.
     */
    abstract isSatisfied(agent: Agent): boolean;
}
