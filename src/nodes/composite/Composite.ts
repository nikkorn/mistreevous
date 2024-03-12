import Node from "../Node";
import State from "../../State";
import { Agent } from "../../Agent";
import Attribute from "../../attributes/Attribute";

/**
 * A composite node that wraps child nodes.
 */
export default abstract class Composite extends Node {
    /**
     * @param type The node type.
     * @param attributes The node attributes.
     * @param children The child nodes.
     */
    constructor(type: string, attributes: Attribute[], protected children: Node[]) {
        super(type, attributes);
    }

    /**
     * Gets whether this node is a leaf node.
     */
    isLeafNode = () => false;

    /**
     * Gets the children of this node.
     */
    getChildren = () => this.children;

    /**
     * Reset the state of the node.
     */
    reset = () => {
        // Reset the state of this node.
        this.setState(State.READY);

        // Reset the state of any child nodes.
        this.getChildren().forEach((child) => child.reset());
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

        // Abort any child nodes.
        this.getChildren().forEach((child) => child.abort(agent));

        // Reset the state of this node.
        this.reset();

        this.getAttribute("exit")?.callAgentFunction(agent, false, true);
    };
}
