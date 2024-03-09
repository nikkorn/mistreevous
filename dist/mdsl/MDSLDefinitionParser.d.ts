import { RootNodeDefinition } from "../BehaviourTreeDefinition";
/**
 * Convert the MDSL tree definition string into an equivalent JSON definition.
 * @param definition The tree definition string as MDSL.
 * @returns The root node JSON definitions.
 */
export declare function convertMDSLToJSON(definition: string): RootNodeDefinition[];
