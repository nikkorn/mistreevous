import Node from "../../nodes/node";
/**
 * An exception thrown when evaluating node guard path conditions and a conditions fails.
 */
export default class GuardUnsatisifedException extends Error {
    private source;
    /**
     * @param source The node at which a guard condition failed.
     */
    constructor(source: Node);
    /**
     * Gets whether the specified node is the node at which a guard condition failed.
     * @param node The node to check against the source node.
     * @returns Whether the specified node is the node at which a guard condition failed.
     */
    isSourceNode: (node: Node) => boolean;
}
