import { BehaviourTreeOptions } from "../BehaviourTreeOptions";
import State, { AnyState } from "../State";
import { Agent } from "../Agent";
import Leaf from "./leaf/Leaf";
import Attribute from "../attributes/Attribute";
import Entry from "../attributes/callbacks/Entry";
import Exit from "../attributes/callbacks/Exit";
import Step from "../attributes/callbacks/Step";
import While from "../attributes/guards/While";
import Until from "../attributes/guards/Until";
import GuardPath from "../attributes/guards/GuardPath";
import GuardUnsatisifedException from "../attributes/guards/GuardUnsatisifedException";
import { GuardAttributeDetails } from "../attributes/guards/Guard";
import { CallbackAttributeDetails } from "../attributes/callbacks/Callback";
import { createUid } from "../Utilities";

/**
 * Details of a tree node instance.
 */
export type NodeDetails = {
    /**
     * The tree node identifier.
     */
    id: string;
    /**
     * The tree node type.
     */
    type: string;
    /**
     * The tree node name.
     */
    name: string;
    /**
     * The current state of the tree node.
     */
    state: AnyState;
    /**
     * The array of agent or globally registered function arguments, defined if this is an action or condition node.
     */
    args?: any[];
    /**
     * The 'while' guard attribute configured for this node.
     */
    while?: GuardAttributeDetails;
    /**
     * The 'until' guard attribute configured for this node.
     */
    until?: GuardAttributeDetails;
    /**
     * The 'entry' callback attribute configured for this node.
     */
    entry?: CallbackAttributeDetails;
    /**
     * The 'step' callback attribute configured for this node.
     */
    step?: CallbackAttributeDetails;
    /**
     * The 'exit' callback attribute configured for this node.
     */
    exit?: CallbackAttributeDetails;
    /**
     * The array of the child nodes of this node, defined if this node is a composite or decorator node.
     */
    children?: NodeDetails[];
};

/**
 * A mapping of attribute names to attributes configured for a node.
 */
type Attributes = {
    /**
     * The 'entry' callback attribute configured for this node.
     */
    entry?: Entry;
    /**
     * The 'step' callback attribute configured for this node.
     */
    step?: Step;
    /**
     * The 'exit' callback attribute configured for this node.
     */
    exit?: Exit;
    /**
     * The 'while' guard attribute configured for this node.
     */
    while?: While;
    /**
     * The 'until' guard attribute configured for this node.
     */
    until?: Until;
};

/**
 * A base node.
 */
export default abstract class Node {
    /**
     * The node unique identifier.
     */
    protected readonly uid: string;
    /**
     * The node attributes.
     */
    protected readonly attributes: Attributes;
    /**
     * The node state.
     */
    private _state: AnyState = State.READY;
    /**
     * The guard path to evaluate as part of a node update.
     */
    private _guardPath: GuardPath | undefined;

    /**
     * @param type The node type.
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     */
    constructor(private type: string, attributes: Attribute[], protected options: BehaviourTreeOptions) {
        // Create a unique identifier for this node.
        this.uid = createUid();

        // Create our attribute mapping.
        this.attributes = {
            entry: attributes.find(({ type }) => type === "entry") as Entry,
            step: attributes.find(({ type }) => type === "step") as Step,
            exit: attributes.find(({ type }) => type === "exit") as Exit,
            while: attributes.find(({ type }) => type === "while") as While,
            until: attributes.find(({ type }) => type === "until") as Until
        };
    }

    /**
     * Called when the node is being updated.
     * @param agent The agent.
     */
    protected abstract onUpdate(agent: Agent): void;

    /**
     * Gets the name of the node.
     */
    public abstract getName(): string;

    /**
     * Gets whether this node is a leaf node.
     */
    public abstract isLeafNode: () => this is Leaf;

