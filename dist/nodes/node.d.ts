import { Agent } from "../Agent";
import Attribute from "../attributes/Attribute";
import Entry from "../attributes/callbacks/Entry";
import Exit from "../attributes/callbacks/Exit";
import Step from "../attributes/callbacks/Step";
import Guard from "../attributes/guards/Guard";
import GuardPath from "../attributes/guards/GuardPath";
import { BehaviourTreeOptions } from "../BehaviourTreeOptions";
import { AnyArgument } from "../RootAstNodesBuilder";
import { AnyState } from "../State";
import Leaf from "./leaf/Leaf";
/**
 * A base node.
 */
export default abstract class Node {
    private type;
    private attributes;
    private args;
    /**
     * The node uid.
     */
    private readonly uid;
    /**
     * The node state.
     */
    private state;
    /**
     * The guard path to evaluate as part of a node update.
     */
    private guardPath;
    /**
     * @param type The node type.
     * @param attributes The node attributes.
     * @param args The node argument definitions.
     */
    constructor(type: string, attributes: Attribute[], args: AnyArgument[]);
    /**
     * Called when the node is being updated.
     * @param agent The agent.
     * @param options The behaviour tree options object.
     */
    protected abstract onUpdate(agent: Agent, options: BehaviourTreeOptions): void;
    /**
     * Gets the name of the node.
     */
    abstract getName(): string;
    /**
     * Gets whether this node is a leaf node.
     */
    abstract isLeafNode: () => this is Leaf;
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
    getAttributes: () => Attribute<import("../attributes/Attribute").AttributeDetails>[];
    /**
     * Gets the node arguments.
     */
    getArguments: () => AnyArgument[];
    /**
     * Gets the node attribute with the specified type, or null if it does not exist.
     */
    getAttribute(type: "entry" | "ENTRY"): Entry;
    getAttribute(type: "exit" | "EXIT"): Exit;
    getAttribute(type: "step" | "STEP"): Step;
    /**
     * Gets the node attributes.
     */
    getGuardAttributes: () => Guard[];
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
     * @param options The behaviour tree options object.
     * @returns The result of the update.
     */
    update(agent: Agent, options: BehaviourTreeOptions): void;
}
