import Decorator from "./decorator";
import Node from "../node";
import { Agent } from "../../agent";
/**
 * A Flip node.
 * This node wraps a single child and will flip the state of the child state.
 */
export default class Flip extends Decorator {
    /**
     * @param decorators The node decorators.
     * @param child The child node.
     */
    constructor(decorators: Decorator[] | null, child: Node);
    /**
     * Update the node.
     * @param agent The agent.
     * @returns The result of the update.
     */
    onUpdate: (agent: Agent) => void;
    /**
     * Gets the name of the node.
     */
    getName: () => string;
}
