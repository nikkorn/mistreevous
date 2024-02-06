import { AnyNodeDefinition, RootNodeDefinition } from "./BehaviourTreeDefinition";
import GuardPath, { GuardPathPart } from "./attributes/guards/GuardPath";
import { validateBranchSubtreeLinks } from "./BehaviourTreeDefinitionValidator";
import Node from "./nodes/Node";
import Composite from "./nodes/composite/Composite";
import Decorator from "./nodes/decorator/Decorator";
import Parallel from "./nodes/composite/Parallel";
import Selector from "./nodes/composite/Selector";
import Sequence from "./nodes/composite/Sequence";
import Lotto from "./nodes/composite/Lotto";
import Fail from "./nodes/decorator/Fail";
import Flip from "./nodes/decorator/Flip";
import Repeat from "./nodes/decorator/Repeat";
import Retry from "./nodes/decorator/Retry";
import Root from "./nodes/decorator/Root";
import Succeed from "./nodes/decorator/Succeed";
import Action from "./nodes/leaf/Action";
import Condition from "./nodes/leaf/Condition";
import Wait from "./nodes/leaf/Wait";
import Lookup from "./Lookup";
import Attribute from "./attributes/Attribute";
import While from "./attributes/guards/While";
import Until from "./attributes/guards/Until";
import Entry from "./attributes/callbacks/Entry";
import Step from "./attributes/callbacks/Step";
import Exit from "./attributes/callbacks/Exit";

/**
 * A type representing any node instance in a behaviour tree.
 */
type AnyNode =
    | Root
    | Action
    | Condition
    | Wait
    | Sequence
    | Selector
    | Lotto
    | Parallel
    | Repeat
    | Retry
    | Flip
    | Succeed
    | Fail;

/**
 * A type defining a mapping of root node identifiers to root node definitions.
 */
type RootNodeDefinitionMap = { [key: string | symbol]: RootNodeDefinition };

/**
 * A symbol to use as the main root key in any root node mappings.
 */
const MAIN_ROOT_NODE_KEY = Symbol("__root__");

/**
 * Build and populate the root nodes based on the provided definition, assuming that the definition has been validated.
 * @param definition The root node definitions.
 * @returns The built and populated root node definitions.
 */
export default function buildRootNode(definition: RootNodeDefinition[]): Root {
    // Create a mapping of root node identifers to root node definitions, including globally registered subtree root node definitions.
    const rootNodeDefinitionMap = createRootNodeDefinitionMap(definition);

    // Now that we have all of our root node definitons (those part of the tree definition and those globally
    // registered) we should validate the definition. This will also double-check that we dont have any circular
    // dependencies in our branch -> subtree references and that we have no broken branch -> subtree links.
    validateBranchSubtreeLinks(definition, true);

    // Create our populated tree of node instances, starting with our main root node.
    const rootNode = nodeFactory(rootNodeDefinitionMap[MAIN_ROOT_NODE_KEY]) as Root;

    // Set a guard path on every leaf of the tree to evaluate as part of its update.
    applyLeafNodeGuardPaths(rootNode);

    // We only need to return the main root node.
    return rootNode;
}

/**
 * A factory function which creates a node instance based on the specified definition.
 * @param definition The node definition.
 * @returns A node instance based on the specified definition.
 */
function nodeFactory(definition: AnyNodeDefinition): AnyNode {
    // Get the attributes for the node.
    const attributes = nodeAttributesFactory(definition);

    // Create the node instance based on the definition type.
    switch (definition.type) {
        case "root":
            return new Root(attributes, nodeFactory(definition.child));

        // ...

        default:
            throw new Error(`unexpected node type of '${definition.type}'`);
    }
}

/**
 * Creates an array of node attribute instances based on the specified node definition.
 * @param definition The node definition.
 * @returns An array of node attribute instances based on the specified node definition.
 */
function nodeAttributesFactory(definition: AnyNodeDefinition): Attribute[] {
    const attributes: Attribute[] = [];

    if (definition.while) {
        attributes.push(new While(definition.while.call, definition.while.args ?? []));
    }

    if (definition.until) {
        attributes.push(new Until(definition.until.call, definition.until.args ?? []));
    }

    if (definition.entry) {
        attributes.push(new Entry(definition.entry.call, definition.entry.args ?? []));
    }

    if (definition.step) {
        attributes.push(new Step(definition.step.call, definition.step.args ?? []));
    }

    if (definition.exit) {
        attributes.push(new Exit(definition.exit.call, definition.exit.args ?? []));
    }

    return attributes;
}

/**
 * Creates a mapping of root node identifers to root node definitions, mixing in globally registered subtree root node definitions.
 * @param definition The root node definitions.
 * @returns A mapping of root node identifers to root node definitions, including globally registered subtree root node definitions.
 */
function createRootNodeDefinitionMap(definition: RootNodeDefinition[]): RootNodeDefinitionMap {
    // Create a mapping of root node identifers to root node definitions.
    const rootNodeMap: RootNodeDefinitionMap = {};

    // Add in any registered subtree root node definitions.
    for (const [name, rootNodeDefinition] of Object.entries(Lookup.getSubtrees())) {
        // The name used when registering the subtree will be used as the root node identifier.
        rootNodeMap[name] = { ...rootNodeDefinition, id: name };
    }

    // Populate the map with the root node definitions that were included with the tree definition.
    // We do this after adding any registered subtrees as we want these to take presedence.
    for (const rootNodeDefinition of definition) {
        rootNodeMap[rootNodeDefinition.id ?? MAIN_ROOT_NODE_KEY] = rootNodeDefinition;
    }

    return rootNodeMap;
}

/**
 * Applies a guard path to every leaf of the tree to evaluate as part of each update.
 * @param root The main root tree node.
 */
function applyLeafNodeGuardPaths(root: Root) {
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
    findLeafNodes([], root);

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
