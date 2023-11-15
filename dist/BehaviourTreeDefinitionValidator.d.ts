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
