import Node from "../node";
import State from "../../state";
import { Agent } from "../../agent";

/**
 * A decorator node that wraps a single child node.
 */
export default abstract class Decorator extends Node {
    /**
     * @param type The node type.
     * @param decorators The node decorators.
     * @param child The child node.
     */
    constructor(type: string, decorators: Decorator[] | null, protected child: Node) {
        super(type, decorators, []);
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

        // Try to get the exit decorator for this node.
        const exitDecorator = this.getDecorator("exit");

        // Call the exit decorator function if it exists.
        if (exitDecorator) {
            (exitDecorator as any).callAgentFunction(agent, false, true);
        }
    };
}
