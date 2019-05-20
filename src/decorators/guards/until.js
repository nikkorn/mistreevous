import Decorator from '../decorator'

/**
 * An UNTIL guard which is satisfied as long as the given condition remains false.
 * @param condition The name of the condition function that determines whether the guard is satisfied.
 */
export default function Until(condition) {
    Decorator.call(this, "until");

    /**
     * Gets whether the decorator is a guard.
     */
    this.isGuard = () => true;

    /**
     * Gets the condition of the guard.
     */
    this.getCondition = () => condition;

    /**
     * Gets the decorator details.
     */
    this.getDetails = () => {
        return {
            type: this.getType(),
            isGuard: this.isGuard(),
            condition: this.getCondition()
        };
    };

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

Until.prototype = Object.create(Decorator.prototype);