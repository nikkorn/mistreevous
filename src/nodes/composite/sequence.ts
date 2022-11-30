import Composite from "./composite";
import Node from "../node";
import State from "../../state";
import Decorator from "../decorator/decorator";

/**
 * A SEQUENCE node.
 * The child nodes are executed in sequence until one fails or all succeed.
 * @param decorators The node decorators.
 * @param children The child nodes.
 */
export default class Sequence extends Composite {
    constructor(decorators: Decorator[] | null, protected children: Node[]) {
        super("sequence", decorators, children);
    }

    /**
     * Update the node and get whether the node state has changed.
     * @param agent The agent.
     * @returns Whether the state of this node has changed as part of the update.
     */
    onUpdate = (agent: any) => {
        // Iterate over all of the children of this node.
        for (const child of this.children) {
            // If the child has never been updated or is running then we will need to update it now.
            if (child.getState() === State.READY || child.getState() === State.RUNNING) {
                // Update the child of this node.
                child.update(agent);
            }

            // If the current child has a state of 'SUCCEEDED' then we should move on to the next child.
            if (child.getState() === State.SUCCEEDED) {
                // Find out if the current child is the last one in the sequence.
                // If it is then this sequence node has also succeeded.
                if (this.children.indexOf(child) === this.children.length - 1) {
                    // This node is a 'SUCCEEDED' node.
                    this.setState(State.SUCCEEDED);

                    // There is no need to check the rest of the sequence as we have completed it.
                    return;
                } else {
                    // The child node succeeded, but we have not finished the sequence yet.
                    continue;
                }
            }

            // If the current child has a state of 'FAILED' then this node is also a 'FAILED' node.
            if (child.getState() === State.FAILED) {
                // This node is a 'FAILED' node.
                this.setState(State.FAILED);

                // There is no need to check the rest of the sequence.
                return;
            }

            // The node should be in the 'RUNNING' state.
            if (child.getState() === State.RUNNING) {
                // This node is a 'RUNNING' node.
                this.setState(State.RUNNING);

                // There is no need to check the rest of the sequence as the current child is still running.
                return;
            }

            // The child node was not in an expected state.
            throw new Error("child node was not in an expected state.");
        }
    };

    /**
     * Gets the name of the node.
     */
    getName = () => "SEQUENCE";
}
