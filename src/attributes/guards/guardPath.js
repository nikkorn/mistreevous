import GuardUnsatisifedException from "./guardUnsatisifedException";

/**
 * Represents a path of node guards along a root-to-leaf tree path.
 * @param nodes An array of objects defining a node instance -> guard link, ordered by node depth.
 */
export default function GuardPath(nodes) {
    /**
     * Evaluate guard conditions for all guards in the tree path, moving outwards from the root.
     * @param agent The agent, required for guard evaluation.
     * @returns An evaluation results object.
     */
    this.evaluate = (agent) => {
        // We need to evaluate guard conditions for nodes up the tree, moving outwards from the root.
        for (const details of nodes) {
            // There can be multiple guards per node.
            for (const guard of details.guards) {
                // Check whether the guard condition passes, and throw an exception if not.
                if (!guard.isSatisfied(agent)) {
                    throw new GuardUnsatisifedException(details.node);
                }
            }
        }
    };
}
