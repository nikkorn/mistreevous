import Composite from "./composite";
import Node from "../node";
import { Agent } from "../../agent";
import Attribute from "../../attributes/attribute";
import { BehaviourTreeOptions } from "../../behaviourTreeOptions";
/**
 * A PARALLEL node.
 * The child nodes are executed concurrently until one fails or all succeed.
 */
export default class Parallel extends Composite {
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
