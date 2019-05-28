// Type definitions for Mistreevous 0.0.6
// Project: Mistreevous
// Definitions by: nikolas howard <https://github.com/nikkorn>
declare module "Mistreevous" {
	enum State {
		READY,
		RUNNING,
		SUCCEEDED,
		FAILED
	}

	declare class BehaviourTree {
		constructor(definition: string, board: any);
		step(): void;
		reset(): void;
		isRunning(): boolean;
		getState(): State;
	}
}