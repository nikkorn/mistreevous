import Leaf from "./leaf";
import State from "../../state";
import Lookup, { Args } from "../../lookup";
import Decorator from "../decorator/decorator";

/**
 * A Condition leaf node.
 * This will succeed or fail immediately based on an agent predicate, without moving to the 'RUNNING' state.
 * @param decorators The node decorators.
 * @param conditionName The name of the condition function.
 * @param conditionArguments The array of condition argument definitions.
 */
export default class Condition extends Leaf {
    constructor(decorators: Decorator[] | null, private conditionName: string, private conditionArguments: Args) {
        super("condition", decorators, conditionArguments);
    }

    /**
     * Update the node.
     * @param agent The agent.
     * @returns The result of the update.
     */
    onUpdate = (agent: any) => {
        // Attempt to get the invoker for the condition function.
        const conditionFuncInvoker = Lookup.getFuncInvoker(agent, this.conditionName);

        // The condition function should be defined.
        if (conditionFuncInvoker === null) {
            throw new Error(
                `cannot update condition node as the condition '${this.conditionName}' function is not defined on the agent and has not been registered`
            );
        }

        // Call the condition function to determine the state of this node.
        this.setState(!!conditionFuncInvoker(this.conditionArguments) ? State.SUCCEEDED : State.FAILED);
    };

    /**
     * Gets the name of the node.
     */
    getName = () => this.conditionName;
}
