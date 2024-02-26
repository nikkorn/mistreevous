import { assert } from "chai";

import { BehaviourTree, State } from "../../../src/index";
import { RootNodeDefinition } from "../../../src/BehaviourTreeDefinition";
import { Agent } from "../../../src/Agent";

import { findNode } from "../../TestUtilities";

describe("A Succeed node", () => {
    describe("on tree initialisation", () => {
        describe("will error if the node does not have a single child", () => {
            it("(MDSL)", () => {
                const definition = "root { succeed {} }";
                assert.throws(
                    () => new BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: a succeed node must have a single child node defined"
                );
            });

            it("(JSON)", () => {
                const definition = {
                    type: "root",
                    child: {
                        type: "succeed"
                    }
                } as any;
                assert.throws(
                    () => new BehaviourTree(definition, {}),
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
                    const tree = new BehaviourTree(definition, agent);

                    let node = findNode(tree, "succeed", "SUCCEED");
                    assert.strictEqual(node.state, State.READY);

                    tree.step();

                    node = findNode(tree, "succeed", "SUCCEED");
                    assert.strictEqual(node.state, State.SUCCEEDED);
                });

                it("(JSON)", () => {
                    const definition: RootNodeDefinition = {
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
                    const tree = new BehaviourTree(definition, agent);

                    let node = findNode(tree, "succeed", "SUCCEED");
                    assert.strictEqual(node.state, State.READY);

                    tree.step();

                    node = findNode(tree, "succeed", "SUCCEED");
                    assert.strictEqual(node.state, State.SUCCEEDED);
                });
            });

            describe("SUCCESS state", () => {
                it("(MDSL)", () => {
                    const definition = "root { succeed { condition [someCondition] } }";
                    const agent = { someCondition: () => true };
                    const tree = new BehaviourTree(definition, agent);

                    let node = findNode(tree, "succeed", "SUCCEED");
                    assert.strictEqual(node.state, State.READY);

                    tree.step();

                    node = findNode(tree, "succeed", "SUCCEED");
                    assert.strictEqual(node.state, State.SUCCEEDED);
                });

                it("(JSON)", () => {
                    const definition: RootNodeDefinition = {
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
                    const tree = new BehaviourTree(definition, agent);

                    let node = findNode(tree, "succeed", "SUCCEED");
                    assert.strictEqual(node.state, State.READY);

                    tree.step();

                    node = findNode(tree, "succeed", "SUCCEED");
                    assert.strictEqual(node.state, State.SUCCEEDED);
                });
            });
        });

        describe("move to the RUNNING state if the child node moves to the RUNNING state", () => {
            it("(MDSL)", () => {
                const definition = "root { succeed { action [someAction] } }";
                const agent = { someAction: () => {} };
                const tree = new BehaviourTree(definition, agent);

                let node = findNode(tree, "succeed", "SUCCEED");
                assert.strictEqual(node.state, State.READY);

                tree.step();

                node = findNode(tree, "succeed", "SUCCEED");
                assert.strictEqual(node.state, State.RUNNING);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
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
                const tree = new BehaviourTree(definition, agent);

                let node = findNode(tree, "succeed", "SUCCEED");
                assert.strictEqual(node.state, State.READY);

                tree.step();

                node = findNode(tree, "succeed", "SUCCEED");
                assert.strictEqual(node.state, State.RUNNING);
            });
        });
    });
});