    /**
     * Gets/Sets the state of the node.
     */
    getState = (): AnyState => this._state;
    setState = (value: AnyState): void => {
        // Grab the original state of this node.
        const previousState = this._state;

        // Set the new node state.
        this._state = value;

        // If the state actually changed we should handle it.
        if (previousState !== value) {
            this.onStateChanged(previousState);
        }
    };

    /**
     * Gets the unique id of the node.
     */
    getUid = () => this.uid;

    /**
     * Gets the type of the node.
     */
    getType = () => this.type;

    /**
     * Gets the node attributes.
     */
    getAttributes = () => Object.values(this.attributes).filter((attribute) => !!attribute);

    /**
     * Sets the guard path to evaluate as part of a node update.
     */
    setGuardPath = (value: GuardPath) => (this._guardPath = value);

    /**
     * Gets whether a guard path is assigned to this node.
     */
    hasGuardPath = () => !!this._guardPath;

    /**
     * Gets whether this node is in the specified state.
     * @param value The value to compare to the node state.
     */
    public is(value: AnyState): boolean {
        return this._state === value;
    }

    /**
     * Reset the state of the node.
     */
    public reset(): void {
        this.setState(State.READY);
    }

    /**
     * Abort the running of this node.
     * @param agent The agent.
     */
    public abort(agent: Agent): void {
        // There is nothing to do if this node is not in the running state.
        if (!this.is(State.RUNNING)) {
            return;
        }

        // Reset the state of this node.
        this.reset();

        this.attributes.exit?.callAgentFunction(agent, false, true);
    }

    /**
     * Update the node.
     * @param agent The agent.
     * @returns The result of the update.
     */
    public update(agent: Agent): void {
        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (this.is(State.SUCCEEDED) || this.is(State.FAILED)) {
            return;
        }

        try {
            // Evaluate all of the guard path conditions for the current tree path.
            this._guardPath!.evaluate(agent);

            // If this node is in the READY state then call the ENTRY for this node if it exists.
            if (this.is(State.READY)) {
                this.attributes.entry?.callAgentFunction(agent);
            }

            this.attributes.step?.callAgentFunction(agent);

            // Do the actual update.
            this.onUpdate(agent);

            // If this node is now in a 'SUCCEEDED' or 'FAILED' state then call the EXIT for this node if it exists.
            if (this.is(State.SUCCEEDED) || this.is(State.FAILED)) {
                this.attributes.exit?.callAgentFunction(agent, this.is(State.SUCCEEDED), false);
            }
        } catch (error) {
            // If the error is a GuardUnsatisfiedException then we need to determine if this node is the source.
            if (error instanceof GuardUnsatisifedException && error.isSourceNode(this)) {
                // Abort the current node.
                this.abort(agent);

                // Any node that is the source of an abort will be a failed node.
                this.setState(State.FAILED);
            } else {
                throw error;
            }
        }
    }

    /**
     * Gets the details of this node instance.
     * @returns The details of this node instance.
     */
    public getDetails(): NodeDetails {
        return {
            id: this.uid,
            name: this.getName(),
            type: this.type,
            while: this.attributes.while?.getDetails(),
            until: this.attributes.until?.getDetails(),
            entry: this.attributes.entry?.getDetails(),
            step: this.attributes.step?.getDetails(),
            exit: this.attributes.exit?.getDetails(),
            state: this._state
        };
    }

    /**
     * Called when the state of this node changes.
     * @param previousState The previous node state.
     */
    protected onStateChanged(previousState: State): void {
        // We should call the onNodeStateChange callback if it was defined.
        this.options.onNodeStateChange?.({
            id: this.uid,
            type: this.type,
            while: this.attributes.while?.getDetails(),
            until: this.attributes.until?.getDetails(),
            entry: this.attributes.entry?.getDetails(),
            step: this.attributes.step?.getDetails(),
            exit: this.attributes.exit?.getDetails(),
            previousState,
            state: this._state
        });
    }
}
