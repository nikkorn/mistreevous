import { assert } from "chai";
import sinon, { SinonSandbox } from "sinon";

import { BehaviourTree, State } from "../../../src/index";
import { RootNodeDefinition } from "../../../src/BehaviourTreeDefinition";
import { Agent } from "../../../src/Agent";

import { findNode } from "../../TestUtilities";

describe("A Retry node", () => {
    describe("on tree initialisation", () => {
        describe("will error if", () => {
            describe("the node does not have a single child", () => {
                it("(MDSL)", () => {
                    const definition = "root { retry {} }";
                    assert.throws(
                        () => new BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: a retry node must have a single child"
                    );
                });

                it("(JSON)", () => {
                    const definition = {
                        type: "root",
                        child: {
                            type: "retry"
                        }
                    } as any;
                    assert.throws(
                        () => new BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: expected property 'child' to be defined for retry node at depth '1'"
                    );
                });
            });

            describe("the defined node arguments are not integers", () => {
                it("(MDSL)", () => {
                    const definition = "root { retry ['not', 'integers'] { condition [someCondition] } }";
                    assert.throws(
                        () => new BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: retry node attempt counts must be integer values"
                    );
                });

                it("(JSON)", () => {
                    const definition = {
                        type: "root",
                        child: {
                            type: "retry",
                            attempts: ["not", "integers"],
                            child: {
                                type: "condition",
                                call: "someCondition"
                            }
                        }
                    } as any;
                    assert.throws(
                        () => new BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: expected array containing two integer values for 'attempts' property if defined for retry node at depth '1'"
                    );
                });
            });

            describe("a negative attempts count node argument was defined", () => {
                it("(MDSL)", () => {
                    const definition = "root { retry [-1] { condition [someCondition] } }";
                    assert.throws(
                        () => new BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: a retry node must have a positive number of attempts if defined"
                    );
                });

                it("(JSON)", () => {
                    const definition = {
                        type: "root",
                        child: {
                            type: "retry",
                            attempts: -1,
                            child: {
                                type: "condition",
                                call: "someCondition"
                            }
                        }
                    } as any;
                    assert.throws(
                        () => new BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: expected positive attempts count for 'attempts' property if defined for retry node at depth '1'"
                    );
                });
            });

            describe("more than two node arguments are defined", () => {
                it("(MDSL)", () => {
                    const definition = "root { retry [0, 10, 20] { condition [someCondition] } }";
                    assert.throws(
                        () => new BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: invalid number of retry node attempt count arguments defined"
                    );
                });

                it("(JSON)", () => {
                    const definition = {
                        type: "root",
                        child: {
                            type: "retry",
                            attempts: [0, 10, 20],
                            child: {
                                type: "condition",
                                call: "someCondition"
                            }
                        }
                    } as any;
                    assert.throws(
                        () => new BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: expected array containing two integer values for 'attempts' property if defined for retry node at depth '1'"
                    );
                });
            });

            describe("a minimum iteration count node argument is defined that is greater than the maximum iteration count node argument", () => {
                it("(MDSL)", () => {
                    const definition = "root { retry [10, 5] { condition [someCondition] } }";
                    assert.throws(
                        () => new BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: a retry node must not have a minimum attempt count that exceeds the maximum attempt count"
                    );
                });

                it("(JSON)", () => {
                    const definition = {
                        type: "root",
                        child: {
                            type: "retry",
                            attempts: [10, 5],
                            child: {
                                type: "condition",
                                call: "someCondition"
                            }
                        }
                    } as any;
                    assert.throws(
                        () => new BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: expected minimum attempts count that does not exceed the maximum attempts count for 'attempts' property if defined for retry node at depth '1'"
                    );
                });
            });
        });
    });

    describe("when updated as part of a tree step", () => {
        var sandbox: SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
            sandbox.replace(globalThis.Math, "random", () => 0.5);
        });

        afterEach(() => sandbox.restore());

        describe("will move to the SUCCEEDED state if the child node moves to the SUCCEEDED state", () => {
            it("(MDSL)", () => {
                const definition = "root { retry { condition [someCondition] } }";
                const agent = { someCondition: () => true };
                const tree = new BehaviourTree(definition, agent);

                let node = findNode(tree, "retry", "RETRY");
                assert.exists(node);
                assert.strictEqual(node.state, State.READY);

                tree.step();

                node = findNode(tree, "retry", "RETRY");
                assert.strictEqual(node.state, State.SUCCEEDED);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "retry",
                        child: {
                            type: "condition",
                            call: "someCondition"
                        }
                    }
                };
                const agent = { someCondition: () => true };
                const tree = new BehaviourTree(definition, agent);

                let node = findNode(tree, "retry", "RETRY");
                assert.exists(node);
                assert.strictEqual(node.state, State.READY);

                tree.step();

                node = findNode(tree, "retry", "RETRY");
                assert.strictEqual(node.state, State.SUCCEEDED);
            });
        });

        describe("will move to the RUNNING state if the child node moves to the FAILED state", () => {
            it("(MDSL)", () => {
                const definition = "root { retry { condition [someCondition] } }";
                const agent = { someCondition: () => false };
                const tree = new BehaviourTree(definition, agent);

                let node = findNode(tree, "retry", "RETRY");
                assert.exists(node);
                assert.strictEqual(node.state, State.READY);

                tree.step();

                node = findNode(tree, "retry", "RETRY");
                assert.strictEqual(node.state, State.RUNNING);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "retry",
                        child: {
                            type: "condition",
                            call: "someCondition"
                        }
                    }
                };
                const agent = { someCondition: () => false };
                const tree = new BehaviourTree(definition, agent);

                let node = findNode(tree, "retry", "RETRY");
                assert.exists(node);
                assert.strictEqual(node.state, State.READY);

                tree.step();

                node = findNode(tree, "retry", "RETRY");
                assert.strictEqual(node.state, State.RUNNING);
            });
        });

        describe("and an attempt count node argument is defined will attempt to re-run the child node until the attempt count is reached", () => {
            it("(MDSL)", () => {
                const definition = "root { retry [3] { condition [someCondition] } }";
                const agent = { someCondition: () => false };
                const tree = new BehaviourTree(definition, agent);

                let node = findNode(tree, "retry", "RETRY 3x");
                assert.exists(node);
                assert.strictEqual(node.state, State.READY);

                tree.step();

                node = findNode(tree, "retry", "RETRY 3x");
                assert.strictEqual(node.state, State.RUNNING);

                tree.step();

                node = findNode(tree, "retry", "RETRY 3x");
                assert.strictEqual(node.state, State.RUNNING);

                tree.step();

                node = findNode(tree, "retry", "RETRY 3x");
                assert.strictEqual(node.state, State.RUNNING);

                tree.step();

                node = findNode(tree, "retry", "RETRY 3x");
                assert.strictEqual(node.state, State.FAILED);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "retry",
                        attempts: 3,
                        child: {
                            type: "condition",
                            call: "someCondition"
                        }
                    }
                };
                const agent = { someCondition: () => false };
                const tree = new BehaviourTree(definition, agent);

                let node = findNode(tree, "retry", "RETRY 3x");
                assert.exists(node);
                assert.strictEqual(node.state, State.READY);

                tree.step();

                node = findNode(tree, "retry", "RETRY 3x");
                assert.strictEqual(node.state, State.RUNNING);

                tree.step();

                node = findNode(tree, "retry", "RETRY 3x");
                assert.strictEqual(node.state, State.RUNNING);

                tree.step();

                node = findNode(tree, "retry", "RETRY 3x");
                assert.strictEqual(node.state, State.RUNNING);

                tree.step();

                node = findNode(tree, "retry", "RETRY 3x");
                assert.strictEqual(node.state, State.FAILED);
            });
        });

        describe("and minumum and maximum attempt count node arguments are defined", () => {
            describe("and if the 'random' behaviour tree option is not defined will pick an attempt count from between the minimum and maximum bounds using Math.random", () => {
                it("(MDSL)", () => {
                    // We have spied on Math.random to always return 0.5 for the sake of this test, so our attempt count should always be 4.
                    const definition = "root { retry [2, 6] { condition [someCondition] } }";
                    const agent = { someCondition: () => false };
                    const tree = new BehaviourTree(definition, agent);

                    let node = findNode(tree, "retry", "RETRY 2x-6x");
                    assert.exists(node);
                    assert.strictEqual(node.state, State.READY);

                    tree.step();

                    node = findNode(tree, "retry", "RETRY 2x-6x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "retry", "RETRY 2x-6x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "retry", "RETRY 2x-6x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "retry", "RETRY 2x-6x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "retry", "RETRY 2x-6x");
                    assert.strictEqual(node.state, State.FAILED);
                });

                it("(JSON)", () => {
                    // We have spied on Math.random to always return 0.5 for the sake of this test, so our attempt count should always be 4.
                    const definition: RootNodeDefinition = {
                        type: "root",
                        child: {
                            type: "retry",
                            attempts: [2, 6],
                            child: {
                                type: "condition",
                                call: "someCondition"
                            }
                        }
                    };
                    const agent = { someCondition: () => false };
                    const tree = new BehaviourTree(definition, agent);

                    let node = findNode(tree, "retry", "RETRY 2x-6x");
                    assert.exists(node);
                    assert.strictEqual(node.state, State.READY);

                    tree.step();

                    node = findNode(tree, "retry", "RETRY 2x-6x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "retry", "RETRY 2x-6x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "retry", "RETRY 2x-6x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "retry", "RETRY 2x-6x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "retry", "RETRY 2x-6x");
                    assert.strictEqual(node.state, State.FAILED);
                });
            });

            describe("and if the 'random' behaviour tree option is defined will use it to pick an attempt count from between the minimum and maximum bounds", () => {
                it("(MDSL)", () => {
                    const definition = "root { retry [2, 10] { condition [someCondition] } }";
                    const agent = { someCondition: () => false };
                    const options = {
                        // Usually this would return a new pseudo-random number each time, but for the sake of this test we
                        // just want to make sure that the number we return actually has an impact on the attempt count picked.
                        // A value of 0.2 should always result in an attempt count of 3.
                        random: () => 0.2
                    };
                    const tree = new BehaviourTree(definition, agent, options);

                    let node = findNode(tree, "retry", "RETRY 2x-10x");
                    assert.exists(node);
                    assert.strictEqual(node.state, State.READY);

                    tree.step();

                    node = findNode(tree, "retry", "RETRY 2x-10x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "retry", "RETRY 2x-10x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "retry", "RETRY 2x-10x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "retry", "RETRY 2x-10x");
                    assert.strictEqual(node.state, State.FAILED);
                });

                it("(JSON)", () => {
                    const definition: RootNodeDefinition = {
                        type: "root",
                        child: {
                            type: "retry",
                            attempts: [2, 10],
                            child: {
                                type: "condition",
                                call: "someCondition"
                            }
                        }
                    };
                    const agent = { someCondition: () => false };
                    const options = {
                        // Usually this would return a new pseudo-random number each time, but for the sake of this test we
                        // just want to make sure that the number we return actually has an impact on the attempt count picked.
                        // A value of 0.2 should always result in an attempt count of 3.
                        random: () => 0.2
                    };
                    const tree = new BehaviourTree(definition, agent, options);

                    let node = findNode(tree, "retry", "RETRY 2x-10x");
                    assert.exists(node);
                    assert.strictEqual(node.state, State.READY);

                    tree.step();

                    node = findNode(tree, "retry", "RETRY 2x-10x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "retry", "RETRY 2x-10x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "retry", "RETRY 2x-10x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "retry", "RETRY 2x-10x");
                    assert.strictEqual(node.state, State.FAILED);
                });
            });
        });
    });
});
