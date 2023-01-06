import Node from "../node";
import { Agent } from "../../agent";
import Attribute from "../../attributes/attribute";
/**
 * A decorator node that wraps a single child node.
 */
export default abstract class Decorator extends Node {
    protected child: Node;
    /**
     * @param type The node type.
     * @param attributes The node attributes.
     * @param child The child node.
     */
    constructor(type: string, attributes: Attribute[], child: Node);
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
