import GuardUnsatisifedException from "../attributes/guards/guardUnsatisifedException";
import State from "../State";

/**
 * A base node.
 * @param type The node type.
 * @param attributes The node guard/callback attributes.
 * @param args The node argument definitions.
 */
export default function Node(type, attributes, args) {
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
     * Gets the node guard/callback attributes.
     */
    this.getAttributes = () => attributes || [];

    /**
     * Gets the node arguments.
     */
    this.getArguments = () => args || [];

    /**
     * Gets the node guard/callback attribute with the specified type, or null if it does not exist.
     */
    this.getAttribute = (type) =>
        this.getAttributes().filter((attribute) => attribute.getType().toUpperCase() === type.toUpperCase())[0] || null;

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

        // Try to get the exit callback attribute for this node.
        const exitCallback = this.getAttribute("exit");

        // Call the exit callback attribute function if it exists.
        if (exitCallback) {
            exitCallback.callAgentFunction(agent, false, true);
        }
    };

    /**
     * Update the node.
     * @param agent The agent.
     * @param options The behaviour tree options object.
     * @returns The result of the update.
     */
    this.update = (agent, options) => {
        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (this.is(State.SUCCEEDED) || this.is(State.FAILED)) {
            // We have not changed state.
            return {};
        }

        // If this node is in a 'READY' state then we may want to carry out some initialisation for any node guard attributes. 
        if (this.is(State.READY)) {
            this.getAttributes()
                .filter((attribute) => attribute.isGuard())
                .forEach((guard) => guard.onReady());
        }

        try {
            // Evaluate all of the guard path conditions for the current tree path.
            guardPath.evaluate(agent);

            // If this node is in the READY state then call the entry callback for this node if it exists.
            if (this.is(State.READY)) {
                // Try to get the entry callback attribute for this node.
                const entryCallback = this.getAttribute("entry");

                // Call the entry callback attribute function if it exists.
                if (entryCallback) {
                    entryCallback.callAgentFunction(agent);
                }
            }

            // Try to get the step callback attribute for this node.
            const stepCallback = this.getAttribute("step");

            // Call the step callback attribute function if it exists.
            if (stepCallback) {
                stepCallback.callAgentFunction(agent);
            }

            // Do the actual update.
            this.onUpdate(agent, options);

            // If this node is now in a 'SUCCEEDED' or 'FAILED' state then call the EXIT callback for this node if it exists.
            if (this.is(State.SUCCEEDED) || this.is(State.FAILED)) {
                // Try to get the exit callback attribute for this node.
                const exitCallback = this.getAttribute("exit");

                // Call the exit callback attribute function if it exists.
                if (exitCallback) {
                    exitCallback.callAgentFunction(agent, this.is(State.SUCCEEDED), false);
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
