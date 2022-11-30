import GuardPath from "../attributes/guards/guardPath";
import Decorator from "./decorator/decorator";
import Leaf from "./leaf/leaf";
/**
 * A base node.
 * @param type The node type.
 * @param decorators The node decorators.
 * @param args The node argument definitions.
 */
export default abstract class Node {
    private type;
    private decorators;
    private args;
    constructor(type: string, decorators: Decorator[] | null, args: any[]);
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
    abstract onUpdate: (agent: any) => void;
    abstract getName: () => string;
    abstract isLeafNode: () => this is Leaf;
    /**
     * Gets/Sets the state of the node.
     */
    getState: () => any;
    setState: (value: any) => any;
    /**
     * Gets the unique id of the node.
     */
    getUid: () => string;
    /**
     * Gets the type of the node.
     */
    getType: () => string;
    /**
     * Gets the node decorators.
     */
    getDecorators: () => Decorator[];
    /**
     * Gets the node arguments.
     */
    getArguments: () => any[];
    /**
     * Gets the node decorator with the specified type, or null if it does not exist.
     */
    getDecorator(type: string): Decorator;
    /**
     * Gets the node decorators.
     */
    getGuardDecorators: () => Decorator[];
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
    is: (value: any) => boolean;
    /**
     * Reset the state of the node.
     */
    reset: () => any;
    /**
     * Abort the running of this node.
     * @param agent The agent.
     */
    abort: (agent: any) => void;
    /**
     * Update the node.
     * @param agent The agent.
     * @returns The result of the update.
     */
    update: (agent: any) => {} | undefined;
}
