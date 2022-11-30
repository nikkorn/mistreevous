import Composite from "./composite";
import Node from "../node";
import Decorator from "../decorator/decorator";
/**
 * A SEQUENCE node.
 * The child nodes are executed in sequence until one fails or all succeed.
 * @param decorators The node decorators.
 * @param children The child nodes.
 */
export default class Sequence extends Composite {
    protected children: Node[];
    constructor(decorators: Decorator[] | null, children: Node[]);
    /**
     * Update the node and get whether the node state has changed.
     * @param agent The agent.
     * @returns Whether the state of this node has changed as part of the update.
     */
    onUpdate: (agent: any) => void;
    /**
     * Gets the name of the node.
     */
    getName: () => string;
}
