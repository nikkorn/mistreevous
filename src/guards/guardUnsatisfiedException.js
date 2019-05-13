/**
 * An exception thrown in a tree step when a guard condition fails.
 * @param node The node decorated with the failed guard condition.
 */
export default function GuardUnsatisfiedException(node) {

    /**
     * The name of the exception.
     */
    this.name = 'GuardUnsatisfiedException';

    /**
     * Gets whether the specified node is the one attached to the failed guard condition.
     * @param value The specified node value
     * @returns Whether the specified node is the one attached to the failed guard condition.
     */
    this.isForNode = (value) => value === node;
};