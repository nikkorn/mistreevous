/**
 * The options object that can be passed as an argument when instantiating the BehaviourTree class.
 */
export interface BehaviourTreeOptions {
    /**
     * Gets the delta time to use in seconds.
     * @returns The delta time to use in seconds.
     */
    getDeltaTime?(): number;
}