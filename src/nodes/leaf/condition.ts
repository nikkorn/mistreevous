import Leaf from "./leaf";
import State from "../../state";
import Lookup from "../../lookup";
import { Agent } from "../../agent";
import Attribute from "../../attributes/attribute";
import { AnyArgument } from "../../rootAstNodesBuilder";
import { BehaviourTreeOptions } from "../../behaviourTreeOptions";

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
    constructor(attributes: Attribute[], private conditionName: string, private conditionArguments: AnyArgument[]) {
        super("condition", attributes, conditionArguments);
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

        // Call the condition function to determine the state of this node.
        this.setState(!!conditionFuncInvoker(this.conditionArguments) ? State.SUCCEEDED : State.FAILED);
    };

    /**
     * Gets the name of the node.
     */
    getName = () => this.conditionName;
}
