import { assert } from "chai";

import { BehaviourTree, State } from "../../../src/index";
import { RootNodeDefinition } from "../../../src/BehaviourTreeDefinition";
import { Agent } from "../../../src/Agent";

import { findNode } from "../../TestUtilities";

describe("A Root node", () => {
    describe("on tree initialisation", () => {
        describe("will error if the node does not have a single child", () => {
            it("(MDSL)", () => {
                const definition = "root { }";
                assert.throws(
                    () => new BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: a root node must have a single child node defined"
                );
            });

            it("(JSON)", () => {
                const definition = {
                    type: "root"
                } as any;
                assert.throws(
                    () => new BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: expected property 'child' to be defined for root node"
                );
            });
        });
    });

    describe("when updated as part of a tree step will", () => {
        describe("move to the SUCCESS state if the child node moves to the SUCCESS state", () => {
            it("(MDSL)", () => {
                const definition = "root { condition [someCondition] }";
                const agent = { someCondition: () => false };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.FAILED);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "condition",
                        call: "someCondition"
                    }
                };
                const agent = { someCondition: () => false };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.FAILED);
            });
        });

        describe("move to the FAILED state if the child node moves to the FAILED state", () => {
            it("(MDSL)", () => {
                const definition = "root { condition [someCondition] }";
                const agent = { someCondition: () => true };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.SUCCEEDED);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "condition",
                        call: "someCondition"
                    }
                };
                const agent = { someCondition: () => true };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.SUCCEEDED);
            });
        });

        describe("move to the RUNNING state if the child node does not move to the SUCCESS or FAILED state", () => {
            it("(MDSL)", () => {
                const definition = "root { action [someAction] }";
                const agent = { someAction: () => State.RUNNING };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "action",
                        call: "someAction"
                    }
                };
                const agent = { someAction: () => State.RUNNING };
                const tree = new BehaviourTree(definition, agent);

                assert.strictEqual(findNode(tree, "root").state, State.READY);

                tree.step();

                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
            });
        });
    });
});
