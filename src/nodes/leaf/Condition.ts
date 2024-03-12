import { BehaviourTreeOptions } from "../../BehaviourTreeOptions";
import State from "../../State";
import { Agent } from "../../Agent";
import Leaf from "./Leaf";
import Lookup from "../../Lookup";
import Attribute from "../../attributes/Attribute";

/**
 * A Condition leaf node.
 * This will succeed or fail immediately based on an agent predicate, without moving to the 'RUNNING' state.
 */
export default class Condition extends Leaf {
    /**
     * @param attributes The node attributes.
     * @param conditionName The name of the condition function.
     * @param conditionArguments The array of condition argument definitions.
     */
    constructor(attributes: Attribute[], private conditionName: string, public conditionArguments: any[]) {
        super("condition", attributes);
    }

    /**
     * Called when the node is being updated.
     * @param agent The agent.
     * @param options The behaviour tree options object.
     */
    protected onUpdate(agent: Agent, options: BehaviourTreeOptions): void {
        // Attempt to get the invoker for the condition function.
        const conditionFuncInvoker = Lookup.getFuncInvoker(agent, this.conditionName);

        // The condition function should be defined.
        if (conditionFuncInvoker === null) {
            throw new Error(
                `cannot update condition node as the condition '${this.conditionName}' function is not defined on the agent and has not been registered`
            );
        }

        let conditionFunctionResult;

        try {
            // Call the condition function to determine the state of this node, the result of which should be a boolean.
            conditionFunctionResult = conditionFuncInvoker(this.conditionArguments);
        } catch (error) {
            // An uncaught error was thrown.
            if (error instanceof Error) {
                throw new Error(`condition function '${this.conditionName}' threw: ${error.stack}`);
            } else {
                throw new Error(`condition function '${this.conditionName}' threw: ${error}`);
            }
        }

        // The result of calling the condition function must be a boolean value.
        if (typeof conditionFunctionResult !== "boolean") {
            throw new Error(
                `expected condition function '${this.conditionName}' to return a boolean but returned '${conditionFunctionResult}'`
            );
        }

        // Set the state of this node based on the result of calling the condition function.
        this.setState(!!conditionFunctionResult ? State.SUCCEEDED : State.FAILED);
    }

    /**
     * Gets the name of the node.
     */
    getName = () => this.conditionName;
}
