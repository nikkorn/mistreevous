import GuardPath, { GuardPathPart } from "./attributes/guards/guardPath";
import buildRootASTNodes, { AstNode } from "./rootAstNodesBuilder";
import State from "./state";
import Lookup from "./lookup";
import Node from "./nodes/node";
import Root from "./nodes/decorator/root";
import Composite from "./nodes/composite/composite";
import Decorator from "./nodes/decorator/decorator";
import { Agent, GlobalActionFunction } from "./agent";
import Attribute from "./attributes/attribute";

type FlattenedTreeNode = {
    id: string,
    type: string,
    caption: string,
    state: any,
    decorators: any[] | null,
    arguments: any[],
    parentId: string | null
}

/**
 * A representation of a behaviour tree.
 */
export default class BehaviourTree {
    /**
     * The main root tree node.
     */
    public readonly rootNode: Root;

    /**
     * @param definition The behaviour tree definition.
     * @param agent The agent instance that this behaviour tree is modelling behaviour for.
     */
    constructor(definition: string, private agent: Agent) {
        // The tree definition must be defined and a valid string.
        if (typeof definition !== "string") {
            throw new Error("the tree definition must be a string");
        }

        // The agent must be defined and not null.
        if (typeof agent !== "object" || agent === null) {
            throw new Error("the agent must be defined and not null");
        }

        // Parse the behaviour tree definition, create the populated tree of behaviour tree nodes, and get the root.
        this.rootNode = BehaviourTree.createRootNode(definition);
    }

    /**
     * Gets whether the tree is in the RUNNING state.
     * @returns true if the tree is in the RUNNING state, otherwise false.
     */
    isRunning() {
        return this.rootNode.getState() === State.RUNNING;
    }

    /**
     * Gets the current tree state of SUCCEEDED, FAILED, READY or RUNNING.
     * @returns The current tree state.
     */
    getState() {
        return this.rootNode.getState();
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
        if (this.rootNode.getState() === State.SUCCEEDED || this.rootNode.getState() === State.FAILED) {
            this.rootNode.reset();
        }

        try {
            this.rootNode.update(this.agent);
        } catch (exception) {
            throw new Error(`error stepping tree: ${(exception as Error).message}`);
        }
    }

    /**
     * Resets the tree from the root node outwards to each nested node, giving each a state of READY.
     */
    reset() {
        this.rootNode.reset();
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
            /**
             * Helper function to get details for all node attributes.
             * @param attributes The node attributes.
             * @returns The attribute details for a node.
             */
            const getAttributeDetails = (attributes: Attribute[]): any[] | null =>
                attributes.length > 0 ? attributes.map((attribute) => attribute.getDetails()) : null;

            // Push the current node into the flattened nodes array.
            flattenedTreeNodes.push({
                id: node.getUid(),
                type: node.getType(),
                caption: node.getName(),
                state: node.getState(),
                decorators: getAttributeDetails(node.getAttributes()),
                arguments: node.getArguments(),
                parentId: parentUid
            });

            // Process each of the nodes children if it is not a leaf node.
            if (!node.isLeafNode()) {
                (node as Composite | Decorator).getChildren().forEach((child) => processNode(child, (node as Composite | Decorator).getUid()));
            }
        };

        // Convert the nested node structure into a flattened array of node details.
        processNode(this.rootNode, null);

        return flattenedTreeNodes;
    }

    /**
     * Registers the action/condition/guard/callback function or subtree with the given name.
     * @param name The name of the function or subtree to register.
     * @param value The function or subtree definition to register.
     */
    static register(name: string, value: GlobalActionFunction | string) {
        if (typeof value === "function") {
            // We are going to register a action/condition/guard/callback function.
            Lookup.setFunc(name, value);
        } else if (typeof value === "string") {
            // We are going to register a subtree.
            let rootASTNodes;

            try {
                // Try to create the behaviour tree AST based on the definition provided, this could fail if the definition is invalid.
                rootASTNodes = buildRootASTNodes(value);
            } catch (exception) {
                // There was an issue in trying to parse and build the tree definition.
                throw new Error(`error registering definition: ${(exception as Error).message}`);
            }

            // This function should only ever be called with a definition containing a single unnamed root node.
            if (rootASTNodes.length != 1 || rootASTNodes[0].name !== null) {
                throw new Error("error registering definition: expected a single unnamed root node");
            }

            Lookup.setSubtree(name, rootASTNodes[0]);
        } else {
            throw new Error("unexpected value, expected string definition or function");
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

    /**
     * Parses a behaviour tree definition and creates a tree of behaviour tree nodes.
     * @param {string} definition The behaviour tree definition.
     * @returns The root behaviour tree node.
     */
    private static createRootNode(definition: string): Root {
        try {
            // Try to create the behaviour tree AST based on the definition provided, this could fail if the definition is invalid.
            const rootASTNodes = buildRootASTNodes(definition);

            // Create a symbol to use as the main root key in our root node mapping.
            const mainRootNodeKey = Symbol("__root__");

            // Create a mapping of root node names to root AST tokens. The main root node will have a key of Symbol("__root__").
            const rootNodeMap: {[key: string | symbol]: AstNode<Root>} = {};
            for (const rootASTNode of rootASTNodes) {
                rootNodeMap[rootASTNode.name === null ? mainRootNodeKey : rootASTNode.name!] = rootASTNode;
            }

            // Create a provider for named root nodes that are part of our definition or have been registered. Prioritising the former.
            const namedRootNodeProvider = function (name: string) {
                return rootNodeMap[name] ? rootNodeMap[name] : Lookup.getSubtree(name);
            };

            // Convert the AST to our actual tree and get the root node.
            const rootNode = rootNodeMap[mainRootNodeKey].createNodeInstance(namedRootNodeProvider, []);

            // Set a guard path on every leaf of the tree to evaluate as part of its update.
            BehaviourTree.applyLeafNodeGuardPaths(rootNode as any);

            // Return the root node.
            return rootNode;
        } catch (exception) {
            // There was an issue in trying to parse and build the tree definition.
            throw new Error(`error parsing tree: ${(exception as Error).message}\n${(exception as Error).stack}`);
        }
    }

    /**
     * Applies a guard path to every leaf of the tree to evaluate as part of each update.
     * @param rootNode The main root tree node.
     */
    private static applyLeafNodeGuardPaths(rootNode: Root) {
        const nodePaths: Node[][] = [];

        const findLeafNodes = (path: Node[], node: Node) => {
            // Add the current node to the path.
            path = path.concat(node);

            // Check whether the current node is a leaf node.
            if (node.isLeafNode()) {
                nodePaths.push(path);
            } else {
                (node as Composite | Decorator).getChildren().forEach((child) => findLeafNodes(path, child));
            }
        };

        // Find all leaf node paths, starting from the root.
        findLeafNodes([], rootNode);

        nodePaths.forEach((path) => {
            // Each node in the current path will have to be assigned a guard path, working from the root outwards.
            for (let depth = 0; depth < path.length; depth++) {
                // Get the node in the path at the current depth.
                const currentNode = path[depth];

                // The node may already have been assigned a guard path, if so just skip it.
                if (currentNode.hasGuardPath()) {
                    continue;
                }

                // Create the guard path for the current node.
                const guardPath = new GuardPath(
                    path
                        .slice(0, depth + 1)
                        .map<GuardPathPart>((node) => ({ node, guards: node.getGuardAttributes() }))
                        .filter((details) => details.guards.length > 0)
                );

                // Assign the guard path to the current node.
                currentNode.setGuardPath(guardPath);
            }
        });
    }
}
