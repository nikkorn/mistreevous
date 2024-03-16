import { BehaviourTreeOptions } from "../../BehaviourTreeOptions";
import State, { CompleteState } from "../../State";
import { Agent } from "../../Agent";
import Leaf from "./Leaf";
import Lookup from "../../Lookup";
import Attribute from "../../attributes/Attribute";

/**
 * The type representing a resolved/rejected update promise.
 */
type UpdatePromiseResult = {
    /**
     * Whether the promise was resolved rather than rejected.
     */
    isResolved: boolean;

    /**
     * The promise resolved value or rejection reason.
     */
    value: any;
};

/**
 * An Action leaf node.
 * This represents an immediate or ongoing state of behaviour.
 */
export default class Action extends Leaf {
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param actionName The action name.
     * @param actionArguments The array of action argument definitions.
     */
    constructor(
        attributes: Attribute[],
        options: BehaviourTreeOptions,
        private actionName: string,
        public actionArguments: any[]
    ) {
        super("action", attributes, options);
    }

    /**
     * Whether there is a pending update promise.
     */
    private isUsingUpdatePromise = false;

    /**
     * The finished state result of an update promise.
     */
    private updatePromiseResult: UpdatePromiseResult | null = null;

    /**
     * Called when the node is being updated.
     * @param agent The agent.
     */
    protected onUpdate(agent: Agent): void {
        // If the result of this action depends on an update promise then there is nothing to do until it settles.
        if (this.isUsingUpdatePromise) {
            // Are we still waiting for our update promise to settle?
            if (!this.updatePromiseResult) {
                return;
            }

            const { isResolved, value } = this.updatePromiseResult;

            // Our update promise settled, was it resolved or rejected?
            if (isResolved) {
                // Our promise resolved so check to make sure the result is a valid finished state.
                if (value !== State.SUCCEEDED && value !== State.FAILED) {
                    throw new Error(
                        "action node promise resolved with an invalid value, expected a State.SUCCEEDED or State.FAILED value to be returned"
                    );
                }

                // Set the state of this node to match the state returned by the promise.
                this.setState(value);

                return;
            } else {
                // The promise was rejected, which isn't great.
                throw new Error(`action function '${this.actionName}' promise rejected with '${value}'`);
            }
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
            // An uncaught error was thrown.
            if (error instanceof Error) {
                throw new Error(`action function '${this.actionName}' threw: ${error.stack}`);
            } else {
                throw new Error(`action function '${this.actionName}' threw: ${error}`);
            }
        }

        if (actionFunctionResult instanceof Promise) {
            actionFunctionResult.then(
                (result) => {
                    // If 'isUpdatePromisePending' is not set then the promise was cleared as it was resolving, probably via an abort of reset.
                    if (!this.isUsingUpdatePromise) {
                        return;
                    }

                    // Set the resolved update promise result so that it can be handled on the next update of this node.
                    this.updatePromiseResult = {
                        isResolved: true,
                        value: result
                    };
                },
                (reason) => {
                    // If 'isUpdatePromisePending' is not set then the promise was cleared as it was resolving, probably via an abort or reset.
                    if (!this.isUsingUpdatePromise) {
                        return;
                    }

                    // Set the rejected update promise result so that it can be handled on the next update of this node.
                    this.updatePromiseResult = {
                        isResolved: false,
                        value: reason
                    };
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
        this.updatePromiseResult = null;
    };

    /**
     * Called when the state of this node changes.
     * @param previousState The previous node state.
     */
    protected onStateChanged(previousState: State): void {
        this.options.onNodeStateChange?.({
            id: this.uid,
            type: this.getType(),
            args: this.actionArguments,
            while: this.attributes.while?.getDetails(),
            until: this.attributes.until?.getDetails(),
            entry: this.attributes.entry?.getDetails(),
            step: this.attributes.step?.getDetails(),
            exit: this.attributes.exit?.getDetails(),
            previousState,
            state: this.getState()
        });
    }

    /**
     * Validate the result of an update function call.
     * @param result The result of an update function call.
     */
    private validateUpdateResult = (result: CompleteState | State.RUNNING) => {
        switch (result) {
            case State.SUCCEEDED:
            case State.FAILED:
            case State.RUNNING:
            case undefined:
                return;
            default:
                throw new Error(
                    `expected action function '${this.actionName}' to return an optional State.SUCCEEDED or State.FAILED value but returned '${result}'`
                );
        }
    };
}
