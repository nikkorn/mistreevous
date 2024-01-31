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
};
/**
 * Validates the specified behaviour tree definition in the form of JSON or MDSL.
 * @param definition The behaviour tree definition in the form of JSON or MDSL.
 * @returns An object representing the result of validating the given tree definition.
 */
export declare function validateDefinition(definition: any): DefinitionValidationResult;
/**
 * Validates the specified behaviour tree definition in the form of MDSL.
 * @param definition The behaviour tree definition in the form of MDSL.
 * @returns An object representing the result of validating the given tree definition.
 */
export declare function validateMDSLDefinition(definition: string): DefinitionValidationResult;
/**
 * Validates the specified behaviour tree definition in the form of JSON.
 * @param definition The behaviour tree definition in the form of JSON.
 * @returns An object representing the result of validating the given tree definition.
 */
export declare function validateJSONDefinition(definition: RootNodeDefinition | RootNodeDefinition[]): DefinitionValidationResult;
