import { RootNodeDefinition } from "./BehaviourTreeDefinition";
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
    /**
     * The definition as json if the validation was successful, or undefined if validation did not succeed.
     */
    json?: RootNodeDefinition[];
};
/**
 * Validates the specified behaviour tree definition in the form of JSON or MDSL, not taking any globally registered subtrees into consideration.
 * @param definition The behaviour tree definition in the form of JSON or MDSL.
 * @returns An object representing the result of validating the given tree definition.
 */
export declare function validateDefinition(definition: any): DefinitionValidationResult;
/**
 * Validates the specified behaviour tree definition in the form of JSON.
 * @param definition The behaviour tree definition in the form of JSON.
 * @returns An object representing the result of validating the given tree definition.
 */
export declare function validateJSONDefinition(definition: RootNodeDefinition | RootNodeDefinition[]): DefinitionValidationResult;
/**
 * Validates the branch -> subtree links across all provided root node definitions.
 * This will not consider branch nodes that reference any globally registered subtrees unless includesGlobalSubtrees
 * is set to true, in which case we will also verify that there are no broken branch -> subtree links.
 * @param rootNodeDefinitions The array of root node definitions.
 * @param includesGlobalSubtrees A flag defining whether the array includes all global subtree root node definitions.
 */
export declare function validateBranchSubtreeLinks(rootNodeDefinitions: RootNodeDefinition[], includesGlobalSubtrees: boolean): void;
