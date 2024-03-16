import Node from "../Node";
import Decorator from "./Decorator";
import { Agent } from "../../Agent";
import Attribute from "../../attributes/Attribute";
import { BehaviourTreeOptions } from "../../BehaviourTreeOptions";
/**
 * A RETRY node.
 * The node has a single child which can have:
 * -- A number of iterations for which to repeat the child node.
 * -- An infinite repeat loop if neither an iteration count or a condition function is defined.
 * The RETRY node will stop and have a 'SUCCEEDED' state if its child is ever in a 'SUCCEEDED' state after an update.
 * The RETRY node will attempt to move on to the next iteration if its child is ever in a 'FAILED' state.
 */
export default class Retry extends Decorator {
    private attempts;
    private attemptsMin;
    private attemptsMax;
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param attempts The number of attempts to retry the child node.
     * @param attemptsMin The minimum possible number of attempts to retry the child node.
     * @param attemptsMax The maximum possible number of attempts to retry the child node.
     * @param child The child node.
     */
    constructor(attributes: Attribute[], options: BehaviourTreeOptions, attempts: number | null, attemptsMin: number | null, attemptsMax: number | null, child: Node);
    /**
     * The number of target attempts to make.
     */
    private targetAttemptCount;
    /**
     * The current attempt count.
     */
    private currentAttemptCount;
    /**
     * Called when the node is being updated.
     * @param agent The agent.
     */
    protected onUpdate(agent: Agent): void;
    /**
     * Gets the name of the node.
     */
    getName: () => string;
    /**
     * Reset the state of the node.
     */
    reset: () => void;
    /**
     * Gets whether an attempt can be made.
     * @returns Whether an attempt can be made.
     */
    canAttempt: () => boolean;
    /**
     * Sets the target attempt count.
     */
    setTargetAttemptCount: () => void;
}
