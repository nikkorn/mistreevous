
import { AnyNodeDefinition, RootNodeDefinition } from "./BehaviourTreeDefinition";
import { validateJSONDefinition } from "./BehaviourTreeDefinitionValidator";
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

/**
 * A type representing any node instance in a behaviour tree.
 */
type AnyNode = Root | Action | Condition | Wait | Sequence | Selector | Lotto | Parallel | Repeat | Retry | Flip | Succeed | Fail;

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

    // Now that we have all of our root node definitons (those part of the tree definition and those globally registered) we should validate
    // the definition. This will also double-check that we dont have any circular depdendencies in our branch -> root node references.
    try {
        const { succeeded, errorMessage } = validateJSONDefinition(Object.values(rootNodeDefinitionMap));

        // Did our validation fail without error?
        if (!succeeded) {
            throw new Error(errorMessage);
        }
    } catch (exception) {
        throw new Error(`root node validation failed: '${(exception as Error).message}'`);
    }

    // Create our populated tree of node instances, starting with our main root node.
    const rootNode = nodeFactory(rootNodeDefinitionMap[MAIN_ROOT_NODE_KEY]) as Root;

    // TODO Set a guard path on every leaf of the tree to evaluate as part of its update. (see BehaviourTree._applyLeafNodeGuardPaths)

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

function nodeAttributesFactory(definition: AnyNodeDefinition): Attribute[] {
   const attributes: Attribute[] = [];

   if (definition.while) {
        // TODO does this take args as any? We have AnyArgument type but is that just for mdsl parsing???
        // TODO Double check that validateJSONDefinition handles the args, surely they can be 'any' at this point?
        attributes.push(new While(definition.while.call, definition.while.args));
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
        rootNodeMap[name] = rootNodeDefinition;
    }

    // Populate the map with the root node definitions that were included with the tree definition.
    // We do this after adding any registered subtrees as we want these to take presedence.
    for (const rootNodeDefinition of definition) {
        rootNodeMap[rootNodeDefinition.id ?? MAIN_ROOT_NODE_KEY] = rootNodeDefinition;
    }

    return rootNodeMap;
}