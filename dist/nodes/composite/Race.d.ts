import Composite from "./Composite";
import Node from "../Node";
import { Agent } from "../../Agent";
import Attribute from "../../attributes/Attribute";
import { BehaviourTreeOptions } from "../../BehaviourTreeOptions";
/**
 * A RACE node.
 * The child nodes are executed concurrently until one succeeds or all fail.
 */
export default class Race extends Composite {
    /**
     * @param attributes The node attributes.
     * @param children The child nodes.
     */
    constructor(attributes: Attribute[], children: Node[]);
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
