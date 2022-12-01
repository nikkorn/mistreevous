import { Agent } from "../../agent";
/**
 * Represents a path of node guards along a root-to-leaf tree path.
 */
export default class GuardPath {
    private nodes;
    /**
     * @param nodes An array of objects defining a node instance -> guard link, ordered by node depth.
     */
    constructor(nodes: any[]);
    /**
     * Evaluate guard conditions for all guards in the tree path, moving outwards from the root.
     * @param agent The agent, required for guard evaluation.
     * @returns An evaluation results object.
     */
    evaluate: (agent: Agent) => void;
}
