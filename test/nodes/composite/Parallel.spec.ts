import { assert } from "chai";

import { BehaviourTree, State } from "../../../src/index";
import { RootNodeDefinition } from "../../../src/BehaviourTreeDefinition";

import { findNode } from "../../TestUtilities";

describe("A Parallel node", () => {
    describe("on tree initialisation", () => {
        describe("will error if the node does not have at least one child", () => {
            it("(MDSL)", () => {
                const definition = "root { parallel {} }";
                assert.throws(
                    () => new BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: a parallel node must have at least a single child"
                );
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "parallel",
                        children: []
                    }
                };
                assert.throws(
                    () => new BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: expected non-empty 'children' array to be defined for parallel node at depth '1'"
                );
            });
        });
    });

    describe("when updated as part of a tree step will", () => {
        describe("update each child node concurrently", () => {
            it("(MDSL)", () => {
                const definition = "root { parallel { action [actionRunning1] action [actionRunning2] } }";
                const agent = {
                    actionRunning1: () => {},
                    actionRunning2: () => {}
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "parallel").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionRunning1").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionRunning2").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "parallel").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "actionRunning1").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "actionRunning2").state, State.RUNNING);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "parallel",
                        children: [
                            {
                                type: "action",
                                call: "actionRunning1"
                            },
                            {
                                type: "action",
                                call: "actionRunning2"
                            }
                        ]
                    }
                };
                const agent = {
                    actionRunning1: () => {},
                    actionRunning2: () => {}
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "parallel").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionRunning1").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionRunning2").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "parallel").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "actionRunning1").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "actionRunning2").state, State.RUNNING);
            });
        });

        describe("move to the FAILED state if any child node moves to the FAILED state", () => {
            it("(MDSL)", () => {
                const definition = "root { parallel { action [action1] action [action2] } }";
                const agent = {
                    action1: () => {},
                    action2: () => {}
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "parallel").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "parallel").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.RUNNING);

                agent.action2 = () => State.FAILED;

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.FAILED);
                assert.strictEqual(findNode(tree, "parallel").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.FAILED);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "parallel",
                        children: [
                            {
                                type: "action",
                                call: "action1"
                            },
                            {
                                type: "action",
                                call: "action2"
                            }
                        ]
                    }
                };
                const agent = {
                    action1: () => {},
                    action2: () => {}
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "parallel").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "parallel").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.RUNNING);

                agent.action2 = () => State.FAILED;

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.FAILED);
                assert.strictEqual(findNode(tree, "parallel").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.FAILED);
            });
        });

        describe("move to the SUCCEEDED state if any child node moves to the SUCCEEDED state", () => {
            it("(MDSL)", () => {
                const definition = "root { parallel { action [action1] action [action2] } }";
                const agent = {
                    action1: () => {},
                    action2: () => {}
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "parallel").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "parallel").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.RUNNING);

                agent.action1 = () => State.SUCCEEDED;

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "parallel").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.RUNNING);

                agent.action2 = () => State.SUCCEEDED;

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "parallel").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.SUCCEEDED);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "parallel",
                        children: [
                            {
                                type: "action",
                                call: "action1"
                            },
                            {
                                type: "action",
                                call: "action2"
                            }
                        ]
                    }
                };
                const agent = {
                    action1: () => {},
                    action2: () => {}
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "parallel").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "parallel").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.RUNNING);

                agent.action1 = () => State.SUCCEEDED;

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "parallel").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.RUNNING);

                agent.action2 = () => State.SUCCEEDED;

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "parallel").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.SUCCEEDED);
            });
        });
    });
});
