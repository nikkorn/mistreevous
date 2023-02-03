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
     * @param tickets The child node tickets
     * @param children The child nodes.
     */
    constructor(attributes: Attribute[], private tickets: number[], children: Node[]) {
        super("lotto", attributes, children);
    }

    /**
     * The winning child node.
     */
    private winningChild: Node | undefined;

    /**
     * Called when the node is being updated.
     * @param agent The agent.
     * @param options The behaviour tree options object.
     */
    protected onUpdate(agent: Agent, options: BehaviourTreeOptions): void {
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
        if (this.winningChild!.getState() === State.READY || this.winningChild!.getState() === State.RUNNING) {
            this.winningChild!.update(agent, options);
        }

        // The state of the lotto node is the state of its winning child.
        // Note: We're dirty casting away undefined like this ignores the fact lotto.draw() can return undefined...
        this.setState(this.winningChild!.getState());
    }

    /**
     * Gets the name of the node.
     */
    getName = () => (this.tickets.length ? `LOTTO [${this.tickets.join(",")}]` : "LOTTO");
}

type Participant = { participant: Node; tickets: number };

/**
 * Represents a lotto draw.
 */
class LottoDraw {
    /**
     * The participants
     */
    private readonly participants: Participant[] = [];

    /**
     * Add a participant.
     * @param participant The participant.
     * @param tickets The number of tickets held by the participant.
     */
    add = (participant: Node, tickets: number) => {
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

        const pickable: Node[] = [];

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
    getRandomItem = <T>(items: T[]): T | undefined => {
        // We cant pick a random item from an empty array.
        if (!items.length) {
            return undefined;
        }

        // Return a random item.
        return items[Math.floor(Math.random() * items.length)];
    };
}
