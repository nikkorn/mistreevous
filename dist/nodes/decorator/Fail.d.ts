import Node from "../Node";
import Decorator from "./Decorator";
import { Agent } from "../../Agent";
import Attribute from "../../attributes/Attribute";
import { BehaviourTreeOptions } from "../../BehaviourTreeOptions";
/**
 * A Fail node.
 * This node wraps a single child and will always move to the 'FAILED' state when the child moves to a 'SUCCEEDED' or 'FAILED' state.
 */
export default class Fail extends Decorator {
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param child The child node.
     */
    constructor(attributes: Attribute[], options: BehaviourTreeOptions, child: Node);
    /**
     * Called when the node is being updated.
     * @param agent The agent.
     */
    protected onUpdate(agent: Agent): void;
    /**
     * Gets the name of the node.
     */
    getName: () => string;
}
