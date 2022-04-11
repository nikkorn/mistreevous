import GuardPath from './attributes/guards/guardPath';
import buildRootASTNodes from './rootASTNodesBuilder';
import State from "./state";
import Lookup from "./lookup";

/**
 * The behaviour tree.
 * @param definition The tree definition.
 * @param board The board.
 */
export default function BehaviourTree(definition, board) {
    /**
     * The blackboard.
     */
    this._blackboard = board;
    /**
     * The main root tree node.
     */
    this._rootNode;

    /**
     * Initialise the BehaviourTree instance.
     */
    this._init = function() {
        // The tree definition must be defined and a valid string.
        if (typeof definition !== "string") {
            throw new Error("the tree definition must be a string");
        }

        // The blackboard must be defined.
        if (typeof board !== 'object' || board === null) {
            throw new Error("the blackboard must be defined");
        }

        // Swap out any node/decorator argument string literals with a placeholder and get a mapping of placeholders to original values.
        const stringArgumentPlaceholders = this._substituteStringLiterals();

        // Convert the definition into an array of raw tokens.
        const tokens = this._parseTokensFromDefinition();

        try {
            // Try to create the behaviour tree AST from tokens, this could fail if the definition is invalid.
            const rootASTNodes = buildRootASTNodes(tokens, stringArgumentPlaceholders);

            // Create a symbol to use as the main root key in our root node mapping.
            const mainRootNodeKey = Symbol("__root__");

            // Create a mapping of root node names to root AST tokens. The main root node will have a key of Symbol("__root__").
            const rootNodeMap = {};
            for (const rootASTNode of rootASTNodes) {
                rootNodeMap[rootASTNode.name === null ? mainRootNodeKey : rootASTNode.name] = rootASTNode;
            }

            // Create a provider for named root nodes.
            const namedRootNodeProvider = function (name) { return rootNodeMap[name]; };

            // Convert the AST to our actual tree.
            this._rootNode = rootNodeMap[mainRootNodeKey].createNodeInstance(namedRootNodeProvider, []);

            // Set a guard path on every leaf of the tree to evaluate as part of its update.
            this._applyLeafNodeGuardPaths();
        } catch (exception) {
            // There was an issue in trying to parse and build the tree definition.
            throw new Error(`error parsing tree: ${exception.message}`);
        }
    };

    /**
     * Swaps out any node/decorator argument string literals with placeholders.
     * @returns A mapping of placeholders to original string values.
     */
    this._substituteStringLiterals = function() {
        // Create an object to hold the mapping of placeholders to original string values.
        const matches = {};

        // Replace any string literals wrapped with double quotes in our definition with placeholders to be processed later.
        definition = definition.replace(
            /\"(\\.|[^"\\])*\"/g,
            (match) => {
                var strippedMatch = match.substring(1, match.length - 1);
                var placeholder   = Object.keys(matches).find(key => matches[key] === strippedMatch);
                
                // If we have no existing string literal match then create a new placeholder.
                if (!placeholder) {
                    placeholder          = `@@${Object.keys(matches).length}@@`;
                    matches[placeholder] = strippedMatch;
                } 
                
                return placeholder;
            }
        );

        return matches;
    };

    /**
     * Parse the BT tree definition into an array of raw tokens.
     * @returns An array of tokens parsed from the definition.
     */
    this._parseTokensFromDefinition = function() {
        // Add some space around various important characters so that they can be plucked out easier as individual tokens.
        definition = definition.replace(/\(/g, " ( ");
        definition = definition.replace(/\)/g, " ) ");
        definition = definition.replace(/\{/g, " { ");
        definition = definition.replace(/\}/g, " } ");
        definition = definition.replace(/\]/g, " ] ");
        definition = definition.replace(/\[/g, " [ ");
        definition = definition.replace(/\,/g, " , ");

        // Split the definition into raw token form and return it.
        return definition.replace(/\s+/g, " ").trim().split(" ");
    };

    /**
     * Apply guard paths for every leaf node in the behaviour tree.
     */
    this._applyLeafNodeGuardPaths = function() {
        this._getAllNodePaths().forEach((path) => {
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
                        .map((node) => ({ node, guards: node.getGuardDecorators() }))
                        .filter((details) => details.guards.length > 0)
                )

                // Assign the guard path to the current node.
                currentNode.setGuardPath(guardPath);
            }
        });
    };

    /**
     * Gets a multi-dimensional array of root->leaf node paths.
     * @returns A multi-dimensional array of root->leaf node paths.
     */
    this._getAllNodePaths = function() {
        const nodePaths = [];

        const findLeafNodes = (path, node) => {
            // Add the current node to the path.
            path = path.concat(node);

            // Check whether the current node is a leaf node. 
            if (node.isLeafNode()) {
                nodePaths.push(path);
            } else {
                node.getChildren().forEach((child) => findLeafNodes(path, child));
            }
        };

        // Find all leaf node paths, starting from the root.
        findLeafNodes([], this._rootNode);

        return nodePaths;
    };

    // Call init logic.
    this._init();
}

