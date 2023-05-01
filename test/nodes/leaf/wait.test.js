const mistreevous = require("../../../dist/index");
const chai = require("chai");
const sinon = require("sinon");

var assert = chai.assert;

const findNode = (tree, type, caption) =>
    tree.getFlattenedNodeDetails().find((node) => node.type === type && (!caption || node.caption === caption));

describe("A Wait node", () => {
    describe("on tree initialisation", () => {
        describe("will error if", () => {
            it("the defined node arguments are not integers", () => {
                const definition = "root { wait ['not', 'integers'] }";
                assert.throws(
                    () => new mistreevous.BehaviourTree(definition, {}),
                    Error,
                    "error parsing tree: wait node durations must be integer values"
                );
            });

            it("a negative duration node argument was defined", () => {
                const definition = "root { wait [-1] }";
                assert.throws(
                    () => new mistreevous.BehaviourTree(definition, {}),
                    Error,
                    "error parsing tree: a wait node must have a positive duration"
                );
            });

            it("more than two node arguments are defined", () => {
                const definition = "root { wait [0, 1000, 4000] }";
                assert.throws(
                    () => new mistreevous.BehaviourTree(definition, {}),
                    Error,
                    "error parsing tree: invalid number of wait node duration arguments defined"
                );
            });

            it("a minimum duration bound node argument is defined that is greater than the maximum duration bound node argument", () => {
                const definition = "root { wait [1000, 500] }";
                assert.throws(
                    () => new mistreevous.BehaviourTree(definition, {}),
                    Error,
                    "error parsing tree: a wait node must not have a minimum duration that exceeds the maximum duration"
                );
            });
        });
    });

    describe("when updated as part of a tree step", () => {
        var clock;
        var sandbox;

        beforeEach(() => {
            clock = sinon.useFakeTimers();
            sandbox = sinon.createSandbox();
            sandbox.replace(globalThis.Math, "random", () => 0.5);
        });

        afterEach(() => {
            clock.restore();
            sandbox.restore();
        });

        it("and an explicit duration was defined will move to the SUCCEEDED state if the duration has expired", () => {
            const definition = "root { wait [100] }";
            const tree = new mistreevous.BehaviourTree(definition, {});

            let node = findNode(tree, "wait");
            assert.strictEqual(node.state, mistreevous.State.READY);

            tree.step();

            node = findNode(tree, "wait");
            assert.strictEqual(node.state, mistreevous.State.RUNNING);

            clock.tick(99);

            tree.step();

            node = findNode(tree, "wait");
            assert.strictEqual(node.state, mistreevous.State.RUNNING);

            clock.tick(1);

            tree.step();

            node = findNode(tree, "wait");
            assert.strictEqual(node.state, mistreevous.State.SUCCEEDED);
        });

        describe("and min and max durations were defined", () => {
            it("will select a random duration between the min and max durations and move to the SUCCEEDED state if the duration has expired", () => {
                const definition = "root { wait [5000, 10000] }";
                const tree = new mistreevous.BehaviourTree(definition, {});

                let node = findNode(tree, "wait");
                assert.strictEqual(node.state, mistreevous.State.READY);

                tree.step();

                node = findNode(tree, "wait");
                assert.strictEqual(node.state, mistreevous.State.RUNNING);

                // We have spied on Math.random to always return 0.5 for the sake of this test, so our actual duration 'should' be 7500ms.
                clock.tick(7499);

                tree.step();

                node = findNode(tree, "wait");
                assert.strictEqual(node.state, mistreevous.State.RUNNING);

                clock.tick(1);

                tree.step();

                node = findNode(tree, "wait");
                assert.strictEqual(node.state, mistreevous.State.SUCCEEDED);
            });

            it("will use the 'random' function to select the duration between the min and max durations if it was defined as a behaviour tree option and move to the SUCCEEDED state if the duration has expired", () => {
                const definition = "root { wait [5000, 10000] }";
                const options = {
                    // Usually this would return a new pseudo-random number each time, but for the sake of this test we
                    // just want to make sure that the number we return actually has an impact on which duration is picked.
                    random: () => 0.2
                };
                const tree = new mistreevous.BehaviourTree(definition, {}, options);

                let node = findNode(tree, "wait");
                assert.strictEqual(node.state, mistreevous.State.READY);

                tree.step();

                node = findNode(tree, "wait");
                assert.strictEqual(node.state, mistreevous.State.RUNNING);

                // Our 'random' function option will always return 0.2 for the sake of this test, so our actual duration 'should' be 6000ms.
                clock.tick(5999);

                tree.step();

                node = findNode(tree, "wait");
                assert.strictEqual(node.state, mistreevous.State.RUNNING);

                clock.tick(1);

                tree.step();

                node = findNode(tree, "wait");
                assert.strictEqual(node.state, mistreevous.State.SUCCEEDED);
            });
        });

        it("and an explicit duration or min and max durations were not defined will stay in the RUNNING state until aborted", () => {
            const definition = "root { wait while(CanWait) }";
            let canWait = true;
            const agent = { CanWait: () => canWait };
            const tree = new mistreevous.BehaviourTree(definition, agent);

            let node = findNode(tree, "wait");
            assert.strictEqual(node.state, mistreevous.State.READY);

            tree.step();

            node = findNode(tree, "wait");
            assert.strictEqual(node.state, mistreevous.State.RUNNING);

            clock.tick(1000000);

            tree.step();

            node = findNode(tree, "wait");
            assert.strictEqual(node.state, mistreevous.State.RUNNING);

            canWait = false;

            tree.step();

            node = findNode(tree, "wait");
            assert.strictEqual(node.state, mistreevous.State.FAILED);
        });

        it("will use the 'getDeltaTime' function to update the elapsed duration if it was defined as a behaviour tree option", () => {
            const definition = "root { wait [1000] }";
            const tree = new mistreevous.BehaviourTree(definition, {}, { getDeltaTime: () => 0.5 });

            let node = findNode(tree, "wait");
            assert.strictEqual(node.state, mistreevous.State.READY);

            tree.step();

            node = findNode(tree, "wait");
            assert.strictEqual(node.state, mistreevous.State.RUNNING);

            tree.step();

            node = findNode(tree, "wait");
            assert.strictEqual(node.state, mistreevous.State.SUCCEEDED);
        });
    });
});
