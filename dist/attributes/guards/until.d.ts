import Guard from "./guard";
import { Agent } from "../../agent";
import { AnyArgument } from "../../rootAstNodesBuilder";
/**
 * An UNTIL guard which is satisfied as long as the given condition remains false.
 */
export default class Until extends Guard {
    private condition;
    /**
     * @param condition The name of the condition function that determines whether the guard is satisfied.
     * @param args The array of decorator argument definitions.
     */
    constructor(condition: string, args: AnyArgument[]);
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
        arguments: AnyArgument[];
    };
    /**
     * Gets whether the guard is satisfied.
     * @param agent The agent.
     * @returns Whether the guard is satisfied.
     */
    isSatisfied: (agent: Agent) => boolean;
}
