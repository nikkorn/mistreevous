import { NodeAttributeDefinition } from "./BehaviourTreeDefinition";
import { State } from "./State";
/**
 * An object representing a change in state for a node in a behaviour tree instance.
 */
export type NodeStateChange = {
    /**
     * The node unique identifier.
     */
    id: string;
    /**
     * The node type.
     */
    type: string;
    /**
     * The node caption.
     */
    caption: string;
    /**
     * The array of agent or globally registered function arguments if this is an action or condition node.
     */
    args?: any[];
    /**
     * The 'when' guard attribute configured for this node.
     */
    when?: NodeAttributeDefinition;
    /**
     * The 'until' guard attribute configured for this node.
     */
    until?: NodeAttributeDefinition;
    /**
     * The 'entry' callback attribute configured for this node.
     */
    entry?: NodeAttributeDefinition;
    /**
     * The 'step' callback attribute configured for this node.
     */
    step?: NodeAttributeDefinition;
    /**
     * The 'exit' callback attribute configured for this node.
     */
    exit?: NodeAttributeDefinition;
    /**
     * The previous state of the node.
     */
    previousState: State;
    /**
     * The current state of the node.
     */
    state: State;
};
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
    /**
     * An event handler that is called whenever the state of a node changes.
     * @param change The object representing a change in state for a node in a behaviour tree instance.
     */
    onNodeStateChange?(change: NodeStateChange): void;
}
