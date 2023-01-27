import Leaf from "./leaf";
import Attribute from "../../attributes/attribute";
import { Agent } from "../../agent";
import { BehaviourTreeOptions } from "../../behaviourTreeOptions";
/**
 * A WAIT node.
 * The state of this node will change to SUCCEEDED after a duration of time
 */
export default class Wait extends Leaf {
    private duration;
    private longestDuration;
    /**
     * @param attributes The node attributes.
     * @param duration The duration that this node will wait to succeed in milliseconds, or the earliest if longestDuration is defined.
     * @param longestDuration The longest possible duration in milliseconds that this node will wait to succeed.
     */
    constructor(attributes: Attribute[], duration: number, longestDuration: number);
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
