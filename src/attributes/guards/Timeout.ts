import Guard from "./Guard";
import { Agent } from "../../Agent";
import { AttributeDetails } from "../Attribute";
import State from "../../State";

/**
 * Details of a node timeout guard attribute.
 */
export type TimeoutGuardAttributeDetails = {
    /** The name of the condition function that determines whether the guard is satisfied. */
    duration: number;
} & AttributeDetails;

/**
 * A TIMEOUT guard which is satisfied as long as the...
 */
export default class Timeout extends Guard<TimeoutGuardAttributeDetails> {
    /**
     * @param duration The timeout duration.
     */
    constructor(private duration: number) {
        super("timeout");
    }

    /**
     * Called when the state of the guarded node changes.
     * @param state The new node state.
     */
    onNodeStateChange(state: State): void {
        console.log("timeout node state change: " + state);
    }
    
    isSatisfied(agent: Agent): boolean {
        throw new Error("Method not implemented.");
    }

    /**
     * Gets the attribute details.
     */
    getDetails(): TimeoutGuardAttributeDetails {
        return {
            type: this.type,
            duration: this.duration
        };
    }
}