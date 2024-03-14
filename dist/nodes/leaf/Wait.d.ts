import Leaf from "./Leaf";
import Attribute from "../../attributes/Attribute";
import { Agent } from "../../Agent";
import { BehaviourTreeOptions } from "../../BehaviourTreeOptions";
/**
 * A WAIT node.
 * The state of this node will change to SUCCEEDED after a duration of time
 */
export default class Wait extends Leaf {
    private duration;
    private durationMin;
    private durationMax;
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param duration The duration that this node will wait to succeed in milliseconds.
     * @param durationMin The minimum possible duration in milliseconds that this node will wait to succeed.
     * @param durationMax The maximum possible duration in milliseconds that this node will wait to succeed.
     */
    constructor(attributes: Attribute[], options: BehaviourTreeOptions, duration: number | null, durationMin: number | null, durationMax: number | null);
    /**
     * The time in milliseconds at which this node was first updated.
     */
    private initialUpdateTime;
    /**
     * The total duration in milliseconds that this node will be waiting for.
     */
    private totalDuration;
    /**
     * The duration in milliseconds that this node has been waiting for.
     */
    private waitedDuration;
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
}
