import { BehaviourTreeOptions } from "../BehaviourTreeOptions";
import State, { AnyState } from "../State";
import { Agent } from "../Agent";
import Attribute from "../attributes/Attribute";
import Entry from "../attributes/callbacks/Entry";
import Exit from "../attributes/callbacks/Exit";
import Step from "../attributes/callbacks/Step";
import While from "../attributes/guards/While";
import Until from "../attributes/guards/Until";
import GuardPath from "../attributes/guards/GuardPath";
import { GuardAttributeDetails } from "../attributes/guards/Guard";
import { CallbackAttributeDetails } from "../attributes/callbacks/Callback";
/**
 * Details of a tree node instance.
 */
export type NodeDetails = {
    /**
     * The tree node identifier.
     */
    id: string;
    /**
     * The tree node type.
     */
    type: string;
    /**
     * The tree node name.
     */
    name: string;
    /**
     * The current state of the tree node.
     */
    state: AnyState;
    /**
     * The array of agent or globally registered function arguments, defined if this is an action or condition node.
     */
    args?: any[];
    /**
     * The 'while' guard attribute configured for this node.
     */
    while?: GuardAttributeDetails;
    /**
     * The 'until' guard attribute configured for this node.
     */
    until?: GuardAttributeDetails;
    /**
     * The 'entry' callback attribute configured for this node.
     */
    entry?: CallbackAttributeDetails;
    /**
     * The 'step' callback attribute configured for this node.
     */
    step?: CallbackAttributeDetails;
    /**
     * The 'exit' callback attribute configured for this node.
     */
    exit?: CallbackAttributeDetails;
    /**
     * The array of the child nodes of this node, defined if this node is a composite or decorator node.
     */
    children?: NodeDetails[];
};
/**
 * A mapping of attribute names to attributes configured for a node.
 */
type Attributes = {
    /**
     * The 'entry' callback attribute configured for this node.
     */
    entry?: Entry;
    /**
     * The 'step' callback attribute configured for this node.
     */
    step?: Step;
    /**
     * The 'exit' callback attribute configured for this node.
     */
    exit?: Exit;
    /**
     * The 'while' guard attribute configured for this node.
     */
    while?: While;
    /**
     * The 'until' guard attribute configured for this node.
     */
    until?: Until;
};
/**
 * A base node.
 */
export default abstract class Node {
    private type;
    protected options: BehaviourTreeOptions;
    /**
     * The node unique identifier.
     */
    protected readonly uid: string;
    /**
     * The node attributes.
     */
    protected readonly attributes: Attributes;
    /**
     * The node state.
     */
    private _state;
    /**
     * The guard path to evaluate as part of a node update.
     */
    private _guardPath;
    /**
     * @param type The node type.
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     */
    constructor(type: string, attributes: Attribute[], options: BehaviourTreeOptions);
    /**
     * Called when the node is being updated.
     * @param agent The agent.
     */
    protected abstract onUpdate(agent: Agent): void;
    /**
     * Gets the name of the node.
     */
    abstract getName(): string;
    /**
     * Gets/Sets the state of the node.
     */
    getState: () => AnyState;
    setState: (value: AnyState) => void;
    /**
     * Gets the unique id of the node.
     */
    getUid: () => string;
    /**
     * Gets the type of the node.
     */
    getType: () => string;
    /**
     * Gets the node attributes.
     */
    getAttributes: () => (Entry | Exit | Step | While | Until)[];
    /**
     * Sets the guard path to evaluate as part of a node update.
     */
    setGuardPath: (value: GuardPath) => GuardPath;
    /**
     * Gets whether a guard path is assigned to this node.
     */
    hasGuardPath: () => boolean;
    /**
     * Gets whether this node is in the specified state.
     * @param value The value to compare to the node state.
     */
    is(value: AnyState): boolean;
    /**
     * Reset the state of the node.
     */
    reset(): void;
    /**
     * Abort the running of this node.
     * @param agent The agent.
     */
    abort(agent: Agent): void;
    /**
     * Update the node.
     * @param agent The agent.
     * @returns The result of the update.
     */
    update(agent: Agent): void;
    /**
     * Gets the details of this node instance.
     * @returns The details of this node instance.
     */
    getDetails(): NodeDetails;
    /**
     * Called when the state of this node changes.
     * @param previousState The previous node state.
     */
    protected onStateChanged(previousState: State): void;
}
export {};
