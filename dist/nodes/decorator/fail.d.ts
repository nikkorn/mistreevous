import Node from "../node";
import Decorator from "./decorator";
import { Agent } from "../../agent";
/**
 * A Fail node.
 * This node wraps a single child and will always move to the 'FAILED' state when the child moves to a 'SUCCEEDED' or 'FAILED' state.
 */
export default class Fail extends Decorator {
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
