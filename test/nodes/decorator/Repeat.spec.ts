import { assert } from "chai";
import sinon, { SinonSandbox } from "sinon";

import { BehaviourTree, State } from "../../../src/index";
import { RootNodeDefinition } from "../../../src/BehaviourTreeDefinition";
import { Agent } from "../../../src/Agent";

import { findNode } from "../../TestUtilities";

describe("A Repeat node", () => {
    describe("on tree initialisation", () => {
        describe("will error if the node does not have a single child", () => {
            it("(MDSL)", () => {
                const definition = "root { repeat {} }";
                assert.throws(
                    () => new BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: a repeat node must have a single child"
                );
            });

            it("(JSON)", () => {
                const definition = {
                    type: "root",
                    child: {
                        type: "repeat"
                    }
                } as any;
                assert.throws(
                    () => new BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: expected property 'child' to be defined for repeat node at depth '1'"
                );
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

        describe("will move to the FAILED state if the child node moves to the FAILED state", () => {
            it("(MDSL)", () => {
                const definition = "root { repeat { condition [someCondition] } }";
                const agent = { someCondition: () => false };
                const tree = new BehaviourTree(definition, agent);

                let node = findNode(tree, "repeat", "REPEAT");
                assert.exists(node);
                assert.strictEqual(node.state, State.READY);

                tree.step();

                node = findNode(tree, "repeat", "REPEAT");
                assert.strictEqual(node.state, State.FAILED);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "repeat",
                        child: {
                            type: "condition",
                            call: "someCondition"
                        }
                    }
                };
                const agent = { someCondition: () => false };
                const tree = new BehaviourTree(definition, agent);

                let node = findNode(tree, "repeat", "REPEAT");
                assert.exists(node);
                assert.strictEqual(node.state, State.READY);

                tree.step();

                node = findNode(tree, "repeat", "REPEAT");
                assert.strictEqual(node.state, State.FAILED);
            });
        });

        describe("will move to the RUNNING state if the child node moves to the SUCCEEDED state", () => {
            it("(MDSL)", () => {
                const definition = "root { repeat { condition [someCondition] } }";
                const agent = { someCondition: () => true };
                const tree = new BehaviourTree(definition, agent);

                let node = findNode(tree, "repeat", "REPEAT");
                assert.exists(node);
                assert.strictEqual(node.state, State.READY);

                tree.step();

                node = findNode(tree, "repeat", "REPEAT");
                assert.strictEqual(node.state, State.RUNNING);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "repeat",
                        child: {
                            type: "condition",
                            call: "someCondition"
                        }
                    }
                };
                const agent = { someCondition: () => true };
                const tree = new BehaviourTree(definition, agent);

                let node = findNode(tree, "repeat", "REPEAT");
                assert.exists(node);
                assert.strictEqual(node.state, State.READY);

                tree.step();

                node = findNode(tree, "repeat", "REPEAT");
                assert.strictEqual(node.state, State.RUNNING);
            });
        });

        describe("and an iteration count node argument is defined will attempt to re-run the child node until the iteration count is reached", () => {
            it("(MDSL)", () => {
                const definition = "root { repeat [3] { condition [someCondition] } }";
                const agent = { someCondition: () => true };
                const tree = new BehaviourTree(definition, agent);

                let node = findNode(tree, "repeat", "REPEAT 3x");
                assert.exists(node);
                assert.strictEqual(node.state, State.READY);

                tree.step();

                node = findNode(tree, "repeat", "REPEAT 3x");
                assert.strictEqual(node.state, State.RUNNING);

                tree.step();

                node = findNode(tree, "repeat", "REPEAT 3x");
                assert.strictEqual(node.state, State.RUNNING);

                tree.step();

                node = findNode(tree, "repeat", "REPEAT 3x");
                assert.strictEqual(node.state, State.RUNNING);

                tree.step();

                node = findNode(tree, "repeat", "REPEAT 3x");
                assert.strictEqual(node.state, State.SUCCEEDED);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "repeat",
                        iterations: 3,
                        child: {
                            type: "condition",
                            call: "someCondition"
                        }
                    }
                };
                const agent = { someCondition: () => true };
                const tree = new BehaviourTree(definition, agent);

                let node = findNode(tree, "repeat", "REPEAT 3x");
                assert.exists(node);
                assert.strictEqual(node.state, State.READY);

                tree.step();

                node = findNode(tree, "repeat", "REPEAT 3x");
                assert.strictEqual(node.state, State.RUNNING);

                tree.step();

                node = findNode(tree, "repeat", "REPEAT 3x");
                assert.strictEqual(node.state, State.RUNNING);

                tree.step();

                node = findNode(tree, "repeat", "REPEAT 3x");
                assert.strictEqual(node.state, State.RUNNING);

                tree.step();

                node = findNode(tree, "repeat", "REPEAT 3x");
                assert.strictEqual(node.state, State.SUCCEEDED);
            });
        });

        describe("and minumum and maximum iteration count node arguments are defined", () => {
            describe("and if the 'random' behaviour tree option is not defined will pick an iteration count from between the minimum and maximum bounds using Math.random", () => {
                it("(MDSL)", () => {
                    // We have spied on Math.random to always return 0.5 for the sake of this test, so our iteration count should always be 4.
                    const definition = "root { repeat [2, 6] { condition [someCondition] } }";
                    const agent = { someCondition: () => true };
                    const tree = new BehaviourTree(definition, agent);

                    let node = findNode(tree, "repeat", "REPEAT 2x-6x");
                    assert.exists(node);
                    assert.strictEqual(node.state, State.READY);

                    tree.step();

                    node = findNode(tree, "repeat", "REPEAT 2x-6x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "repeat", "REPEAT 2x-6x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "repeat", "REPEAT 2x-6x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "repeat", "REPEAT 2x-6x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "repeat", "REPEAT 2x-6x");
                    assert.strictEqual(node.state, State.SUCCEEDED);
                });

                it("(JSON)", () => {
                    // We have spied on Math.random to always return 0.5 for the sake of this test, so our iteration count should always be 4.
                    const definition: RootNodeDefinition = {
                        type: "root",
                        child: {
                            type: "repeat",
                            iterations: [2, 6],
                            child: {
                                type: "condition",
                                call: "someCondition"
                            }
                        }
                    };
                    const agent = { someCondition: () => true };
                    const tree = new BehaviourTree(definition, agent);

                    let node = findNode(tree, "repeat", "REPEAT 2x-6x");
                    assert.exists(node);
                    assert.strictEqual(node.state, State.READY);

                    tree.step();

                    node = findNode(tree, "repeat", "REPEAT 2x-6x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "repeat", "REPEAT 2x-6x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "repeat", "REPEAT 2x-6x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "repeat", "REPEAT 2x-6x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "repeat", "REPEAT 2x-6x");
                    assert.strictEqual(node.state, State.SUCCEEDED);
                });
            });

            describe("and if the 'random' behaviour tree option is defined will use it to pick an iteration count from between the minimum and maximum bounds", () => {
                it("(MDSL)", () => {
                    const definition = "root { repeat [2, 10] { condition [someCondition] } }";
                    const agent = { someCondition: () => true };
                    const options = {
                        // Usually this would return a new pseudo-random number each time, but for the sake of this test we
                        // just want to make sure that the number we return actually has an impact on the iteration count picked.
                        // A value of 0.2 should always result in an iteration count of 3.
                        random: () => 0.2
                    };
                    const tree = new BehaviourTree(definition, agent, options);

                    let node = findNode(tree, "repeat", "REPEAT 2x-10x");
                    assert.exists(node);
                    assert.strictEqual(node.state, State.READY);

                    tree.step();

                    node = findNode(tree, "repeat", "REPEAT 2x-10x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "repeat", "REPEAT 2x-10x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "repeat", "REPEAT 2x-10x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "repeat", "REPEAT 2x-10x");
                    assert.strictEqual(node.state, State.SUCCEEDED);
                });

                it("(JSON)", () => {
                    const definition: RootNodeDefinition = {
                        type: "root",
                        child: {
                            type: "repeat",
                            iterations: [2, 10],
                            child: {
                                type: "condition",
                                call: "someCondition"
                            }
                        }
                    };
                    const agent = { someCondition: () => true };
                    const options = {
                        // Usually this would return a new pseudo-random number each time, but for the sake of this test we
                        // just want to make sure that the number we return actually has an impact on the iteration count picked.
                        // A value of 0.2 should always result in an iteration count of 3.
                        random: () => 0.2
                    };
                    const tree = new BehaviourTree(definition, agent, options);

                    let node = findNode(tree, "repeat", "REPEAT 2x-10x");
                    assert.exists(node);
                    assert.strictEqual(node.state, State.READY);

                    tree.step();

                    node = findNode(tree, "repeat", "REPEAT 2x-10x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "repeat", "REPEAT 2x-10x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "repeat", "REPEAT 2x-10x");
                    assert.strictEqual(node.state, State.RUNNING);

                    tree.step();

                    node = findNode(tree, "repeat", "REPEAT 2x-10x");
                    assert.strictEqual(node.state, State.SUCCEEDED);
                });
            });
        });
    });
});
