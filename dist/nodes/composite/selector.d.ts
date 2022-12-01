import Composite from "./composite";
import Node from "../node";
import Decorator from "../decorator/decorator";
import { Agent } from "../../agent";
/**
 * A SELECTOR node.
 * The child nodes are executed in sequence until one succeeds or all fail.
 */
export default class Selector extends Composite {
    protected children: Node[];
    /**
     * @param decorators The node decorators.
     * @param children The child nodes.
     */
    constructor(decorators: Decorator[] | null, children: Node[]);
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
