import { assert } from "chai";

import { BehaviourTree, State } from "../../../src/index";
import { RootNodeDefinition } from "../../../src/BehaviourTreeDefinition";
import { Agent } from "../../../src/Agent";

import { findNode } from "../../TestUtilities";

describe("A Condition node", () => {
    describe("on tree initialisation", () => {
        it("will error if a condition name identifier is not the first node argument", () => {
            const definition = "root { condition [] }";
            assert.throws(
                () => new BehaviourTree(definition, {}),
                Error,
                "invalid definition: expected condition name identifier argument"
            );
        });
    });

    describe("when updated as part of a tree step", () => {
        describe("will call the function defined by the first node argument", () => {
            describe("when the referenced function is", () => {
                it("a registered function", () => {
                    BehaviourTree.register("someCondition", () => {
                        return true;
                    });

                    const definition = "root { condition [someCondition] }";
                    const tree = new BehaviourTree(definition, {});

                    tree.step();

                    const node = findNode(tree, "condition", "someCondition");
                    assert.strictEqual(node.state, State.SUCCEEDED);
                });

                it("an agent function", () => {
                    const definition = "root { condition [someCondition] }";
                    const agent = { someCondition: () => true };
                    const tree = new BehaviourTree(definition, agent);

                    tree.step();

                    const node = findNode(tree, "condition", "someCondition");
                    assert.strictEqual(node.state, State.SUCCEEDED);
                });
            });

            it("and will error if there is no agent function or registered function that matches the condition name", () => {
                const definition = "root { condition [someCondition] }";
                let tree: BehaviourTree;
                assert.doesNotThrow(() => (tree = new BehaviourTree(definition, {})), Error);
                assert.throws(
                    () => tree.step(),
                    Error,
                    "error stepping tree: cannot update condition node as the condition 'someCondition' function is not defined on the agent and has not been registered"
                );
            });

            describe("and move to", () => {
                it("the SUCCESS state if the function returns a truthy value", () => {
                    const definition = "root { condition [someCondition] }";
                    const agent = { someCondition: () => true };
                    const tree = new BehaviourTree(definition, agent);

                    let node = findNode(tree, "condition", "someCondition");
                    assert.strictEqual(node.state, State.READY);

                    tree.step();

                    node = findNode(tree, "condition", "someCondition");
                    assert.strictEqual(node.state, State.SUCCEEDED);
                });

                it("the FAILED state if the function returns a falsy value", () => {
                    const definition = "root { condition [someCondition] }";
                    const agent = { someCondition: () => false };
                    const tree = new BehaviourTree(definition, agent);

                    let node = findNode(tree, "condition", "someCondition");
                    assert.strictEqual(node.state, State.READY);

                    tree.step();

                    node = findNode(tree, "condition", "someCondition");
                    assert.strictEqual(node.state, State.FAILED);
                });
            });

            describe("and pass any node arguments that follow the condition name identifier argument where", () => {
                describe("the argument is a", () => {
                    it("string", () => {
                        const definition = 'root { condition [someCondition, "hello world!"] }';
                        const agent = {
                            someCondition: (arg: any) => assert.strictEqual(arg, "hello world!")
                        };
                        const tree = new BehaviourTree(definition, agent);

                        tree.step();
                    });

                    it("string with escaped quotes", () => {
                        const definition = 'root { condition [someCondition, "hello \\" world!"] }';
                        const agent = {
                            someCondition: (arg: any) => assert.strictEqual(arg, 'hello " world!')
                        };
                        const tree = new BehaviourTree(definition, agent);

                        tree.step();
                    });

                    it("number", () => {
                        const definition = "root { condition [someCondition, 23.4567] }";
                        const agent = {
                            someCondition: (arg: any) => assert.strictEqual(arg, 23.4567)
                        };
                        const tree = new BehaviourTree(definition, agent);

                        tree.step();
                    });

                    it("boolean 'true' literal", () => {
                        const definition = "root { condition [someCondition, true] }";
                        const agent = {
                            someCondition: (arg: any) => assert.strictEqual(arg, true)
                        };
                        const tree = new BehaviourTree(definition, agent);

                        tree.step();
                    });

                    it("boolean 'false' literal", () => {
                        const definition = "root { condition [someCondition, false] }";
                        const agent = {
                            someCondition: (arg: any) => assert.strictEqual(arg, false)
                        };
                        const tree = new BehaviourTree(definition, agent);

                        tree.step();
                    });

                    it("null", () => {
                        const definition = "root { condition [someCondition, null] }";
                        const agent = {
                            someCondition: (arg: any) => assert.isNull(arg)
                        };
                        const tree = new BehaviourTree(definition, agent);

                        tree.step();
                    });
                });

                it("there are multiple arguments", () => {
                    const definition = 'root { condition [someCondition, 1.23, "hello world!", false, null] }';
                    const agent = {
                        someCondition: (arg0: any, arg1: any, arg2: any, arg3: any) => {
                            assert.strictEqual(arg0, 1.23);
                            assert.strictEqual(arg1, "hello world!");
                            assert.strictEqual(arg2, false);
                            assert.strictEqual(arg3, null);
                        }
                    };
                    const tree = new BehaviourTree(definition, agent);

                    tree.step();
                });
            });
        });
    });
});
