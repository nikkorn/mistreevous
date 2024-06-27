import { assert } from "chai";
import sinon, { SinonFakeTimers, SinonSandbox } from "sinon";

import { BehaviourTree, State } from "../../../src/index";
import { RootNodeDefinition } from "../../../src/BehaviourTreeDefinition";
import { Agent } from "../../../src/Agent";

import { findNode } from "../../TestUtilities";

describe("A Wait node", () => {
    describe("on tree initialisation", () => {
        describe("will error if", () => {
            describe("the defined node arguments are not integers", () => {
                it("(MDSL)", () => {
                    const definition = "root { wait ['not', 'integers'] }";
                    assert.throws(
                        () => new BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: wait node durations must be integer values"
                    );
                });

                it("(JSON)", () => {
                    const definition = {
                        type: "root",
                        child: {
                            type: "wait",
                            duration: ["not", "integers"]
                        }
                    } as any;
                    assert.throws(
                        () => new BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: expected array containing two integer values for 'duration' property if defined for wait node at depth '1'"
                    );
                });
            });

            describe("a negative duration node argument was defined", () => {
                it("(MDSL)", () => {
                    const definition = "root { wait [-1] }";
                    assert.throws(
                        () => new BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: a wait node must have a positive duration"
                    );
                });

                it("(JSON)", () => {
                    const definition = {
                        type: "root",
                        child: {
                            type: "wait",
                            duration: -1
                        }
                    } as any;
                    assert.throws(
                        () => new BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: expected positive duration value for 'duration' property if defined for wait node at depth '1'"
                    );
                });
            });

            describe("more than two node arguments are defined", () => {
                it("(MDSL)", () => {
                    const definition = "root { wait [0, 1000, 4000] }";
                    assert.throws(
                        () => new BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: invalid number of wait node duration arguments defined"
                    );
                });

                it("(JSON)", () => {
                    const definition = {
                        type: "root",
                        child: {
                            type: "wait",
                            duration: [0, 1000, 4000]
                        }
                    } as any;
                    assert.throws(
                        () => new BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: expected array containing two integer values for 'duration' property if defined for wait node at depth '1'"
                    );
                });
            });

            describe("a minimum duration bound node argument is defined that is greater than the maximum duration bound node argument", () => {
                it("(MDSL)", () => {
                    const definition = "root { wait [1000, 500] }";
                    assert.throws(
                        () => new BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: a wait node must not have a minimum duration that exceeds the maximum duration"
                    );
                });

                it("(JSON)", () => {
                    const definition = {
                        type: "root",
                        child: {
                            type: "wait",
                            duration: [1000, 500]
                        }
                    } as any;
                    assert.throws(
                        () => new BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: expected minimum duration value that does not exceed the maximum duration value for 'duration' property if defined for wait node at depth '1'"
                    );
                });
            });
        });
    });

    describe("when updated as part of a tree step", () => {
        let clock: SinonFakeTimers;
        let sandbox: SinonSandbox;

        beforeEach(() => {
            clock = sinon.useFakeTimers();
            sandbox = sinon.createSandbox();
            sandbox.replace(globalThis.Math, "random", () => 0.5);
        });

        afterEach(() => {
            clock.restore();
            sandbox.restore();
        });

        describe("and an explicit duration was defined will move to the SUCCEEDED state if the duration has expired", () => {
            it("(MDSL)", () => {
                const definition = "root { wait [100] }";
                const tree = new BehaviourTree(definition, {});

                let node = findNode(tree, "wait");
                assert.strictEqual(node.state, State.READY);

                tree.step();

                node = findNode(tree, "wait");
                assert.strictEqual(node.state, State.RUNNING);

                clock.tick(99);

                tree.step();

                node = findNode(tree, "wait");
                assert.strictEqual(node.state, State.RUNNING);

                clock.tick(1);

                tree.step();

                node = findNode(tree, "wait");
                assert.strictEqual(node.state, State.SUCCEEDED);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "wait",
                        duration: 100
                    }
                };
                const tree = new BehaviourTree(definition, {});

                let node = findNode(tree, "wait");
                assert.strictEqual(node.state, State.READY);

                tree.step();

                node = findNode(tree, "wait");
                assert.strictEqual(node.state, State.RUNNING);

                clock.tick(99);

                tree.step();

                node = findNode(tree, "wait");
                assert.strictEqual(node.state, State.RUNNING);

                clock.tick(1);

                tree.step();

                node = findNode(tree, "wait");
                assert.strictEqual(node.state, State.SUCCEEDED);
            });
        });

        describe("and min and max durations were defined", () => {
            describe("will select a random duration between the min and max durations and move to the SUCCEEDED state if the duration has expired", () => {
                it("(MDSL)", () => {
                    const definition = "root { wait [5000, 10000] }";
                    const tree = new BehaviourTree(definition, {});

                    let node = findNode(tree, "wait");
                    assert.strictEqual(node.state, State.READY);

                    tree.step();

                    node = findNode(tree, "wait");
                    assert.strictEqual(node.state, State.RUNNING);

                    // We have spied on Math.random to always return 0.5 for the sake of this test, so our actual duration 'should' be 7500ms.
                    clock.tick(7499);

                    tree.step();

                    node = findNode(tree, "wait");
                    assert.strictEqual(node.state, State.RUNNING);

                    clock.tick(1);

                    tree.step();

                    node = findNode(tree, "wait");
                    assert.strictEqual(node.state, State.SUCCEEDED);
                });

                it("(JSON)", () => {
                    const definition: RootNodeDefinition = {
                        type: "root",
                        child: {
                            type: "wait",
                            duration: [5000, 10000]
                        }
                    };
                    const tree = new BehaviourTree(definition, {});

                    let node = findNode(tree, "wait");
                    assert.strictEqual(node.state, State.READY);

                    tree.step();

                    node = findNode(tree, "wait");
                    assert.strictEqual(node.state, State.RUNNING);

                    // We have spied on Math.random to always return 0.5 for the sake of this test, so our actual duration 'should' be 7500ms.
                    clock.tick(7499);

                    tree.step();

                    node = findNode(tree, "wait");
                    assert.strictEqual(node.state, State.RUNNING);

                    clock.tick(1);

                    tree.step();

                    node = findNode(tree, "wait");
                    assert.strictEqual(node.state, State.SUCCEEDED);
                });
            });

            describe("will use the 'random' function to select the duration between the min and max durations if it was defined as a behaviour tree option and move to the SUCCEEDED state if the duration has expired", () => {
                it("(MDSL)", () => {
                    const definition = "root { wait [5000, 10000] }";
                    const options = {
                        // Usually this would return a new pseudo-random number each time, but for the sake of this test we
                        // just want to make sure that the number we return actually has an impact on which duration is picked.
                        random: () => 0.2
                    };
                    const tree = new BehaviourTree(definition, {}, options);

                    let node = findNode(tree, "wait");
                    assert.strictEqual(node.state, State.READY);

                    tree.step();

                    node = findNode(tree, "wait");
                    assert.strictEqual(node.state, State.RUNNING);

                    // Our 'random' function option will always return 0.2 for the sake of this test, so our actual duration 'should' be 6000ms.
                    clock.tick(5999);

                    tree.step();

                    node = findNode(tree, "wait");
                    assert.strictEqual(node.state, State.RUNNING);

                    clock.tick(1);

                    tree.step();

                    node = findNode(tree, "wait");
                    assert.strictEqual(node.state, State.SUCCEEDED);
                });

                it("(JSON)", () => {
                    const definition: RootNodeDefinition = {
                        type: "root",
                        child: {
                            type: "wait",
                            duration: [5000, 10000]
                        }
                    };
                    const options = {
                        // Usually this would return a new pseudo-random number each time, but for the sake of this test we
                        // just want to make sure that the number we return actually has an impact on which duration is picked.
                        random: () => 0.2
                    };
                    const tree = new BehaviourTree(definition, {}, options);

                    let node = findNode(tree, "wait");
                    assert.strictEqual(node.state, State.READY);

                    tree.step();

                    node = findNode(tree, "wait");
                    assert.strictEqual(node.state, State.RUNNING);

                    // Our 'random' function option will always return 0.2 for the sake of this test, so our actual duration 'should' be 6000ms.
                    clock.tick(5999);

                    tree.step();

                    node = findNode(tree, "wait");
                    assert.strictEqual(node.state, State.RUNNING);

                    clock.tick(1);

                    tree.step();

                    node = findNode(tree, "wait");
                    assert.strictEqual(node.state, State.SUCCEEDED);
                });
            });
        });

        describe("and an explicit duration or min and max durations were not defined will stay in the RUNNING state until aborted", () => {
            it("(MDSL)", () => {
                const definition = "root { wait while(CanWait) }";
                let canWait = true;
                const agent = { CanWait: () => canWait };
                const tree = new BehaviourTree(definition, agent);

                let node = findNode(tree, "wait");
                assert.strictEqual(node.state, State.READY);

                tree.step();

                node = findNode(tree, "wait");
                assert.strictEqual(node.state, State.RUNNING);

                clock.tick(1000000);

                tree.step();

                node = findNode(tree, "wait");
                assert.strictEqual(node.state, State.RUNNING);

                canWait = false;

                tree.step();

                node = findNode(tree, "wait");
                assert.strictEqual(node.state, State.FAILED);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "wait",
                        while: {
                            call: "CanWait"
                        }
                    }
                };
                let canWait = true;
                const agent = { CanWait: () => canWait };
                const tree = new BehaviourTree(definition, agent);

                let node = findNode(tree, "wait");
                assert.strictEqual(node.state, State.READY);

                tree.step();

                node = findNode(tree, "wait");
                assert.strictEqual(node.state, State.RUNNING);

                clock.tick(1000000);

                tree.step();

                node = findNode(tree, "wait");
                assert.strictEqual(node.state, State.RUNNING);

                canWait = false;

                tree.step();

                node = findNode(tree, "wait");
                assert.strictEqual(node.state, State.FAILED);
            });
        });

        describe("will use the 'getDeltaTime' function to update the elapsed duration if it was defined as a behaviour tree option", () => {
            it("(MDSL)", () => {
                const definition = "root { wait [1000] }";
                const tree = new BehaviourTree(definition, {}, { getDeltaTime: () => 0.5 });

                let node = findNode(tree, "wait");
                assert.strictEqual(node.state, State.READY);

                tree.step();

                node = findNode(tree, "wait");
                assert.strictEqual(node.state, State.RUNNING);

                tree.step();

                node = findNode(tree, "wait");
                assert.strictEqual(node.state, State.SUCCEEDED);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "wait",
                        duration: 1000
                    }
                };
                const tree = new BehaviourTree(definition, {}, { getDeltaTime: () => 0.5 });

                let node = findNode(tree, "wait");
                assert.strictEqual(node.state, State.READY);

                tree.step();

                node = findNode(tree, "wait");
                assert.strictEqual(node.state, State.RUNNING);

                tree.step();

                node = findNode(tree, "wait");
                assert.strictEqual(node.state, State.SUCCEEDED);
            });
        });
    });
});
