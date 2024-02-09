const mistreevous = require("../../../dist/index");
const chai = require("chai");

var assert = chai.assert;

const findNode = (tree, type, caption) =>
    tree.getFlattenedNodeDetails().find((node) => node.type === type && node.caption === caption);

describe("A Flip node", () => {
    describe("on tree initialisation", () => {
        describe("will error if the node does not have a single child", () => {
            it("(MDSL)", () => {
                const definition = "root { flip {} }";
                assert.throws(
                    () => new mistreevous.BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: a flip node must have a single child"
                );
            });

            it("(JSON)", () => {
                const definition = {
                    type: "root",
                    child: {
                        type: "flip"
                    }
                };
                assert.throws(
                    () => new mistreevous.BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: expected property 'child' to be defined for flip node at depth '1'"
                );
            });
        });
    });

    describe("when updated as part of a tree step will", () => {
        describe("move to the SUCCESS state if the child node moves to the FAILED state", () => {
            it("(MDSL)", () => {
                const definition = "root { flip { condition [someCondition] } }";
                const agent = { someCondition: () => false };
                const tree = new mistreevous.BehaviourTree(definition, agent);

                let node = findNode(tree, "flip", "FLIP");
                assert.strictEqual(node.state, mistreevous.State.READY);

                tree.step();

                node = findNode(tree, "flip", "FLIP");
                assert.strictEqual(node.state, mistreevous.State.SUCCEEDED);
            });

            it("(JSON)", () => {
                const definition = {
                    type: "root",
                    child: {
                        type: "flip",
                        child: {
                            type: "condition",
                            call: "someCondition"
                        }
                    }
                };
                const agent = { someCondition: () => false };
                const tree = new mistreevous.BehaviourTree(definition, agent);

                let node = findNode(tree, "flip", "FLIP");
                assert.strictEqual(node.state, mistreevous.State.READY);

                tree.step();

                node = findNode(tree, "flip", "FLIP");
                assert.strictEqual(node.state, mistreevous.State.SUCCEEDED);
            });
        });

        describe("move to the FAILED state if the child node moves to the SUCCESS state", () => {
            it("(MDSL)", () => {
                const definition = "root { flip { condition [someCondition] } }";
                const agent = { someCondition: () => true };
                const tree = new mistreevous.BehaviourTree(definition, agent);

                let node = findNode(tree, "flip", "FLIP");
                assert.strictEqual(node.state, mistreevous.State.READY);

                tree.step();

                node = findNode(tree, "flip", "FLIP");
                assert.strictEqual(node.state, mistreevous.State.FAILED);
            });

            it("(JSON)", () => {
                const definition = {
                    type: "root",
                    child: {
                        type: "flip",
                        child: {
                            type: "condition",
                            call: "someCondition"
                        }
                    }
                };
                const agent = { someCondition: () => true };
                const tree = new mistreevous.BehaviourTree(definition, agent);

                let node = findNode(tree, "flip", "FLIP");
                assert.strictEqual(node.state, mistreevous.State.READY);

                tree.step();

                node = findNode(tree, "flip", "FLIP");
                assert.strictEqual(node.state, mistreevous.State.FAILED);
            });
        });

        describe("move to the RUNNING state if the child node does not move to the SUCCESS or FAILED state", () => {
            it("(MDSL)", () => {
                const definition = "root { flip { action [someAction] } }";
                const agent = { someAction: () => {} };
                const tree = new mistreevous.BehaviourTree(definition, agent);

                let node = findNode(tree, "flip", "FLIP");
                assert.strictEqual(node.state, mistreevous.State.READY);

                tree.step();

                node = findNode(tree, "flip", "FLIP");
                assert.strictEqual(node.state, mistreevous.State.RUNNING);
            });

            it("(JSON)", () => {
                const definition = {
                    type: "root",
                    child: {
                        type: "flip",
                        child: {
                            type: "action",
                            call: "someAction"
                        }
                    }
                };
                const agent = { someAction: () => {} };
                const tree = new mistreevous.BehaviourTree(definition, agent);

                let node = findNode(tree, "flip", "FLIP");
                assert.strictEqual(node.state, mistreevous.State.READY);

                tree.step();

                node = findNode(tree, "flip", "FLIP");
                assert.strictEqual(node.state, mistreevous.State.RUNNING);
            });
        });
    });
});
