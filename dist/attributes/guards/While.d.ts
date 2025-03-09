import Guard from "./Guard";
import { Agent } from "../../Agent";
import { NodeGuardDefinition } from "../../BehaviourTreeDefinition";
/**
 * A WHILE guard which is satisfied as long as the given condition remains true.
 */
export default class While extends Guard {
    /**
     * Creates a new instance of the While class.
     * @param definition The while node guard definition.
     */
    constructor(definition: NodeGuardDefinition);
    /**
     * Gets whether the guard is satisfied.
     * @param agent The agent.
     * @returns Whether the guard is satisfied.
     */
    isSatisfied: (agent: Agent) => boolean;
}
