import Guard from './guard'

/**
 * An UNTIL guard which is satisfied as long as the given condition remains false.
 * @param duration The duration of the timeout.
 * @param args The array of decorator argument definitions.
 */
export default function Timeout(duration, args) {
    Guard.call(this, "timeout", args);

    /**
     * Gets whether the decorator is a guard.
     */
    this.isGuard = () => true;

    /**
     * Gets whether the guard is satisfied.
     * @param board The board.
     * @returns Whether the guard is satisfied.
     */
    this.isSatisfied = (board) => {
       // TODO
    };
};

Timeout.prototype = Object.create(Guard.prototype);