import { RootNodeDefinition } from "./BehaviourTreeDefinition";
import Root from "./nodes/decorator/Root";
import { BehaviourTreeOptions } from "./BehaviourTreeOptions";
/**
 * Build and populate the root nodes based on the provided definition, assuming that the definition has been validated.
 * @param definition The root node definitions.
 * @param options The behaviour tree options.
 * @returns The built and populated root node definitions.
 */
export default function buildRootNode(definition: RootNodeDefinition[], options: BehaviourTreeOptions): Root;
