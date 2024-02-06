import Guard from "./Guard";
import Lookup from "../../Lookup";
import { Agent } from "../../Agent";

/**
 * An UNTIL guard which is satisfied as long as the given condition remains false.
 */
export default class Until extends Guard {
    /**
     * @param condition The name of the condition function that determines whether the guard is satisfied.
     * @param args The array of decorator argument definitions.
     */
    constructor(condition: string, args: any[]) {
        super("until", args, condition);
    }

    /**
     * Gets whether the guard is satisfied.
     * @param agent The agent.
     * @returns Whether the guard is satisfied.
     */
    isSatisfied = (agent: Agent) => {
        // Attempt to get the invoker for the condition function.
        const conditionFuncInvoker = Lookup.getFuncInvoker(agent, this.getCondition());

        // The condition function should be defined.
        if (conditionFuncInvoker === null) {
            throw new Error(
                `cannot evaluate node guard as the condition '${this.getCondition()}' function is not defined on the agent and has not been registered`
            );
        }

        // Call the condition function to determine whether this guard is satisfied.
        return !!!conditionFuncInvoker(this.args);
    };
}
