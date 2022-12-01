import Leaf from "./leaf";
import { Args } from "../../lookup";
import { Agent } from "../../agent";
import Attribute from "../../attributes/attribute";
/**
 * A Condition leaf node.
 * This will succeed or fail immediately based on an agent predicate, without moving to the 'RUNNING' state.
 */
export default class Condition extends Leaf {
    private conditionName;
    private conditionArguments;
    /**
     * @param attributes The node attributes.
     * @param conditionName The name of the condition function.
     * @param conditionArguments The array of condition argument definitions.
     */
    constructor(attributes: Attribute[] | null, conditionName: string, conditionArguments: Args);
    /**
     * Update the node.
     * @param agent The agent.
     * @returns The result of the update.
     */
    onUpdate: (agent: Agent) => void;
    /**
     * Gets the name of the node.
     */
    getName: () => string;
}
