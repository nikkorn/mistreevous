import State, { AnyState } from "./State";
import Lookup from "./Lookup";
import Node from "./nodes/Node";
import Root from "./nodes/decorator/Root";
import Action from "./nodes/leaf/Action";
import Condition from "./nodes/leaf/Condition";
import Composite from "./nodes/composite/Composite";
import Decorator from "./nodes/decorator/Decorator";
import { Agent, GlobalFunction } from "./Agent";
import { CallbackAttributeDetails } from "./attributes/callbacks/Callback";
import { GuardAttributeDetails } from "./attributes/guards/Guard";
import { BehaviourTreeOptions } from "./BehaviourTreeOptions";
import { convertMDSLToJSON } from "./mdsl/MDSLDefinitionParser";
import { RootNodeDefinition } from "./BehaviourTreeDefinition";
import { validateDefinition, validateJSONDefinition } from "./BehaviourTreeDefinitionValidator";
import buildRootNode from "./BehaviourTreeBuilder";
import { isNullOrUndefined } from "./BehaviourTreeDefinitionUtilities";

// Purely for outside inspection of the tree.
export type FlattenedTreeNode = {
    id: string;
    type: string;
    caption: string;
    state: AnyState;
    /**
     * The array of agent or globally registered function arguments if this is an action or condition node.
     */
    args?: any[];
    guards: GuardAttributeDetails[];
    callbacks: CallbackAttributeDetails[];
    parentId: string | null;
};

/**
 * A representation of a behaviour tree.
 */
export class BehaviourTree {
    /**
     * The main root tree node.
     */
    private readonly _rootNode: Root;

    /**
     * Creates a new instance of the BehaviourTree class.
     * @param definition The behaviour tree definition as either an MDSL string, root node definition object or array of root node definition objects.
     * @param agent The agent instance that this behaviour tree is modelling behaviour for.
     * @param options The behaviour tree options object.
     */
    constructor(
        definition: string | RootNodeDefinition | RootNodeDefinition[],
        private agent: Agent,
        private options: BehaviourTreeOptions = {}
    ) {
        // The tree definition must be defined.
        if (isNullOrUndefined(definition)) {
            throw new Error("tree definition not defined");
        }

        // The agent must be defined and not null.
        if (typeof agent !== "object" || agent === null) {
            throw new Error("the agent must be an object and not null");
        }

        // We should validate the definition before we try to build the tree nodes.
        const { succeeded, errorMessage, json } = validateDefinition(definition);

        // Did our validation fail without error?
        if (!succeeded) {
            throw new Error(`invalid definition: ${errorMessage}`);
        }

        // Double check that we did actually get our json definition as part of our definition validtion.
        if (!json) {
            throw new Error(
                "expected json definition to be returned as part of successful definition validation response"
            );
        }

        try {
            // Create the populated tree of behaviour tree nodes and get the root node.
            this._rootNode = buildRootNode(json, options);
        } catch (exception) {
            // There was an issue in trying build and populate the behaviour tree.
            throw new Error(`error building tree: ${(exception as Error).message}`);
        }
    }

    /**
     * Gets whether the tree is in the RUNNING state.
     * @returns true if the tree is in the RUNNING state, otherwise false.
     */
    isRunning() {
        return this._rootNode.getState() === State.RUNNING;
    }

    /**
     * Gets the current tree state of SUCCEEDED, FAILED, READY or RUNNING.
     * @returns The current tree state.
     */
    getState() {
        return this._rootNode.getState();
    }

    /**
     * Step the tree.
     * Carries out a node update that traverses the tree from the root node outwards to any child nodes, skipping those that are already in a resolved state of SUCCEEDED or FAILED.
     * After being updated, leaf nodes will have a state of SUCCEEDED, FAILED or RUNNING. Leaf nodes that are left in the RUNNING state as part of a tree step will be revisited each
     * subsequent step until they move into a resolved state of either SUCCEEDED or FAILED, after which execution will move through the tree to the next node with a state of READY.
     *
     * Calling this method when the tree is already in a resolved state of SUCCEEDED or FAILED will cause it to be reset before tree traversal begins.
     */
    step() {
        // If the root node has already been stepped to completion then we need to reset it.
        if (this._rootNode.getState() === State.SUCCEEDED || this._rootNode.getState() === State.FAILED) {
            this._rootNode.reset();
        }

        try {
            this._rootNode.update(this.agent);
        } catch (exception) {
            throw new Error(`error stepping tree: ${(exception as Error).message}`);
        }
    }

    /**
     * Resets the tree from the root node outwards to each nested node, giving each a state of READY.
     */
    reset() {
        this._rootNode.reset();
    }

