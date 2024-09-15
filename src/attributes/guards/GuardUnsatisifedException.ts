import Node from "../../nodes/Node";

/**
 * An exception thrown when evaluating node guard path conditions and a condition fails.
 */
export default class GuardUnsatisifedException extends Error {
    /**
     * @param source The node at which a guard condition failed.
     */
    constructor(private source: Node) {
        super("A guard path condition has failed");
    }

    /**
     * Gets whether the specified node is the node at which a guard condition failed.
     * @param node The node to check against the source node.
     * @returns Whether the specified node is the node at which a guard condition failed.
     */
    isSourceNode(node: Node): boolean { 
        return node === this.source;
    }
}
