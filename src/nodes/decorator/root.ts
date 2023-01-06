import Node from "../node";
import Decorator from "./decorator";
import State from "../../state";
import { Agent } from "../../agent";
import Attribute from "../../attributes/attribute";
import { BehaviourTreeOptions } from "../../behaviourTreeOptions";

/**
 * A Root node.
 * The root node will have a single child.
 */
export default class Root extends Decorator {
    /**
     * @param attributes The node attributes.
     * @param child The child node.
     */
    constructor(attributes: Attribute[], child: Node) {
        super("root", attributes, child);
    }

    /**
     * Called when the node is being updated.
     * @param agent The agent.
     * @param options The behaviour tree options object.
     */
    protected onUpdate(agent: Agent, options: BehaviourTreeOptions): void {
        // If the child has never been updated or is running then we will need to update it now.
        if (this.child.getState() === State.READY || this.child.getState() === State.RUNNING) {
            // Update the child of this node.
            this.child.update(agent, options);
        }

        // The state of the root node is the state of its child.
        this.setState(this.child.getState());
    };

    /**
     * Gets the name of the node.
     */
    getName = () => "ROOT";
}
