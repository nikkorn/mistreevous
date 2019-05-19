/**
 * An exception thrown when evaluating node guard path conditions and a conditions fails.
 * @param source The node at which a guard condition failed. 
 */
export default function GuardUnsatisifedException(source) {

    /**
     * The exception message.
     */
    this.message = "A guard path condition has failed";

    /**
     * Gets whether the specified node is the node at which a guard condition failed.
     * @param node The node to check against the source node.
     * @returns Whether the specified node is the node at which a guard condition failed.
     */
    this.isSourceNode = (node) => node === source;
}
   
GuardUnsatisifedException.prototype = new Error;