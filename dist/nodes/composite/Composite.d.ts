import Node from "../Node";
import { Agent } from "../../Agent";
import Attribute from "../../attributes/Attribute";
/**
 * A composite node that wraps child nodes.
 */
export default abstract class Composite extends Node {
    protected children: Node[];
    /**
     * @param type The node type.
     * @param attributes The node attributes.
     * @param children The child nodes.
     */
    constructor(type: string, attributes: Attribute[], children: Node[]);
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
}
