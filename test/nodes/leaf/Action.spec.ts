import { assert } from "chai";

import { BehaviourTree, State } from "../../../src/index";
import { RootNodeDefinition } from "../../../src/BehaviourTreeDefinition";
import { Agent } from "../../../src/Agent";

import { findNode } from "../../TestUtilities";

describe("An Action node", () => {
    describe("on tree initialisation", () => {
        it("will error if an action name identifier is not the first node argument", () => {
            const definition = "root { action [] }";
            assert.throws(
                () => new BehaviourTree(definition, {}),
                Error,
                "invalid definition: expected action name identifier argument"
            );
        });
    });

    describe("when updated as part of a tree step", () => {
        describe("will call the function defined by the first node argument", () => {
            describe("when the referenced function is", () => {
                it("a registered function", () => {
                    BehaviourTree.register("doAction", () => {
                        return State.SUCCEEDED;
                    });

                    const definition = "root { action [doAction] }";
                    const tree = new BehaviourTree(definition, {});

                    tree.step();

                    const node = findNode(tree, "action", "doAction");
                    assert.strictEqual(node.state, State.SUCCEEDED);
                });

                it("an agent function", () => {
                    const definition = "root { action [doAction] }";
                    const agent: Agent = { doAction: () => State.SUCCEEDED };
                    const tree = new BehaviourTree(definition, agent);

                    tree.step();

                    const node = findNode(tree, "action", "doAction");
                    assert.strictEqual(node.state, State.SUCCEEDED);
                });
            });

            it("and will error if there is no agent function or registered function that matches the action name", () => {
                const definition = "root { action [DoTheThing] }";
                let tree: BehaviourTree;
                assert.doesNotThrow(() => (tree = new BehaviourTree(definition, {})), Error);
                assert.throws(
                    () => tree.step(),
                    Error,
                    "error stepping tree: cannot update action node as the action 'DoTheThing' function is not defined on the agent and has not been registered"
                );
            });

            describe("and move to", () => {
                it("the SUCCESS state if the function returns a value of State.SUCCEEDED", () => {
                    const definition = "root { action [doAction] }";
                    const agent: Agent = { doAction: () => State.SUCCEEDED };
                    const tree = new BehaviourTree(definition, agent);

                    let node = findNode(tree, "action", "doAction");
                    assert.strictEqual(node.state, State.READY);

                    tree.step();

                    node = findNode(tree, "action", "doAction");
                    assert.strictEqual(node.state, State.SUCCEEDED);
                });

                it("the FAILED state if the function returns a value of State.FAILED", () => {
                    const definition = "root { action [doAction] }";
                    const agent: Agent = { doAction: () => State.FAILED };
                    const tree = new BehaviourTree(definition, agent);

                    let node = findNode(tree, "action", "doAction");
                    assert.strictEqual(node.state, State.READY);

                    tree.step();

                    node = findNode(tree, "action", "doAction");
                    assert.strictEqual(node.state, State.FAILED);
                });

                describe("the RUNNING state if", () => {
                    it("the function returns undefined", () => {
                        const definition = "root { action [doAction] }";
                        const agent = { doAction: () => {} };
                        const tree = new BehaviourTree(definition, agent);

                        let node = findNode(tree, "action", "doAction");
                        assert.strictEqual(node.state, State.READY);

                        tree.step();

                        node = findNode(tree, "action", "doAction");
                        assert.strictEqual(node.state, State.RUNNING);
                    });

                    it("the function returns a promise to return a value of State.SUCCEEDED or State.FAILED", (done) => {
                        const result: Promise<State.SUCCEEDED> = new Promise((resolve) => resolve(State.SUCCEEDED));

                        const definition = "root { action [doAction] }";
                        const agent: Agent = { doAction: () => result };
                        const tree = new BehaviourTree(definition, agent);

                        let node = findNode(tree, "action", "doAction");
                        assert.strictEqual(node.state, State.READY);

                        tree.step();

                        result
                            .then(() => tree.step())
                            .then(() => {
                                node = findNode(tree, "action", "doAction");
                                assert.strictEqual(node.state, State.SUCCEEDED);
                            })
                            .then(done);
                    });
                });
            });

            describe("and pass any node arguments that follow the action name identifier argument where", () => {
                describe("the argument is a", () => {
                    it("string", () => {
                        const definition = 'root { action [doAction, "hello world!"] }';
                        const agent = {
                            doAction: (arg: any) => assert.strictEqual(arg, "hello world!")
                        };
                        const tree = new BehaviourTree(definition, agent);

                        tree.step();
                    });

                    it("string with escaped quotes", () => {
                        const definition = 'root { action [doAction, "hello \\" world!"] }';
                        const agent = {
                            doAction: (arg: any) => assert.strictEqual(arg, 'hello " world!')
                        };
                        const tree = new BehaviourTree(definition, agent);

                        tree.step();
                    });

                    it("number", () => {
                        const definition = "root { action [doAction, 23.4567] }";
                        const agent = {
                            doAction: (arg: any) => assert.strictEqual(arg, 23.4567)
                        };
                        const tree = new BehaviourTree(definition, agent);

                        tree.step();
                    });

                    it("boolean 'true' literal", () => {
                        const definition = "root { action [doAction, true] }";
                        const agent = {
                            doAction: (arg: any) => assert.strictEqual(arg, true)
                        };
                        const tree = new BehaviourTree(definition, agent);

                        tree.step();
                    });

                    it("boolean 'false' literal", () => {
                        const definition = "root { action [doAction, false] }";
                        const agent = {
                            doAction: (arg: any) => assert.strictEqual(arg, false)
                        };
                        const tree = new BehaviourTree(definition, agent);

                        tree.step();
                    });

                    it("null", () => {
                        const definition = "root { action [doAction, null] }";
                        const agent = {
                            doAction: (arg: any) => assert.isNull(arg)
                        };
                        const tree = new BehaviourTree(definition, agent);

                        tree.step();
                    });
                });

                it("there are multiple arguments", () => {
                    const definition = 'root { action [doAction, 1.23, "hello world!", false, null] }';
                    const agent = {
                        doAction: (arg0: any, arg1: any, arg2: any, arg3: any) => {
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
