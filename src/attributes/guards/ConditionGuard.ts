import Guard from "./Guard";
import Lookup from "../../Lookup";
import { Agent } from "../../Agent";
import { AttributeDetails } from "../Attribute";

/**
 * Details of a node condition guard attribute.
 */
export type ConditionGuardAttributeDetails = {
    /** The name of the condition function that determines whether the guard is satisfied. */
    calls: string;

    /** The condition function arguments. */
    args: any[];
} & AttributeDetails;

/**
 * An guard which is satisfied as long as the given condition function returns an expected value.
 */
export default class ConditionGuard extends Guard<ConditionGuardAttributeDetails> {
    /**
     * @param type The node attribute type.
     * @param condition The name of the condition function that determines whether the guard is satisfied.
     * @param args The condition function arguments.
     */
    constructor(type: string, private condition: string, private args: any[]) {
        super(type);
    }

    /**
     * Gets whether the guard is satisfied.
     * @param agent The agent.
     * @returns Whether the guard is satisfied.
     */
    isSatisfied(agent: Agent): boolean {
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

    /**
     * Gets the attribute details.
     */
    getDetails(): ConditionGuardAttributeDetails {
        return {
            type: this.type,
            args: this.args,
            calls: this.condition
        };
    }
}
