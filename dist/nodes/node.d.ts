import { Agent } from "../agent";
import Attribute from "../attributes/attribute";
import Entry from "../attributes/callbacks/entry";
import Exit from "../attributes/callbacks/exit";
import Step from "../attributes/callbacks/step";
import Guard from "../attributes/guards/guard";
import GuardPath from "../attributes/guards/guardPath";
import { AnyArgument } from "../rootAstNodesBuilder";
import { AnyState } from "../state";
import Leaf from "./leaf/leaf";
/**
 * A base node.
 */
export default abstract class Node {
    private type;
    private attributes;
    private args;
    /**
     * @param type The node type.
     * @param attributes The node attributes.
     * @param args The node argument definitions.
     */
    constructor(type: string, attributes: Attribute[] | null, args: AnyArgument[]);
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
     * Update the node and get whether the node state has changed.
     * @param agent The agent.
     * @returns Whether the state of this node has changed as part of the update.
     */
    abstract onUpdate: (agent: Agent) => void;
    /**
     * Gets the name of the node.
     */
    abstract getName: () => string;
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
    getAttributes: () => Attribute[];
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
    is: (value: AnyState) => boolean;
    /**
     * Reset the state of the node.
     */
    reset: () => void;
    /**
     * Abort the running of this node.
     * @param agent The agent.
     */
    abort: (agent: Agent) => void;
    /**
     * Update the node.
     * @param agent The agent.
     * @returns The result of the update.
     */
    update: (agent: Agent) => {} | undefined;
}
