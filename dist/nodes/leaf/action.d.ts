import Leaf from "./leaf";
import { Args } from "../../lookup";
import Decorator from "../decorator/decorator";
import { Agent } from "../../agent";
/**
 * An Action leaf node.
 * This represents an immediate or ongoing state of behaviour.
 */
export default class Action extends Leaf {
    private actionName;
    private actionArguments;
    /**
     * @param decorators The node decorators.
     * @param actionName The action name.
     * @param actionArguments The array of action argument definitions.
     */
    constructor(decorators: Decorator[] | null, actionName: string, actionArguments: Args);
    /**
     * Whether there is a pending update promise.
     */
    private isUsingUpdatePromise;
    /**
     * The finished state result of an update promise.
     */
    private updatePromiseStateResult;
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
    /**
     * Reset the state of the node.
     */
    reset: () => void;
    /**
     * Validate the result of an update function call.
     * @param result The result of an update function call.
     */
    private validateUpdateResult;
}
