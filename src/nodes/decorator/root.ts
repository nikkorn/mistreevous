import Node from "../node";
import Decorator from "./decorator";
import State from "../../state";
import { Agent } from "../../agent";

/**
 * A Root node.
 * The root node will have a single child.
 */
export default class Root extends Decorator {
    /**
     * @param decorators The node decorators.
     * @param child The child node.
     */
    constructor(decorators: Decorator[] | null, child: Node) {
        super("root", decorators, child);
    }

    /**
     * Update the node and get whether the node state has changed.
     * @param agent The agent.
     * @returns Whether the state of this node has changed as part of the update.
     */
    onUpdate = (agent: Agent) => {
        // If the child has never been updated or is running then we will need to update it now.
        if (this.child.getState() === State.READY || this.child.getState() === State.RUNNING) {
            // Update the child of this node.
            this.child.update(agent);
        }

        // The state of the root node is the state of its child.
        this.setState(this.child.getState());
    };

    /**
     * Gets the name of the node.
     */
    getName = () => "ROOT";
}
