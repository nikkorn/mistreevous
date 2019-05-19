import Composite from './composite'

/**
 * A LOTTO node.
 * A winning child is picked on the initial update of this node, based on ticket weighting.
 * The state of this node will match the state of the winning child.
 * @param decorators The node decorators.
 * @param tickets The child node tickets
 * @param children The child nodes. 
 */
export default function Lotto(decorators, tickets, children) {
    Composite.call(this, "lotto", decorators, children);

    /**
     * The winning child node.
     */
    let winningChild;

    /**
     * Represents a lotto draw.
     */
    function LottoDraw() {
        /**
         * The participants
         */
        this.participants = [];

        /**
         * Add a participant.
         * @param participant The participant.
         * @param tickets The number of tickets held by the participant.
         */
        this.add = function(participant, tickets) {
            this.participants.push({ participant, tickets });
            return this;
        };

        /**
         * Draw a winning participant.
         * @returns A winning participant.
         */
        this.draw = function() {
            // We cannot do anything if there are no participants.
            if (!this.participants.length) {
                throw "cannot draw a lotto winner when there are no participants";
            }

            const pickable = [];

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
        this.getRandomItem = function(items) {
            // We cant pick a random item from an empty array.
            if (!items.length) {
                return undefined;
            }

            // Return a random item.
            return items[Math.floor(Math.random() * items.length)]; 
        }
    }
   
    /**
     * Update the node and get whether the node state has changed.
     * @param board The board.
     * @returns Whether the state of this node has changed as part of the update.
     */
    this.onUpdate = function(board) {
        // If this node is in the READY state then we need to pick a winning child node.
        if (this.is(Mistreevous.State.READY)) {
            // Create a lotto draw.
            const lottoDraw = new LottoDraw();

            // Add each child of this node to a lotto draw, with each child's corresponding ticket weighting, or a single ticket if not defined.
            children.forEach((child, index) => lottoDraw.add(child, tickets[index] || 1));

            // Randomly pick a child based on ticket weighting.
            winningChild = lottoDraw.draw();
        }

        // If the winning child has never been updated or is running then we will need to update it now.
        if (winningChild.getState() === Mistreevous.State.READY || winningChild.getState() === Mistreevous.State.RUNNING) {
            // Update the winning child of this node and get the result.
            const updateResult = winningChild.update(board);

            // Check to see whether a node guard condition failed during the child node update.
            if (updateResult.failedGuardNode) {
                // Is this node the one with the failed guard condition?
                if (updateResult.failedGuardNode === this) {
                    // We need to abort this node.
                    this.abort(board);
                    
                    // The guard condition for this node did not pass, so this node will move into the FAILED state.
                    this.setState(Mistreevous.State.FAILED);

                    return;
                } else {
                    // A node guard condition has failed higher ups the tree.
                    return { failedGuardNode: updateResult.failedGuardNode };
                }
            }
        }

        // The state of the lotto node is the state of its winning child.
        this.setState(winningChild.getState());
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => tickets.length ? `LOTTO [${ tickets.join(",") }]` : "LOTTO";
};

Lotto.prototype = Object.create(Composite.prototype);