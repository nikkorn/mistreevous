import Leaf from "./Leaf";
import State from "../../State";
import Attribute from "../../attributes/Attribute";
import { Agent } from "../../Agent";
import { BehaviourTreeOptions } from "../../BehaviourTreeOptions";

/**
 * A WAIT node.
 * The state of this node will change to SUCCEEDED after a duration of time
 */
export default class Wait extends Leaf {
    /**
     * @param attributes The node attributes.
     * @param duration The duration that this node will wait to succeed in milliseconds, or the earliest if longestDuration is defined.
     * @param durationMin The minimum possible duration in milliseconds that this node will wait to succeed.
     * @param durationMax The maximum possible duration in milliseconds that this node will wait to succeed.
     */
    constructor(
        attributes: Attribute[],
        private duration: number | null,
        private durationMin: number | null,
        private durationMax: number | null
    ) {
        super("wait", attributes, []);
    }

    /**
     * The time in milliseconds at which this node was first updated.
     */
    private initialUpdateTime: number = 0;

    /**
     * The total duration in milliseconds that this node will be waiting for.
     */
    private totalDuration: number | null = null;

    /**
     * The duration in milliseconds that this node has been waiting for.
     */
    private waitedDuration: number = 0;

    /**
     * Called when the node is being updated.
     * @param agent The agent.
     * @param options The behaviour tree options object.
     */
    protected onUpdate(agent: Agent, options: BehaviourTreeOptions): void {
        // If this node is in the READY state then we need to set the initial update time.
        if (this.is(State.READY)) {
            // Set the initial update time.
            this.initialUpdateTime = new Date().getTime();

            // Set the initial waited duration.
            this.waitedDuration = 0;

            // Are we dealing with an explicit duration or will we be randomly picking a duration between the min and max duration.
            if (this.duration !== null) {
                this.totalDuration = this.duration;
            } else if (this.durationMin !== null && this.durationMax !== null) {
                this.totalDuration = Math.floor(
                    Math.random() * (this.durationMax - this.durationMin + 1) + this.durationMin
                );
            } else {
                this.totalDuration = null;
            }

            // The node is now running until we finish waiting.
            this.setState(State.RUNNING);
        }

        // If we have no total duration then this wait node will wait indefinitely until it is aborted.
        if (this.totalDuration === null) {
            return;
        }

        // If we have a 'getDeltaTime' function defined as part of our options then we will use it to figure out how long we have waited for.
        if (typeof options.getDeltaTime === "function") {
            // Get the delta time.
            const deltaTime = options.getDeltaTime();

            // Our delta time must be a valid number and cannot be NaN.
            if (typeof deltaTime !== "number" || isNaN(deltaTime)) {
                throw new Error("The delta time must be a valid number and not NaN.");
            }

            // Update the amount of time that this node has been waiting for based on the delta time.
            this.waitedDuration += deltaTime * 1000;
        } else {
            // We are not using a delta time, so we will just work out hom much time has passed since the first update.
            this.waitedDuration = new Date().getTime() - this.initialUpdateTime;
        }

        // Have we waited long enough?
        if (this.waitedDuration >= this.totalDuration) {
            // We have finished waiting!
            this.setState(State.SUCCEEDED);
        }
    }

    /**
     * Gets the name of the node.
     */
    getName = () => {
        if (this.duration !== null) {
            return `WAIT ${this.duration}ms`;
        } else if (this.durationMin !== null && this.durationMax !== null) {
            return `WAIT ${this.durationMin}ms-${this.durationMax}ms`;
        } else {
            return "WAIT";
        }
    };
}
