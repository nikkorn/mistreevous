import { BehaviourTreeOptions } from "../../BehaviourTreeOptions";
import { Agent } from "../../Agent";
import Leaf from "./Leaf";
import Attribute from "../../attributes/Attribute";
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
    constructor(attributes: Attribute[], conditionName: string, conditionArguments: any[]);
    /**
     * Called when the node is being updated.
     * @param agent The agent.
     * @param options The behaviour tree options object.
     */
    protected onUpdate(agent: Agent, options: BehaviourTreeOptions): void;
    /**
     * Gets the name of the node.
     */
    getName: () => string;
}
