import Node from "../node";
import Composite from "./composite";
import State from "../../state";
import Decorator from "../decorator/decorator";
import { Agent } from "../../agent";

/**
 * A LOTTO node.
 * A winning child is picked on the initial update of this node, based on ticket weighting.
 * The state of this node will match the state of the winning child.
 */
export default class Lotto extends Composite {
    /**
     * @param decorators The node decorators.
     * @param tickets The child node tickets
     * @param children The child nodes.
     */
    constructor(decorators: Decorator[] | null, private tickets: any[], children: Node[]) {
        super("lotto", decorators, children);
    }

    /**
     * The winning child node.
     */
    private winningChild: any;

    /**
     * Update the node and get whether the node state has changed.
     * @param agent The agent.
     * @returns Whether the state of this node has changed as part of the update.
     */
    onUpdate = (agent: Agent) => {
        // If this node is in the READY state then we need to pick a winning child node.
        if (this.is(State.READY)) {
            // Create a lotto draw.
            const lottoDraw = new LottoDraw();

            // Add each child of this node to a lotto draw, with each child's corresponding ticket weighting, or a single ticket if not defined.
            this.children.forEach((child, index) => lottoDraw.add(child, this.tickets[index] || 1));

            // Randomly pick a child based on ticket weighting.
            this.winningChild = lottoDraw.draw();
        }

        // If the winning child has never been updated or is running then we will need to update it now.
        if (this.winningChild.getState() === State.READY || this.winningChild.getState() === State.RUNNING) {
            this.winningChild.update(agent);
        }

        // The state of the lotto node is the state of its winning child.
        this.setState(this.winningChild.getState());
    };

    /**
     * Gets the name of the node.
     */
    getName = () => (this.tickets.length ? `LOTTO [${this.tickets.join(",")}]` : "LOTTO")
}

/**
 * Represents a lotto draw.
 */
class LottoDraw {
    /**
     * The participants
     */
    private readonly participants: { participant: any, tickets: any }[] = [];

    /**
     * Add a participant.
     * @param participant The participant.
     * @param tickets The number of tickets held by the participant.
     */
    add = (participant: any, tickets: any) => {
        this.participants.push({ participant, tickets });
        return this;
    };

    /**
     * Draw a winning participant.
     * @returns A winning participant.
     */
    draw = () => {
        // We cannot do anything if there are no participants.
        if (!this.participants.length) {
            throw new Error("cannot draw a lotto winner when there are no participants");
        }

        const pickable: any[] = [];

        this.participants.forEach(({ participant, tickets }) => {
            for (let ticketCount = 0; ticketCount < tickets; ticketCount++) {
                pickable.push(participant);
            }
        });

        return this.getRandomItem(pickable);
    };

    /**
     * Get a random item form an array.
     * @param items Th array of items.
     * @returns The randomly picked item.
     */
    getRandomItem = (items: any[]) => {
        // We cant pick a random item from an empty array.
        if (!items.length) {
            return undefined;
        }

        // Return a random item.
        return items[Math.floor(Math.random() * items.length)];
    };
}
