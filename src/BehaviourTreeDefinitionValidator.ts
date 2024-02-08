import { RootNodeDefinition } from "./BehaviourTreeDefinition";
import { flattenDefinition, isBranchNode, isInteger } from "./BehaviourTreeDefinitionUtilities";
import { convertMDSLToJSON } from "./mdsl/MDSLDefinitionParser";

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
 * Validates the specified behaviour tree definition in the form of JSON or MDSL, not taking any globally registered subtrees into consideration.
 * @param definition The behaviour tree definition in the form of JSON or MDSL.
 * @returns An object representing the result of validating the given tree definition.
 */
export function validateDefinition(definition: any): DefinitionValidationResult {
    // The definition must be defined.
    if (definition === null || typeof definition === "undefined") {
        return createValidationFailureResult("definition is null or undefined");
    }

    // We are expecting a definition in one of three different forms:
    // - A string which we will assume is MDSL and we will parse this to JSON before validation.
    // - An array which we will assume is an array of root node definitions with at least one being the primary root node (no 'id' property)
    // - An object which we will assume is the primary root node and should not have an 'id' property.
    if (typeof definition === "string") {
        // The definition is a string which we can assume is MDSL, so attempt to validate it.
        return validateMDSLDefinition(definition);
    } else if (typeof definition === "object") {
        // The definition will either be an array (of root node definitions) or an object (the single primary root node definition).
        return validateJSONDefinition(definition);
    } else {
        return createValidationFailureResult(`unexpected definition type of '${typeof definition}'`);
    }
}

/**
 * Validates the specified behaviour tree definition in the form of MDSL.
 * @param definition The behaviour tree definition in the form of MDSL.
 * @returns An object representing the result of validating the given tree definition.
 */
export function validateMDSLDefinition(definition: string): DefinitionValidationResult {
    let rootNodeDefinitions;

    // The first thing the we need to do is to attempt to convert our MDSL into JSON.
    try {
        // The definition is a string which we can assume is MDSL, so attempt to parse it to a JSON definition in the form of an array of root node definitions.
        rootNodeDefinitions = convertMDSLToJSON(definition);
    } catch (exception) {
        // We failed to parse the JSON from the MDSL, this is likely to be the result of it not being a valid MDSL string.
        return createValidationFailureResult((exception as Error).message);
    }

    // Unpack all of the root node definitions into arrays of main ('id' defined) and sub ('id' not defined) root node definitions.
    const mainRootNodeDefinitions = rootNodeDefinitions.filter(({ id }) => typeof id === "undefined");
    const subRootNodeDefinitions = rootNodeDefinitions.filter(({ id }) => typeof id === "string" && id.length > 0);

    // We should ALWAYS have exactly one root node definition without an 'id' property defined, which is out main root node definition.
    if (mainRootNodeDefinitions.length !== 1) {
        return createValidationFailureResult(
            "expected single unnamed root node at base of definition to act as main root"
        );
    }

    // We should never have duplicate 'id' properties across our sub root node definitions.
    const subRootNodeIdenitifers: string[] = [];
    for (const { id } of subRootNodeDefinitions) {
        // Have we already come across this 'id' property value?
        if (subRootNodeIdenitifers.includes(id!)) {
            return createValidationFailureResult(`multiple root nodes found with duplicate name '${id}'`);
        }

        subRootNodeIdenitifers.push(id!);
    }

    try {
        // Validate our branch -> subtree links and check for any circular dependencies, we don't care about checking for broken subtree links here.
        validateBranchSubtreeLinks(rootNodeDefinitions, false);
    } catch (exception) {
        return createValidationFailureResult((exception as Error).message);
    }

    // Our definition was valid!
    return { succeeded: true };
}

/**
 * Validates the specified behaviour tree definition in the form of JSON.
 * @param definition The behaviour tree definition in the form of JSON.
 * @returns An object representing the result of validating the given tree definition.
 */
