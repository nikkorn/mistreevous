const mistreevous = require("../../../dist/index");
const chai = require("chai");

var assert = chai.assert;

const findNode = (tree, type, caption) =>
    tree.getFlattenedNodeDetails().find((node) => node.type === type && node.caption === caption);

describe("A Succeed node", () => {
    describe("on tree initialisation", () => {
        describe("will error if the node does not have a single child", () => {
            it("(MDSL)", () => {
                const definition = "root { succeed {} }";
                assert.throws(
                    () => new mistreevous.BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: a succeed node must have a single child"
                );
            });

            it("(JSON)", () => {
                const definition = {
                    type: "root",
                    child: {
                        type: "succeed"
                    }
                };
                assert.throws(
                    () => new mistreevous.BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: expected property 'child' to be defined for succeed node at depth '1'"
                );
            });
        });
    });

    describe("when updated as part of a tree step will", () => {
        describe("move to the SUCCEEDED state if the child node moves to the", () => {
            describe("FAILED state", () => {
                it("(MDSL)", () => {
                    const definition = "root { succeed { condition [someCondition] } }";
                    const agent = { someCondition: () => false };
                    const tree = new mistreevous.BehaviourTree(definition, agent);

                    let node = findNode(tree, "succeed", "SUCCEED");
                    assert.strictEqual(node.state, mistreevous.State.READY);

                    tree.step();

                    node = findNode(tree, "succeed", "SUCCEED");
                    assert.strictEqual(node.state, mistreevous.State.SUCCEEDED);
                });

                it("(JSON)", () => {
                    const definition = {
                        type: "root",
                        child: {
                            type: "succeed",
                            child: {
                                type: "condition",
                                call: "someCondition"
                            }
                        }
                    };
                    const agent = { someCondition: () => false };
                    const tree = new mistreevous.BehaviourTree(definition, agent);

                    let node = findNode(tree, "succeed", "SUCCEED");
                    assert.strictEqual(node.state, mistreevous.State.READY);

                    tree.step();

                    node = findNode(tree, "succeed", "SUCCEED");
                    assert.strictEqual(node.state, mistreevous.State.SUCCEEDED);
                });
            });

            describe("SUCCESS state", () => {
                it("(MDSL)", () => {
                    const definition = "root { succeed { condition [someCondition] } }";
                    const agent = { someCondition: () => true };
                    const tree = new mistreevous.BehaviourTree(definition, agent);

                    let node = findNode(tree, "succeed", "SUCCEED");
                    assert.strictEqual(node.state, mistreevous.State.READY);

                    tree.step();

                    node = findNode(tree, "succeed", "SUCCEED");
                    assert.strictEqual(node.state, mistreevous.State.SUCCEEDED);
                });

                it("(JSON)", () => {
                    const definition = {
                        type: "root",
                        child: {
                            type: "succeed",
                            child: {
                                type: "condition",
                                call: "someCondition"
                            }
                        }
                    };
                    const agent = { someCondition: () => true };
                    const tree = new mistreevous.BehaviourTree(definition, agent);

                    let node = findNode(tree, "succeed", "SUCCEED");
                    assert.strictEqual(node.state, mistreevous.State.READY);

                    tree.step();

                    node = findNode(tree, "succeed", "SUCCEED");
                    assert.strictEqual(node.state, mistreevous.State.SUCCEEDED);
                });
            });
        });

        describe("move to the RUNNING state if the child node moves to the RUNNING state", () => {
            it("(MDSL)", () => {
                const definition = "root { succeed { action [someAction] } }";
                const agent = { someAction: () => {} };
                const tree = new mistreevous.BehaviourTree(definition, agent);

                let node = findNode(tree, "succeed", "SUCCEED");
                assert.strictEqual(node.state, mistreevous.State.READY);

                tree.step();

                node = findNode(tree, "succeed", "SUCCEED");
                assert.strictEqual(node.state, mistreevous.State.RUNNING);
            });

            it("(JSON)", () => {
                const definition = {
                    type: "root",
                    child: {
                        type: "succeed",
                        child: {
                            type: "action",
                            call: "someAction"
                        }
                    }
                };
                const agent = { someAction: () => {} };
                const tree = new mistreevous.BehaviourTree(definition, agent);

                let node = findNode(tree, "succeed", "SUCCEED");
                assert.strictEqual(node.state, mistreevous.State.READY);

                tree.step();

                node = findNode(tree, "succeed", "SUCCEED");
                assert.strictEqual(node.state, mistreevous.State.RUNNING);
            });
        });
    });
});
