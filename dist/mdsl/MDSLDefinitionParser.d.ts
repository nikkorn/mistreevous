import { RootDefinition } from "../BehaviourTreeDefinition";
/**
 * Parse the MDSL tree definition string into an equivalent JSON definition.
 * @param definition The tree definition string as MDSL.
 * @returns The root node JSON definitions.
 */
export declare function parseMDSLToJSON(definition: string): RootDefinition[];
