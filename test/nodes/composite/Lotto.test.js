const mistreevous = require("../../../dist/index");
const chai = require("chai");

var assert = chai.assert;

const findNode = (tree, type, caption) => tree.getFlattenedNodeDetails().find((node) => node.type === type);

describe("A Lotto node", () => {
    describe("on tree initialisation", () => {
        it("will error if the node does not have at least one child", () => {
            const definition = "root { lotto {} }";
            assert.throws(
                () => new mistreevous.BehaviourTree(definition, {}),
                Error,
                "error parsing tree: a lotto node must have at least a single child"
            );
        });
    });

    describe("when updated as part of a tree step will", () => {
        it("when initially in the READY state will select a child node at random to be the single active child node", () => {
            const definition = "root { lotto { condition [IsTrue] } }";
            const agent = { IsTrue: () => true };
            const tree = new mistreevous.BehaviourTree(definition, agent);

            let lottoNode = findNode(tree, "lotto");
            let childNode = findNode(tree, "condition");
            assert.strictEqual(lottoNode.state, mistreevous.State.READY);
            assert.strictEqual(childNode.state, mistreevous.State.READY);

            tree.step();

            lottoNode = findNode(tree, "lotto");
            childNode = findNode(tree, "condition");
            assert.strictEqual(lottoNode.state, mistreevous.State.SUCCEEDED);
            assert.strictEqual(childNode.state, mistreevous.State.SUCCEEDED);
        });

        it("will use the 'random' function to select the single active child if it was defined as a behaviour tree option", () => {
            const definition =
                "root { lotto { condition [IsFalse] condition [IsFalse] condition [IsFalse] condition [IsTrue] condition [IsFalse] condition [IsFalse] } }";
            const agent = {
                IsTrue: () => true,
                IsFalse: () => false
            };
            const options = {
                // Usually this would return a new pseudo-random number each time, but for the sake of this test we
                // just want to make sure that the number we return actually has an impact on which child node of the
                // lotto node is selected. A value of 0.6 should always result in the fourth child out of six being picked.
                random: () => 0.6
            };
            const tree = new mistreevous.BehaviourTree(definition, agent, options);

            let lottoNode = findNode(tree, "lotto");
            assert.strictEqual(lottoNode.state, mistreevous.State.READY);

            tree.step();

            // Check that the lotto node has moved into the SUCCEEDED state. This would only
            // have happened if the fourth condition node was selected by the lotto node.
            lottoNode = findNode(tree, "lotto");
            assert.strictEqual(lottoNode.state, mistreevous.State.SUCCEEDED);
        });

        it("move to the SUCCESS state if the selected child node moves to the SUCCESS state", () => {
            const definition = "root { lotto { condition [IsTrue] } }";
            const agent = { IsTrue: () => true };
            const tree = new mistreevous.BehaviourTree(definition, agent);

            let lottoNode = findNode(tree, "lotto");
            let childNode = findNode(tree, "condition");
            assert.strictEqual(lottoNode.state, mistreevous.State.READY);
            assert.strictEqual(childNode.state, mistreevous.State.READY);

            tree.step();

            lottoNode = findNode(tree, "lotto");
            childNode = findNode(tree, "condition");
            assert.strictEqual(lottoNode.state, mistreevous.State.SUCCEEDED);
            assert.strictEqual(childNode.state, mistreevous.State.SUCCEEDED);
        });

        it("move to the FAILED state if the selected child node moves to the FAILED state", () => {
            const definition = "root { lotto { condition [IsFalse] } }";
            const agent = { IsFalse: () => false };
            const tree = new mistreevous.BehaviourTree(definition, agent);

            let lottoNode = findNode(tree, "lotto");
            let childNode = findNode(tree, "condition");
            assert.strictEqual(lottoNode.state, mistreevous.State.READY);
            assert.strictEqual(childNode.state, mistreevous.State.READY);

            tree.step();

            lottoNode = findNode(tree, "lotto");
            childNode = findNode(tree, "condition");
            assert.strictEqual(lottoNode.state, mistreevous.State.FAILED);
            assert.strictEqual(childNode.state, mistreevous.State.FAILED);
        });

        it("move to the RUNNING state if the selected child node does not move to the SUCCESS or FAILED state", () => {
            const definition = "root { lotto { action [someAction] } }";
            const agent = { someAction: () => {} };
            const tree = new mistreevous.BehaviourTree(definition, agent);

            let lottoNode = findNode(tree, "lotto");
            let actionNode = findNode(tree, "action");
            assert.strictEqual(lottoNode.state, mistreevous.State.READY);
            assert.strictEqual(actionNode.state, mistreevous.State.READY);

            tree.step();

            lottoNode = findNode(tree, "lotto");
            actionNode = findNode(tree, "action");
            assert.strictEqual(lottoNode.state, mistreevous.State.RUNNING);
            assert.strictEqual(actionNode.state, mistreevous.State.RUNNING);
        });
    });
});