export function validateJSONDefinition(
    definition: RootNodeDefinition | RootNodeDefinition[]
): DefinitionValidationResult {
    // The definition will either be an array (of root node definitions) or an object (the single primary root node definition).
    const rootNodeDefinitions = Array.isArray(definition) ? definition : [definition];

    // Iterate over our array of root nodes and call validateNode for each, passing an initial depth of 0, wrapped in a try catch to handle validation failures.
    try {
        rootNodeDefinitions.forEach((rootNodeDefinition) => validateNode(rootNodeDefinition, 0));
    } catch (error) {
        // Handle cases where we have caught a thrown Error and return a failure result with the error message.
        if (error instanceof Error) {
            return createValidationFailureResult(error.message);
        }

        // No idea what happened here!
        return createValidationFailureResult(`unexpected error: ${error}`);
    }

    // Unpack all of the root node definitions into arrays of main ('id' defined) and sub ('id' not defined) root node definitions.
    const mainRootNodeDefinitions = rootNodeDefinitions.filter(({ id }) => typeof id === "undefined");
    const subRootNodeDefinitions = rootNodeDefinitions.filter(({ id }) => typeof id === "string" && id.length > 0);

    // We should ALWAYS have exactly one root node definition without an 'id' property defined, which is out main root node definition.
    if (mainRootNodeDefinitions.length !== 1) {
        return createValidationFailureResult(
            "expected single root node without 'id' property defined to act as main root"
        );
    }

    // We should never have duplicate 'id' properties across our sub root node definitions.
    const subRootNodeIdenitifers: string[] = [];
    for (const { id } of subRootNodeDefinitions) {
        // Have we already come across this 'id' property value?
        if (subRootNodeIdenitifers.includes(id!)) {
            return createValidationFailureResult(
                `multiple root nodes found with duplicate 'id' property value of '${id}'`
            );
        }

        subRootNodeIdenitifers.push(id!);
    }

    try {
        // Validate our branch -> subtree links and check for any circular dependencies, we don't care about checking for broken subtree links here.
        validateBranchSubtreeLinks(rootNodeDefinitions, false);
    } catch (exception) {
        return createValidationFailureResult((exception as Error).message);
    }

    // Our definition was valid!
    return { succeeded: true };
}

/**
 * Validates the branch -> subtree links across all provided root node definitions.
 * This will not consider branch nodes that reference any globally registered subtrees unless includesGlobalSubtrees
 * is set to true, in which case we will also verify that there are no broken branch -> subtree links.
 * @param rootNodeDefinitions The array of root node definitions.
 * @param includesGlobalSubtrees A flag defining whether the array includes all global subtree root node definitions.
 */
export function validateBranchSubtreeLinks(rootNodeDefinitions: RootNodeDefinition[], includesGlobalSubtrees: boolean) {
    // Create a mapping of root node identifiers to other root nodes that they reference via branch nodes.
    // Below is an example of a mapping that includes a circular dependency (root => a => b => c => a)
    // [{ refs: ["a", "b"] }, { id: "a", refs: ["b"] }, { id: "b", refs: ["c"] }, { id: "c", refs: ["a"] }]
    const rootNodeMappings: { id: string | undefined; refs: string[] }[] = rootNodeDefinitions.map(
        (rootNodeDefinition) => ({
            id: rootNodeDefinition.id,
            refs: flattenDefinition(rootNodeDefinition)
                .filter(isBranchNode)
                .map(({ ref }) => ref)
        })
    );

    // A recursive function to walk through the mappings, keeping track of which root nodes we have visited in the form of a path of root node identifiers.
    const followRefs = (mapping: { id: string | undefined; refs: string[] }, path: (string | undefined)[] = []) => {
        // Have we found a circular dependency?
        if (path.includes(mapping.id)) {
            // We found a circular dependency! Get the bad path of root node identifiers.
            const badPath = [...path, mapping.id];

            // Create the formatted path value. [undefined, "a", "b", "c", "a"] would be formatted as "a -> b -> c -> a".
            const badPathFormatted = badPath.filter((element) => !!element).join(" => ");

            // No need to continue, we found a circular dependency.
            throw new Error(`circular dependency found in branch node references: ${badPathFormatted}`);
        }

        for (const ref of mapping.refs) {
            // Find the mapping for the root node with an identifer matching the current ref.
            const subMapping = rootNodeMappings.find(({ id }) => id === ref);

            // We may not have a mapping for this ref, which is normal when we aren't considering all globally registered subtrees.
            if (subMapping) {
                followRefs(subMapping, [...path, mapping.id]);
            } else if (includesGlobalSubtrees) {
                // We found a reference to a root node that doesn't exist, which is a problem seeing as the root node definitons includes all globally registered subtrees.
                throw new Error(
                    mapping.id
                        ? `subtree '${mapping.id}' has branch node that references root node '${ref}' which has not been defined`
                        : `primary tree has branch node that references root node '${ref}' which has not been defined`
                );
            }
        }
    };

    // Start looking for circular dependencies and broken references from the primary root node definition.
    followRefs(rootNodeMappings.find((mapping) => typeof mapping.id === "undefined")!);
}

