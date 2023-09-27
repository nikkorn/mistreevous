const mistreevous = require("../dist/index");
const chai = require("chai");

var assert = chai.assert;

const findNode = (tree, type, caption) =>
    tree.getFlattenedNodeDetails().find((node) => node.type === type && node.caption === caption);

describe("A BehaviourTree instance", () => {
    describe("has initialisation logic that", () => {
        describe("should error when", () => {
            it("the tree definition argument is not a string", () => {
                assert.throws(
                    () => new mistreevous.BehaviourTree(null, {}),
                    Error,
                    "the tree definition must be a string"
                );
            });

            it("the tree definition argument is not a valid tree definition", () => {
                assert.throws(
                    () => new mistreevous.BehaviourTree("", {}),
                    Error,
                    "error parsing tree: invalid token count"
                );
            });

            it("the tree definition argument contains unexpected tokens", () => {
                assert.throws(
                    () => new mistreevous.BehaviourTree("invalid-token { }", {}),
                    Error,
                    "error parsing tree: unexpected token 'invalid-token'"
                );
            });

            it("the agent object is not defined", () => {
                assert.throws(() => new mistreevous.BehaviourTree("", undefined), Error, "the agent must be defined");
            });
        });

        it("should not error when the tree definition argument is a valid definition", () => {
            assert.doesNotThrow(() => new mistreevous.BehaviourTree("root { action [test] }", {}), Error);
        });
    });

    it("has a 'getState' function that returns the state of the root node", () => {
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

    it("has an 'isRunning' function that returns a flag defining whether the tree is in a running state", () => {
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

    it("has a 'reset' function that resets the tree from the root node outwards to each nested node, giving each a state of READY", () => {
        const definition = "root { action [getActionResult] }";
        const agent = { getActionResult: () => mistreevous.State.SUCCEEDED };
        const tree = new mistreevous.BehaviourTree(definition, agent);

        assert.strictEqual(tree.getState(), mistreevous.State.READY);

        tree.step();

        assert.strictEqual(tree.getState(), mistreevous.State.SUCCEEDED);

        tree.reset();

        assert.strictEqual(tree.getState(), mistreevous.State.READY);
    });

    it("has a 'step' function that .....", () => {
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
});
