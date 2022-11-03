const mistreevous = require("../../../dist/index");
const chai = require("chai");

var assert = chai.assert;

const findNode = (tree, type, caption) =>
    tree.getFlattenedNodeDetails().find((node) => node.type === type && node.caption === caption);

describe("A Condition node", () => {
    describe("on tree initialisation", () => {
        it("will error if a condition name identifier is not the first node argument", () => {
            const definition = "root { condition [] }";
            assert.throws(
                () => new mistreevous.BehaviourTree(definition, {}),
                Error,
                "error parsing tree: expected condition name identifier argument"
            );
        });
    });

    describe("when updated as part of a tree step", () => {
        describe("will call the function defined by the first node argument", () => {
            describe("when the referenced function is", () => {
                it("a registered function", () => {
                    mistreevous.BehaviourTree.register("someCondition", () => {
                        return true;
                    });

                    const definition = "root { condition [someCondition] }";
                    const tree = new mistreevous.BehaviourTree(definition, {});

                    tree.step();

                    node = findNode(tree, "condition", "someCondition");
                    assert.strictEqual(node.state, mistreevous.State.SUCCEEDED);
                });

                it("an agent function", () => {
                    const definition = "root { condition [someCondition] }";
                    const agent = { someCondition: () => true };
                    const tree = new mistreevous.BehaviourTree(definition, agent);

                    tree.step();

                    node = findNode(tree, "condition", "someCondition");
                    assert.strictEqual(node.state, mistreevous.State.SUCCEEDED);
                });
            });

            it("and will error if there is no agent function or registered function that matches the condition name", () => {
                const definition = "root { condition [someCondition] }";
                let tree;
                assert.doesNotThrow(() => (tree = new mistreevous.BehaviourTree(definition, {})), Error);
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
                    const tree = new mistreevous.BehaviourTree(definition, agent);

                    let node = findNode(tree, "condition", "someCondition");
                    assert.strictEqual(node.state, mistreevous.State.READY);

                    tree.step();

                    node = findNode(tree, "condition", "someCondition");
                    assert.strictEqual(node.state, mistreevous.State.SUCCEEDED);
                });

                it("the FAILED state if the function returns a falsy value", () => {
                    const definition = "root { condition [someCondition] }";
                    const agent = { someCondition: () => false };
                    const tree = new mistreevous.BehaviourTree(definition, agent);

                    let node = findNode(tree, "condition", "someCondition");
                    assert.strictEqual(node.state, mistreevous.State.READY);

                    tree.step();

                    node = findNode(tree, "condition", "someCondition");
                    assert.strictEqual(node.state, mistreevous.State.FAILED);
                });
            });

            describe("and pass any node arguments that follow the condition name identifier argument where", () => {
                describe("the argument is a", () => {
                    it("string", () => {
                        const definition = 'root { condition [someCondition, "hello world!"] }';
                        const agent = {
                            someCondition: (arg) => assert.strictEqual(arg, "hello world!")
                        };
                        const tree = new mistreevous.BehaviourTree(definition, agent);

                        tree.step();
                    });

                    it("string with escaped quotes", () => {
                        const definition = 'root { condition [someCondition, "hello \\" world!"] }';
                        const agent = {
                            someCondition: (arg) => assert.strictEqual(arg, 'hello " world!')
                        };
                        const tree = new mistreevous.BehaviourTree(definition, agent);

                        tree.step();
                    });

                    it("number", () => {
                        const definition = "root { condition [someCondition, 23.4567] }";
                        const agent = {
                            someCondition: (arg) => assert.strictEqual(arg, 23.4567)
                        };
                        const tree = new mistreevous.BehaviourTree(definition, agent);

                        tree.step();
                    });

                    it("boolean 'true' literal", () => {
                        const definition = "root { condition [someCondition, true] }";
                        const agent = {
                            someCondition: (arg) => assert.strictEqual(arg, true)
                        };
                        const tree = new mistreevous.BehaviourTree(definition, agent);

                        tree.step();
                    });

                    it("boolean 'false' literal", () => {
                        const definition = "root { condition [someCondition, false] }";
                        const agent = {
                            someCondition: (arg) => assert.strictEqual(arg, false)
                        };
                        const tree = new mistreevous.BehaviourTree(definition, agent);

                        tree.step();
                    });

                    it("null", () => {
                        const definition = "root { condition [someCondition, null] }";
                        const agent = {
                            someCondition: (arg) => assert.isNull(arg)
                        };
                        const tree = new mistreevous.BehaviourTree(definition, agent);

                        tree.step();
                    });
                });

                it("there are multiple arguments", () => {
                    const definition = 'root { condition [someCondition, 1.23, "hello world!", false, null] }';
                    const agent = {
                        someCondition: (arg0, arg1, arg2, arg3) => {
                            assert.strictEqual(arg0, 1.23);
                            assert.strictEqual(arg1, "hello world!");
                            assert.strictEqual(arg2, false);
                            assert.strictEqual(arg3, null);
                        }
                    };
                    const tree = new mistreevous.BehaviourTree(definition, agent);

                    tree.step();
                });
            });
        });
    });
});
