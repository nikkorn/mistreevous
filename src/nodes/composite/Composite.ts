import Node, { NodeDetails } from "../Node";
import State from "../../State";
import { Agent } from "../../Agent";
import Attribute from "../../attributes/Attribute";
import { BehaviourTreeOptions } from "../../BehaviourTreeOptions";

/**
 * A composite node that wraps child nodes.
 */
export default abstract class Composite extends Node {
    /**
     * @param type The node type.
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param children The child nodes.
     */
    constructor(type: string, attributes: Attribute[], options: BehaviourTreeOptions, protected children: Node[]) {
        super(type, attributes, options);
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
        this.children.forEach((child) => child.reset());
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
        this.children.forEach((child) => child.abort(agent));

        // Reset the state of this node.
        this.reset();

        this.attributes.exit?.callAgentFunction(agent, false, true);
    };

    /**
     * Gets the details of this node instance.
     * @returns The details of this node instance.
     */
    public getDetails(): NodeDetails {
        return {
            ...super.getDetails(),
            children: this.children.map((child) => child.getDetails())
        };
    }
}
