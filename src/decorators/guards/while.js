import Decorator from '../decorator'

/**
 * A WHILE guard which is satisfied as long as the given condition remains true.
 * @param condition The name of the condition function that determines whether the guard is satisfied.
 */
export default function While(condition, ...args) {
    Decorator.call(this, "while");

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
            condition: this.getCondition(),
            arguments: args
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
            return !!(board[condition].apply(board, args || []));
        } else {
            throw `cannot evaluate node guard as function '${condition}' is not defined in the blackboard`;
        }
    };
};

While.prototype = Object.create(Decorator.prototype);
