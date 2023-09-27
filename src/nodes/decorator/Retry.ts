import Node from "../Node";
import Decorator from "./Decorator";
import State from "../../State";
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
    /**
     * @param attributes The node attributes.
     * @param attempts The number of attempts to retry the child node.
     * @param attemptsMin The minimum possible number of attempts to retry the child node.
     * @param attemptsMax The maximum possible number of attempts to retry the child node.
     * @param child The child node.
     */
    constructor(
        attributes: Attribute[],
        private attempts: number | null,
        private attemptsMin: number | null,
        private attemptsMax: number | null,
        child: Node
    ) {
        super("retry", attributes, child);
    }

    /**
     * The number of target attempts to make.
     */
    private targetAttemptCount: number | null = null;

    /**
     * The current attempt count.
     */
    private currentAttemptCount: number = 0;

    /**
     * Called when the node is being updated.
     * @param agent The agent.
     * @param options The behaviour tree options object.
     */
    protected onUpdate(agent: Agent, options: BehaviourTreeOptions): void {
        // If this node is in the READY state then we need to reset the child and the target attempt count.
        if (this.is(State.READY)) {
            // Reset the child node.
            this.child.reset();

            // Reset the current attempt count.
            this.currentAttemptCount = 0;

            // Set the target attempt count.
            this.setTargetAttemptCount(options);
        }

        // Do a check to see if we can attempt. If we can then this node will move into the 'RUNNING' state.
        // If we cannot attempt then we have hit our target attempt count, which means that the node has succeeded.
        if (this.canAttempt()) {
            // This node is in the running state and can do its initial attempt.
            this.setState(State.RUNNING);

            // We may have already completed an attempt, meaning that the child node will be in the FAILED state.
            // If this is the case then we will have to reset the child node now.
            if (this.child.getState() === State.FAILED) {
                this.child.reset();
            }

            // Update the child of this node.
            this.child.update(agent, options);

            // If the child moved into the SUCCEEDED state when we updated it then there is nothing left to do and this node has also succeeded.
            // If it has moved into the FAILED state then we have completed the current attempt.
            if (this.child.getState() === State.SUCCEEDED) {
                // The child has succeeded, meaning that this node has succeeded.
                this.setState(State.SUCCEEDED);

                return;
            } else if (this.child.getState() === State.FAILED) {
                // We have completed an attempt.
                this.currentAttemptCount += 1;
            }
        } else {
            // This node is in the 'FAILED' state as we cannot iterate any more.
            this.setState(State.FAILED);
        }
    }

    /**
     * Gets the name of the node.
     */
    getName = () => {
        if (this.attempts !== null) {
            return `RETRY ${this.attempts}x`;
        } else if (this.attemptsMin !== null && this.attemptsMax !== null) {
            return `RETRY ${this.attemptsMin}x-${this.attemptsMax}x`;
        } else {
            return "RETRY";
        }
    };

    /**
     * Reset the state of the node.
     */
    reset = () => {
        // Reset the state of this node.
        this.setState(State.READY);

        // Reset the current attempt count.
        this.currentAttemptCount = 0;

        // Reset the child node.
        this.child.reset();
    };

    /**
     * Gets whether an attempt can be made.
     * @returns Whether an attempt can be made.
     */
    canAttempt = () => {
        if (this.targetAttemptCount !== null) {
            // We can attempt as long as we have not reached our target attempt count.
            return this.currentAttemptCount < this.targetAttemptCount;
        }

        // If neither an attempt count or a condition function were defined then we can attempt indefinitely.
        return true;
    };

    /**
     * Sets the target attempt count.
     * @param options The behaviour tree options object.
     */
    setTargetAttemptCount = (options: BehaviourTreeOptions) => {
        // Are we dealing with an explicit attempt count or will we be randomly picking an attempt count between the min and max attempt count.
        if (this.attempts !== null) {
            this.targetAttemptCount = this.attempts;
        } else if (this.attemptsMin !== null && this.attemptsMax !== null) {
            // We will be picking a random attempt count between a min and max attempt count, if the optional 'random'
            // behaviour tree function option is defined then we will be using that, otherwise we will fall back to using Math.random.
            const random = typeof options.random === "function" ? options.random : Math.random;

            // Pick a random attempt count between a min and max attempt count.
            this.targetAttemptCount = Math.floor(
                random() * (this.attemptsMax - this.attemptsMin + 1) + this.attemptsMin
            );
        } else {
            this.targetAttemptCount = null;
        }
    };
}
