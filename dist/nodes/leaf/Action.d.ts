import { BehaviourTreeOptions } from "../../BehaviourTreeOptions";
import State from "../../State";
import { Agent } from "../../Agent";
import Leaf from "./Leaf";
import Attribute from "../../attributes/Attribute";
/**
 * An Action leaf node.
 * This represents an immediate or ongoing state of behaviour.
 */
export default class Action extends Leaf {
    private actionName;
    actionArguments: any[];
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param actionName The action name.
     * @param actionArguments The array of action argument definitions.
     */
    constructor(attributes: Attribute[], options: BehaviourTreeOptions, actionName: string, actionArguments: any[]);
    /**
     * Whether there is a pending update promise.
     */
    private isUsingUpdatePromise;
    /**
     * The finished state result of an update promise.
     */
    private updatePromiseResult;
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
     * Called when the state of this node changes.
     * @param previousState The previous node state.
     */
    protected onStateChanged(previousState: State): void;
    /**
     * Validate the result of an update function call.
     * @param result The result of an update function call.
     */
    private validateUpdateResult;
}
