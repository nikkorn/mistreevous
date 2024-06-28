import Node, { NodeDetails } from "../Node";
import { Agent } from "../../Agent";
import Attribute from "../../attributes/Attribute";
import { BehaviourTreeOptions } from "../../BehaviourTreeOptions";
/**
 * A composite node that wraps child nodes.
 */
export default abstract class Composite extends Node {
    protected children: Node[];
    /**
     * @param type The node type.
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param children The child nodes.
     */
    constructor(type: string, attributes: Attribute[], options: BehaviourTreeOptions, children: Node[]);
    /**
     * Gets the children of this node.
     */
    getChildren: () => Node[];
    /**
     * Reset the state of the node.
     */
    reset: () => void;
    /**
     * Abort the running of this node.
     * @param agent The agent.
     */
    abort: (agent: Agent) => void;
    /**
     * Gets the details of this node instance.
     * @returns The details of this node instance.
     */
    getDetails(): NodeDetails;
}
