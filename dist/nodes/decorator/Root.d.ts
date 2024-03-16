import Node from "../Node";
import Decorator from "./Decorator";
import { Agent } from "../../Agent";
import Attribute from "../../attributes/Attribute";
import { BehaviourTreeOptions } from "../../BehaviourTreeOptions";
/**
 * A Root node.
 * The root node will have a single child.
 */
export default class Root extends Decorator {
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
