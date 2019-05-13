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
     * Gets the node decorated with the failed guard condition.
     */
    this.getGuardNode = () => node;
};