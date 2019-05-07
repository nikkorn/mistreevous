/**
 * An UNTIL guard which is satisfied as long as the given condition remains false.
 * @param condition The name of the condition function that determines whether the guard is satisfied.
 */
export default function Until(condition) {

    /**
     * Gets whether the guard is satisfied.
     * @param board The board.
     * @returns Whether the guard is satisfied.
     */
    this.isSatisfied = (board) => {
        // Call the condition function to determine whether this guard is satisfied.
        if (typeof board[condition] === "function") {
            return !!!(board[condition]());
        } else {
            throw `cannot evaluate node guard as function '${condition}' is not defined in the blackboard`;
        }
    };
};