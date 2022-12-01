import Node from "../node";
import Decorator from "./decorator";
import { Agent } from "../../agent";
import Attribute from "../../attributes/attribute";
/**
 * A RETRY node.
 * The node has a single child which can have:
 * -- A number of iterations for which to repeat the child node.
 * -- An infinite repeat loop if neither an iteration count or a condition function is defined.
 * The RETRY node will stop and have a 'SUCCEEDED' state if its child is ever in a 'SUCCEEDED' state after an update.
 * The RETRY node will attempt to move on to the next iteration if its child is ever in a 'FAILED' state.
 */
export default class Retry extends Decorator {
    private iterations;
    private maximumIterations;
    /**
     * @param attributes The node attributes.
     * @param iterations The number of iterations to repeat the child node, or the minimum number of iterations if maximumIterations is defined.
     * @param maximumIterations The maximum number of iterations to repeat the child node.
     * @param child The child node.
     */
    constructor(attributes: Attribute[] | null, iterations: number | null, maximumIterations: number | null, child: Node);
    /**
     * The number of target iterations to make.
     */
    private targetIterationCount;
    /**
     * The current iteration count.
     */
    private currentIterationCount;
    /**
     * Update the node.
     * @param agent The agent.
     * @returns The result of the update.
     */
    onUpdate: (agent: Agent) => void;
    /**
     * Gets the name of the node.
     */
    getName: () => string;
    /**
     * Reset the state of the node.
     */
    reset: () => void;
    /**
     * Gets whether an iteration can be made.
     * @returns Whether an iteration can be made.
     */
    canIterate: () => boolean;
    /**
     * Sets the target iteration count.
     */
    setTargetIterationCount: () => void;
}
