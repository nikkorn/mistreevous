import Composite from "./composite";
import Node from "../node";
import { Agent } from "../../agent";
import Attribute from "../../attributes/attribute";
/**
 * A PARALLEL node.
 * The child nodes are executed concurrently until one fails or all succeed.
 */
export default class Parallel extends Composite {
    /**
     * @param attributes The node attributes.
     * @param children The child nodes.
     */
    constructor(attributes: Attribute[] | null, children: Node[]);
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
