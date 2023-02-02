const mistreevous = require("../../../dist/index");
const chai = require("chai");
const sinon = require("sinon");

var assert = chai.assert;

const findNode = (tree, type, caption) =>
    tree.getFlattenedNodeDetails().find((node) => node.type === type && (!caption || node.caption === caption));

describe("A Wait node", () => {
    describe("on tree initialisation", () => {
        it("will error if a duration is not provided", () => {
            const definition = "root { wait [] }";
            assert.throws(
                () => new mistreevous.BehaviourTree(definition, {}),
                Error,
                "error parsing tree: invalid number of wait node duration arguments defined"
            );
        });
    });

    describe("when updated as part of a tree step", () => {
        var clock;

        beforeEach(() => (clock = sinon.useFakeTimers()));
        afterEach(() => clock.restore());

        describe("and an explicit duration was defined", () => {
            it("will move to the SUCCEEDED state if the duration has expired", () => {
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
        });

        describe("and an explicit duration was not defined", () => {});

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
