import Guard from "./Guard";
import { Agent } from "../../Agent";
/**
 * A WHILE guard which is satisfied as long as the given condition remains true.
 */
export default class While extends Guard {
    /**
     * @param condition The name of the condition function that determines whether the guard is satisfied.
     * @param args The array of decorator argument definitions.
     */
    constructor(condition: string, args: any[]);
    /**
     * Gets whether the guard is satisfied.
     * @param agent The agent.
     * @returns Whether the guard is satisfied.
     */
    isSatisfied: (agent: Agent) => boolean;
}
