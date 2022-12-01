import Node from "../node";
import Composite from "./composite";
import { Agent } from "../../agent";
import Attribute from "../../attributes/attribute";
/**
 * A LOTTO node.
 * A winning child is picked on the initial update of this node, based on ticket weighting.
 * The state of this node will match the state of the winning child.
 */
export default class Lotto extends Composite {
    private tickets;
    /**
     * @param attributes The node attributes.
     * @param tickets The child node tickets
     * @param children The child nodes.
     */
    constructor(attributes: Attribute[] | null, tickets: any[], children: Node[]);
    /**
     * The winning child node.
     */
    private winningChild;
    /**
     * Update the node and get whether the node state has changed.
     * @param agent The agent.
     * @returns Whether the state of this node has changed as part of the update.
     */
    onUpdate: (agent: Agent) => void;
    /**
     * Gets the name of the node.
     */
    getName: () => string;
}
