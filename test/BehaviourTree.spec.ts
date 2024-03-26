import { assert } from "chai";
import sinon from "sinon";
import { SinonSandbox } from "sinon";

import { BehaviourTree, NodeDetails, State } from "../src/index";
import { RootNodeDefinition } from "../src/BehaviourTreeDefinition";
import * as Utilities from "../src/Utilities";

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

    describe("has a 'getTreeNodeDetails' function that gets the node details for the tree", () => {
        var sandbox: SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
            sandbox.replace(Utilities, "createUid", () => "fake-node-uid");
        });

        afterEach(() => sandbox.restore());

        it("(MDSL)", () => {
            const definition =
                "root { selector { flip { action [Succeed, 100] } action [Fail, 200] action [Fail, 200] action [Succeed, 100] action [Succeed, 100] } }";
            const agent = {
                Fail: () => State.FAILED,
                Succeed: () => State.SUCCEEDED
            };
            const tree = new BehaviourTree(definition, agent);

            tree.step();

            const expectedTreeNodeDetails: NodeDetails = {
                id: "fake-node-uid",
                type: "root",
                name: "ROOT",
                state: State.SUCCEEDED,
                entry: undefined,
                exit: undefined,
                step: undefined,
                until: undefined,
                while: undefined,
                children: [
                    {
                        id: "fake-node-uid",
                        type: "selector",
                        name: "SELECTOR",
                        state: State.SUCCEEDED,
                        entry: undefined,
                        exit: undefined,
                        step: undefined,
                        until: undefined,
                        while: undefined,
                        children: [
                            {
                                id: "fake-node-uid",
                                type: "flip",
                                name: "FLIP",
                                state: State.FAILED,
                                entry: undefined,
                                exit: undefined,
                                step: undefined,
                                until: undefined,
                                while: undefined,
                                children: [
                                    {
                                        id: "fake-node-uid",
                                        type: "action",
                                        name: "Succeed",
                                        state: State.SUCCEEDED,
                                        args: [100],
                                        entry: undefined,
                                        exit: undefined,
                                        step: undefined,
                                        until: undefined,
                                        while: undefined
                                    }
                                ]
                            },
                            {
                                id: "fake-node-uid",
                                type: "action",
                                name: "Fail",
                                state: State.FAILED,
                                args: [200],
                                entry: undefined,
                                exit: undefined,
                                step: undefined,
                                until: undefined,
                                while: undefined
                            },
                            {
                                id: "fake-node-uid",
                                type: "action",
                                name: "Fail",
                                state: State.FAILED,
                                args: [200],
                                entry: undefined,
                                exit: undefined,
                                step: undefined,
                                until: undefined,
                                while: undefined
                            },
                            {
                                id: "fake-node-uid",
                                type: "action",
                                name: "Succeed",
                                state: State.SUCCEEDED,
                                args: [100],
                                entry: undefined,
                                exit: undefined,
                                step: undefined,
                                until: undefined,
                                while: undefined
                            },
                            {
                                id: "fake-node-uid",
                                type: "action",
                                name: "Succeed",
                                state: State.READY,
                                args: [100],
                                entry: undefined,
                                exit: undefined,
                                step: undefined,
                                until: undefined,
                                while: undefined
                            }
                        ]
                    }
                ]
            };

            assert.deepEqual(tree.getTreeNodeDetails(), expectedTreeNodeDetails);
        });

        it("(JSON)", () => {
            const definition: RootNodeDefinition = {
                type: "root",
                child: {
                    type: "selector",
                    children: [
                        {
                            type: "flip",
                            child: {
                                type: "action",
                                call: "Succeed",
                                args: [100]
                            }
                        },
                        {
                            type: "action",
                            call: "Fail",
                            args: [200]
                        },
                        {
                            type: "action",
                            call: "Fail",
                            args: [200]
                        },
                        {
                            type: "action",
                            call: "Succeed",
                            args: [100]
                        },
                        {
                            type: "action",
                            call: "Succeed",
                            args: [100]
                        }
                    ]
                }
            };
            const agent = {
                Fail: () => State.FAILED,
                Succeed: () => State.SUCCEEDED
            };
            const tree = new BehaviourTree(definition, agent);

            tree.step();

            const expectedTreeNodeDetails: NodeDetails = {
                id: "fake-node-uid",
                type: "root",
                name: "ROOT",
                state: State.SUCCEEDED,
                entry: undefined,
                exit: undefined,
                step: undefined,
                until: undefined,
                while: undefined,
                children: [
                    {
                        id: "fake-node-uid",
                        type: "selector",
                        name: "SELECTOR",
                        state: State.SUCCEEDED,
                        entry: undefined,
                        exit: undefined,
                        step: undefined,
                        until: undefined,
                        while: undefined,
                        children: [
                            {
                                id: "fake-node-uid",
                                type: "flip",
                                name: "FLIP",
                                state: State.FAILED,
                                entry: undefined,
                                exit: undefined,
                                step: undefined,
                                until: undefined,
                                while: undefined,
                                children: [
                                    {
                                        id: "fake-node-uid",
                                        type: "action",
                                        name: "Succeed",
                                        state: State.SUCCEEDED,
                                        args: [100],
                                        entry: undefined,
                                        exit: undefined,
                                        step: undefined,
                                        until: undefined,
                                        while: undefined
                                    }
                                ]
                            },
                            {
                                id: "fake-node-uid",
                                type: "action",
                                name: "Fail",
                                state: State.FAILED,
                                args: [200],
                                entry: undefined,
                                exit: undefined,
                                step: undefined,
                                until: undefined,
                                while: undefined
                            },
                            {
                                id: "fake-node-uid",
                                type: "action",
                                name: "Fail",
                                state: State.FAILED,
                                args: [200],
                                entry: undefined,
                                exit: undefined,
                                step: undefined,
                                until: undefined,
                                while: undefined
                            },
                            {
                                id: "fake-node-uid",
                                type: "action",
                                name: "Succeed",
                                state: State.SUCCEEDED,
                                args: [100],
                                entry: undefined,
                                exit: undefined,
                                step: undefined,
                                until: undefined,
                                while: undefined
                            },
                            {
                                id: "fake-node-uid",
                                type: "action",
                                name: "Succeed",
                                state: State.READY,
                                args: [100],
                                entry: undefined,
                                exit: undefined,
                                step: undefined,
                                until: undefined,
                                while: undefined
                            }
                        ]
                    }
                ]
            } as any;

            assert.deepEqual(tree.getTreeNodeDetails(), expectedTreeNodeDetails);
        });
    });
});
