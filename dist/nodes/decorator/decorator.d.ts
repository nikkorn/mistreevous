import Node from "../node";
/**
 * A decorator node that wraps a single child node.
 * @param type The node type.
 * @param decorators The node decorators.
 * @param child The child node.
 */
export default abstract class Decorator extends Node {
    protected child: Node;
    constructor(type: string, decorators: Decorator[] | null, child: Node);
    /**
     * Gets whether this node is a leaf node.
     */
    isLeafNode: () => boolean;
    /**
     * Gets the children of this node.
     */
    getChildren: () => Node[];
    /**
     * Reset the state of the node.
     */
    reset: () => void;
    /**
     * Abort the running of this node.
     * @param agent The agent.
     */
    abort: (agent: any) => void;
}
