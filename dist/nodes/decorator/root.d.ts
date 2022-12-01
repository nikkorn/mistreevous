import Node from "../node";
import Decorator from "./decorator";
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
    constructor(decorators: Decorator[] | null, child: Node);
    /**
     * Update the node and get whether the node state has changed.
     * @param agent The agent.
     * @returns Whether the state of this node has changed as part of the update.
     */
    onUpdate: (agent: Agent) => void;
    /**
     * Gets the name of the node.
     */
    getName: () => string;
}
