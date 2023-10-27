import { RootNodeDefinition } from "./BehaviourTreeDefinition";
import { flattenDefinition, isBranchNode } from "./BehaviourTreeDefinitionUtilities";
import { parseMDSLToJSON } from "./mdsl/MDSLDefinitionParser";

/**
 * An object representing the result of validating a tree definition.
 */
export type DefinitionValidationResult = {
    /** 
     * A flag defining whether validation succeeded.
     */
    succeeded: boolean;
    /** 
     * A string containing the error message if validation did not succeed.
     */
    errorMessage?: string;
};

/**
 * Validates the specified behaviour tree definition in the form of JSON or MDSL.
 * @param definition The behaviour tree definition in the form of JSON or MDSL.
 * @returns An object representing the result of validating the given tree definition.
 */
export function validateDefinition(definition: any): DefinitionValidationResult {
    // A helper function to create a failure validation result with the given error message.
    const createFailureResult = (errorMessage: string) => ({ succeeded: false, errorMessage });

    // The definition must be defined.
    if (definition === null || typeof definition === "undefined") {
        return createFailureResult("definition is null or undefined");
    }
    
    let rootNodeDefinitions: any[];

    // We are expecting a definition in one of three different forms:
    // - A string which we will assume is mdsl and we will parse this to JSON before validation.
    // - An array which we will assume is an array of root node definitions with at least one being the primary root node (no 'id' property)
    // - An object which we will assume is the primary root node and should not have an 'id' property. 
    if (typeof definition === "string") {
        try {
            // The definition is a string which we can assume is mdsl, so attempt to parse it to a JSON definition in the form of an array of root node definitions.
            rootNodeDefinitions = parseMDSLToJSON(definition);
        } catch (error) {
            // We failed to parse the JSON from the mdsl, this is likely to be the result of it not being a valid mdsl string.
            return createFailureResult(`invalid mdsl: ${definition}`);
        }
    } else if (typeof definition === "object") {
        // The definition will either be an array (of root node definitions) or an object (the single primary root node definition).
        // If our definition is an array, we should verify that each of the elements within it are objects (potential root node definitions).
        if (Array.isArray(definition)) {
            // Find any invalid node definitions in our definition array, not full validation just a check that each is a valid object.
            const invalidDefinitionElements = definition.filter((element) => {
                // Each element isn't valid unless it is an object that isn't also an array and isn't null.
                return typeof element !== "object" || Array.isArray(element) || element === null;
            });

            // If we have any invalid node definitions then validation has failed.
            if (invalidDefinitionElements.length) {
                return createFailureResult("invalid elements in definition array, each must be an root node definition object");
            }

            // Our definition is already an array of root node definition objects.
            rootNodeDefinitions = definition;
        } else {
            // Our definition is an object, but we want an array of root node definitions.
            rootNodeDefinitions = [definition];
        }
    } else {
        return createFailureResult(`unexpected definition type of '${typeof definition}'`);
    }

    // TODO Iterate over our array of root nodes and call validateNode for each, passing an initial depth of 0, wrapped in a try catch to handle validation failures.

    // Unpack all of the root node definitions into arrays of main ('id' defined) and sub ('id' not defined) root node definitions.
    const mainRootNodeDefinitions = rootNodeDefinitions.filter(({ id }) => typeof id === "undefined");
    const subRootNodeDefinitions = rootNodeDefinitions.filter(({ id }) => typeof id === "string" && id.length > 0);

    // We should ALWAYS have exactly one root node definition without an 'id' property defined, which is out main root node definition. 
    if (mainRootNodeDefinitions.length !== 1) {
        return createFailureResult("expected single root node without 'id' property defined to act as main root");
    }

    // We should never have duplicate 'id' properties across our sub root node definitions. 
    const subRootNodeIdenitifers: string[] = [];
    for (const { id } of subRootNodeDefinitions) {
        // Have we already come across this 'id' property value?
        if (subRootNodeIdenitifers.includes(id)) {
            return createFailureResult(`multiple root nodes found with duplicate 'id' property value of '${id}'`);
        }

        subRootNodeIdenitifers.push(id);
    }

    // TODO Check for any root node circular depedencies. This will not include any globally registered subtrees.


    // TODO How do we handle globally defined root nodes?
    
    // Our definition was valid!
    return { succeeded: true };
}

