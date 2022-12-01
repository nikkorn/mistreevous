import Guard from "./guard";
import { Agent } from "../../agent";
/**
 * A WHILE guard which is satisfied as long as the given condition remains true.
 */
export default class While extends Guard {
    private condition;
    /**
     * @param condition The name of the condition function that determines whether the guard is satisfied.
     * @param args The array of decorator argument definitions.
     */
    constructor(condition: string, args: any[]);
    /**
     * Gets whether the decorator is a guard.
     */
    isGuard: () => boolean;
    /**
     * Gets the condition of the guard.
     */
    getCondition: () => string;
    /**
     * Gets the decorator details.
     */
    getDetails: () => {
        type: string;
        isGuard: boolean;
        condition: string;
        arguments: any[];
    };
    /**
     * Gets whether the guard is satisfied.
     * @param agent The agent.
     * @returns Whether the guard is satisfied.
     */
    isSatisfied: (agent: Agent) => boolean;
}
