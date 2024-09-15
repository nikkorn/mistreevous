import ConditionGuard from "./ConditionGuard";

/**
 * A WHILE guard which is satisfied as long as the given condition remains true.
 */
export default class While extends ConditionGuard {
    /**
     * @param condition The name of the condition function that determines whether the guard is satisfied.
     * @param args The array of decorator argument definitions.
     */
    constructor(condition: string, args: any[]) {
        super("while", condition, args);
    }
}
