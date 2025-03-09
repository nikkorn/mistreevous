import { Agent } from "../../Agent";
import { NodeGuardDefinition } from "../../BehaviourTreeDefinition";
import Attribute, { AttributeDetails } from "../Attribute";

/**
 * Details of a node guard attribute.
 */
export type GuardAttributeDetails = {
    /** The name of the condition function that determines whether the guard is satisfied. */
    calls: string;
} & AttributeDetails;

/**
 * A base node guard attribute.
 */
export default abstract class Guard extends Attribute<GuardAttributeDetails> {
    /**
     * Creates a new instance of the Guard class.
     * @param type The node attribute type.
     * @param definition The node guard definition.
     */
    constructor(type: string, private definition: NodeGuardDefinition) {
        super(type, definition.args ?? []);
    }

    /**
     * Gets the name of the condition function that determines whether the guard is satisfied.
     */
    public get condition(): string {
        return this.definition.call;
    }

    /**
     * Gets a flag defining whether the running node should move to the succeeded state when aborted, otherwise failed.
     */
    public get succeedOnAbort(): boolean {
        return !!this.definition.succeedOnAbort;
    }

    /**
     * Gets the attribute details.
     */
    public getDetails(): GuardAttributeDetails {
        return {
            type: this.type,
            args: this.args,
            calls: this.condition
        };
    }

    /**
     * Gets whether the guard is satisfied.
     * @param agent The agent.
     * @returns Whether the guard is satisfied.
     */
    abstract isSatisfied(agent: Agent): boolean;
}
