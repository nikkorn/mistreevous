import Leaf from './leaf'

/**
 * A Condition leaf node.
 * This will succeed or fail immediately based on a board predicate, without moving to the 'RUNNING' state.
 * @param decorators The node decorators.
 * @param condition The name of the condition function. 
 */
export default function Condition(decorators, condition) {
    Leaf.call(this, "condition", decorators);
   
    /**
     * Update the node.
     * @param board The board.
     * @returns The result of the update.
     */
    this.onUpdate = function(board) {
        // Call the condition function to determine the state of this node, but it must exist in the blackboard.
        if (typeof board[condition] === "function") {
            this.setState(!!(board[condition]()) ? Mistreevous.State.SUCCEEDED : Mistreevous.State.FAILED);
        } else {
            throw `cannot update condition node as function '${condition}' is not defined in the blackboard`;
        }
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => condition;
};

Condition.prototype = Object.create(Leaf.prototype);