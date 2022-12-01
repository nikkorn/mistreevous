import Leaf from "./leaf";
import { Args } from "../../lookup";
import Decorator from "../decorator/decorator";
import { Agent } from "../../agent";
/**
 * A Condition leaf node.
 * This will succeed or fail immediately based on an agent predicate, without moving to the 'RUNNING' state.
 */
export default class Condition extends Leaf {
    private conditionName;
    private conditionArguments;
    /**
     * @param decorators The node decorators.
     * @param conditionName The name of the condition function.
     * @param conditionArguments The array of condition argument definitions.
     */
    constructor(decorators: Decorator[] | null, conditionName: string, conditionArguments: Args);
    /**
     * Update the node.
     * @param agent The agent.
     * @returns The result of the update.
     */
    onUpdate: (agent: Agent) => void;
    /**
     * Gets the name of the node.
     */
    getName: () => string;
}
