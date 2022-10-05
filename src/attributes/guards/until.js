import Guard from "./guard";
import Lookup from "../../lookup";

/**
 * An UNTIL guard which is satisfied as long as the given condition remains false.
 * @param condition The name of the condition function that determines whether the guard is satisfied.
 * @param args The array of decorator argument definitions.
 */
export default function Until(condition, args) {
    Guard.call(this, "until", args);

    /**
     * Gets whether the decorator is a guard.
     */
    this.isGuard = () => true;

    /**
     * Gets the condition of the guard.
     */
    this.getCondition = () => condition;

    /**
     * Gets the decorator details.
     */
    this.getDetails = () => {
        return {
            type: this.getType(),
            isGuard: this.isGuard(),
            condition: this.getCondition(),
            arguments: this.getArguments()
        };
    };

    /**
     * Gets whether the guard is satisfied.
     * @param agent The agent.
     * @returns Whether the guard is satisfied.
     */
    this.isSatisfied = (agent) => {
        // Attempt to get the invoker for the condition function.
        const conditionFuncInvoker = Lookup.getFuncInvoker(agent, condition);

        // The condition function should be defined.
        if (conditionFuncInvoker === null) {
            throw new Error(
                `cannot evaluate node guard as the condition '${condition}' function is not defined on the agent and has not been registered`
            );
        }

        // Call the condition function to determine whether this guard is satisfied.
        return !!!conditionFuncInvoker(args);
    };
}

Until.prototype = Object.create(Guard.prototype);
