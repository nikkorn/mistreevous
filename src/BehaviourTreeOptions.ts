/**
 * The options object that can be passed as an argument when instantiating the BehaviourTree class.
 */
export interface BehaviourTreeOptions {
    /**
     * Gets a delta time in seconds that is used to calculate the elapsed duration of any `wait` nodes.
     * If this function is not defined then `Date.prototype.getTime()` will be used instead by default.
     * @returns The delta time to use in seconds.
     */
    getDeltaTime?(): number;

    /**
     * Gets a pseudo-random floating-point number between 0 (inclusive) and 1 (exclusive) for use in operations such as:
     *  - The selection of active children for any `lotto` nodes.
     *  - The selection of durations for `wait` nodes,
     *  - The selection of iterations for `repeat` nodes and attempts for `retry` nodes when minimum and maximum bounds are defined.
     * If not defined then `Math.random()` will be used instead by default.
     * @returns A floating-point number between 0 (inclusive) and 1 (exclusive)
     */
    random?(): number;
}
