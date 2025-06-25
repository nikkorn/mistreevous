import { Agent } from "../../Agent";
import { NodeGuardDefinition } from "../../BehaviourTreeDefinition";
import Attribute, { AttributeDetails } from "../Attribute";
/**
 * Details of a node guard attribute.
 */
export type GuardAttributeDetails = {
    /** The name of the condition function that determines whether the guard is satisfied. */
    calls: string;
    /** A flag defining whether the running node will move to the succeeded state when aborted, otherwise failed.  */
    succeedOnAbort: boolean;
} & AttributeDetails;
/**
 * A base node guard attribute.
 */
export default abstract class Guard extends Attribute<GuardAttributeDetails> {
    private definition;
    /**
     * Creates a new instance of the Guard class.
     * @param type The node attribute type.
     * @param definition The node guard definition.
     */
    constructor(type: string, definition: NodeGuardDefinition);
    /**
     * Gets the name of the condition function that determines whether the guard is satisfied.
     */
    get condition(): string;
    /**
     * Gets a flag defining whether the running node should move to the succeeded state when aborted, otherwise failed.
     */
    get succeedOnAbort(): boolean;
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
