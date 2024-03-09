import { RootNodeDefinition } from "./BehaviourTreeDefinition";
import Root from "./nodes/decorator/Root";
/**
 * Build and populate the root nodes based on the provided definition, assuming that the definition has been validated.
 * @param definition The root node definitions.
 * @returns The built and populated root node definitions.
 */
export default function buildRootNode(definition: RootNodeDefinition[]): Root;
