import Node from "../node";
import Decorator from "./decorator";
import { Agent } from "../../agent";
import Attribute from "../../attributes/attribute";
import { BehaviourTreeOptions } from "../../behaviourTreeOptions";
/**
 * A Root node.
 * The root node will have a single child.
 */
export default class Root extends Decorator {
    /**
     * @param attributes The node attributes.
     * @param child The child node.
     */
    constructor(attributes: Attribute[], child: Node);
    /**
     * Called when the node is being updated.
     * @param agent The agent.
     * @param options The behaviour tree options object.
     */
    protected onUpdate(agent: Agent, options: BehaviourTreeOptions): void;
    /**
     * Gets the name of the node.
     */
    getName: () => string;
}
