import Composite from "./Composite";
import Node from "../Node";
import { Agent } from "../../Agent";
import Attribute from "../../attributes/Attribute";
import { BehaviourTreeOptions } from "../../BehaviourTreeOptions";
/**
 * A SELECTOR node.
 * The child nodes are executed in sequence until one succeeds or all fail.
 */
export default class Selector extends Composite {
    protected children: Node[];
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param children The child nodes.
     */
    constructor(attributes: Attribute[], options: BehaviourTreeOptions, children: Node[]);
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
