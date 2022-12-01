import { Agent } from "../../agent";
import Guard from "./guard";
import Node from "../../nodes/node";
import GuardUnsatisifedException from "./guardUnsatisifedException";

export type GuardPathPart = {
    node: Node;
    guards: Guard[];
};

/**
 * Represents a path of node guards along a root-to-leaf tree path.
 */
export default class GuardPath {
    /**
     * @param nodes An array of objects defining a node instance -> guard link, ordered by node depth.
     */
    constructor(private nodes: GuardPathPart[]) {}

    /**
     * Evaluate guard conditions for all guards in the tree path, moving outwards from the root.
     * @param agent The agent, required for guard evaluation.
     * @returns An evaluation results object.
     */
    evaluate = (agent: Agent) => {
        // We need to evaluate guard conditions for nodes up the tree, moving outwards from the root.
        for (const details of this.nodes) {
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
