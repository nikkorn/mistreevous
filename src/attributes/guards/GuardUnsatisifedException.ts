import Node from "../../nodes/Node";
import Guard from "./Guard";

/**
 * An exception thrown when evaluating node guard path conditions and a conditions fails.
 */
export default class GuardUnsatisifedException extends Error {
    /**
     * @param source The node at which a guard condition failed.
     * @param guard The guard.
     */
    constructor(private source: Node, public guard: Guard) {
        super("A guard path condition has failed");
    }

    /**
     * Gets whether the specified node is the node at which a guard condition failed.
     * @param node The node to check against the source node.
     * @returns Whether the specified node is the node at which a guard condition failed.
     */
    public isSourceNode(node: Node): boolean {
        return node === this.source;
    }
}
