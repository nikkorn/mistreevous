import Guard from "./guard";

/**
 * A TIMEOUT guard which is satisfied as long as the given condition remains false.
 * @param duration The duration of the timeout.
 * @param args The array of decorator argument definitions.
 */
export default class Timeout extends Guard {
    constructor(private duration: number, args: any[]) {
        super("timeout", args);
    }

    /**
     * Gets whether the decorator is a guard.
     */
    isGuard = () => true;

    /**
     * Gets the decorator details.
     */
    getDetails = () => {
        return {
            type: this.getType(),
            arguments: this.getArguments()
        };
    };

    onReady = () => {};

    /**
     * Gets whether the guard is satisfied.
     * @param agent The agent.
     * @returns Whether the guard is satisfied.
     */
    isSatisfied = (agent: any) => {
        throw new Error("TODO");
    };
}
