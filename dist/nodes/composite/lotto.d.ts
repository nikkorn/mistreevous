import Node from "../Node";
import Composite from "./Composite";
import { Agent } from "../../Agent";
import Attribute from "../../attributes/Attribute";
import { BehaviourTreeOptions } from "../../BehaviourTreeOptions";
/**
 * A LOTTO node.
 * A winning child is picked on the initial update of this node, based on ticket weighting.
 * The state of this node will match the state of the winning child.
 */
export default class Lotto extends Composite {
    private tickets;
    /**
     * @param attributes The node attributes.
     * @param tickets The child node tickets.
     * @param children The child nodes.
     */
    constructor(attributes: Attribute[], tickets: number[], children: Node[]);
    /**
     * The child node selected to be the active one.
     */
    private selectedChild;
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
