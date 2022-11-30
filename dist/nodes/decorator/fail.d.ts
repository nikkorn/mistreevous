import Node from "../node";
import Decorator from "./decorator";
/**
 * A Fail node.
 * This node wraps a single child and will always move to the 'FAILED' state when the child moves to a 'SUCCEEDED' or 'FAILED' state.
 * @param decorators The node decorators.
 * @param child The child node.
 */
export default class Fail extends Decorator {
    constructor(decorators: Decorator[] | null, child: Node);
    /**
     * Update the node.
     * @param agent The agent.
     * @returns The result of the update.
     */
    onUpdate: (agent: any) => void;
    /**
     * Gets the name of the node.
     */
    getName: () => string;
}
