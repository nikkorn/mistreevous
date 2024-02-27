import { assert } from "chai";

import { BehaviourTree, State } from "../src/index";
import { RootNodeDefinition } from "../src/BehaviourTreeDefinition";

import { findNode } from "./TestUtilities";

describe("A BehaviourTree instance", () => {
    describe("has initialisation logic that", () => {
        describe("should error when", () => {
            it("the tree definition argument is not defined", () => {
                assert.throws(() => new BehaviourTree(null as any, {}), Error, "tree definition not defined");
                assert.throws(() => new BehaviourTree(undefined as any, {}), Error, "tree definition not defined");
            });

            it("the agent object is not defined", () => {
                assert.throws(
                    () => new BehaviourTree("", undefined as any),
                    Error,
                    "the agent must be an object and not null"
                );
                assert.throws(
                    () => new BehaviourTree("", null as any),
                    Error,
                    "the agent must be an object and not null"
                );
                assert.throws(
                    () => new BehaviourTree("", 42 as any),
                    Error,
                    "the agent must be an object and not null"
                );
            });
        });

        describe("should not error when the tree definition argument is a valid definition", () => {
            it("(MDSL)", () => {
                const definition = "root { action [test] }";
                assert.doesNotThrow(() => new BehaviourTree(definition, {}), Error);
            });

            it("(JSON)", () => {
                const definition: RootNodeDefinition = {
                    type: "root",
                    child: {
                        type: "action",
                        call: "test"
                    }
                };
                assert.doesNotThrow(() => new BehaviourTree(definition, {}), Error);
            });
        });
    });

    describe("has a 'getState' function that returns the state of the root node", () => {
        it("(MDSL)", () => {
            const definition = "root { action [getActionResult] }";
            const agent = { getActionResult: () => State.RUNNING };
            const tree = new BehaviourTree(definition, agent);

            assert.strictEqual(tree.getState(), State.READY);

            tree.step();

            assert.strictEqual(tree.getState(), State.RUNNING);

            agent.getActionResult = () => State.SUCCEEDED;

            tree.step();

            assert.strictEqual(tree.getState(), State.SUCCEEDED);
        });

        it("(JSON)", () => {
            const definition: RootNodeDefinition = {
                type: "root",
                child: {
                    type: "action",
                    call: "getActionResult"
                }
            };
            const agent = { getActionResult: () => State.RUNNING };
            const tree = new BehaviourTree(definition, agent);

            assert.strictEqual(tree.getState(), State.READY);

            tree.step();

            assert.strictEqual(tree.getState(), State.RUNNING);

            agent.getActionResult = () => State.SUCCEEDED;

            tree.step();

            assert.strictEqual(tree.getState(), State.SUCCEEDED);
        });
    });

    describe("has an 'isRunning' function that returns a flag defining whether the tree is in a running state", () => {
        it("(MDSL)", () => {
            const definition = "root { action [getActionResult] }";
            const agent = { getActionResult: () => State.RUNNING };
            const tree = new BehaviourTree(definition, agent);

            assert.strictEqual(tree.isRunning(), false);

            tree.step();

            assert.strictEqual(tree.isRunning(), true);

            agent.getActionResult = () => State.SUCCEEDED;

            tree.step();

            assert.strictEqual(tree.isRunning(), false);
        });

        it("(JSON)", () => {
            const definition: RootNodeDefinition = {
                type: "root",
                child: {
                    type: "action",
                    call: "getActionResult"
                }
            };
            const agent = { getActionResult: () => State.RUNNING };
            const tree = new BehaviourTree(definition, agent);

            assert.strictEqual(tree.isRunning(), false);

            tree.step();

            assert.strictEqual(tree.isRunning(), true);

            agent.getActionResult = () => State.SUCCEEDED;

            tree.step();

            assert.strictEqual(tree.isRunning(), false);
        });
    });

    describe("has a 'reset' function that resets the tree from the root node outwards to each nested node, giving each a state of READY", () => {
        it("(MDSL)", () => {
            const definition = "root { sequence { action [getActionResult] } }";
            const agent = { getActionResult: () => State.SUCCEEDED };
            const tree = new BehaviourTree(definition, agent);

            assert.strictEqual(findNode(tree, "root").state, State.READY);
            assert.strictEqual(findNode(tree, "sequence").state, State.READY);
            assert.strictEqual(findNode(tree, "action", "getActionResult").state, State.READY);

            tree.step();

            assert.strictEqual(findNode(tree, "root").state, State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "sequence").state, State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult").state, State.SUCCEEDED);

            tree.reset();

            assert.strictEqual(findNode(tree, "root").state, State.READY);
            assert.strictEqual(findNode(tree, "sequence").state, State.READY);
            assert.strictEqual(findNode(tree, "action", "getActionResult").state, State.READY);
        });

        it("(JSON)", () => {
            const definition: RootNodeDefinition = {
                type: "root",
                child: {
                    type: "sequence",
                    children: [
                        {
                            type: "action",
                            call: "getActionResult"
                        }
                    ]
                }
            };
            const agent = { getActionResult: () => State.SUCCEEDED };
            const tree = new BehaviourTree(definition, agent);

            assert.strictEqual(findNode(tree, "root").state, State.READY);
            assert.strictEqual(findNode(tree, "sequence").state, State.READY);
            assert.strictEqual(findNode(tree, "action", "getActionResult").state, State.READY);

            tree.step();

            assert.strictEqual(findNode(tree, "root").state, State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "sequence").state, State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult").state, State.SUCCEEDED);

            tree.reset();

            assert.strictEqual(findNode(tree, "root").state, State.READY);
            assert.strictEqual(findNode(tree, "sequence").state, State.READY);
            assert.strictEqual(findNode(tree, "action", "getActionResult").state, State.READY);
        });
    });

    describe("has a 'step' function that updates all nodes in sequence unless a node is left in the running state", () => {
        it("(MDSL)", () => {
            const definition =
                "root { sequence { action [getActionResult0] action [getActionResult1] action [getActionResult2] action [getActionResult3] } }";
            const agent = {
                getActionResult0: () => State.SUCCEEDED,
                getActionResult1: () => State.SUCCEEDED,
                getActionResult2: () => State.RUNNING,
                getActionResult3: () => State.SUCCEEDED
            };
            const tree = new BehaviourTree(definition, agent);

            assert.strictEqual(findNode(tree, "action", "getActionResult0").state, State.READY);
            assert.strictEqual(findNode(tree, "action", "getActionResult1").state, State.READY);
            assert.strictEqual(findNode(tree, "action", "getActionResult2").state, State.READY);
            assert.strictEqual(findNode(tree, "action", "getActionResult3").state, State.READY);

            tree.step();

            assert.strictEqual(findNode(tree, "action", "getActionResult0").state, State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult1").state, State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult2").state, State.RUNNING);
            assert.strictEqual(findNode(tree, "action", "getActionResult3").state, State.READY);

            agent.getActionResult2 = () => State.SUCCEEDED;

            tree.step();

            assert.strictEqual(findNode(tree, "action", "getActionResult0").state, State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult1").state, State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult2").state, State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult3").state, State.SUCCEEDED);

            agent.getActionResult2 = () => State.RUNNING;

            tree.step();

            assert.strictEqual(findNode(tree, "action", "getActionResult0").state, State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult1").state, State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult2").state, State.RUNNING);
            assert.strictEqual(findNode(tree, "action", "getActionResult3").state, State.READY);
        });

        it("(JSON)", () => {
            const definition: RootNodeDefinition = {
                type: "root",
                child: {
                    type: "sequence",
                    children: [
                        {
                            type: "action",
                            call: "getActionResult0"
                        },
                        {
                            type: "action",
                            call: "getActionResult1"
                        },
                        {
                            type: "action",
                            call: "getActionResult2"
                        },
                        {
                            type: "action",
                            call: "getActionResult3"
                        }
                    ]
                }
            };
            const agent = {
                getActionResult0: () => State.SUCCEEDED,
                getActionResult1: () => State.SUCCEEDED,
                getActionResult2: () => State.RUNNING,
                getActionResult3: () => State.SUCCEEDED
            };
            const tree = new BehaviourTree(definition, agent);

            assert.strictEqual(findNode(tree, "action", "getActionResult0").state, State.READY);
            assert.strictEqual(findNode(tree, "action", "getActionResult1").state, State.READY);
            assert.strictEqual(findNode(tree, "action", "getActionResult2").state, State.READY);
            assert.strictEqual(findNode(tree, "action", "getActionResult3").state, State.READY);

            tree.step();

            assert.strictEqual(findNode(tree, "action", "getActionResult0").state, State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult1").state, State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult2").state, State.RUNNING);
            assert.strictEqual(findNode(tree, "action", "getActionResult3").state, State.READY);

            agent.getActionResult2 = () => State.SUCCEEDED;

            tree.step();

            assert.strictEqual(findNode(tree, "action", "getActionResult0").state, State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult1").state, State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult2").state, State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult3").state, State.SUCCEEDED);

            agent.getActionResult2 = () => State.RUNNING;

            tree.step();

            assert.strictEqual(findNode(tree, "action", "getActionResult0").state, State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult1").state, State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult2").state, State.RUNNING);
            assert.strictEqual(findNode(tree, "action", "getActionResult3").state, State.READY);
        });
    });
});
