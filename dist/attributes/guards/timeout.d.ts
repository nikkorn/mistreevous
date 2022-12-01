import { Agent } from "../../agent";
import Guard from "./guard";
/**
 * A TIMEOUT guard which is satisfied as long as the given condition remains false.
 */
export default class Timeout extends Guard {
    private duration;
    /**
     * @param duration The duration of the timeout.
     * @param args The array of decorator argument definitions.
     */
    constructor(duration: number, args: any[]);
    /**
     * Gets whether the decorator is a guard.
     */
    isGuard: () => boolean;
    /**
     * Gets whether the guard is satisfied.
     * @param agent The agent.
     * @returns Whether the guard is satisfied.
     */
    isSatisfied: (agent: Agent) => never;
}
