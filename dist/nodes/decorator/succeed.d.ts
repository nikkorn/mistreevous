import Node from "../node";
import Decorator from "./decorator";
/**
 * A Succeed node.
 * This node wraps a single child and will always move to the 'SUCCEEDED' state when the child moves to a 'SUCCEEDED' or 'FAILED' state.
 * @param decorators The node decorators.
 * @param child The child node.
 */
export default class Succeed extends Decorator {
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
