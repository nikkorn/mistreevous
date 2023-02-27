import Node from "../Node";
import State from "../../State";
import { Agent } from "../../Agent";
import Attribute from "../../attributes/Attribute";

/**
 * A decorator node that wraps a single child node.
 */
export default abstract class Decorator extends Node {
    /**
     * @param type The node type.
     * @param attributes The node attributes.
     * @param child The child node.
     */
    constructor(type: string, attributes: Attribute[], protected child: Node) {
        super(type, attributes, []);
    }

    /**
     * Gets whether this node is a leaf node.
     */
    isLeafNode = () => false;

    /**
     * Gets the children of this node.
     */
    getChildren = () => [this.child];

    /**
     * Reset the state of the node.
     */
    reset = () => {
        // Reset the state of this node.
        this.setState(State.READY);

        // Reset the state of the child node.
        this.child.reset();
    };

    /**
     * Abort the running of this node.
     * @param agent The agent.
     */
    abort = (agent: Agent) => {
        // There is nothing to do if this node is not in the running state.
        if (!this.is(State.RUNNING)) {
            return;
        }

        // Abort the child node.
        this.child.abort(agent);

        // Reset the state of this node.
        this.reset();

        this.getAttribute("exit")?.callAgentFunction(agent, false, true);
    };
}