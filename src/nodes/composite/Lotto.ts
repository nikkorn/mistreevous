import createLotto from "lotto-draw";

import Node from "../Node";
import Composite from "./Composite";
import State from "../../State";
import { Agent } from "../../Agent";
import Attribute from "../../attributes/Attribute";
import { BehaviourTreeOptions } from "../../BehaviourTreeOptions";

/**
 * A LOTTO node.
 * A winning child is picked on the initial update of this node, based on ticket weighting.
 * The state of this node will match the state of the winning child.
 */
export default class Lotto extends Composite {
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param weights The child node weights.
     * @param children The child nodes.
     */
    constructor(
        attributes: Attribute[],
        options: BehaviourTreeOptions,
        private weights: number[] | undefined,
        children: Node[]
    ) {
        super("lotto", attributes, options, children);
    }

    /**
     * The child node selected to be the active one.
     */
    private selectedChild: Node | undefined;

    /**
     * Called when the node is being updated.
     * @param agent The agent.
     * @param options The behaviour tree options object.
     */
    protected onUpdate(agent: Agent, options: BehaviourTreeOptions): void {
        // If this node is in the READY state then we need to pick a winning child node.
        if (this.is(State.READY)) {
            // Create a lotto draw with which to randomly pick a child node to become the active one.
            const lottoDraw = createLotto<Node>({
                // Hook up the optional 'random' behaviour tree function option to the one used by 'lotto-draw'.
                random: options.random,
                // Pass in each child node as a participant in the lotto draw with their respective ticket count.
                participants: this.children.map((child, index) => [child, this.weights?.[index] || 1])
            });

            // Randomly pick a child based on ticket weighting, this will become the active child for this composite node.
            this.selectedChild = lottoDraw.draw() || undefined;
        }

        // If something went wrong and we don't have an active child then we should throw an error.
        if (!this.selectedChild) {
            throw new Error("failed to update lotto node as it has no active child");
        }

        // If the selected child has never been updated or is running then we will need to update it now.
        if (this.selectedChild.getState() === State.READY || this.selectedChild.getState() === State.RUNNING) {
            this.selectedChild.update(agent, options);
        }

        // The state of the lotto node is the state of its selected child.
        this.setState(this.selectedChild.getState());
    }

    /**
     * Gets the name of the node.
     */
    getName = () => (this.weights ? `LOTTO [${this.weights.join(",")}]` : "LOTTO");
}
