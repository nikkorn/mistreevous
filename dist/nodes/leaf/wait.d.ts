import Leaf from "./leaf";
import Decorator from "../decorator/decorator";
/**
 * A WAIT node.
 * The state of this node will change to SUCCEEDED after a duration of time.
 * @param decorators The node decorators.
 * @param duration The duration that this node will wait to succeed in milliseconds, or the earliest if longestDuration is defined.
 * @param longestDuration The longest possible duration in milliseconds that this node will wait to succeed.
 */
export default class Wait extends Leaf {
    private duration;
    private longestDuration;
    constructor(decorators: Decorator[] | null, duration: number, longestDuration: number);
    /**
     * The time in milliseconds at which this node was first updated.
     */
    private initialUpdateTime;
    /**
     * The duration in milliseconds that this node will be waiting for.
     */
    private waitDuration;
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
}