/**
 * Validate an object that we expect to be a node definition.
 * @param definition An object that we expect to be a node definition.
 * @param depth The depth of the node in the definition tree.
 */
function validateNode(definition: any, depth: number): void {
    // Every node must be valid object and have a non-empty 'type' string property.
    if (typeof definition !== "object" || typeof definition.type !== "string" || definition.type.length === 0) {
        throw new Error(
            `node definition is not an object or 'type' property is not a non-empty string at depth '${depth}'`
        );
    }

    // How we validate this node definition will depend on its type.
    switch (definition.type) {
        case "action":
            validateActionNode(definition, depth);
            break;

        case "condition":
            validateConditionNode(definition, depth);
            break;

        case "wait":
            validateWaitNode(definition, depth);
            break;

        case "branch":
            validateBranchNode(definition, depth);
            break;

        case "root":
            validateRootNode(definition, depth);
            break;

        case "success":
            validateSuccessNode(definition, depth);
            break;

        case "fail":
            validateFailNode(definition, depth);
            break;

        case "flip":
            validateFlipNode(definition, depth);
            break;

        case "repeat":
            validateRepeatNode(definition, depth);
            break;

        case "retry":
            validateRetryNode(definition, depth);
            break;

        case "sequence":
            validateSequenceNode(definition, depth);
            break;

        case "selector":
            validateSelectorNode(definition, depth);
            break;

        case "parallel":
            validateParallelNode(definition, depth);
            break;

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
            throw new Error(
                `expected attribute '${attributeName}' to be an object for '${definition.type}' node at depth '${depth}'`
            );
        }

        // The 'call' property must be defined for any attribute definition.
        if (typeof attributeDefinition.call !== "string" || attributeDefinition.call.length === 0) {
            throw new Error(
                `expected 'call' property for attribute '${attributeName}' to be a non-empty string for '${definition.type}' node at depth '${depth}'`
            );
        }

        // If any node attribute arguments have been defined then they must have been defined in an array.
        if (typeof attributeDefinition.args !== "undefined" && !Array.isArray(attributeDefinition.args)) {
            throw new Error(
                `expected 'args' property for attribute '${attributeName}' to be an array for '${definition.type}' node at depth '${depth}'`
            );
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

/**
 * Validate an object that we expect to be a success node definition.
 * @param definition An object that we expect to be a success node definition.
 * @param depth The depth of the node in the definition tree.
 */
function validateSuccessNode(definition: any, depth: number): void {
    // Check that the node type is correct.
    if (definition.type !== "success") {
        throw new Error(`expected node type of 'success' for success node at depth '${depth}'`);
    }

    // A success node is a decorator node, so must have a child node defined.
    if (typeof definition.child === "undefined") {
        throw new Error(`expected property 'child' to be defined for success node at depth '${depth}'`);
    }

    // Validate the node attributes.
    validateNodeAttributes(definition, depth);

    // Validate the child node of this decorator node.
    validateNode(definition.child, depth + 1);
}

/**
 * Validate an object that we expect to be a fail node definition.
 * @param definition An object that we expect to be a fail node definition.
 * @param depth The depth of the node in the definition tree.
 */
function validateFailNode(definition: any, depth: number): void {
    // Check that the node type is correct.
    if (definition.type !== "fail") {
        throw new Error(`expected node type of 'fail' for fail node at depth '${depth}'`);
    }

    // A fail node is a decorator node, so must have a child node defined.
    if (typeof definition.child === "undefined") {
        throw new Error(`expected property 'child' to be defined for fail node at depth '${depth}'`);
    }

    // Validate the node attributes.
    validateNodeAttributes(definition, depth);

    // Validate the child node of this decorator node.
    validateNode(definition.child, depth + 1);
}

/**
 * Validate an object that we expect to be a flip node definition.
 * @param definition An object that we expect to be a flip node definition.
 * @param depth The depth of the node in the definition tree.
 */
function validateFlipNode(definition: any, depth: number): void {
    // Check that the node type is correct.
    if (definition.type !== "flip") {
        throw new Error(`expected node type of 'flip' for flip node at depth '${depth}'`);
    }

    // A flip node is a decorator node, so must have a child node defined.
    if (typeof definition.child === "undefined") {
        throw new Error(`expected property 'child' to be defined for flip node at depth '${depth}'`);
    }

    // Validate the node attributes.
    validateNodeAttributes(definition, depth);

    // Validate the child node of this decorator node.
    validateNode(definition.child, depth + 1);
}

/**
 * Validate an object that we expect to be a repeat node definition.
 * @param definition An object that we expect to be a repeat node definition.
 * @param depth The depth of the node in the definition tree.
 */
function validateRepeatNode(definition: any, depth: number): void {
    // Check that the node type is correct.
    if (definition.type !== "repeat") {
        throw new Error(`expected node type of 'repeat' for repeat node at depth '${depth}'`);
    }

    // A repeat node is a decorator node, so must have a child node defined.
    if (typeof definition.child === "undefined") {
        throw new Error(`expected property 'child' to be defined for repeat node at depth '${depth}'`);
    }

    // Check whether an 'iterations' property has been defined, it may not have been if this node is to repeat indefinitely.
    if (typeof definition.iterations !== "undefined") {
        if (Array.isArray(definition.iterations)) {
            // Check whether any elements of the array are not integer values.
            const containsNonInteger = !!definition.iterations.find((value: unknown) => !isInteger(value));

            // If the 'iterations' property is an array then it MUST contain two integer values.
            if (definition.iterations.length !== 2 || containsNonInteger) {
                throw new Error(
                    `expected array containing two integer values for 'iterations' property if defined for repeat node at depth '${depth}'`
                );
            }

            // A repeat node must have a positive min and max iterations count if they are defined.
            if (definition.iterations[0] < 0 || definition.iterations[1] < 0) {
                throw new Error(
                    `expected positive minimum and maximum iterations count for 'iterations' property if defined for repeat node at depth '${depth}'`
                );
            }

            // A repeat node must not have a minimum iterations count that exceeds the maximum iterations count.
            if (definition.iterations[0] > definition.iterations[1]) {
                throw new Error(
                    `expected minimum iterations count that does not exceed the maximum iterations count for 'iterations' property if defined for repeat node at depth '${depth}'`
                );
            }
        } else if (isInteger(definition.iterations)) {
            // A repeat node must have a positive number of iterations if defined.
            if (definition.iterations < 0) {
                throw new Error(
                    `expected positive iterations count for 'iterations' property if defined for repeat node at depth '${depth}'`
                );
            }
        } else {
            throw new Error(
                `expected integer value or array containing two integer values for 'iterations' property if defined for repeat node at depth '${depth}'`
            );
        }
    }

    // Validate the node attributes.
    validateNodeAttributes(definition, depth);

    // Validate the child node of this decorator node.
    validateNode(definition.child, depth + 1);
}

/**
 * Validate an object that we expect to be a retry node definition.
 * @param definition An object that we expect to be a retry node definition.
 * @param depth The depth of the node in the definition tree.
 */
function validateRetryNode(definition: any, depth: number): void {
    // Check that the node type is correct.
    if (definition.type !== "retry") {
        throw new Error(`expected node type of 'retry' for retry node at depth '${depth}'`);
    }

    // A retry node is a decorator node, so must have a child node defined.
    if (typeof definition.child === "undefined") {
        throw new Error(`expected property 'child' to be defined for retry node at depth '${depth}'`);
    }

    // Check whether an 'attempts' property has been defined, it may not have been if this node is to retry indefinitely.
    if (typeof definition.attempts !== "undefined") {
        if (Array.isArray(definition.attempts)) {
            // Check whether any elements of the array are not integer values.
            const containsNonInteger = !!definition.attempts.find((value: unknown) => !isInteger(value));

            // If the 'attempts' property is an array then it MUST contain two integer values.
            if (definition.attempts.length !== 2 || containsNonInteger) {
                throw new Error(
                    `expected array containing two integer values for 'attempts' property if defined for retry node at depth '${depth}'`
                );
            }

            // A retry node must have a positive min and max attempts count if they are defined.
            if (definition.attempts[0] < 0 || definition.attempts[1] < 0) {
                throw new Error(
                    `expected positive minimum and maximum attempts count for 'attempts' property if defined for retry node at depth '${depth}'`
                );
            }

            // A retry node must not have a minimum attempts count that exceeds the maximum attempts count.
            if (definition.attempts[0] > definition.attempts[1]) {
                throw new Error(
                    `expected minimum attempts count that does not exceed the maximum attempts count for 'attempts' property if defined for retry node at depth '${depth}'`
                );
            }
        } else if (isInteger(definition.attempts)) {
            // A retry node must have a positive number of attempts if defined.
            if (definition.attempts < 0) {
                throw new Error(
                    `expected positive attempts count for 'attempts' property if defined for retry node at depth '${depth}'`
                );
            }
        } else {
            throw new Error(
                `expected integer value or array containing two integer values for 'attempts' property if defined for retry node at depth '${depth}'`
            );
        }
    }

    // Validate the node attributes.
    validateNodeAttributes(definition, depth);

    // Validate the child node of this decorator node.
    validateNode(definition.child, depth + 1);
}

/**
 * Validate an object that we expect to be a branch node definition.
 * @param definition An object that we expect to be a branch node definition.
 * @param depth The depth of the node in the definition tree.
 */
function validateBranchNode(definition: any, depth: number): void {
    // Check that the node type is correct.
    if (definition.type !== "branch") {
        throw new Error(`expected node type of 'branch' for branch node at depth '${depth}'`);
    }

    // Check that the branch node 'ref' property is defined and is a non-empty string.
    if (typeof definition.ref !== "string" || definition.ref.length === 0) {
        throw new Error(`expected non-empty string for 'ref' property for branch node at depth '${depth}'`);
    }

    // It is invalid to define guard attributes for a branch node as they should be defined on the referenced root node.
    ["while", "until"].forEach((attributeName) => {
        if (typeof definition[attributeName] !== "undefined") {
            throw new Error(
                `guards should not be defined for branch nodes but guard '${attributeName}' was defined for branch node at depth '${depth}'`
            );
        }
    });

    // It is invalid to define callback attributes for a branch node as they should be defined on the referenced root node.
    ["entry", "exit", "step"].forEach((attributeName) => {
        if (typeof definition[attributeName] !== "undefined") {
            throw new Error(
                `callbacks should not be defined for branch nodes but callback '${attributeName}' was defined for branch node at depth '${depth}'`
            );
        }
    });
}

/**
 * Validate an object that we expect to be a action node definition.
 * @param definition An object that we expect to be a action node definition.
 * @param depth The depth of the node in the definition tree.
 */
function validateActionNode(definition: any, depth: number): void {
    // Check that the node type is correct.
    if (definition.type !== "action") {
        throw new Error(`expected node type of 'action' for action node at depth '${depth}'`);
    }

    // The 'call' property must be defined for a action node definition.
    if (typeof definition.call !== "string" || definition.call.length === 0) {
        throw new Error(`expected non-empty string for 'call' property of action node at depth '${depth}'`);
    }

    // If any action function arguments have been defined then they must have been defined in an array.
    if (typeof definition.args !== "undefined" && !Array.isArray(definition.args)) {
        throw new Error(`expected array for 'args' property if defined for action node at depth '${depth}'`);
    }

    // Validate the node attributes.
    validateNodeAttributes(definition, depth);
}

/**
 * Validate an object that we expect to be a condition node definition.
 * @param definition An object that we expect to be a condition node definition.
 * @param depth The depth of the node in the definition tree.
 */
function validateConditionNode(definition: any, depth: number): void {
    // Check that the node type is correct.
    if (definition.type !== "condition") {
        throw new Error(`expected node type of 'condition' for condition node at depth '${depth}'`);
    }

    // The 'call' property must be defined for a condition node definition.
    if (typeof definition.call !== "string" || definition.call.length === 0) {
        throw new Error(`expected non-empty string for 'call' property of condition node at depth '${depth}'`);
    }

    // If any condition function arguments have been defined then they must have been defined in an array.
    if (typeof definition.args !== "undefined" && !Array.isArray(definition.args)) {
        throw new Error(`expected array for 'args' property if defined for condition node at depth '${depth}'`);
    }

    // Validate the node attributes.
    validateNodeAttributes(definition, depth);
}

/**
 * Validate an object that we expect to be a wait node definition.
 * @param definition An object that we expect to be a wait node definition.
 * @param depth The depth of the node in the definition tree.
 */
function validateWaitNode(definition: any, depth: number): void {
    // Check that the node type is correct.
    if (definition.type !== "wait") {
        throw new Error(`expected node type of 'wait' for wait node at depth '${depth}'`);
    }

    // Check whether a 'duration' property has been defined, it may not have been if this node is to wait indefinitely.
    if (typeof definition.duration !== "undefined") {
        if (Array.isArray(definition.duration)) {
            // Check whether any elements of the array are not integer values.
            const containsNonInteger = !!definition.duration.find((value: unknown) => !isInteger(value));

            // If the 'duration' property is an array then it MUST contain two integer values.
            if (definition.duration.length !== 2 || containsNonInteger) {
                throw new Error(
                    `expected array containing two integer values for 'duration' property if defined for wait node at depth '${depth}'`
                );
            }

            // A wait node must have a positive min and max duration value if they are defined.
            if (definition.duration[0] < 0 || definition.duration[1] < 0) {
                throw new Error(
                    `expected positive minimum and maximum duration for 'duration' property if defined for wait node at depth '${depth}'`
                );
            }

            // A wait node must not have a minimum duration value that exceeds the maximum duration value.
            if (definition.duration[0] > definition.duration[1]) {
                throw new Error(
                    `expected minimum duration value that does not exceed the maximum duration value for 'duration' property if defined for wait node at depth '${depth}'`
                );
            }
        } else if (isInteger(definition.duration)) {
            // A wait node must have a positive duration value if defined.
            if (definition.duration < 0) {
                throw new Error(
                    `expected positive duration value for 'duration' property if defined for wait node at depth '${depth}'`
                );
            }
        } else {
            throw new Error(
                `expected integer value or array containing two integer values for 'duration' property if defined for wait node at depth '${depth}'`
            );
        }
    }

    // Validate the node attributes.
    validateNodeAttributes(definition, depth);
}

/**
 * Validate an object that we expect to be a sequence node definition.
 * @param definition An object that we expect to be a sequence node definition.
 * @param depth The depth of the node in the definition tree.
 */
function validateSequenceNode(definition: any, depth: number): void {
    // Check that the node type is correct.
    if (definition.type !== "sequence") {
        throw new Error(`expected node type of 'sequence' for sequence node at depth '${depth}'`);
    }

    // A sequence node is a composite node, so must have a children nodes array defined.
    if (!Array.isArray(definition.children) || definition.children.length === 0) {
        throw new Error(`expected non-empty 'children' array to be defined for sequence node at depth '${depth}'`);
    }

    // Validate the node attributes.
    validateNodeAttributes(definition, depth);

    // Validate the child nodes of this composite node.
    definition.children.forEach((child: any) => validateNode(child, depth + 1));
}

/**
 * Validate an object that we expect to be a selector node definition.
 * @param definition An object that we expect to be a selector node definition.
 * @param depth The depth of the node in the definition tree.
 */
function validateSelectorNode(definition: any, depth: number): void {
    // Check that the node type is correct.
    if (definition.type !== "selector") {
        throw new Error(`expected node type of 'selector' for selector node at depth '${depth}'`);
    }

    // A selector node is a composite node, so must have a children nodes array defined.
    if (!Array.isArray(definition.children) || definition.children.length === 0) {
        throw new Error(`expected non-empty 'children' array to be defined for selector node at depth '${depth}'`);
    }

    // Validate the node attributes.
    validateNodeAttributes(definition, depth);

    // Validate the child nodes of this composite node.
    definition.children.forEach((child: any) => validateNode(child, depth + 1));
}

/**
 * Validate an object that we expect to be a parallel node definition.
 * @param definition An object that we expect to be a parallel node definition.
 * @param depth The depth of the node in the definition tree.
 */
function validateParallelNode(definition: any, depth: number): void {
    // Check that the node type is correct.
    if (definition.type !== "parallel") {
        throw new Error(`expected node type of 'parallel' for parallel node at depth '${depth}'`);
    }

    // A parallel node is a composite node, so must have a children nodes array defined.
    if (!Array.isArray(definition.children) || definition.children.length === 0) {
        throw new Error(`expected non-empty 'children' array to be defined for parallel node at depth '${depth}'`);
    }

    // Validate the node attributes.
    validateNodeAttributes(definition, depth);

    // Validate the child nodes of this composite node.
    definition.children.forEach((child: any) => validateNode(child, depth + 1));
}

/**
 * A helper function to create a failure validation result with the given error message.
 * @param errorMessage The validation failure error message.
 * @returns A failure validation result with the given error message.
 */
function createValidationFailureResult(errorMessage: string): DefinitionValidationResult {
    return { succeeded: false, errorMessage };
}