    /**
     * Gets the flattened details of every node in the tree.
     * @returns The flattened details of every node in the tree.
     */
    getFlattenedNodeDetails(): FlattenedTreeNode[] {
        // Create an empty flattened array of tree nodes.
        const flattenedTreeNodes: FlattenedTreeNode[] = [];

        /**
         * Helper function to process a node instance and push details into the flattened tree nodes array.
         * @param node The current node.
         * @param parentUid The UID of the node parent, or null if the node is the main root node.
         */
        const processNode = (node: Node, parentUid: string | null) => {
            // Get the guard and callback attribute details for this node.
            const guards = node
                .getAttributes()
                .filter((attribute) => attribute.isGuard())
                .map((attribute) => attribute.getDetails()) as GuardAttributeDetails[];
            const callbacks = node
                .getAttributes()
                .filter((attribute) => !attribute.isGuard())
                .map((attribute) => attribute.getDetails()) as CallbackAttributeDetails[];

            // Create the node details.
            const flattenedTreeNode: FlattenedTreeNode = {
                id: node.getUid(),
                type: node.getType(),
                caption: node.getName(),
                state: node.getState(),
                guards,
                callbacks,
                parentId: parentUid
            };

            // If this node is an action or condition node then we will be sticking the function arguments on there too.
            if (node instanceof Action) {
                flattenedTreeNode.args = node.actionArguments;
            } else if (node instanceof Condition) {
                flattenedTreeNode.args = node.conditionArguments;
            }

            // Push the current node into the flattened nodes array.
            flattenedTreeNodes.push(flattenedTreeNode);

            // Process each of the nodes children if it is not a leaf node.
            if (!node.isLeafNode()) {
                (node as Composite | Decorator)
                    .getChildren()
                    .forEach((child) => processNode(child, (node as Composite | Decorator).getUid()));
            }
        };

        // Convert the nested node structure into a flattened array of node details.
        processNode(this._rootNode, null);

        return flattenedTreeNodes;
    }

    /**
     * Registers the action/condition/guard/callback function or subtree with the given name.
     * @param name The name of the function or subtree to register.
     * @param value The function or subtree definition to register.
     */
    static register(name: string, value: GlobalFunction | string | RootNodeDefinition) {
        // Are we going to register a action/condition/guard/callback function?
        if (typeof value === "function") {
            Lookup.setFunc(name, value);
            return;
        }

        // We are not registering an action/condition/guard/callback function, so we must be registering a subtree.
        if (typeof value === "string") {
            let rootNodeDefinitions: RootNodeDefinition[];

            // We will assume that any string passed in will be a mdsl definition.
            try {
                rootNodeDefinitions = convertMDSLToJSON(value);
            } catch (exception) {
                throw new Error(`error registering definition, invalid MDSL: ${(exception as Error).message}`);
            }

            // This function should only ever be called with a definition containing a single unnamed root node.
            if (rootNodeDefinitions.length != 1 || typeof rootNodeDefinitions[0].id !== "undefined") {
                throw new Error("error registering definition: expected a single unnamed root node");
            }

            try {
                // We should validate the subtree as we don't want invalid subtrees available via the lookup.
                const { succeeded, errorMessage } = validateJSONDefinition(rootNodeDefinitions[0]);

                // Did our validation fail without error?
                if (!succeeded) {
                    throw new Error(errorMessage);
                }
            } catch (exception) {
                throw new Error(`error registering definition: ${(exception as Error).message}`);
            }

            // Everything seems hunky-dory, register the subtree.
            Lookup.setSubtree(name, rootNodeDefinitions[0]);
        } else if (typeof value === "object" && !Array.isArray(value)) {
            // We will assume that any object passed in is a root node definition.

            try {
                // We should validate the subtree as we don't want invalid subtrees available via the lookup.
                const { succeeded, errorMessage } = validateJSONDefinition(value);

                // Did our validation fail without error?
                if (!succeeded) {
                    throw new Error(errorMessage);
                }
            } catch (exception) {
                throw new Error(`error registering definition: ${(exception as Error).message}`);
            }

            // Everything seems hunky-dory, register the subtree.
            Lookup.setSubtree(name, value);
        } else {
            throw new Error("unexpected value, expected string mdsl definition, root node json definition or function");
        }
    }

    /**
     * Unregisters the registered action/condition/guard/callback function or subtree with the given name.
     * @param name The name of the registered action/condition/guard/callback function or subtree to unregister.
     */
    static unregister(name: string): void {
        Lookup.remove(name);
    }

    /**
     * Unregister all registered action/condition/guard/callback functions and subtrees.
     */
    static unregisterAll(): void {
        Lookup.empty();
    }
}
