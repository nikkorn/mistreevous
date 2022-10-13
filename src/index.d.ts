// Project: Mistreevous
// Definitions by: nikolas howard <https://github.com/nikkorn>
declare module "mistreevous" {
	/**
	 * Enumeration of node state types.
	 */
	enum State {
		READY,
		RUNNING,
		SUCCEEDED,
		FAILED
	}

	/**
	 * The options object that can be passed as an argument when instantiating the BehaviourTree class.
	 */
	interface BehaviourTreeOptions {
		/**
		 * Gets the delta time to use in seconds.
		 * @returns The delta time to use in seconds.
		 */
		getDeltaTime?(): number;
	}

	/**
	 * A representation of a behaviour tree.
	 */
	class BehaviourTree {
		/**
		 * Creates a new instance of the BehaviourTree class.
		 * @param definition The tree definition.
		 * @param agent The agent that the tree is modelling behaviour for.
		 * @param options The options object.
		 */
		constructor(definition: string, agent: any, options?: BehaviourTreeOptions);

		/**
		 * Carries out a node update that traverses the tree from the root node outwards to any child nodes, skipping those that are already in a resolved state of SUCCEEDED or FAILED.
		 * After being updated, leaf nodes will have a state of SUCCEEDED, FAILED or RUNNING. Leaf nodes that are left in the RUNNING state as part of a tree step will be revisited each
		 * subsequent step until they move into a resolved state of either SUCCEEDED or FAILED, after which execution will move through the tree to the next node with a state of READY.
		 *
		 * Calling this method when the tree is already in a resolved state of SUCCEEDED or FAILED will cause it to be reset before tree traversal begins.
		 */
		step(): void;

		/**
		 * Resets the tree from the root node outwards to each nested node, giving each a state of READY.
		 */
		reset(): void;

		/**
		 * Gets whether the tree is in the RUNNING state.
		 * @returns true if the tree is in the RUNNING state, otherwise false.
		 */
		isRunning(): boolean;

		/**
		 * Gets the current tree state.
		 * @returns The current tree state.
		 */
		getState(): State;

		/**
		 * Registers the action/condition/guard/callback function or subtree with the given name.
		 * @param name The name of the function or subtree to register.
		 * @param value The function or subtree definition to register.
		 */
		static register(name: string, value: Function | string): void;

		/**
		 * Unregisters the registered action/condition/guard/callback function or subtree with the given name.
		 * @param name The name of the registered action/condition/guard/callback function or subtree to unregister.
		 */
		static unregister(name: string): void;

		/**
		 * Unregister all registered action/condition/guard/callback functions and subtrees.
		 */
		static unregisterAll(): void;
	}
}