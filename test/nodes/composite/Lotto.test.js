const mistreevous = require("../../../dist/index");
const chai = require("chai");

var assert = chai.assert;

const findNode = (tree, type, caption) => tree.getFlattenedNodeDetails().find((node) => node.type === type);

describe("A Lotto node", () => {
    describe("on tree initialisation", () => {
        describe("will error if the node does not have at least one child", () => {
            it("(MDSL)", () => {
                const definition = "root { lotto {} }";
                assert.throws(
                    () => new mistreevous.BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: a lotto node must have at least a single child"
                );
            });

            it("(JSON)", () => {
                const definition = {
                    type: "root",
                    child: {
                        type: "lotto",
                        children: []
                    }
                };
                assert.throws(
                    () => new mistreevous.BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: expected non-empty 'children' array to be defined for lotto node at depth '1'"
                );
            });
        });

        describe("will error if any optional weights are defined and", () => {
            describe("are not positive integer values", () => {
                it("(MDSL)", () => {
                    let definition = "root { lotto [-1] { action [SomeAction] } }";
                    assert.throws(
                        () => new mistreevous.BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: lotto node weight arguments must be positive integer values"
                    );

                    definition = "root { lotto [1.234] { action [SomeAction] } }";
                    assert.throws(
                        () => new mistreevous.BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: lotto node weight arguments must be positive integer values"
                    );

                    definition = 'root { lotto ["some-string"] { action [SomeAction] } }';
                    assert.throws(
                        () => new mistreevous.BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: lotto node weight arguments must be positive integer values"
                    );

                    definition = "root { lotto [false] { action [SomeAction] } }";
                    assert.throws(
                        () => new mistreevous.BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: lotto node weight arguments must be positive integer values"
                    );
                });

                it("(JSON)", () => {
                    let definition = {
                        type: "root",
                        child: {
                            type: "lotto",
                            weights: [-1],
                            children: [
                                {
                                    type: "action",
                                    call: "SomeAction"
                                }
                            ]
                        }
                    };
                    assert.throws(
                        () => new mistreevous.BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: expected an array of positive integer weight values with a length matching the number of child nodes for 'weights' property if defined for lotto node at depth '1'"
                    );

                    definition = {
                        type: "root",
                        child: {
                            type: "lotto",
                            weights: [1.234],
                            children: [
                                {
                                    type: "action",
                                    call: "SomeAction"
                                }
                            ]
                        }
                    };
                    assert.throws(
                        () => new mistreevous.BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: expected an array of positive integer weight values with a length matching the number of child nodes for 'weights' property if defined for lotto node at depth '1'"
                    );

                    definition = {
                        type: "root",
                        child: {
                            type: "lotto",
                            weights: ["some-string"],
                            children: [
                                {
                                    type: "action",
                                    call: "SomeAction"
                                }
                            ]
                        }
                    };
                    assert.throws(
                        () => new mistreevous.BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: expected an array of positive integer weight values with a length matching the number of child nodes for 'weights' property if defined for lotto node at depth '1'"
                    );

                    definition = {
                        type: "root",
                        child: {
                            type: "lotto",
                            weights: [false],
                            children: [
                                {
                                    type: "action",
                                    call: "SomeAction"
                                }
                            ]
                        }
                    };
                    assert.throws(
                        () => new mistreevous.BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: expected an array of positive integer weight values with a length matching the number of child nodes for 'weights' property if defined for lotto node at depth '1'"
                    );
                });
            });

            describe("the number of weights does not match the number of child nodes", () => {
                it("(MDSL)", () => {
                    const definition = "root { lotto [1] { action [SomeAction] action [SomeOtherAction] } }";
                    assert.throws(
                        () => new mistreevous.BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: expected a number of weight arguments matching the number of child nodes for lotto node"
                    );
                });

                it("(JSON)", () => {
                    const definition = {
                        type: "root",
                        child: {
                            type: "lotto",
                            weights: [1],
                            children: [
                                {
                                    type: "action",
                                    call: "SomeAction"
                                },
                                {
                                    type: "action",
                                    call: "SomeOtherAction"
                                }
                            ]
                        }
                    };
                    assert.throws(
                        () => new mistreevous.BehaviourTree(definition, {}),
                        Error,
                        "invalid definition: expected an array of positive integer weight values with a length matching the number of child nodes for 'weights' property if defined for lotto node at depth '1'"
                    );
                });
            });
        });
    });

    describe("when updated as part of a tree step will", () => {
        describe("when initially in the READY state will select a child node at random to be the single active child node", () => {
            it("(MDSL)", () => {
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

            it("(JSON)", () => {
                const definition = {
                    type: "root",
                    child: {
                        type: "lotto",
                        children: [
                            {
                                type: "condition",
                                call: "IsTrue"
                            }
                        ]
                    }
                };
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
        });

        describe("will use the 'random' function to select the single active child if it was defined as a behaviour tree option", () => {
            it("(MDSL)", () => {
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

            it("(JSON)", () => {
                const definition = {
                    type: "root",
                    child: {
                        type: "lotto",
                        children: [
                            {
                                type: "condition",
                                call: "IsFalse"
                            },
                            {
                                type: "condition",
                                call: "IsFalse"
                            },
                            {
                                type: "condition",
                                call: "IsFalse"
                            },
                            {
                                type: "condition",
                                call: "IsTrue"
                            },
                            {
                                type: "condition",
                                call: "IsFalse"
                            },
                            {
                                type: "condition",
                                call: "IsFalse"
                            }
                        ]
                    }
                };
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
        });

        it("can optionally have weights defined and will use them to influence the selection of the single active child", () => {
            // TODO Need to figure out how to spy on createLotto as there is no other way to test this.
        });

        describe("move to the SUCCESS state if the selected child node moves to the SUCCESS state", () => {
            it("(MDSL)", () => {
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

            it("(JSON)", () => {
                const definition = {
                    type: "root",
                    child: {
                        type: "lotto",
                        children: [
                            {
                                type: "condition",
                                call: "IsTrue"
                            }
                        ]
                    }
                };
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
        });

        describe("move to the FAILED state if the selected child node moves to the FAILED state", () => {
            it("(MDSL)", () => {
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

            it("(JSON)", () => {
                const definition = {
                    type: "root",
                    child: {
                        type: "lotto",
                        children: [
                            {
                                type: "condition",
                                call: "IsFalse"
                            }
                        ]
                    }
                };
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
        });

        describe("move to the RUNNING state if the selected child node does not move to the SUCCESS or FAILED state", () => {
            it("(MDSL)", () => {
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

            it("(JSON)", () => {
                const definition = {
                    type: "root",
                    child: {
                        type: "lotto",
                        children: [
                            {
                                type: "action",
                                call: "someAction"
                            }
                        ]
                    }
                };
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
});
