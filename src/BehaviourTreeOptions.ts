/**
 * The options object that can be passed as an argument when instantiating the BehaviourTree class.
 */
export interface BehaviourTreeOptions {
    /**
     * Gets a delta time in seconds that is used to calculate the elapsed duration of any wait nodes.
     * @returns The delta time to use in seconds.
     */
    getDeltaTime?(): number;

    /**
     * Gets a pseudo-random floating-point number between 0 (inclusive) and 1 (exclusive) for use in the selection of active children for any lotto nodes.
     * @returns A floating-point number between 0 (inclusive) and 1 (exclusive)
     */
    random?(): number;
}
