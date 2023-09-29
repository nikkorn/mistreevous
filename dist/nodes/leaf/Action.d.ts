import Leaf from "./Leaf";
import { Agent } from "../../Agent";
import Attribute from "../../attributes/Attribute";
import { AnyArgument } from "../../RootAstNodesBuilder";
import { BehaviourTreeOptions } from "../../BehaviourTreeOptions";
/**
 * An Action leaf node.
 * This represents an immediate or ongoing state of behaviour.
 */
export default class Action extends Leaf {
    private actionName;
    private actionArguments;
    /**
     * @param attributes The node attributes.
     * @param actionName The action name.
     * @param actionArguments The array of action argument definitions.
     */
    constructor(attributes: Attribute[], actionName: string, actionArguments: AnyArgument[]);
    /**
     * Whether there is a pending update promise.
     */
    private isUsingUpdatePromise;
    /**
     * The finished state result of an update promise.
     */
    private updatePromiseStateResult;
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
    /**
     * Reset the state of the node.
     */
    reset: () => void;
    /**
     * Validate the result of an update function call.
     * @param result The result of an update function call.
     */
    private validateUpdateResult;
}
