const mistreevous = require("../../../dist/index");
const chai = require("chai");
const sinon = require("sinon");

var assert = chai.assert;

const findNode = (tree, type, caption) =>
    tree.getFlattenedNodeDetails().find((node) => node.type === type && node.caption === caption);

describe("A Repeat node", () => {
    describe("on tree initialisation", () => {
        it("will error if the node does not have a single child", () => {
            const definition = "root { repeat {} }";
            assert.throws(
                () => new mistreevous.BehaviourTree(definition, {}),
                Error,
                "error parsing tree: a repeat node must have a single child"
            );
        });
    });

    describe("when updated as part of a tree step", () => {
        var sandbox;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
            sandbox.replace(globalThis.Math, "random", () => 0.5);
        });

        afterEach(() => sandbox.restore());

        it("will move to the FAILED state if the child node moves to the FAILED state", () => {
            const definition = "root { repeat { condition [someCondition] } }";
            const agent = { someCondition: () => false };
            const tree = new mistreevous.BehaviourTree(definition, agent);

            let node = findNode(tree, "repeat", "REPEAT");
            assert.exists(node);
            assert.strictEqual(node.state, mistreevous.State.READY);

            tree.step();

            node = findNode(tree, "repeat", "REPEAT");
            assert.strictEqual(node.state, mistreevous.State.FAILED);
        });

        it("will move to the RUNNING state if the child node moves to the SUCCEEDED state", () => {
            const definition = "root { repeat { condition [someCondition] } }";
            const agent = { someCondition: () => true };
            const tree = new mistreevous.BehaviourTree(definition, agent);

            let node = findNode(tree, "repeat", "REPEAT");
            assert.exists(node);
            assert.strictEqual(node.state, mistreevous.State.READY);

            tree.step();

            node = findNode(tree, "repeat", "REPEAT");
            assert.strictEqual(node.state, mistreevous.State.RUNNING);
        });

        it("and an iteration count node argument is defined will attempt to re-run the child node until the iteration count is reached", () => {
            const definition = "root { repeat [3] { condition [someCondition] } }";
            const agent = { someCondition: () => true };
            const tree = new mistreevous.BehaviourTree(definition, agent);

            let node = findNode(tree, "repeat", "REPEAT 3x");
            assert.exists(node);
            assert.strictEqual(node.state, mistreevous.State.READY);

            tree.step();

            node = findNode(tree, "repeat", "REPEAT 3x");
            assert.strictEqual(node.state, mistreevous.State.RUNNING);

            tree.step();

            node = findNode(tree, "repeat", "REPEAT 3x");
            assert.strictEqual(node.state, mistreevous.State.RUNNING);

            tree.step();

            node = findNode(tree, "repeat", "REPEAT 3x");
            assert.strictEqual(node.state, mistreevous.State.RUNNING);

            tree.step();

            node = findNode(tree, "repeat", "REPEAT 3x");
            assert.strictEqual(node.state, mistreevous.State.SUCCEEDED);
        });

        describe("and minumum and maximum iteration count node arguments are defined", () => {
            it("and if the 'random' behaviour tree option is not defined will pick an iteration count from between the minimum and maximum bounds using Math.random", () => {
                // We have spied on Math.random to always return 0.5 for the sake of this test, so our iteration count should always be 4.
                const definition = "root { repeat [2, 6] { condition [someCondition] } }";
                const agent = { someCondition: () => true };
                const tree = new mistreevous.BehaviourTree(definition, agent);

                let node = findNode(tree, "repeat", "REPEAT 2x-6x");
                assert.exists(node);
                assert.strictEqual(node.state, mistreevous.State.READY);

                tree.step();

                node = findNode(tree, "repeat", "REPEAT 2x-6x");
                assert.strictEqual(node.state, mistreevous.State.RUNNING);

                tree.step();

                node = findNode(tree, "repeat", "REPEAT 2x-6x");
                assert.strictEqual(node.state, mistreevous.State.RUNNING);

                tree.step();

                node = findNode(tree, "repeat", "REPEAT 2x-6x");
                assert.strictEqual(node.state, mistreevous.State.RUNNING);

                tree.step();

                node = findNode(tree, "repeat", "REPEAT 2x-6x");
                assert.strictEqual(node.state, mistreevous.State.RUNNING);

                tree.step();

                node = findNode(tree, "repeat", "REPEAT 2x-6x");
                assert.strictEqual(node.state, mistreevous.State.SUCCEEDED);
            });

            it("and if the 'random' behaviour tree option is defined will use it to pick an iteration count from between the minimum and maximum bounds", () => {
                const definition = "root { repeat [2, 10] { condition [someCondition] } }";
                const agent = { someCondition: () => true };
                const options = {
                    // Usually this would return a new pseudo-random number each time, but for the sake of this test we
                    // just want to make sure that the number we return actually has an impact on the iteration count picked.
                    // A value of 0.2 should always result in an iteration count of 3.
                    random: () => 0.2
                };
                const tree = new mistreevous.BehaviourTree(definition, agent, options);

                let node = findNode(tree, "repeat", "REPEAT 2x-10x");
                assert.exists(node);
                assert.strictEqual(node.state, mistreevous.State.READY);

                tree.step();

                node = findNode(tree, "repeat", "REPEAT 2x-10x");
                assert.strictEqual(node.state, mistreevous.State.RUNNING);

                tree.step();

                node = findNode(tree, "repeat", "REPEAT 2x-10x");
                assert.strictEqual(node.state, mistreevous.State.RUNNING);

                tree.step();

                node = findNode(tree, "repeat", "REPEAT 2x-10x");
                assert.strictEqual(node.state, mistreevous.State.RUNNING);

                tree.step();

                node = findNode(tree, "repeat", "REPEAT 2x-10x");
                assert.strictEqual(node.state, mistreevous.State.SUCCEEDED);
            });
        });
    });
});
