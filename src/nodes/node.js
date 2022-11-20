import GuardUnsatisifedException from "../attributes/guards/guardUnsatisifedException";
import State from "../State";

/**
 * A base node.
 * @param type The node type.
 * @param decorators The node decorators.
 * @param args The node argument definitions.
 */
export default function Node(type, decorators, args) {
    /**
     * The node uid.
     */
    const uid = createNodeUid();
    /**
     * The node state.
     */
    let state = State.READY;
    /**
     * The guard path to evaluate as part of a node update.
     */
    let guardPath;

    /**
     * Gets/Sets the state of the node.
     */
    this.getState = () => state;
    this.setState = (value) => (state = value);

    /**
     * Gets the unique id of the node.
     */
    this.getUid = () => uid;

    /**
     * Gets the type of the node.
     */
    this.getType = () => type;

    /**
     * Gets the node decorators.
     */
    this.getDecorators = () => decorators || [];

    /**
     * Gets the node arguments.
     */
    this.getArguments = () => args || [];

    /**
     * Gets the node decorator with the specified type, or null if it does not exist.
     */
    this.getDecorator = (type) =>
        this.getDecorators().filter((decorator) => decorator.getType().toUpperCase() === type.toUpperCase())[0] || null;

    /**
     * Gets the node decorators.
     */
    this.getGuardDecorators = () => this.getDecorators().filter((decorator) => decorator.isGuard());

    /**
     * Sets the guard path to evaluate as part of a node update.
     */
    this.setGuardPath = (value) => (guardPath = value);

    /**
     * Gets whether a guard path is assigned to this node.
     */
    this.hasGuardPath = () => !!guardPath;

    /**
     * Gets whether this node is in the specified state.
     * @param value The value to compare to the node state.
     */
    this.is = (value) => {
        return state === value;
    };

    /**
     * Reset the state of the node.
     */
    this.reset = () => {
        // Reset the state of this node.
        this.setState(State.READY);
    };

    /**
     * Abort the running of this node.
     * @param agent The agent.
     */
    this.abort = (agent) => {
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
            exitDecorator.callAgentFunction(agent, false, true);
        }
    };

    /**
     * Update the node.
     * @param agent The agent.
     * @returns The result of the update.
     */
    this.update = (agent) => {
        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (this.is(State.SUCCEEDED) || this.is(State.FAILED)) {
            // We have not changed state.
            return {};
        }

        try {
            // Evaluate all of the guard path conditions for the current tree path.
            guardPath.evaluate(agent);

            // If this node is in the READY state then call the ENTRY decorator for this node if it exists.
            if (this.is(State.READY)) {
                const entryDecorator = this.getDecorator("entry");

                // Call the entry decorator function if it exists.
                if (entryDecorator) {
                    entryDecorator.callAgentFunction(agent);
                }
            }

            // Try to get the step decorator for this node.
            const stepDecorator = this.getDecorator("step");

            // Call the step decorator function if it exists.
            if (stepDecorator) {
                stepDecorator.callAgentFunction(agent);
            }

            // Do the actual update.
            this.onUpdate(agent);

            // If this node is now in a 'SUCCEEDED' or 'FAILED' state then call the EXIT decorator for this node if it exists.
            if (this.is(State.SUCCEEDED) || this.is(State.FAILED)) {
                const exitDecorator = this.getDecorator("exit");

                // Call the exit decorator function if it exists.
                if (exitDecorator) {
                    exitDecorator.callAgentFunction(agent, this.is(State.SUCCEEDED), false);
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
function createNodeUid() {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}
