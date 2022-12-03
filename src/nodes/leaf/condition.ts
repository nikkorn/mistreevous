import Leaf from "./leaf";
import State from "../../state";
import Lookup from "../../lookup";
import { Agent } from "../../agent";
import Attribute from "../../attributes/attribute";
import { AnyArgument } from "../../rootAstNodesBuilder";

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
    constructor(attributes: Attribute[] | null, private conditionName: string, private conditionArguments: AnyArgument[]) {
        super("condition", attributes, conditionArguments);
    }

    /**
     * Update the node.
     * @param agent The agent.
     * @returns The result of the update.
     */
    onUpdate = (agent: Agent) => {
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
