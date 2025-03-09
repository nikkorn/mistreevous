import { Agent } from "../../Agent";
import Guard from "./Guard";
import Node from "../../nodes/Node";
export type GuardPathPart = {
    node: Node;
    guards: Guard[];
};
/**
 * Represents a path of node guards along a root-to-leaf tree path.
 */
export default class GuardPath {
    private nodes;
    /**
     * @param nodes An array of objects defining a node instance -> guard link, ordered by node depth.
     */
    constructor(nodes: GuardPathPart[]);
    /**
     * Evaluate guard conditions for all guards in the tree path, moving outwards from the root.
     * @param agent The agent, required for guard evaluation.
     * @returns An evaluation results object.
     */
    evaluate(agent: Agent): void;
}
