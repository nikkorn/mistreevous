import Node, { NodeDetails } from "../Node";
import { Agent } from "../../Agent";
import Attribute from "../../attributes/Attribute";
import { BehaviourTreeOptions } from "../../BehaviourTreeOptions";
/**
 * A decorator node that wraps a single child node.
 */
export default abstract class Decorator extends Node {
    protected child: Node;
    /**
     * @param type The node type.
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param child The child node.
     */
    constructor(type: string, attributes: Attribute[], options: BehaviourTreeOptions, child: Node);
    /**
     * Gets whether this node is a leaf node.
     */
    isLeafNode: () => boolean;
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
