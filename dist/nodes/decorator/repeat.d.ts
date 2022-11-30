import Node from "../node";
import Decorator from "./decorator";
/**
 * A REPEAT node.
 * The node has a single child which can have:
 * -- A number of iterations for which to repeat the child node.
 * -- An infinite repeat loop if neither an iteration count or a condition function is defined.
 * The REPEAT node will stop and have a 'FAILED' state if its child is ever in a 'FAILED' state after an update.
 * The REPEAT node will attempt to move on to the next iteration if its child is ever in a 'SUCCEEDED' state.
 * @param decorators The node decorators.
 * @param iterations The number of iterations to repeat the child node, or the minimum number of iterations if maximumIterations is defined.
 * @param maximumIterations The maximum number of iterations to repeat the child node.
 * @param child The child node.
 */
export default class Repeat extends Decorator {
    private iterations;
    private maximumIterations;
    constructor(decorators: Decorator[] | null, iterations: number, maximumIterations: number, child: Node);
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
    onUpdate: (agent: any) => void;
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
    private canIterate;
    /**
     * Sets the target iteration count.
     */
    private setTargetIterationCount;
}
