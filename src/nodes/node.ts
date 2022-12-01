import { Agent } from "../agent";
import GuardPath from "../attributes/guards/guardPath";
import GuardUnsatisifedException from "../attributes/guards/guardUnsatisifedException";
import State from "../state";
import Decorator from "./decorator/decorator";
import Leaf from "./leaf/leaf";

/**
 * A base node.
 */
export default abstract class Node {
    /**
     * @param type The node type.
     * @param decorators The node decorators.
     * @param args The node argument definitions.
     */
    constructor(private type: string, private decorators: Decorator[] | null, private args: any[]) {}
    /**
     * The node uid.
     */
    private readonly uid: string = createNodeUid();
    /**
     * The node state.
     */
    private state: any = State.READY;
    /**
     * The guard path to evaluate as part of a node update.
     */
    private guardPath: GuardPath | undefined;

    abstract onUpdate: (agent: Agent) => void;
    abstract getName: () => string;
    abstract isLeafNode: () => this is Leaf;

    /**
     * Gets/Sets the state of the node.
     */
    getState = (): any => this.state;
    setState = (value: any): any => (this.state = value);

    /**
     * Gets the unique id of the node.
     */
    getUid = () => this.uid;

    /**
     * Gets the type of the node.
     */
    getType = () => this.type;

    /**
     * Gets the node decorators.
     */
    getDecorators = () => this.decorators || [];

    /**
     * Gets the node arguments.
     */
    getArguments = () => this.args || [];

    /**
     * Gets the node decorator with the specified type, or null if it does not exist.
     */
    // getDecorator(type: "entry"): Entry;
    // getDecorator(type: "exit"): Exit;
    // getDecorator(type: "step"): Step;
    getDecorator(type: string): Decorator {
        return this.getDecorators().filter((decorator) => decorator.getType().toUpperCase() === type.toUpperCase())[0] || null;
    }

    /**
     * Gets the node decorators.
     */
    getGuardDecorators = () => this.getDecorators().filter((decorator) => (decorator as any).isGuard());

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
    is = (value: any) => this.state === value;

    /**
     * Reset the state of the node.
     */
    reset = () => this.setState(State.READY);

    /**
     * Abort the running of this node.
     * @param agent The agent.
     */
    abort = (agent: Agent) => {
        // There is nothing to do if this node is not in the running state.
        if (!this.is(State.RUNNING)) {
            return;
        }

        // Reset the state of this node.
        this.reset();

        // Try to get the exit decorator for this node.
        const exitDecorator = this.getDecorator("exit");

        // Call the exit decorator function if it exists.
        if (exitDecorator) {
            (exitDecorator as any).callAgentFunction(agent, false, true);
        }
    };

    /**
     * Update the node.
     * @param agent The agent.
     * @returns The result of the update.
     */
    update = (agent: Agent) => {
        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (this.is(State.SUCCEEDED) || this.is(State.FAILED)) {
            // We have not changed state.
            return {};
        }

        try {
            // Evaluate all of the guard path conditions for the current tree path.
            this.guardPath!.evaluate(agent);

            // If this node is in the READY state then call the ENTRY decorator for this node if it exists.
            if (this.is(State.READY)) {
                const entryDecorator = this.getDecorator("entry");

                // Call the entry decorator function if it exists.
                if (entryDecorator) {
                    (entryDecorator as any).callAgentFunction(agent);
                }
            }

            // Try to get the step decorator for this node.
            const stepDecorator = this.getDecorator("step");

            // Call the step decorator function if it exists.
            if (stepDecorator) {
                (stepDecorator as any).callAgentFunction(agent);
            }

            // Do the actual update.
            this.onUpdate(agent);

            // If this node is now in a 'SUCCEEDED' or 'FAILED' state then call the EXIT decorator for this node if it exists.
            if (this.is(State.SUCCEEDED) || this.is(State.FAILED)) {
                const exitDecorator = this.getDecorator("exit");

                // Call the exit decorator function if it exists.
                if (exitDecorator) {
                    (exitDecorator as any).callAgentFunction(agent, this.is(State.SUCCEEDED), false);
                }
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
    };
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
