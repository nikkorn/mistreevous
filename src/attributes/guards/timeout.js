import Guard from "./guard";

/**
 * A TIMEOUT guard which is satisfied as long as the given condition remains false.
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
     * Gets the decorator details.
     */
    this.getDetails = () => {
        return {
            type: this.getType(),
            arguments: this.getArguments()
        };
    };

    this.onReady = () => {};

    /**
     * Gets whether the guard is satisfied.
     * @param agent The agent.
     * @returns Whether the guard is satisfied.
     */
    this.isSatisfied = (agent) => {
        // TODO
    };
}

Timeout.prototype = Object.create(Guard.prototype);
