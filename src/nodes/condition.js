import Leaf from './leaf'
import State from "../state";

/**
 * A Condition leaf node.
 * This will succeed or fail immediately based on a board predicate, without moving to the 'RUNNING' state.
 * @param decorators The node decorators.
 * @param conditionName The name of the condition function.
 * @param conditionArguments The array of condition arguments.
 */
export default function Condition(decorators, conditionName, conditionArguments) {
    Leaf.call(this, "condition", decorators);
   
    /**
     * Update the node.
     * @param board The board.
     * @returns The result of the update.
     */
    this.onUpdate = function(board) {
        // Call the condition function to determine the state of this node, but it must exist in the blackboard.
        if (typeof board[conditionName] === "function") {
            this.setState(!!(board[conditionName].apply(board, conditionArguments)) ? State.SUCCEEDED : State.FAILED);
        } else {
            throw new Error(`cannot update condition node as function '${conditionName}' is not defined in the blackboard`);
        }
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => conditionName;
};

Condition.prototype = Object.create(Leaf.prototype);