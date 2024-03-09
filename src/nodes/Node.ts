import { BehaviourTreeOptions } from "../BehaviourTreeOptions";
import State, { AnyState } from "../State";
import { Agent } from "../Agent";
import Leaf from "./leaf/Leaf";
import Attribute from "../attributes/Attribute";
import Entry from "../attributes/callbacks/Entry";
import Exit from "../attributes/callbacks/Exit";
import Step from "../attributes/callbacks/Step";
import Guard from "../attributes/guards/Guard";
import GuardPath from "../attributes/guards/GuardPath";
import GuardUnsatisifedException from "../attributes/guards/GuardUnsatisifedException";

/**
 * A base node.
 */
export default abstract class Node {
    /**
     * The node uid.
     */
    private readonly uid: string = createNodeUid();
    /**
     * The node state.
     */
    private state: AnyState = State.READY;
    /**
     * The guard path to evaluate as part of a node update.
     */
    private guardPath: GuardPath | undefined;

    /**
     * @param type The node type.
     * @param attributes The node attributes.
     * @param args The node argument definitions.
     */
    constructor(private type: string, private attributes: Attribute[], private args: any[]) {}

    /**
     * Called when the node is being updated.
     * @param agent The agent.
     * @param options The behaviour tree options object.
     */
    protected abstract onUpdate(agent: Agent, options: BehaviourTreeOptions): void;

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
    getState = (): AnyState => this.state;
    setState = (value: AnyState): void => {
        this.state = value;
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
    getAttributes = () => this.attributes;

    /**
     * Gets the node arguments.
     */
    getArguments = () => this.args;

    /**
     * Gets the node attribute with the specified type, or null if it does not exist.
     */
    getAttribute(type: "entry" | "ENTRY"): Entry;
    getAttribute(type: "exit" | "EXIT"): Exit;
    getAttribute(type: "step" | "STEP"): Step;
    getAttribute(type: string): Attribute {
        return (
            this.getAttributes().filter((decorator) => decorator.type.toUpperCase() === type.toUpperCase())[0] || null
        );
    }

    /**
     * Gets the node attributes.
     */
    getGuardAttributes = (): Guard[] => this.getAttributes().filter((decorator) => decorator.isGuard()) as Guard[];

    /**
     * Sets the guard path to evaluate as part of a node update.
     */
    setGuardPath = (value: GuardPath) => (this.guardPath = value);

    /**
     * Gets whether a guard path is assigned to this node.
     */
    hasGuardPath = () => !!this.guardPath;

    /**
     * Gets whether this node is in the specified state.
     * @param value The value to compare to the node state.
     */
    public is(value: AnyState): boolean {
        return this.state === value;
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

        this.getAttribute("exit")?.callAgentFunction(agent, false, true);
    }

    /**
     * Update the node.
     * @param agent The agent.
     * @param options The behaviour tree options object.
     * @returns The result of the update.
     */
    public update(agent: Agent, options: BehaviourTreeOptions): void {
        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (this.is(State.SUCCEEDED) || this.is(State.FAILED)) {
            return;
        }

        try {
            // Evaluate all of the guard path conditions for the current tree path.
            this.guardPath!.evaluate(agent);

            // If this node is in the READY state then call the ENTRY for this node if it exists.
            if (this.is(State.READY)) {
                this.getAttribute("entry")?.callAgentFunction(agent);
            }

            this.getAttribute("step")?.callAgentFunction(agent);

            // Do the actual update.
            this.onUpdate(agent, options);

            // If this node is now in a 'SUCCEEDED' or 'FAILED' state then call the EXIT for this node if it exists.
            if (this.is(State.SUCCEEDED) || this.is(State.FAILED)) {
                this.getAttribute("exit")?.callAgentFunction(agent, this.is(State.SUCCEEDED), false);
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
}

/**
 * Create a randomly generated node uid.
 * @returns A randomly generated node uid.
 */
function createNodeUid(): string {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}
