/**
 * An exception thrown when evaluating node guard path conditions and a conditions fails.
 * @param source The node at which a guard condition failed.
 */
export default class GuardUnsatisifedException extends Error {
    constructor(private source: any) {
        super("A guard path condition has failed");
    }

    /**
     * Gets whether the specified node is the node at which a guard condition failed.
     * @param node The node to check against the source node.
     * @returns Whether the specified node is the node at which a guard condition failed.
     */
    isSourceNode = (node:any) => node === this.source;
}
