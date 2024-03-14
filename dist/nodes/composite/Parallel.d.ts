import Composite from "./Composite";
import Node from "../Node";
import { Agent } from "../../Agent";
import Attribute from "../../attributes/Attribute";
import { BehaviourTreeOptions } from "../../BehaviourTreeOptions";
/**
 * A PARALLEL node.
 * The child nodes are executed concurrently until one fails or all succeed.
 */
export default class Parallel extends Composite {
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param children The child nodes.
     */
    constructor(attributes: Attribute[], options: BehaviourTreeOptions, children: Node[]);
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
