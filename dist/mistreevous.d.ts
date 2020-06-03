// Type definitions for Mistreevous 2.0.1
// Project: Mistreevous
// Definitions by: nikolas howard <https://github.com/nikkorn>
declare module "mistreevous" {
	enum State {
		READY,
		RUNNING,
		SUCCEEDED,
		FAILED
	}

	class BehaviourTree {
		constructor(definition: string, board: any);
		step(): void;
		reset(): void;
		isRunning(): boolean;
		getState(): State;
	}
}