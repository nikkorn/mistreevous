import { assert } from "chai";

import { BehaviourTree, State } from "../../../src/index";
import { RootNodeDefinition } from "../../../src/BehaviourTreeDefinition";

import { findNode } from "../../TestUtilities";

describe("A Selector node", () => {
    describe("on tree initialisation", () => {
        describe("will error if the node does not have at least one child", () => {
            it("(MDSL)", () => {
                const definition = "root { selector {} }";
                assert.throws(
                    () => new BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: a selector node must have at least a single child"
                );
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "selector",
                        children: []
                    }
                };
                assert.throws(
                    () => new BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: expected non-empty 'children' array to be defined for selector node at depth '1'"
                );
            });
        });
    });

    describe("when updated as part of a tree step will", () => {
        describe("move to the FAILED state if all child nodes move to the FAILED state", () => {
            it("(MDSL)", () => {
                const definition = "root { selector { action [actionFail1] action [actionFail2] } }";
                const agent = {
                    actionFail1: () => State.FAILED,
                    actionFail2: () => State.FAILED
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "selector").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionFail1").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionFail2").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.FAILED);
                assert.strictEqual(findNode(tree, "selector").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "actionFail1").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "actionFail2").state, State.FAILED);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "selector",
                        children: [
                            {
                                type: "action",
                                call: "actionFail1"
                            },
                            {
                                type: "action",
                                call: "actionFail2"
                            }
                        ]
                    }
                };
                const agent = {
                    actionFail1: () => State.FAILED,
                    actionFail2: () => State.FAILED
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "selector").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionFail1").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionFail2").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.FAILED);
                assert.strictEqual(findNode(tree, "selector").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "actionFail1").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "actionFail2").state, State.FAILED);
            });
        });

        describe("move to the SUCCEEDED state if any child node moves to the SUCCEEDED state", () => {
            it("(MDSL)", () => {
                const definition =
                    "root { selector { action [actionFail] action [actionSucceed1] action [actionSucceed2] } }";
                const agent = {
                    actionSucceed1: () => State.SUCCEEDED,
                    actionSucceed2: () => State.SUCCEEDED,
                    actionFail: () => State.FAILED
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "selector").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionFail").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionSucceed1").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionSucceed2").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "selector").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "actionFail").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "actionSucceed1").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "actionSucceed2").state, State.READY);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "selector",
                        children: [
                            {
                                type: "action",
                                call: "actionFail"
                            },
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
                    actionSucceed2: () => State.SUCCEEDED,
                    actionFail: () => State.FAILED
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "selector").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionFail").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionSucceed1").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionSucceed2").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "selector").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "actionFail").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "actionSucceed1").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action", "actionSucceed2").state, State.READY);
            });
        });

        describe("move to the RUNNING state if any child node is in the RUNNING state", () => {
            it("(MDSL)", () => {
                const definition =
                    "root { selector { action [actionFail] action [actionRunning] action [actionSucceed] } }";
                const agent = {
                    actionSucceed: () => State.SUCCEEDED,
                    actionRunning: () => State.RUNNING,
                    actionFail: () => State.FAILED
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "selector").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionFail").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionRunning").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionSucceed").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "selector").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "actionFail").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "actionRunning").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "actionSucceed").state, State.READY);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "selector",
                        children: [
                            {
                                type: "action",
                                call: "actionFail"
                            },
                            {
                                type: "action",
                                call: "actionRunning"
                            },
                            {
                                type: "action",
                                call: "actionSucceed"
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
                assert.strictEqual(findNode(tree, "selector").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionFail").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionRunning").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionSucceed").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "selector").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "actionFail").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "actionRunning").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "actionSucceed").state, State.READY);
            });
        });
    });
});
