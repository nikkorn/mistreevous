import Composite from "./composite";
import State from "../../state";
import Decorator from "../decorator/decorator";
import Node from "../node";

/**
 * A PARALLEL node.
 * The child nodes are executed concurrently until one fails or all succeed.
 * @param decorators The node decorators.
 * @param children The child nodes.
 */
export default class Parallel extends Composite {
    constructor(decorators: Decorator[] | null, children: Node[]) {
        super("parallel", decorators, children);
    }

    /**
     * Update the node and get whether the node state has changed.
     * @param agent The agent.
     * @returns Whether the state of this node has changed as part of the update.
     */
    onUpdate = (agent: any) => {
        // Keep a count of the number of succeeded child nodes.
        let succeededCount = 0;

        let hasChildFailed = false;

        // Iterate over all of the children of this node.
        for (const child of this.children) {
            // If the child has never been updated or is running then we will need to update it now.
            if (child.getState() === State.READY || child.getState() === State.RUNNING) {
                // Update the child of this node.
                child.update(agent);
            }

            // If the current child has a state of 'SUCCEEDED' then we should move on to the next child.
            if (child.getState() === State.SUCCEEDED) {
                // The child node has succeeded, keep track of this to determine if all children have.
                succeededCount++;

                // The child node succeeded, but we have not finished checking every child node yet.
                continue;
            }

            // If the current child has a state of 'FAILED' then this node is also a 'FAILED' node.
            if (child.getState() === State.FAILED) {
                hasChildFailed = true;

                // There is no need to check the rest of the children.
                break;
            }

            // The node should be in the 'RUNNING' state.
            if (child.getState() !== State.RUNNING) {
                // The child node was not in an expected state.
                throw new Error("child node was not in an expected state.");
            }
        }

        if (hasChildFailed) {
            // This node is a 'FAILED' node.
            this.setState(State.FAILED);

            // Abort every running child.
            for (const child of this.children) {
                if (child.getState() === State.RUNNING) {
                    child.abort(agent);
                }
            }
        } else {
            // If all children have succeeded then this node has also succeeded, otherwise it is still running.
            this.setState(succeededCount === this.children.length ? State.SUCCEEDED : State.RUNNING);
        }
    };

    /**
     * Gets the name of the node.
     */
    getName = () => "PARALLEL";
}
