import { BehaviourTreeOptions } from "../../BehaviourTreeOptions";
import State, { CompleteState } from "../../State";
import { Agent } from "../../Agent";
import Leaf from "./Leaf";
import Lookup from "../../Lookup";
import Attribute from "../../attributes/Attribute";

/**
 * An Action leaf node.
 * This represents an immediate or ongoing state of behaviour.
 */
export default class Action extends Leaf {
    /**
     * @param attributes The node attributes.
     * @param actionName The action name.
     * @param actionArguments The array of action argument definitions.
     */
    constructor(attributes: Attribute[], private actionName: string, private actionArguments: any[]) {
        super("action", attributes, actionArguments);
    }

    /**
     * Whether there is a pending update promise.
     */
    private isUsingUpdatePromise = false;

    /**
     * The finished state result of an update promise.
     */
    private updatePromiseStateResult: CompleteState | null = null;

    /**
     * Called when the node is being updated.
     * @param agent The agent.
     * @param options The behaviour tree options object.
     */
    protected onUpdate(agent: Agent, options: BehaviourTreeOptions): void {
        // If the result of this action depends on an update promise then there is nothing to do until
        // it resolves, unless there has been a value set as a result of the update promise resolving.
        if (this.isUsingUpdatePromise) {
            // Check whether the update promise has resolved with a state value.
            if (this.updatePromiseStateResult) {
                // Set the state of this node to match the state returned by the promise.
                this.setState(this.updatePromiseStateResult);
            }

            return;
        }

        // Attempt to get the invoker for the action function.
        const actionFuncInvoker = Lookup.getFuncInvoker(agent, this.actionName);

        // The action function should be defined.
        if (actionFuncInvoker === null) {
            throw new Error(
                `cannot update action node as the action '${this.actionName}' function is not defined on the agent and has not been registered`
            );
        }

        let actionFunctionResult;

        try {
            // Call the action function, the result of which may be:
            // - The finished state of this action node.
            // - A promise to return a finished node state.
            // - Undefined if the node should remain in the running state.
            actionFunctionResult = actionFuncInvoker(this.actionArguments) as CompleteState | Promise<CompleteState>;
        } catch (error) {
            // The user was naughty and threw something.
            throw new Error(`action function '${this.actionName}' threw '${error}'`);
        }

        if (actionFunctionResult instanceof Promise) {
            actionFunctionResult.then(
                (result) => {
                    // If 'isUpdatePromisePending' is null then the promise was cleared as it was resolving, probably via an abort of reset.
                    if (!this.isUsingUpdatePromise) {
                        return;
                    }

                    // Check to make sure the result is a valid finished state.
                    if (result !== State.SUCCEEDED && result !== State.FAILED) {
                        throw new Error(
                            "action node promise resolved with an invalid value, expected a State.SUCCEEDED or State.FAILED value to be returned"
                        );
                    }

                    // Set pending update promise state result to be processed on next update.
                    this.updatePromiseStateResult = result;
                },
                (reason) => {
                    // If 'isUpdatePromisePending' is null then the promise was cleared as it was resolving, probably via an abort or reset.
                    if (!this.isUsingUpdatePromise) {
                        return;
                    }

                    // TODO We shouldn't throw an error here, we actually need to set this.updatePromiseRejectionReason so that it can be thrown on the next tree.step() call.

                    // The promise was rejected, which isn't great.
                    throw new Error(`action function '${this.actionName}' promise rejected with reason '${reason}'`);
                }
            );

            // This node will be in the 'RUNNING' state until the update promise resolves.
            this.setState(State.RUNNING);

            // We are now waiting for the promise returned by the use to resolve before we know what state this node is in.
            this.isUsingUpdatePromise = true;
        } else {
            // Validate the returned value.
            this.validateUpdateResult(actionFunctionResult);

            // Set the state of this node, this may be undefined, which just means that the node is still in the 'RUNNING' state.
            this.setState(actionFunctionResult || State.RUNNING);
        }
    }

    /**
     * Gets the name of the node.
     */
    getName = () => this.actionName;

    /**
     * Reset the state of the node.
     */
    reset = () => {
        // Reset the state of this node.
        this.setState(State.READY);

        // There is no longer an update promise that we care about.
        this.isUsingUpdatePromise = false;
        this.updatePromiseStateResult = null;
    };

    /**
     * Validate the result of an update function call.
     * @param result The result of an update function call.
     */
    private validateUpdateResult = (result: CompleteState | boolean) => {
        switch (result) {
            case State.SUCCEEDED:
            case State.FAILED:
            case undefined:
                return;
            default:
                throw new Error(
                    `action '${this.actionName}' 'onUpdate' returned an invalid response, expected an optional State.SUCCEEDED or State.FAILED value to be returned`
                );
        }
    };
}
