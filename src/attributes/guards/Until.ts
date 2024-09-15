import ConditionGuard from "./ConditionGuard";

/**
 * An UNTIL guard which is satisfied as long as the given condition remains false.
 */
export default class Until extends ConditionGuard {
    /**
     * @param condition The name of the condition function that determines whether the guard is satisfied.
     * @param args The array of decorator argument definitions.
     */
    constructor(condition: string, args: any[]) {
        super("until", condition, args);
    }
}
