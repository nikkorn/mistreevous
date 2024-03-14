import Node from "../Node";
import Decorator from "./Decorator";
import State from "../../State";
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
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param iterations The number of iterations to repeat the child node.
     * @param iterationsMin The minimum possible number of iterations to repeat the child node.
     * @param iterationsMax The maximum possible number of iterations to repeat the child node.
     * @param child The child node.
     */
    constructor(
        attributes: Attribute[],
        options: BehaviourTreeOptions,
        private iterations: number | null,
        private iterationsMin: number | null,
        private iterationsMax: number | null,
        child: Node
    ) {
        super("repeat", attributes, options, child);
    }

    /**
     * The number of target iterations to make.
     */
    private targetIterationCount: number | null = null;

    /**
     * The current iteration count.
     */
    private currentIterationCount: number = 0;

    /**
     * Called when the node is being updated.
     * @param agent The agent.
     * @param options The behaviour tree options object.
     */
    protected onUpdate(agent: Agent, options: BehaviourTreeOptions): void {
        // If this node is in the READY state then we need to reset the child and the target iteration count.
        if (this.is(State.READY)) {
            // Reset the child node.
            this.child.reset();

            // Reset the current iteration count.
            this.currentIterationCount = 0;

            // Set the target iteration count.
            this.setTargetIterationCount(options);
        }

        // Do a check to see if we can iterate. If we can then this node will move into the 'RUNNING' state.
        // If we cannot iterate then we have hit our target iteration count, which means that the node has succeeded.
        if (this.canIterate()) {
            // This node is in the running state and can do its initial iteration.
            this.setState(State.RUNNING);

            // We may have already completed an iteration, meaning that the child node will be in the SUCCEEDED state.
            // If this is the case then we will have to reset the child node now.
            if (this.child.getState() === State.SUCCEEDED) {
                this.child.reset();
            }

            // Update the child of this node.
            this.child.update(agent, options);

            // If the child moved into the FAILED state when we updated it then there is nothing left to do and this node has also failed.
            // If it has moved into the SUCCEEDED state then we have completed the current iteration.
            if (this.child.getState() === State.FAILED) {
                // The child has failed, meaning that this node has failed.
                this.setState(State.FAILED);

                return;
            } else if (this.child.getState() === State.SUCCEEDED) {
                // We have completed an iteration.
                this.currentIterationCount += 1;
            }
        } else {
            // This node is in the 'SUCCEEDED' state as we cannot iterate any more.
            this.setState(State.SUCCEEDED);
        }
    }

    /**
     * Gets the name of the node.
     */
    getName = () => {
        if (this.iterations !== null) {
            return `REPEAT ${this.iterations}x`;
        } else if (this.iterationsMin !== null && this.iterationsMax !== null) {
            return `REPEAT ${this.iterationsMin}x-${this.iterationsMax}x`;
        } else {
            return "REPEAT";
        }
    };

    /**
     * Reset the state of the node.
     */
    reset = () => {
        // Reset the state of this node.
        this.setState(State.READY);

        // Reset the current iteration count.
        this.currentIterationCount = 0;

        // Reset the child node.
        this.child.reset();
    };

    /**
     * Gets whether an iteration can be made.
     * @returns Whether an iteration can be made.
     */
    private canIterate = () => {
        if (this.targetIterationCount !== null) {
            // We can iterate as long as we have not reached our target iteration count.
            return this.currentIterationCount < this.targetIterationCount;
        }

        // If neither an iteration count or a condition function were defined then we can iterate indefinitely.
        return true;
    };

    /**
     * Sets the target iteration count.
     * @param options The behaviour tree options object.
     */
    private setTargetIterationCount = (options: BehaviourTreeOptions) => {
        // Are we dealing with an explicit iteration count or will we be randomly picking a iteration count between the min and max iteration count.
        if (this.iterations !== null) {
            this.targetIterationCount = this.iterations;
        } else if (this.iterationsMin !== null && this.iterationsMax !== null) {
            // We will be picking a random iteration count between a min and max iteration count, if the optional 'random'
            // behaviour tree function option is defined then we will be using that, otherwise we will fall back to using Math.random.
            const random = typeof options.random === "function" ? options.random : Math.random;

            // Pick a random iteration count between a min and max iteration count.
            this.targetIterationCount = Math.floor(
                random() * (this.iterationsMax - this.iterationsMin + 1) + this.iterationsMin
            );
        } else {
            this.targetIterationCount = null;
        }
    };
}
