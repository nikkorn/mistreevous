import Leaf from "./leaf";
import State from "../../state";
import Lookup from "../../Lookup";

/**
 * A Condition leaf node.
 * This will succeed or fail immediately based on an agent predicate, without moving to the 'RUNNING' state.
 * @param decorators The node decorators.
 * @param conditionName The name of the condition function.
 * @param conditionArguments The array of condition argument definitions.
 */
export default function Condition(decorators, conditionName, conditionArguments) {
    Leaf.call(this, "condition", decorators, conditionArguments);

    /**
     * Update the node.
     * @param agent The agent.
     * @returns The result of the update.
     */
    this.onUpdate = function (agent) {
        // Attempt to get the invoker for the condition function.
        const conditionFuncInvoker = Lookup.getFuncInvoker(agent, conditionName);

        // The condition function should be defined.
        if (conditionFuncInvoker === null) {
            throw new Error(
                `cannot update condition node as the condition '${conditionName}' function is not defined on the agent and has not been registered`
            );
        }

        // Call the condition function to determine the state of this node.
        this.setState(!!conditionFuncInvoker(conditionArguments) ? State.SUCCEEDED : State.FAILED);
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => conditionName;
}

Condition.prototype = Object.create(Leaf.prototype);
