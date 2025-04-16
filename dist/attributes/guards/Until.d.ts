import Guard from "./Guard";
import { Agent } from "../../Agent";
import { NodeGuardDefinition } from "../../BehaviourTreeDefinition";
/**
 * An UNTIL guard which is satisfied as long as the given condition remains false.
 */
export default class Until extends Guard {
    /**
     * Creates a new instance of the Until class.
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
