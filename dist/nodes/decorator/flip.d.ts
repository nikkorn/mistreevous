import Decorator from "./decorator";
import Node from "../node";
import { Agent } from "../../agent";
import Attribute from "../../attributes/attribute";
/**
 * A Flip node.
 * This node wraps a single child and will flip the state of the child state.
 */
export default class Flip extends Decorator {
    /**
     * @param attributes The node attributes.
     * @param child The child node.
     */
    constructor(attributes: Attribute[] | null, child: Node);
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
