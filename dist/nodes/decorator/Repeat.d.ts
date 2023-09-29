import Node from "../Node";
import Decorator from "./Decorator";
import { Agent } from "../../Agent";
import Attribute from "../../attributes/Attribute";
import { BehaviourTreeOptions } from "../../BehaviourTreeOptions";
/**
 * A REPEAT node.
 * The node has a single child which can have:
 * -- A number of iterations for which to repeat the child node.
 * -- An infinite repeat loop if neither an iteration count or a condition function is defined.
 * The REPEAT node will stop and have a 'FAILED' state if its child is ever in a 'FAILED' state after an update.
 * The REPEAT node will attempt to move on to the next iteration if its child is ever in a 'SUCCEEDED' state.
 */
export default class Repeat extends Decorator {
    private iterations;
    private iterationsMin;
    private iterationsMax;
    /**
     * @param attributes The node attributes.
     * @param iterations The number of iterations to repeat the child node.
     * @param iterationsMin The minimum possible number of iterations to repeat the child node.
     * @param iterationsMax The maximum possible number of iterations to repeat the child node.
     * @param child The child node.
     */
    constructor(attributes: Attribute[], iterations: number | null, iterationsMin: number | null, iterationsMax: number | null, child: Node);
    /**
     * The number of target iterations to make.
     */
    private targetIterationCount;
    /**
     * The current iteration count.
     */
    private currentIterationCount;
    /**
     * Called when the node is being updated.
     * @param agent The agent.
     * @param options The behaviour tree options object.
     */
    protected onUpdate(agent: Agent, options: BehaviourTreeOptions): void;
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
     * @param options The behaviour tree options object.
     */
    private setTargetIterationCount;
}
