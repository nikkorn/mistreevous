import { assert } from "chai";
import sinon from "sinon";

import { BehaviourTree, State } from "../../../src/index";
import { RootNodeDefinition } from "../../../src/BehaviourTreeDefinition";

describe("An Entry callback node attribute", () => {
    describe("on tree initialisation", () => {
        describe("will error if no function name is defined", () => {
            it("(MDSL)", () => {
                const definition = "root { action [noop] entry() }";
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
                        entry: {} as any
                    }
                };
                assert.throws(
                    () => new BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: expected 'call' property for attribute 'entry' to be a non-empty string for 'action' node at depth '1'"
                );
            });
        });
    });

    describe("when the node is updated as part of a tree step will call the entry function if it is the first time the node is being updated", () => {
        it("(MDSL)", () => {
            const definition = `root entry(onEntry, "root") { action [someAction] entry(onEntry, "action") }`;
            const agent = {
                someAction: () => State.RUNNING,
                onEntry: sinon.stub()
            };
            const tree = new BehaviourTree(definition, agent);

            assert.isNotTrue(agent.onEntry.called);

            tree.step();

            assert.isTrue(tree.isRunning());
            assert.isTrue(agent.onEntry.calledTwice);
            assert.isTrue(agent.onEntry.calledWith("root"));
            assert.isTrue(agent.onEntry.calledWith("action"));

            agent.someAction = () => State.SUCCEEDED;

            tree.step();

            assert.isFalse(tree.isRunning());
            assert.isTrue(agent.onEntry.calledTwice);
        });

        it("(JSON)", () => {
            const definition: RootNodeDefinition = {
                type: "root",
                entry: {
                    call: "onEntry",
                    args: ["root"]
                },
                child: {
                    type: "action",
                    entry: {
                        call: "onEntry",
                        args: ["action"]
                    },
                    call: "someAction"
                }
            };
            const agent = {
                someAction: () => State.RUNNING,
                onEntry: sinon.stub()
            };
            const tree = new BehaviourTree(definition, agent);

            assert.isNotTrue(agent.onEntry.called);

            tree.step();

            assert.isTrue(tree.isRunning());
            assert.isTrue(agent.onEntry.calledTwice);
            assert.isTrue(agent.onEntry.calledWith("root"));
            assert.isTrue(agent.onEntry.calledWith("action"));

            agent.someAction = () => State.SUCCEEDED;

            tree.step();

            assert.isFalse(tree.isRunning());
            assert.isTrue(agent.onEntry.calledTwice);
        });
    });
});
