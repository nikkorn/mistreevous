import { BehaviourTreeOptions } from "../../BehaviourTreeOptions";
import { NodeDetails } from "../Node";
import State from "../../State";
import { Agent } from "../../Agent";
import Leaf from "./Leaf";
import Attribute from "../../attributes/Attribute";
/**
 * A Condition leaf node.
 * This will succeed or fail immediately based on an agent predicate, without moving to the 'RUNNING' state.
 */
export default class Condition extends Leaf {
    private conditionName;
    conditionArguments: any[];
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param conditionName The name of the condition function.
     * @param conditionArguments The array of condition arguments.
     */
    constructor(attributes: Attribute[], options: BehaviourTreeOptions, conditionName: string, conditionArguments: any[]);
    /**
     * Called when the node is being updated.
     * @param agent The agent.
     */
    protected onUpdate(agent: Agent): void;
    /**
     * Gets the name of the node.
     */
    getName: () => string;
    /**
     * Gets the details of this node instance.
     * @returns The details of this node instance.
     */
    getDetails(): NodeDetails;
    /**
     * Called when the state of this node changes.
     * @param previousState The previous node state.
     */
    protected onStateChanged(previousState: State): void;
}
