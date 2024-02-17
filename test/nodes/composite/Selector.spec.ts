import { assert } from "chai";

import { BehaviourTree, State } from "../../../src/index";
import { RootNodeDefinition } from "../../../src/BehaviourTreeDefinition";
import { Agent } from "../../../src/Agent";

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
        describe("move to the FAILED state if all child nodes move to the FAILED state", () => {});

        describe("move to the SUCCEEDED state if any child node moves to the SUCCEEDED state", () => {});

        describe("move to the RUNNING state if any child node is in the RUNNING state", () => {
            it("(MDSL)", () => {
                const definition =
                    "root { selector { action [actionFail] action [actionRunning] action [actionSucceed] } }";
                const agent: Agent = {
                    actionSucceed: () => State.SUCCEEDED,
                    actionRunning: () => {},
                    actionFail: () => State.FAILED
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root", "ROOT").state, State.READY);
                assert.strictEqual(findNode(tree, "selector", "SELECTOR").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionFail").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionRunning").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionSucceed").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root", "ROOT").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "selector", "SELECTOR").state, State.RUNNING);
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
                const agent: Agent = {
                    actionSucceed: () => State.SUCCEEDED,
                    actionRunning: () => {},
                    actionFail: () => State.FAILED
                };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root", "ROOT").state, State.READY);
                assert.strictEqual(findNode(tree, "selector", "SELECTOR").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionFail").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionRunning").state, State.READY);
                assert.strictEqual(findNode(tree, "action", "actionSucceed").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root", "ROOT").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "selector", "SELECTOR").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "actionFail").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action", "actionRunning").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "actionSucceed").state, State.READY);
            });
        });
    });
});
