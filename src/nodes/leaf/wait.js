import Leaf from "./leaf";
import State from "../../State";

/**
 * A WAIT node.
 * The state of this node will change to SUCCEEDED after a duration of time.
 * @param decorators The node decorators.
 * @param duration The duration that this node will wait to succeed in milliseconds, or the earliest if longestDuration is defined.
 * @param longestDuration The longest possible duration in milliseconds that this node will wait to succeed.
 */
export default function Wait(decorators, duration, longestDuration) {
    Leaf.call(this, "wait", decorators);

    /**
     * The time in milliseconds at which this node was first updated.
     */
    let initialUpdateTime;

    /**
     * The total duration in milliseconds that this node will be waiting for.
     */
    let totalDuration;

    /**
     * The duration in milliseconds that this node has been waiting for.
     */
    let waitedDuration;

    /**
     * Update the node.
     * @param agent The agent.
     * @param options The behaviour tree options object.
     * @returns The result of the update.
     */
    this.onUpdate = function (agent, options) {
        // If this node is in the READY state then we need to set the initial update time.
        if (this.is(State.READY)) {
            // Set the initial update time.
            initialUpdateTime = new Date().getTime();

            // Set the initial waited duration.
            waitedDuration = 0;

            // If a longestDuration value was defined then we will be randomly picking a duration between the
            // shortest and longest duration. If it was not defined, then we will be just using the duration.
            totalDuration = longestDuration
                ? Math.floor(Math.random() * (longestDuration - duration + 1) + duration)
                : duration;

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
            waitedDuration += deltaTime * 1000;
        } else {
            // We are not using a delta time, so we will just work out hom much time has passed since the first update.
            waitedDuration = new Date().getTime() - initialUpdateTime;
        }

        // Have we waited long enough?
        if (waitedDuration >= totalDuration) {
            // We have finished waiting!
            this.setState(State.SUCCEEDED);
        }
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => `WAIT ${longestDuration ? duration + "ms-" + longestDuration + "ms" : duration + "ms"}`;
}

Wait.prototype = Object.create(Leaf.prototype);
