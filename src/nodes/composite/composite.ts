import Node from "../node";
import State from "../../state";
import Decorator from "../decorator/decorator";

/**
 * A composite node that wraps child nodes.
 * @param type The node type.
 * @param decorators The node decorators.
 * @param children The child nodes.
 */
export default abstract class Composite extends Node {
    constructor(type: string, decorators: Decorator[] | null, protected children: Node[]) {
        super(type, decorators, []);
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
    abort = (agent: any) => {
        // There is nothing to do if this node is not in the running state.
        if (!this.is(State.RUNNING)) {
            return;
        }

        // Abort any child nodes.
        this.getChildren().forEach((child) => child.abort(agent));

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
