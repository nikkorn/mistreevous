import Leaf from "./leaf";
import State from "../../state";
import Attribute from "../../attributes/attribute";
import { Agent } from "../../agent";
import { BehaviourTreeOptions } from "../../behaviourTreeOptions";

/**
 * A WAIT node.
 * The state of this node will change to SUCCEEDED after a duration of time
 */
export default class Wait extends Leaf {
    /**
     * @param attributes The node attributes.
     * @param duration The duration that this node will wait to succeed in milliseconds, or the earliest if longestDuration is defined.
     * @param longestDuration The longest possible duration in milliseconds that this node will wait to succeed.
     */
    constructor(attributes: Attribute[], private duration: number, private longestDuration: number) {
        super("wait", attributes, []);
    }

    /**
     * The time in milliseconds at which this node was first updated.
     */
    private initialUpdateTime: number = 0;

    /**
     * The total duration in milliseconds that this node will be waiting for.
     */
    private totalDuration: number = 0;

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

            // If a longestDuration value was defined then we will be randomly picking a duration between the
            // shortest and longest duration. If it was not defined, then we will be just using the duration.
            this.totalDuration = this.longestDuration
                ? Math.floor(Math.random() * (this.longestDuration - this.duration + 1) + this.duration)
                : this.duration;

            // The node is now running until we finish waiting.
            this.setState(State.RUNNING);
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
    getName = () =>
        `WAIT ${this.longestDuration ? this.duration + "ms-" + this.longestDuration + "ms" : this.duration + "ms"}`;
}