function _checkForRootNodeCircularDependencies(rootNodeDefinitions: RootNodeDefinition[]): void {
    // Create a mapping of root node id's to other root nodes that they reference via branch nodes.
    const rootNodeMappings: { id: string | undefined, refs: string[] }[] = rootNodeDefinitions
        .map((rootNodeDefinition) => ({
            id: rootNodeDefinition.id,
            refs: flattenDefinition(rootNodeDefinition).filter(isBranchNode).map(({ ref }) => ref)
        }));

    // TODO Create a recursive function to walk through the mappings, keeing track of which root nodes we have visited.
}

/**
 * Validate an object that we expect to be a node definition.
 * @param definition An object that we expect to be a node definition.
 * @param depth The depth of the node in the definition tree.
 */
function validateNode(definition: any, depth: number): void {
    // Every node must be valid object and have a non-empty 'type' string property.
    if (typeof definition !== "object" || typeof definition.type !== "string" || definition.type.length === 0) {
        throw new Error(`node definition is not an object or 'type' property is not a non-empty string at depth '${depth}'`);
    }

    // How we validate this node will depend on its type.
    switch (definition.type) {
        case "root":
            validateRootNode(definition, depth);
            break;

        // TODO Add cases for all other nodes.

        default:
            throw new Error(`unexpected node type of '${definition.type}' at depth '${depth}'`);
    }
}

/**
 * Validate any attributes for a given node definition.
 * @param definition The node definition.
 * @param depth The depth of the node in the behaviour tree definition.
 */
function validateNodeAttributes(definition: any, depth: number): void {
    // Validate each of the attribute types for this node.
    ["while", "until", "entry", "exit", "step"].forEach((attributeName) => {
        // Attempt to grab the definition for the current attribute from the node definition.
        const attributeDefinition = definition[attributeName];

        // All node attributes are optional, so there is nothing to do if the current attribute is not defined.
        if (typeof attributeDefinition === "undefined") {
            return;
        }

        // The attribute definition must be an object.
        if (typeof attributeDefinition !== "object") {
            throw new Error(`expected attribute '${attributeName}' to be an object for '${definition.type}' node at depth '${depth}'`);
        }

        // The 'call' property must be defined for any attribute definition.
        if (typeof attributeDefinition.call !== "string" || attributeDefinition.call.length === 0) {
            throw new Error(`expected 'call' property for attribute '${attributeName}' to be a non-empty string for '${definition.type}' node at depth '${depth}'`);
        }

        // If any node attribute arguments have been defined then they must have been defined in an array.
        if (typeof attributeDefinition.args !== "undefined" && !Array.isArray(attributeDefinition.args)) {
            throw new Error(`expected 'args' property for attribute '${attributeName}' to be an array for '${definition.type}' node at depth '${depth}'`);
        }
    });
}

/**
 * Validate an object that we expect to be a root node definition.
 * @param definition An object that we expect to be a root node definition.
 * @param depth The depth of the node in the definition tree.
 */
function validateRootNode(definition: any, depth: number): void {
    // Check that the node type is correct.
    if (definition.type !== "root") {
        throw new Error("expected node type of 'root' for root node");
    }

    // A root node cannot be the child of another node.
    if (depth > 0) {
        throw new Error("a root node cannot be the child of another node");
    }

    // Check that, if the root node 'id' property is defined, it is a non-empty string.
    if (typeof definition.id !== "undefined" && (typeof definition.id !== "string" || definition.id.length === 0)) {
        throw new Error("expected non-empty string for 'id' property if defined for root node");
    }

    // A root node is a decorator node, so must have a child node defined.
    if (typeof definition.child === "undefined") {
        throw new Error("expected property 'child' to be defined for root node");
    }

    // Validate the node attributes.
    validateNodeAttributes(definition, depth);

    // Validate the child node of this decorator node.
    validateNode(definition.child, depth + 1);
}