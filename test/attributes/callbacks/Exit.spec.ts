import { assert } from "chai";
import sinon from "sinon";

import { BehaviourTree, State } from "../../../src/index";
import { RootNodeDefinition } from "../../../src/BehaviourTreeDefinition";

describe("An Exit callback node attribute", () => {
    describe("on tree initialisation", () => {
        describe("will error if no function name is defined", () => {
            it("(MDSL)", () => {
                const definition = "root { action [noop] exit() }";
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
                        exit: {} as any
                    }
                };
                assert.throws(
                    () => new BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: expected 'call' property for attribute 'exit' to be a non-empty string for 'action' node at depth '1'"
                );
            });
        });
    });

    describe("when the node is updated as part of a tree step will call the exit function when the node moves out of the RUNNING state", () => {
        describe("and to a SUCCEEDED state", () => {
            it("(MDSL)", () => {
                const definition = `root exit(onExit, "root") { action [someAction] exit(onExit, "action") }`;
                const agent = {
                    someAction: () => State.RUNNING,
                    onExit: sinon.stub()
                };
                const tree = new BehaviourTree(definition, agent);

                tree.step();

                assert.isNotTrue(agent.onExit.called);
                assert.isTrue(tree.isRunning());

                agent.someAction = () => State.SUCCEEDED;

                tree.step();

                assert.isFalse(tree.isRunning());
                assert.isTrue(agent.onExit.calledTwice);
                assert.isTrue(agent.onExit.calledWith(sinon.match({ succeeded: true, aborted: false }), "root"));
                assert.isTrue(agent.onExit.calledWith(sinon.match({ succeeded: true, aborted: false }), "action"));
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    exit: {
                        call: "onExit",
                        args: ["root"]
                    },
                    child: {
                        type: "action",
                        exit: {
                            call: "onExit",
                            args: ["action"]
                        },
                        call: "someAction"
                    }
                };
                const agent = {
                    someAction: () => State.RUNNING,
                    onExit: sinon.stub()
                };
                const tree = new BehaviourTree(definition, agent);

                tree.step();

                assert.isNotTrue(agent.onExit.called);
                assert.isTrue(tree.isRunning());

                agent.someAction = () => State.SUCCEEDED;

                tree.step();

                assert.isFalse(tree.isRunning());
                assert.isTrue(agent.onExit.calledTwice);
                assert.isTrue(agent.onExit.calledWith(sinon.match({ succeeded: true, aborted: false }), "root"));
                assert.isTrue(agent.onExit.calledWith(sinon.match({ succeeded: true, aborted: false }), "action"));
            });
        });

        describe("and to a FAILED state when the node execution", () => {
            describe("was not aborted", () => {
                it("(MDSL)", () => {
                    const definition = `root exit(onExit, "root") { action [someAction] exit(onExit, "action") }`;
                    const agent = {
                        someAction: () => State.RUNNING,
                        onExit: sinon.stub()
                    };
                    const tree = new BehaviourTree(definition, agent);

                    tree.step();

                    assert.isNotTrue(agent.onExit.called);
                    assert.isTrue(tree.isRunning());

                    agent.someAction = () => State.FAILED;

                    tree.step();

                    assert.isFalse(tree.isRunning());
                    assert.isTrue(agent.onExit.calledTwice);
                    assert.isTrue(agent.onExit.calledWith(sinon.match({ succeeded: false, aborted: false }), "root"));
                    assert.isTrue(agent.onExit.calledWith(sinon.match({ succeeded: false, aborted: false }), "action"));
                });

                it("(JSON)", () => {
                    const definition: RootNodeDefinition = {
                        type: "root",
                        exit: {
                            call: "onExit",
                            args: ["root"]
                        },
                        child: {
                            type: "action",
                            exit: {
                                call: "onExit",
                                args: ["action"]
                            },
                            call: "someAction"
                        }
                    };
                    const agent = {
                        someAction: () => State.RUNNING,
                        onExit: sinon.stub()
                    };
                    const tree = new BehaviourTree(definition, agent);

                    tree.step();

                    assert.isNotTrue(agent.onExit.called);
                    assert.isTrue(tree.isRunning());

                    agent.someAction = () => State.FAILED;

                    tree.step();

                    assert.isFalse(tree.isRunning());
                    assert.isTrue(agent.onExit.calledTwice);
                    assert.isTrue(agent.onExit.calledWith(sinon.match({ succeeded: false, aborted: false }), "root"));
                    assert.isTrue(agent.onExit.calledWith(sinon.match({ succeeded: false, aborted: false }), "action"));
                });
            });

            describe("was aborted", () => {
                it("(MDSL)", () => {
                    const definition = `root exit(onExit, "root") { action [someAction] exit(onExit, "action") while(someCondition) }`;
                    const agent = {
                        someAction: () => State.RUNNING,
                        someCondition: () => true,
                        onExit: sinon.stub()
                    };
                    const tree = new BehaviourTree(definition, agent);

                    tree.step();

                    assert.isNotTrue(agent.onExit.called);
                    assert.isTrue(tree.isRunning());

                    // Cause the running action node to be aborted on the next tree step.
                    agent.someCondition = () => false;

                    tree.step();

                    assert.isFalse(tree.isRunning());
                    assert.isTrue(agent.onExit.calledTwice);
                    assert.isTrue(agent.onExit.calledWith(sinon.match({ succeeded: false, aborted: false }), "root"));
                    assert.isTrue(agent.onExit.calledWith(sinon.match({ succeeded: false, aborted: true }), "action"));
                });

                it("(JSON)", () => {
                    const definition: RootNodeDefinition = {
                        type: "root",
                        exit: {
                            call: "onExit",
                            args: ["root"]
                        },
                        child: {
                            type: "action",
                            exit: {
                                call: "onExit",
                                args: ["action"]
                            },
                            while: {
                                call: "someCondition"
                            },
                            call: "someAction"
                        }
                    };
                    const agent = {
                        someAction: () => State.RUNNING,
                        someCondition: () => true,
                        onExit: sinon.stub()
                    };
                    const tree = new BehaviourTree(definition, agent);

                    tree.step();

                    assert.isNotTrue(agent.onExit.called);
                    assert.isTrue(tree.isRunning());

                    // Cause the running action node to be aborted on the next tree step.
                    agent.someCondition = () => false;

                    tree.step();

                    assert.isFalse(tree.isRunning());
                    assert.isTrue(agent.onExit.calledTwice);
                    assert.isTrue(agent.onExit.calledWith(sinon.match({ succeeded: false, aborted: false }), "root"));
                    assert.isTrue(agent.onExit.calledWith(sinon.match({ succeeded: false, aborted: true }), "action"));
                });
            });
        });
    });
});
