import { assert } from "chai";

import { BehaviourTree, State } from "../../../src/index";
import { RootNodeDefinition } from "../../../src/BehaviourTreeDefinition";

import { findNode } from "../../TestUtilities";

describe("An All node", () => {
    describe("on tree initialisation", () => {
        describe("will error if the node does not have at least one child", () => {
            it("(MDSL)", () => {
                const definition = "root { all {} }";
                assert.throws(
                    () => new BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: a all node must have at least a single child"
                );
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "all",
                        children: []
                    }
                };
                assert.throws(
                    () => new BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: expected non-empty 'children' array to be defined for all node at depth '1'"
                );
            });
        });
    });

    describe("when updated as part of a tree step will", () => {
        describe("update each child node concurrently", () => {
            it("(MDSL)", () => {
                const definition = "root { all { action [actionRunning1] action [actionRunning2] } }";
                const agent = {
                    actionRunning1: () => State.RUNNING,
                    actionRunning2: () => State.RUNNING
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "all").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionRunning1").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionRunning2").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "all").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "actionRunning1").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "actionRunning2").state, State.RUNNING);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "all",
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
                    actionRunning1: () => State.RUNNING,
                    actionRunning2: () => State.RUNNING
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "all").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionRunning1").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionRunning2").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "all").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "actionRunning1").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "actionRunning2").state, State.RUNNING);
            });
        });

        describe("move to the SUCCEEDED state if all child nodes move to either the SUCCEEDED or FAILED state and at least one child is in the SUCCEEDED state", () => {
            it("(MDSL)", () => {
                const definition = "root { all { action [action1] action [action2] action [action3] } }";
                const agent = {
                    action1: () => State.RUNNING,
                    action2: () => State.RUNNING,
                    action3: () => State.RUNNING
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "all").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "all").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.RUNNING);

                agent.action1 = () => State.SUCCEEDED;

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "all").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.RUNNING);

                agent.action2 = () => State.FAILED;

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "all").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.RUNNING);

                agent.action3 = () => State.FAILED;

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "all").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.FAILED);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "all",
                        children: [
                            {
                                type: "action",
                                call: "action1"
                            },
                            {
                                type: "action",
                                call: "action2"
                            },
                            {
                                type: "action",
                                call: "action3"
                            }
                        ]
                    }
                };
                const agent = {
                    action1: () => State.RUNNING,
                    action2: () => State.RUNNING,
                    action3: () => State.RUNNING
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "all").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "all").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.RUNNING);

                agent.action1 = () => State.SUCCEEDED;

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "all").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.RUNNING);

                agent.action2 = () => State.FAILED;

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "all").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.RUNNING);

                agent.action3 = () => State.FAILED;

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "all").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.FAILED);
            });
        });

        describe("move to the FAILED state if all child nodes move to either the SUCCEEDED or FAILED state and all child nodes are in the FAILED state", () => {
            it("(MDSL)", () => {
                const definition = "root { all { action [action1] action [action2] action [action3] } }";
                const agent = {
                    action1: () => State.RUNNING,
                    action2: () => State.RUNNING,
                    action3: () => State.RUNNING
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "all").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "all").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.RUNNING);

                agent.action1 = () => State.FAILED;

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "all").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.RUNNING);

                agent.action2 = () => State.FAILED;

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "all").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.RUNNING);

                agent.action3 = () => State.FAILED;

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.FAILED);
                assert.strictEqual(findNode(tree, "all").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.FAILED);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "all",
                        children: [
                            {
                                type: "action",
                                call: "action1"
                            },
                            {
                                type: "action",
                                call: "action2"
                            },
                            {
                                type: "action",
                                call: "action3"
                            }
                        ]
                    }
                };
                const agent = {
                    action1: () => State.RUNNING,
                    action2: () => State.RUNNING,
                    action3: () => State.RUNNING
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "all").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "all").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.RUNNING);

                agent.action1 = () => State.FAILED;

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "all").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.RUNNING);

                agent.action2 = () => State.FAILED;

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "all").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.RUNNING);

                agent.action3 = () => State.FAILED;

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.FAILED);
                assert.strictEqual(findNode(tree, "all").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.FAILED);
            });
        });

        describe("move to the RUNNING state if any child nodes are in the RUNNING state", () => {
            it("(MDSL)", () => {
                const definition = "root { all { action [action1] action [action2] action [action3] } }";
                const agent = {
                    action1: () => State.RUNNING,
                    action2: () => State.RUNNING,
                    action3: () => State.RUNNING
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "all").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "all").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.RUNNING);

                agent.action1 = () => State.SUCCEEDED;

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "all").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.RUNNING);

                agent.action2 = () => State.FAILED;

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "all").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.RUNNING);

                agent.action3 = () => State.SUCCEEDED;

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "all").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.SUCCEEDED);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "all",
                        children: [
                            {
                                type: "action",
                                call: "action1"
                            },
                            {
                                type: "action",
                                call: "action2"
                            },
                            {
                                type: "action",
                                call: "action3"
                            }
                        ]
                    }
                };
                const agent = {
                    action1: () => State.RUNNING,
                    action2: () => State.RUNNING,
                    action3: () => State.RUNNING
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "all").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "all").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.RUNNING);

                agent.action1 = () => State.SUCCEEDED;

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "all").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.RUNNING);

                agent.action2 = () => State.FAILED;

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "all").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.RUNNING);

                agent.action3 = () => State.SUCCEEDED;

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "all").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "action1").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "action2").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "action3").state, State.SUCCEEDED);
            });
        });
    });
});
