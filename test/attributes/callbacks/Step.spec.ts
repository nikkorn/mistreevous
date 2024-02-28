import { assert } from "chai";
import sinon from "sinon";

import { BehaviourTree, State } from "../../../src/index";
import { RootNodeDefinition } from "../../../src/BehaviourTreeDefinition";

describe("A Step callback node attribute", () => {
    describe("on tree initialisation", () => {
        describe("will error if no function name is defined", () => {
            it("(MDSL)", () => {
                const definition = "root { action [noop] step() }";
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
                        step: {} as any
                    }
                };
                assert.throws(
                    () => new BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: expected 'call' property for attribute 'step' to be a non-empty string for 'action' node at depth '1'"
                );
            });
        });
    });

    describe("when the node is updated as part of a tree step will call the step function", () => {
        it("(MDSL)", () => {
            const definition = `root step(onRootStep, "root") { action [someAction] step(onActionStep, "action") }`;
            const agent = {
                someAction: () => State.RUNNING,
                onRootStep: sinon.stub(),
                onActionStep: sinon.stub()
            };
            const tree = new BehaviourTree(definition, agent);

            assert.isNotTrue(agent.onRootStep.called);
            assert.isNotTrue(agent.onActionStep.called);

            tree.step();

            assert.isTrue(tree.isRunning());
            assert.isTrue(agent.onRootStep.calledOnce);
            assert.isTrue(agent.onActionStep.calledOnce);
            assert.isTrue(agent.onRootStep.calledWith("root"));
            assert.isTrue(agent.onActionStep.calledWith("action"));

            tree.step();

            assert.isTrue(tree.isRunning());
            assert.isTrue(agent.onRootStep.calledTwice);
            assert.isTrue(agent.onActionStep.calledTwice);

            agent.someAction = () => State.SUCCEEDED;

            tree.step();

            assert.isFalse(tree.isRunning());
            assert.isTrue(agent.onRootStep.calledThrice);
            assert.isTrue(agent.onActionStep.calledThrice);
        });

        it("(JSON)", () => {
            const definition: RootNodeDefinition = {
                type: "root",
                step: {
                    call: "onRootStep",
                    args: ["root"]
                },
                child: {
                    type: "action",
                    step: {
                        call: "onActionStep",
                        args: ["action"]
                    },
                    call: "someAction"
                }
            };
            const agent = {
                someAction: () => State.RUNNING,
                onRootStep: sinon.stub(),
                onActionStep: sinon.stub()
            };
            const tree = new BehaviourTree(definition, agent);

            assert.isNotTrue(agent.onRootStep.called);
            assert.isNotTrue(agent.onActionStep.called);

            tree.step();

            assert.isTrue(tree.isRunning());
            assert.isTrue(agent.onRootStep.calledOnce);
            assert.isTrue(agent.onActionStep.calledOnce);
            assert.isTrue(agent.onRootStep.calledWith("root"));
            assert.isTrue(agent.onActionStep.calledWith("action"));

            tree.step();

            assert.isTrue(tree.isRunning());
            assert.isTrue(agent.onRootStep.calledTwice);
            assert.isTrue(agent.onActionStep.calledTwice);

            agent.someAction = () => State.SUCCEEDED;

            tree.step();

            assert.isFalse(tree.isRunning());
            assert.isTrue(agent.onRootStep.calledThrice);
            assert.isTrue(agent.onActionStep.calledThrice);
        });
    });
});