/**
 * Gets the root node.
 * @returns The root node.
 */
BehaviourTree.prototype.getRootNode = function () {
    return this._rootNode;
};

/**
 * Gets the flattened details of every node in the tree.
 * @returns The flattened details of every node in the tree.
 */
BehaviourTree.prototype.getFlattenedNodeDetails = function () {
    // Create an empty flattened array of tree nodes.
    const flattenedTreeNodes = [];

    /**
     * Helper function to process a node instance and push details into the flattened tree nodes array.
     * @param node The current node.
     * @param parentUid The UID of the node parent, or null if the node is the main root node.
     */
    const processNode = (node, parentUid) => {
        /**
         * Helper function to get details for all node decorators.
         * @param decorators The node decorators.
         * @returns The decorator details for a node.
         */
        const getDecoratorDetails = (decorators) =>
            decorators.length > 0 ? decorators.map((decorator) => decorator.getDetails()) : null;

        // Push the current node into the flattened nodes array.
        flattenedTreeNodes.push({ 
            id: node.getUid(),
            type: node.getType(), 
            caption: node.getName(),
            state: node.getState(),
            decorators: getDecoratorDetails(node.getDecorators()),
            arguments: node.getArguments(),
            parentId: parentUid
        });

        // Process each of the nodes children if it is not a leaf node.
        if (!node.isLeafNode()) {
            node.getChildren().forEach((child) => processNode(child, node.getUid()));
        }
    };

    // Convert the nested node structure into a flattened array of node details.
    processNode(this._rootNode, null);

    return flattenedTreeNodes;
};

/**
 * Gets whether the tree is in the running state.
 * @returns Whether the tree is in the running state.
 */
BehaviourTree.prototype.isRunning = function () {
    return this._rootNode.getState() === State.RUNNING;
};

/**
 * Gets the current tree state.
 * @returns The current tree state.
 */
BehaviourTree.prototype.getState = function () {
    return this._rootNode.getState();
};

/**
 * Step the tree.
 */
BehaviourTree.prototype.step = function () {
    // If the root node has already been stepped to completion then we need to reset it.
    if (this._rootNode.getState() === State.SUCCEEDED || this._rootNode.getState() === State.FAILED) {
        this._rootNode.reset();
    }

    try {
        this._rootNode.update(this._blackboard);
    } catch (exception) {
        throw new Error(`error stepping tree: ${exception.message}`);
    }
};

/**
 * Reset the tree from the root.
 */
BehaviourTree.prototype.reset = function () {
    this._rootNode.reset();
};

BehaviourTree.register = function (nameOrObject, functionOrDefinition) {
    // This can take either:
    // - A subtree name AND a stringy (and eventually JSON) definition.
    // - A function name AND an action/condition/guard/callback function.
    // - JUST an object that contains a mix of action/condition/guard/callback functions and/or stringy (and eventually JSON) subtree definitions.

    if (typeof nameOrObject === "string") {
        if (typeof functionOrDefinition === "function") {
            Lookup.setFunc(nameOrObject, functionOrDefinition);
        }
        else if (typeof functionOrDefinition === "string") {
            // TODO Convert functionOrDefinition to a subtree
            Lookup.setSubtree(nameOrObject, null);
        }
        else {
            throw new Error("not what i expected! if this is a JSON definition then you are a few releases too early");
        }
    }
    else if (typeof nameOrObject === "object") {
        // TODO I guess we are just going to throw everything in nameOrObject at our lookup?
    }
    else {
        throw new Error("not what i expected!");
    }
};

BehaviourTree.unregister = function (nameOrObject) {
    // Takes a name of a subtree of function OR an object that was passed to register.
};