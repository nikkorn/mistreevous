import Leaf from "./leaf";
import State from "../../state";
import Decorator from "../decorator/decorator";

/**
 * A WAIT node.
 * The state of this node will change to SUCCEEDED after a duration of time.
 * @param decorators The node decorators.
 * @param duration The duration that this node will wait to succeed in milliseconds, or the earliest if longestDuration is defined.
 * @param longestDuration The longest possible duration in milliseconds that this node will wait to succeed.
 */
export default class Wait extends Leaf {
    constructor(decorators: Decorator[] | null, private duration: number, private longestDuration: number) {
        super("wait", decorators, []);
    }

    /**
     * The time in milliseconds at which this node was first updated.
     */
    private initialUpdateTime: number | undefined;

    /**
     * The duration in milliseconds that this node will be waiting for.
     */
    private waitDuration: number | undefined;

    /**
     * Update the node.
     * @param agent The agent.
     * @returns The result of the update.
     */
    onUpdate = (agent: any) => {
        // If this node is in the READY state then we need to set the initial update time.
        if (this.is(State.READY)) {
            // Set the initial update time.
            this.initialUpdateTime = new Date().getTime();

            // If a longestDuration value was defined then we will be randomly picking a duration between the
            // shortest and longest duration. If it was not defined, then we will be just using the duration.
            this.waitDuration = this.longestDuration
                ? Math.floor(Math.random() * (this.longestDuration - this.duration + 1) + this.duration)
                : this.duration;

            // The node is now running until we finish waiting.
            this.setState(State.RUNNING);
        }

        // Have we waited long enough?
        if (new Date().getTime() >= this.initialUpdateTime! + this.waitDuration!) {
            // We have finished waiting!
            this.setState(State.SUCCEEDED);
        }
    };

    /**
     * Gets the name of the node.
     */
    getName = () => `WAIT ${this.longestDuration ? this.duration + "ms-" + this.longestDuration + "ms" : this.duration + "ms"}`;
}
