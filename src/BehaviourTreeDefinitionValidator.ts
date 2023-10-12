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

export function validateDefinition(definition: any): DefinitionValidationResult {
    // The definition must be defined.
    if (definition === null || typeof definition === "undefined") {
        throw new Error(`definition is null or undefined`);
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
            return {
                succeeded: false,
                errorMessage: `invalid mdsl: ${definition}`
            };
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
                return {
                    succeeded: false,
                    errorMessage: "invalid elements in definition array, each must be an root node definition object"
                };
            }

            // Our definition is already an array of root node definition objects.
            rootNodeDefinitions = definition;
        } else {
            // Our definition is an object, but we want an array of root node definitions.
            rootNodeDefinitions = [definition];
        }
    } else {
        throw new Error(`unexpected definition type of '${typeof definition}'`);
    }
    
    // The definition could be an object (our single root node) or an array (multiple root nodes with one that has no id and the rest must have an id)
    // Check that all elements in 'definition' ONE has no id AND there are no duplicate ids
    // Get a list of all root nodes, we will need this to validate that all branch nodes refer to real root nodes.
    // Check for circular dependencies in root node references via branches.

    // Iterate over our array of root nodes and call validateNode for each, passing an initial depth of 0, wrapped in a try catch to handle validation failures.
    
    // Our definition was valid!
    return { succeeded: true };
}

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