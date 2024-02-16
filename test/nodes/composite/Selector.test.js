const mistreevous = require("../../../dist/index");
const chai = require("chai");

var assert = chai.assert;

const findNode = (tree, type, caption) =>
    tree.getFlattenedNodeDetails().find((node) => node.type === type && node.caption === caption);

describe("A Selector node", () => {
    describe("on tree initialisation", () => {
        describe("will error if the node does not have at least one child", () => {
            it("(MDSL)", () => {
                const definition = "root { selector {} }";
                assert.throws(
                    () => new mistreevous.BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: a selector node must have at least a single child"
                );
            });

            it("(JSON)", () => {
                const definition = {
                    type: "root",
                    child: {
                        type: "selector",
                        children: []
                    }
                };
                assert.throws(
                    () => new mistreevous.BehaviourTree(definition, {}),
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
                const agent = {
                    actionSucceed: () => mistreevous.State.SUCCEEDED,
                    actionRunning: () => {},
                    actionFail: () => mistreevous.State.FAILED
                };
                const tree = new mistreevous.BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root", "ROOT").state, mistreevous.State.READY);
                assert.strictEqual(findNode(tree, "selector", "SELECTOR").state, mistreevous.State.READY);
                assert.strictEqual(findNode(tree, "action", "actionFail").state, mistreevous.State.READY);
                assert.strictEqual(findNode(tree, "action", "actionRunning").state, mistreevous.State.READY);
                assert.strictEqual(findNode(tree, "action", "actionSucceed").state, mistreevous.State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root", "ROOT").state, mistreevous.State.RUNNING);
                assert.strictEqual(findNode(tree, "selector", "SELECTOR").state, mistreevous.State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "actionFail").state, mistreevous.State.FAILED);
                assert.strictEqual(findNode(tree, "action", "actionRunning").state, mistreevous.State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "actionSucceed").state, mistreevous.State.READY);
            });

            it("(JSON)", () => {
                const definition = {
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
                    actionSucceed: () => mistreevous.State.SUCCEEDED,
                    actionRunning: () => {},
                    actionFail: () => mistreevous.State.FAILED
                };
                const tree = new mistreevous.BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root", "ROOT").state, mistreevous.State.READY);
                assert.strictEqual(findNode(tree, "selector", "SELECTOR").state, mistreevous.State.READY);
                assert.strictEqual(findNode(tree, "action", "actionFail").state, mistreevous.State.READY);
                assert.strictEqual(findNode(tree, "action", "actionRunning").state, mistreevous.State.READY);
                assert.strictEqual(findNode(tree, "action", "actionSucceed").state, mistreevous.State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root", "ROOT").state, mistreevous.State.RUNNING);
                assert.strictEqual(findNode(tree, "selector", "SELECTOR").state, mistreevous.State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "actionFail").state, mistreevous.State.FAILED);
                assert.strictEqual(findNode(tree, "action", "actionRunning").state, mistreevous.State.RUNNING);
                assert.strictEqual(findNode(tree, "action", "actionSucceed").state, mistreevous.State.READY);
            });
        });
    });
});
