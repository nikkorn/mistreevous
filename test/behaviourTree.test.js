const mistreevous = require("../dist/index");
const chai = require("chai");

var assert = chai.assert;

const findNode = (tree, type, caption) =>
    tree.getFlattenedNodeDetails().find((node) => node.type === type && node.caption === caption);

describe("A BehaviourTree instance", () => {
    describe("has initialisation logic that", () => {
        describe("should error when", () => {
            it("the tree definition argument is not defined", () => {
                assert.throws(() => new mistreevous.BehaviourTree(null, {}), Error, "tree definition not defined");
                assert.throws(() => new mistreevous.BehaviourTree(undefined, {}), Error, "tree definition not defined");
            });

            it("the agent object is not defined", () => {
                assert.throws(
                    () => new mistreevous.BehaviourTree("", undefined),
                    Error,
                    "the agent must be an object and not null"
                );
                assert.throws(
                    () => new mistreevous.BehaviourTree("", null),
                    Error,
                    "the agent must be an object and not null"
                );
                assert.throws(
                    () => new mistreevous.BehaviourTree("", 42),
                    Error,
                    "the agent must be an object and not null"
                );
            });
        });

        describe("should not error when the tree definition argument is a valid definition", () => {
            it("(MDSL)", () => {
                const definition = "root { action [test] }";
                assert.doesNotThrow(() => new mistreevous.BehaviourTree(definition, {}), Error);
            });

            it("(JSON)", () => {
                const definition = {
                    type: "root",
                    child: {
                        type: "action",
                        call: "test"
                    }
                };
                assert.doesNotThrow(() => new mistreevous.BehaviourTree(definition, {}), Error);
            });
        });
    });

    describe("has a 'getState' function that returns the state of the root node", () => {
        it("(MDSL)", () => {
            let actionResult = undefined;

            const definition = "root { action [getActionResult] }";
            const agent = { getActionResult: () => actionResult };
            const tree = new mistreevous.BehaviourTree(definition, agent);

            assert.strictEqual(tree.getState(), mistreevous.State.READY);

            tree.step();

            assert.strictEqual(tree.getState(), mistreevous.State.RUNNING);

            actionResult = mistreevous.State.SUCCEEDED;

            tree.step();

            assert.strictEqual(tree.getState(), mistreevous.State.SUCCEEDED);
        });

        it("(JSON)", () => {
            let actionResult = undefined;

            const definition = {
                type: "root",
                child: {
                    type: "action",
                    call: "getActionResult"
                }
            };
            const agent = { getActionResult: () => actionResult };
            const tree = new mistreevous.BehaviourTree(definition, agent);

            assert.strictEqual(tree.getState(), mistreevous.State.READY);

            tree.step();

            assert.strictEqual(tree.getState(), mistreevous.State.RUNNING);

            actionResult = mistreevous.State.SUCCEEDED;

            tree.step();

            assert.strictEqual(tree.getState(), mistreevous.State.SUCCEEDED);
        });
    });

    describe("has an 'isRunning' function that returns a flag defining whether the tree is in a running state", () => {
        it("(MDSL)", () => {
            let actionResult = undefined;

            const definition = "root { action [getActionResult] }";
            const agent = { getActionResult: () => actionResult };
            const tree = new mistreevous.BehaviourTree(definition, agent);

            assert.strictEqual(tree.isRunning(), false);

            tree.step();

            assert.strictEqual(tree.isRunning(), true);

            actionResult = mistreevous.State.SUCCEEDED;

            tree.step();

            assert.strictEqual(tree.isRunning(), false);
        });

        it("(JSON)", () => {
            let actionResult = undefined;

            const definition = {
                type: "root",
                child: {
                    type: "action",
                    call: "getActionResult"
                }
            };
            const agent = { getActionResult: () => actionResult };
            const tree = new mistreevous.BehaviourTree(definition, agent);

            assert.strictEqual(tree.isRunning(), false);

            tree.step();

            assert.strictEqual(tree.isRunning(), true);

            actionResult = mistreevous.State.SUCCEEDED;

            tree.step();

            assert.strictEqual(tree.isRunning(), false);
        });
    });

    describe("has a 'reset' function that resets the tree from the root node outwards to each nested node, giving each a state of READY", () => {
        it("(MDSL)", () => {
            const definition = "root { sequence { action [getActionResult] } }";
            const agent = { getActionResult: () => mistreevous.State.SUCCEEDED };
            const tree = new mistreevous.BehaviourTree(definition, agent);

            assert.strictEqual(findNode(tree, "root", "ROOT").state, mistreevous.State.READY);
            assert.strictEqual(findNode(tree, "sequence", "SEQUENCE").state, mistreevous.State.READY);
            assert.strictEqual(findNode(tree, "action", "getActionResult").state, mistreevous.State.READY);

            tree.step();

            assert.strictEqual(findNode(tree, "root", "ROOT").state, mistreevous.State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "sequence", "SEQUENCE").state, mistreevous.State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult").state, mistreevous.State.SUCCEEDED);

            tree.reset();

            assert.strictEqual(findNode(tree, "root", "ROOT").state, mistreevous.State.READY);
            assert.strictEqual(findNode(tree, "sequence", "SEQUENCE").state, mistreevous.State.READY);
            assert.strictEqual(findNode(tree, "action", "getActionResult").state, mistreevous.State.READY);
        });

        it("(JSON)", () => {
            const definition = {
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
            const agent = { getActionResult: () => mistreevous.State.SUCCEEDED };
            const tree = new mistreevous.BehaviourTree(definition, agent);

            assert.strictEqual(findNode(tree, "root", "ROOT").state, mistreevous.State.READY);
            assert.strictEqual(findNode(tree, "sequence", "SEQUENCE").state, mistreevous.State.READY);
            assert.strictEqual(findNode(tree, "action", "getActionResult").state, mistreevous.State.READY);

            tree.step();

            assert.strictEqual(findNode(tree, "root", "ROOT").state, mistreevous.State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "sequence", "SEQUENCE").state, mistreevous.State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult").state, mistreevous.State.SUCCEEDED);

            tree.reset();

            assert.strictEqual(findNode(tree, "root", "ROOT").state, mistreevous.State.READY);
            assert.strictEqual(findNode(tree, "sequence", "SEQUENCE").state, mistreevous.State.READY);
            assert.strictEqual(findNode(tree, "action", "getActionResult").state, mistreevous.State.READY);
        });
    });

    describe("has a 'step' function that updates all nodes in sequence unless a node is left in the running state", () => {
        it("(MDSL)", () => {
            const definition =
                "root { sequence { action [getActionResult0] action [getActionResult1] action [getActionResult2] action [getActionResult3] } }";
            const agent = {
                getActionResult0: () => mistreevous.State.SUCCEEDED,
                getActionResult1: () => mistreevous.State.SUCCEEDED,
                getActionResult2: () => undefined,
                getActionResult3: () => mistreevous.State.SUCCEEDED
            };
            const tree = new mistreevous.BehaviourTree(definition, agent);

            assert.strictEqual(findNode(tree, "action", "getActionResult0").state, mistreevous.State.READY);
            assert.strictEqual(findNode(tree, "action", "getActionResult1").state, mistreevous.State.READY);
            assert.strictEqual(findNode(tree, "action", "getActionResult2").state, mistreevous.State.READY);
            assert.strictEqual(findNode(tree, "action", "getActionResult3").state, mistreevous.State.READY);

            tree.step();

            assert.strictEqual(findNode(tree, "action", "getActionResult0").state, mistreevous.State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult1").state, mistreevous.State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult2").state, mistreevous.State.RUNNING);
            assert.strictEqual(findNode(tree, "action", "getActionResult3").state, mistreevous.State.READY);

            agent.getActionResult2 = () => mistreevous.State.SUCCEEDED;

            tree.step();

            assert.strictEqual(findNode(tree, "action", "getActionResult0").state, mistreevous.State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult1").state, mistreevous.State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult2").state, mistreevous.State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult3").state, mistreevous.State.SUCCEEDED);

            agent.getActionResult2 = () => undefined;

            tree.step();

            assert.strictEqual(findNode(tree, "action", "getActionResult0").state, mistreevous.State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult1").state, mistreevous.State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult2").state, mistreevous.State.RUNNING);
            assert.strictEqual(findNode(tree, "action", "getActionResult3").state, mistreevous.State.READY);
        });

        it("(JSON)", () => {
            const definition = {
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
                getActionResult0: () => mistreevous.State.SUCCEEDED,
                getActionResult1: () => mistreevous.State.SUCCEEDED,
                getActionResult2: () => undefined,
                getActionResult3: () => mistreevous.State.SUCCEEDED
            };
            const tree = new mistreevous.BehaviourTree(definition, agent);

            assert.strictEqual(findNode(tree, "action", "getActionResult0").state, mistreevous.State.READY);
            assert.strictEqual(findNode(tree, "action", "getActionResult1").state, mistreevous.State.READY);
            assert.strictEqual(findNode(tree, "action", "getActionResult2").state, mistreevous.State.READY);
            assert.strictEqual(findNode(tree, "action", "getActionResult3").state, mistreevous.State.READY);

            tree.step();

            assert.strictEqual(findNode(tree, "action", "getActionResult0").state, mistreevous.State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult1").state, mistreevous.State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult2").state, mistreevous.State.RUNNING);
            assert.strictEqual(findNode(tree, "action", "getActionResult3").state, mistreevous.State.READY);

            agent.getActionResult2 = () => mistreevous.State.SUCCEEDED;

            tree.step();

            assert.strictEqual(findNode(tree, "action", "getActionResult0").state, mistreevous.State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult1").state, mistreevous.State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult2").state, mistreevous.State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult3").state, mistreevous.State.SUCCEEDED);

            agent.getActionResult2 = () => undefined;

            tree.step();

            assert.strictEqual(findNode(tree, "action", "getActionResult0").state, mistreevous.State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult1").state, mistreevous.State.SUCCEEDED);
            assert.strictEqual(findNode(tree, "action", "getActionResult2").state, mistreevous.State.RUNNING);
            assert.strictEqual(findNode(tree, "action", "getActionResult3").state, mistreevous.State.READY);
        });
    });
});
