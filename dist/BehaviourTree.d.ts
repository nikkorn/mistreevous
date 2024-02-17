import { AnyState } from "./State";
import Root from "./nodes/decorator/Root";
import { Agent, GlobalFunction } from "./Agent";
import { CallbackAttributeDetails } from "./attributes/callbacks/Callback";
import { GuardAttributeDetails } from "./attributes/guards/Guard";
import { BehaviourTreeOptions } from "./BehaviourTreeOptions";
import { RootNodeDefinition } from "./BehaviourTreeDefinition";
export type FlattenedTreeNode = {
    id: string;
    type: string;
    caption: string;
    state: AnyState;
    guards: GuardAttributeDetails[];
    callbacks: CallbackAttributeDetails[];
    args: any[];
    parentId: string | null;
};
/**
 * A representation of a behaviour tree.
 */
export declare class BehaviourTree {
    private agent;
    private options;
    /**
     * The main root tree node.
     */
    readonly rootNode: Root;
    /**
     * Creates a new instance of the BehaviourTree class.
     * @param definition The behaviour tree definition as either an MDSL string, root node definition object or array of root node definition objects.
     * @param agent The agent instance that this behaviour tree is modelling behaviour for.
     * @param options The behaviour tree options object.
     */
    constructor(definition: string | RootNodeDefinition | RootNodeDefinition[], agent: Agent, options?: BehaviourTreeOptions);
    /**
     * Gets whether the tree is in the RUNNING state.
     * @returns true if the tree is in the RUNNING state, otherwise false.
     */
    isRunning(): boolean;
    /**
     * Gets the current tree state of SUCCEEDED, FAILED, READY or RUNNING.
     * @returns The current tree state.
     */
    getState(): AnyState;
    /**
     * Step the tree.
     * Carries out a node update that traverses the tree from the root node outwards to any child nodes, skipping those that are already in a resolved state of SUCCEEDED or FAILED.
     * After being updated, leaf nodes will have a state of SUCCEEDED, FAILED or RUNNING. Leaf nodes that are left in the RUNNING state as part of a tree step will be revisited each
     * subsequent step until they move into a resolved state of either SUCCEEDED or FAILED, after which execution will move through the tree to the next node with a state of READY.
     *
     * Calling this method when the tree is already in a resolved state of SUCCEEDED or FAILED will cause it to be reset before tree traversal begins.
     */
    step(): void;
    /**
     * Resets the tree from the root node outwards to each nested node, giving each a state of READY.
     */
    reset(): void;
    /**
     * Gets the flattened details of every node in the tree.
     * @returns The flattened details of every node in the tree.
     */
    getFlattenedNodeDetails(): FlattenedTreeNode[];
    /**
     * Registers the action/condition/guard/callback function or subtree with the given name.
     * @param name The name of the function or subtree to register.
     * @param value The function or subtree definition to register.
     */
    static register(name: string, value: GlobalFunction | string | RootNodeDefinition): void;
    /**
     * Unregisters the registered action/condition/guard/callback function or subtree with the given name.
     * @param name The name of the registered action/condition/guard/callback function or subtree to unregister.
     */
    static unregister(name: string): void;
    /**
     * Unregister all registered action/condition/guard/callback functions and subtrees.
     */
    static unregisterAll(): void;
}
