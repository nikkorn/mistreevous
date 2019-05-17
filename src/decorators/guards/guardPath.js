/**
 * Represents a path of node guards along a root-to-leaf tree path.
 * @param guardedNodes An array of objects defining a node instance -> guard link, ordered by node depth.
 */
export default function GuardPath(guardedNodes) {

    /**
     * Evaluate guard conditions for all guards in the tree path, moving outwards from the root.
     * @param board The blackboard, required for guard evaluation.
     * @returns An evaluation results object.
     */
    this.evaluate = (board) => {
        // We need to evaluate guard conditions for nodes up the tree, moving outwards from the root.
        for (const details of guardedNodes) {
            // There can be multiple guards per node.
            for (const guard of details.guards) {
                // Check whether the guard condition passes.
                if (!guard.isSatisfied(board)) {
                    return {
                        hasFailedCondition: true,
                        node: details.node
                    };
                }
            }
        }

        // We did not come across a failed guard condition on this path.
        return { hasFailedCondition: false };
    };
};