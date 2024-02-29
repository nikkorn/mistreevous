import { assert } from "chai";
import sinon from "sinon";

import { BehaviourTree, State } from "../../../src/index";
import { RootNodeDefinition } from "../../../src/BehaviourTreeDefinition";
import { findNode } from "../../TestUtilities";

describe("A While guard node attribute", () => {
    describe("on tree initialisation", () => {
        describe("will error if no function name is defined", () => {
            it("(MDSL)", () => {
                const definition = "root { action [noop] while() }";
                assert.throws(
                    () => new BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: expected agent function or registered function name identifier argument for attribute"
                );
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "action",
                        call: "noop",
                        while: {} as any
                    }
                };
                assert.throws(
                    () => new BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: expected 'call' property for attribute 'while' to be a non-empty string for 'action' node at depth '1'"
                );
            });
        });
    });

    describe("when the node is updated as part of a tree step will call the guard function and", () => {
        describe("abort the running node and an child nodes and move them to a FAILED state if the function returns a value of false", () => {
            it("(MDSL)", () => {
                const definition = `root { sequence while(someCondition, "condition-argument") { action [someAction] exit(onActionExit) } }`;
                const agent = {
                    someAction: () => State.RUNNING,
                    someCondition: sinon.stub().returns(true),
                    onActionExit: sinon.stub()
                };
                const tree = new BehaviourTree(definition, agent);

                tree.step();

                assert.isTrue(tree.isRunning());
                assert.isTrue(agent.someCondition.calledWith("condition-argument"));
                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "sequence").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action").state, State.RUNNING);

                agent.someCondition.returns(false);

                tree.step();

                assert.isFalse(tree.isRunning());
                assert.isTrue(agent.someCondition.calledWith("condition-argument"));
                assert.isTrue(agent.onActionExit.calledWith(sinon.match({ succeeded: false, aborted: true })));
                assert.strictEqual(findNode(tree, "root").state, State.FAILED);
                assert.strictEqual(findNode(tree, "sequence").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action").state, State.READY);

                tree.reset();

                assert.isFalse(tree.isRunning());
                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "sequence").state, State.READY);
                assert.strictEqual(findNode(tree, "action").state, State.READY);

                tree.step();

                assert.isFalse(tree.isRunning());
                assert.strictEqual(findNode(tree, "root").state, State.FAILED);
                assert.strictEqual(findNode(tree, "sequence").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action").state, State.READY);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "sequence",
                        while: {
                            call: "someCondition",
                            args: ["condition-argument"]
                        },
                        children: [
                            {
                                type: "action",
                                exit: {
                                    call: "onActionExit"
                                },
                                call: "someAction"
                            }
                        ]
                    }
                };
                const agent = {
                    someAction: () => State.RUNNING,
                    someCondition: sinon.stub().returns(true),
                    onActionExit: sinon.stub()
                };
                const tree = new BehaviourTree(definition, agent);

                tree.step();

                assert.isTrue(tree.isRunning());
                assert.isTrue(agent.someCondition.calledWith("condition-argument"));
                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "sequence").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action").state, State.RUNNING);

                agent.someCondition.returns(false);

                tree.step();

                assert.isFalse(tree.isRunning());
                assert.isTrue(agent.someCondition.calledWith("condition-argument"));
                assert.isTrue(agent.onActionExit.calledWith(sinon.match({ succeeded: false, aborted: true })));
                assert.strictEqual(findNode(tree, "root").state, State.FAILED);
                assert.strictEqual(findNode(tree, "sequence").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action").state, State.READY);

                tree.reset();

                assert.isFalse(tree.isRunning());
                assert.strictEqual(findNode(tree, "root").state, State.READY);
                assert.strictEqual(findNode(tree, "sequence").state, State.READY);
                assert.strictEqual(findNode(tree, "action").state, State.READY);

                tree.step();

                assert.isFalse(tree.isRunning());
                assert.strictEqual(findNode(tree, "root").state, State.FAILED);
                assert.strictEqual(findNode(tree, "sequence").state, State.FAILED);
                assert.strictEqual(findNode(tree, "action").state, State.READY);
            });
        });

        describe("does nothing if the function returns a value of true", () => {
            it("(MDSL)", () => {
                const definition = `root { sequence while(someCondition, "condition-argument") { action [someAction] } }`;
                const agent = {
                    someAction: () => State.RUNNING,
                    someCondition: sinon.stub().returns(true)
                };
                const tree = new BehaviourTree(definition, agent);

                tree.step();

                assert.isTrue(tree.isRunning());
                assert.isTrue(agent.someCondition.calledWith("condition-argument"));
                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "sequence").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action").state, State.RUNNING);

                agent.someAction = () => State.SUCCEEDED;

                tree.step();

                assert.isFalse(tree.isRunning());
                assert.isTrue(agent.someCondition.calledWith("condition-argument"));
                assert.strictEqual(findNode(tree, "root").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "sequence").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action").state, State.SUCCEEDED);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "sequence",
                        while: {
                            call: "someCondition",
                            args: ["condition-argument"]
                        },
                        children: [
                            {
                                type: "action",
                                call: "someAction"
                            }
                        ]
                    }
                };
                const agent = {
                    someAction: () => State.RUNNING,
                    someCondition: sinon.stub().returns(true)
                };
                const tree = new BehaviourTree(definition, agent);

                tree.step();

                assert.isTrue(tree.isRunning());
                assert.isTrue(agent.someCondition.calledWith("condition-argument"));
                assert.strictEqual(findNode(tree, "root").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "sequence").state, State.RUNNING);
                assert.strictEqual(findNode(tree, "action").state, State.RUNNING);

                agent.someAction = () => State.SUCCEEDED;

                tree.step();

                assert.isFalse(tree.isRunning());
                assert.isTrue(agent.someCondition.calledWith("condition-argument"));
                assert.strictEqual(findNode(tree, "root").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "sequence").state, State.SUCCEEDED);
                assert.strictEqual(findNode(tree, "action").state, State.SUCCEEDED);
            });
        });

        describe("throws an error if the guard condition function ", () => {
            describe("does not return a boolean value", () => {
                it("(MDSL)", () => {
                    const definition = `root { sequence while(someCondition, "condition-argument") { action [someAction] } }`;
                    const agent = {
                        someAction: () => State.RUNNING,
                        someCondition: () => "invalid-response"
                    };
                    const tree = new BehaviourTree(definition, agent);

                    assert.throws(
                        () => tree.step(),
                        Error,
                        "expected guard condition function 'someCondition' to return a boolean but returned 'invalid-response'"
                    );
                });

                it("(JSON)", () => {
                    const definition: RootNodeDefinition = {
                        type: "root",
                        child: {
                            type: "sequence",
                            while: {
                                call: "someCondition",
                                args: ["condition-argument"]
                            },
                            children: [
                                {
                                    type: "action",
                                    call: "someAction"
                                }
                            ]
                        }
                    };
                    const agent = {
                        someAction: () => State.RUNNING,
                        someCondition: () => "invalid-response"
                    };
                    const tree = new BehaviourTree(definition, agent);

                    assert.throws(
                        () => tree.step(),
                        Error,
                        "expected guard condition function 'someCondition' to return a boolean but returned 'invalid-response'"
                    );
                });
            });

            describe("throws an exception", () => {
                it("(MDSL)", () => {
                    const definition = `root { sequence while(someCondition, "condition-argument") { action [someAction] } }`;
                    const agent = {
                        someAction: () => State.RUNNING,
                        someCondition: () => {
                            throw new Error("some-error");
                        }
                    };
                    const tree = new BehaviourTree(definition, agent);

                    assert.throws(
                        () => tree.step(),
                        Error,
                        "error stepping tree: guard condition function 'someCondition' threw 'Error: some-error'"
                    );
                });

                it("(JSON)", () => {
                    const definition: RootNodeDefinition = {
                        type: "root",
                        child: {
                            type: "sequence",
                            while: {
                                call: "someCondition",
                                args: ["condition-argument"]
                            },
                            children: [
                                {
                                    type: "action",
                                    call: "someAction"
                                }
                            ]
                        }
                    };
                    const agent = {
                        someAction: () => State.RUNNING,
                        someCondition: () => {
                            throw new Error("some-error");
                        }
                    };
                    const tree = new BehaviourTree(definition, agent);

                    assert.throws(
                        () => tree.step(),
                        Error,
                        "error stepping tree: guard condition function 'someCondition' threw 'Error: some-error'"
                    );
                });
            });
        });
    });
});
