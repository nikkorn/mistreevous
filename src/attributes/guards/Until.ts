import Guard from "./Guard";
import Lookup from "../../Lookup";
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
    constructor(definition: NodeGuardDefinition) {
        super("until", definition);
    }

    /**
     * Gets whether the guard is satisfied.
     * @param agent The agent.
     * @returns Whether the guard is satisfied.
     */
    isSatisfied = (agent: Agent) => {
        // Attempt to get the invoker for the condition function.
        const conditionFuncInvoker = Lookup.getFuncInvoker(agent, this.condition);

        // The condition function should be defined.
        if (conditionFuncInvoker === null) {
            throw new Error(
                `cannot evaluate node guard as the condition '${this.condition}' function is not defined on the agent and has not been registered`
            );
        }

        let conditionFunctionResult;

        try {
            // Call the guard condition function to determine the state of this node, the result of which should be a boolean.
            conditionFunctionResult = conditionFuncInvoker(this.args);
        } catch (error) {
            // An uncaught error was thrown.
            if (error instanceof Error) {
                throw new Error(`guard condition function '${this.condition}' threw: ${error.stack}`);
            } else {
                throw new Error(`guard condition function '${this.condition}' threw: ${error}`);
            }
        }

        // The result of calling the guard condition function must be a boolean value.
        if (typeof conditionFunctionResult !== "boolean") {
            throw new Error(
                `expected guard condition function '${this.condition}' to return a boolean but returned '${conditionFunctionResult}'`
            );
        }

        // Return whether this guard is satisfied.
        return !conditionFunctionResult;
    };
}
