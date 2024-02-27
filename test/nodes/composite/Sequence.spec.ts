import { assert } from "chai";

import { BehaviourTree, State } from "../../../src/index";
import { RootNodeDefinition } from "../../../src/BehaviourTreeDefinition";

import { findNode } from "../../TestUtilities";

describe("A Sequence node", () => {
    describe("on tree initialisation", () => {
        describe("will error if the node does not have at least one child", () => {
            it("(MDSL)", () => {
                const definition = "root { sequence {} }";
                assert.throws(
                    () => new BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: a sequence node must have at least a single child"
                );
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "sequence",
                        children: []
                    }
                };
                assert.throws(
                    () => new BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: expected non-empty 'children' array to be defined for sequence node at depth '1'"
                );
            });
        });
    });

    describe("when updated as part of a tree step will", () => {
        describe("move to the FAILED state if any child node moves to the FAILED state", () => {
            it("(MDSL)", () => {
                const definition = "root { sequence { action [actionFail] action [actionSucceed] } }";
                const agent = {
                    actionFail: () => State.FAILED,
                    actionSucceed: () => State.SUCCEEDED
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "sequence").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionFail").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionSucceed").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.FAILED);
                assert.strictEqual(findNode(tree, "sequence").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "actionFail").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "actionSucceed").state, State.READY);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "sequence",
                        children: [
                            {
                                type: "action",
                                call: "actionFail"
                            },
                            {
                                type: "action",
                                call: "actionSucceed"
                            }
                        ]
                    }
                };
                const agent = {
                    actionFail: () => State.FAILED,
                    actionSucceed: () => State.SUCCEEDED
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "sequence").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionFail").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionSucceed").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.FAILED);
                assert.strictEqual(findNode(tree, "sequence").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "actionFail").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "actionSucceed").state, State.READY);
            });
        });

        describe("move to the SUCCEEDED state if all child nodes move to the SUCCEEDED state", () => {
            it("(MDSL)", () => {
                const definition = "root { sequence { action [actionSucceed1] action [actionSucceed2] } }";
                const agent = {
                    actionSucceed1: () => State.SUCCEEDED,
                    actionSucceed2: () => State.SUCCEEDED
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "sequence").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionSucceed1").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionSucceed2").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "sequence").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "actionSucceed1").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "actionSucceed2").state, State.SUCCEEDED);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "sequence",
                        children: [
                            {
                                type: "action",
                                call: "actionSucceed1"
                            },
                            {
                                type: "action",
                                call: "actionSucceed2"
                            }
                        ]
                    }
                };
                const agent = {
                    actionSucceed1: () => State.SUCCEEDED,
                    actionSucceed2: () => State.SUCCEEDED
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "sequence").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionSucceed1").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionSucceed2").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "sequence").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "actionSucceed1").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "actionSucceed2").state, State.SUCCEEDED);
            });
        });

        describe("move to the RUNNING state if any child node is in the RUNNING state", () => {
            it("(MDSL)", () => {
                const definition =
                    "root { sequence { action [actionSucceed] action [actionRunning] action [actionFail] } }";
                const agent = {
                    actionSucceed: () => State.SUCCEEDED,
                    actionRunning: () => State.RUNNING,
                    actionFail: () => State.FAILED
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "sequence").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionSucceed").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionRunning").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionFail").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "sequence").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "actionSucceed").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "actionRunning").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "actionFail").state, State.READY);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "sequence",
                        children: [
                            {
                                type: "action",
                                call: "actionSucceed"
                            },
                            {
                                type: "action",
                                call: "actionRunning"
                            },
                            {
                                type: "action",
                                call: "actionFail"
                            }
                        ]
                    }
                };
                const agent = {
                    actionSucceed: () => State.SUCCEEDED,
                    actionRunning: () => State.RUNNING,
                    actionFail: () => State.FAILED
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "sequence").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionSucceed").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionRunning").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionFail").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "sequence").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "actionSucceed").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "actionRunning").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "actionFail").state, State.READY);
            });
        });
    });
});
