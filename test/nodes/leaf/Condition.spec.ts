import { assert } from "chai";

import { BehaviourTree, State } from "../../../src/index";
import { RootNodeDefinition } from "../../../src/BehaviourTreeDefinition";
import { Agent } from "../../../src/Agent";

import { findNode } from "../../TestUtilities";

describe("A Condition node", () => {
    beforeEach(() => BehaviourTree.unregisterAll());

    describe("on tree initialisation", () => {
        describe("will error if no condition function name is defined", () => {
            it("(MDSL)", () => {
                const definition = "root { condition [] }";
                assert.throws(
                    () => new BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: expected condition name identifier argument"
                );
            });

            it("(JSON)", () => {
                const definition = {
                    type: "root",
                    child: {
                        type: "condition"
                    }
                } as any;
                assert.throws(
                    () => new BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: expected non-empty string for 'call' property of condition node at depth '1'"
                );
            });
        });
    });

    describe("when updated as part of a tree step", () => {
        describe("will call the condition function", () => {
            describe("when the referenced function is", () => {
                describe("a registered function", () => {
                    it("(MDSL)", () => {
                        BehaviourTree.register("someCondition", () => {
                            return true;
                        });

                        const definition = "root { condition [someCondition] }";
                        const tree = new BehaviourTree(definition, {});

                        tree.step();

                        const node = findNode(tree, "condition", "someCondition");
                        assert.strictEqual(node.state, State.SUCCEEDED);
                    });

                    it("(JSON)", () => {
                        BehaviourTree.register("someCondition", () => {
                            return true;
                        });

                        const definition: RootNodeDefinition = {
                            type: "root",
                            child: {
                                type: "condition",
                                call: "someCondition"
                            }
                        };
                        const tree = new BehaviourTree(definition, {});

                        tree.step();

                        const node = findNode(tree, "condition", "someCondition");
                        assert.strictEqual(node.state, State.SUCCEEDED);
                    });
                });

                describe("an agent function", () => {
                    it("(MDSL)", () => {
                        const definition = "root { condition [someCondition] }";
                        const agent = { someCondition: () => true };
                        const tree = new BehaviourTree(definition, agent);

                        tree.step();

                        const node = findNode(tree, "condition", "someCondition");
                        assert.strictEqual(node.state, State.SUCCEEDED);
                    });

                    it("(JSON)", () => {
                        const definition: RootNodeDefinition = {
                            type: "root",
                            child: {
                                type: "condition",
                                call: "someCondition"
                            }
                        };
                        const agent = { someCondition: () => true };
                        const tree = new BehaviourTree(definition, agent);

                        tree.step();

                        const node = findNode(tree, "condition", "someCondition");
                        assert.strictEqual(node.state, State.SUCCEEDED);
                    });
                });
            });

            describe("and will error if there is no agent function or registered function that matches the condition name", () => {
                it("(MDSL)", () => {
                    const definition = "root { condition [someCondition] }";
                    let tree: BehaviourTree;
                    assert.doesNotThrow(() => (tree = new BehaviourTree(definition, {})), Error);
                    assert.throws(
                        () => tree.step(),
                        Error,
                        "error stepping tree: cannot update condition node as the condition 'someCondition' function is not defined on the agent and has not been registered"
                    );
                });

                it("(JSON)", () => {
                    const definition: RootNodeDefinition = {
                        type: "root",
                        child: {
                            type: "condition",
                            call: "someCondition"
                        }
                    };
                    let tree: BehaviourTree;
                    assert.doesNotThrow(() => (tree = new BehaviourTree(definition, {})), Error);
                    assert.throws(
                        () => tree.step(),
                        Error,
                        "error stepping tree: cannot update condition node as the condition 'someCondition' function is not defined on the agent and has not been registered"
                    );
                });
            });

            describe("and move to", () => {
                describe("the SUCCESS state if the function returns a truthy value", () => {
                    it("(MDSL)", () => {
                        const definition = "root { condition [someCondition] }";
                        const agent = { someCondition: () => true };
                        const tree = new BehaviourTree(definition, agent);

                        let node = findNode(tree, "condition", "someCondition");
                        assert.strictEqual(node.state, State.READY);

                        tree.step();

                        node = findNode(tree, "condition", "someCondition");
                        assert.strictEqual(node.state, State.SUCCEEDED);
                    });

                    it("(JSON)", () => {
                        const definition: RootNodeDefinition = {
                            type: "root",
                            child: {
                                type: "condition",
                                call: "someCondition"
                            }
                        };
                        const agent = { someCondition: () => true };
                        const tree = new BehaviourTree(definition, agent);

                        let node = findNode(tree, "condition", "someCondition");
                        assert.strictEqual(node.state, State.READY);

                        tree.step();

                        node = findNode(tree, "condition", "someCondition");
                        assert.strictEqual(node.state, State.SUCCEEDED);
                    });
                });

                describe("the FAILED state if the function returns a falsy value", () => {
                    it("(MDSL)", () => {
                        const definition = "root { condition [someCondition] }";
                        const agent = { someCondition: () => false };
                        const tree = new BehaviourTree(definition, agent);

                        let node = findNode(tree, "condition", "someCondition");
                        assert.strictEqual(node.state, State.READY);

                        tree.step();

                        node = findNode(tree, "condition", "someCondition");
                        assert.strictEqual(node.state, State.FAILED);
                    });

                    it("(JSON)", () => {
                        const definition: RootNodeDefinition = {
                            type: "root",
                            child: {
                                type: "condition",
                                call: "someCondition"
                            }
                        };
                        const agent = { someCondition: () => false };
                        const tree = new BehaviourTree(definition, agent);

                        let node = findNode(tree, "condition", "someCondition");
                        assert.strictEqual(node.state, State.READY);

                        tree.step();

                        node = findNode(tree, "condition", "someCondition");
                        assert.strictEqual(node.state, State.FAILED);
                    });
                });
            });

            describe("and pass any node arguments that follow the condition name identifier argument where", () => {
                describe("the argument is a", () => {
                    describe("string", () => {
                        it("(MDSL)", () => {
                            const definition = 'root { condition [someCondition, "hello world!"] }';
                            const agent = {
                                someCondition: (arg: any) => assert.strictEqual(arg, "hello world!")
                            };
                            const tree = new BehaviourTree(definition, agent);

                            tree.step();
                        });

                        it("(JSON)", () => {
                            const definition: RootNodeDefinition = {
                                type: "root",
                                child: {
                                    type: "condition",
                                    call: "someCondition",
                                    args: ["hello world!"]
                                }
                            };
                            const agent = {
                                someCondition: (arg: any) => assert.strictEqual(arg, "hello world!")
                            };
                            const tree = new BehaviourTree(definition, agent);

                            tree.step();
                        });
                    });

                    describe("string with escaped quotes", () => {
                        it("(MDSL)", () => {
                            const definition = 'root { condition [someCondition, "hello \\" world!"] }';
                            const agent = {
                                someCondition: (arg: any) => assert.strictEqual(arg, 'hello " world!')
                            };
                            const tree = new BehaviourTree(definition, agent);

                            tree.step();
                        });

                        it("(JSON)", () => {
                            const definition: RootNodeDefinition = {
                                type: "root",
                                child: {
                                    type: "condition",
                                    call: "someCondition",
                                    args: ['hello " world!']
                                }
                            };
                            const agent = {
                                someCondition: (arg: any) => assert.strictEqual(arg, 'hello " world!')
                            };
                            const tree = new BehaviourTree(definition, agent);

                            tree.step();
                        });
                    });

                    describe("number", () => {
                        it("(MDSL)", () => {
                            const definition = "root { condition [someCondition, 23.4567] }";
                            const agent = {
                                someCondition: (arg: any) => assert.strictEqual(arg, 23.4567)
                            };
                            const tree = new BehaviourTree(definition, agent);

                            tree.step();
                        });

                        it("(JSON)", () => {
                            const definition: RootNodeDefinition = {
                                type: "root",
                                child: {
                                    type: "condition",
                                    call: "someCondition",
                                    args: [23.4567]
                                }
                            };
                            const agent = {
                                someCondition: (arg: any) => assert.strictEqual(arg, 23.4567)
                            };
                            const tree = new BehaviourTree(definition, agent);

                            tree.step();
                        });
                    });

                    describe("boolean 'true' literal", () => {
                        it("(MDSL)", () => {
                            const definition = "root { condition [someCondition, true] }";
                            const agent = {
                                someCondition: (arg: any) => assert.strictEqual(arg, true)
                            };
                            const tree = new BehaviourTree(definition, agent);

                            tree.step();
                        });

                        it("(JSON)", () => {
                            const definition: RootNodeDefinition = {
                                type: "root",
                                child: {
                                    type: "condition",
                                    call: "someCondition",
                                    args: [true]
                                }
                            };
                            const agent = {
                                someCondition: (arg: any) => assert.strictEqual(arg, true)
                            };
                            const tree = new BehaviourTree(definition, agent);

                            tree.step();
                        });
                    });

                    describe("boolean 'false' literal", () => {
                        it("(MDSL)", () => {
                            const definition = "root { condition [someCondition, false] }";
                            const agent = {
                                someCondition: (arg: any) => assert.strictEqual(arg, false)
                            };
                            const tree = new BehaviourTree(definition, agent);

                            tree.step();
                        });

                        it("(JSON)", () => {
                            const definition: RootNodeDefinition = {
                                type: "root",
                                child: {
                                    type: "condition",
                                    call: "someCondition",
                                    args: [false]
                                }
                            };
                            const agent = {
                                someCondition: (arg: any) => assert.strictEqual(arg, false)
                            };
                            const tree = new BehaviourTree(definition, agent);

                            tree.step();
                        });
                    });

                    describe("null", () => {
                        it("(MDSL)", () => {
                            const definition = "root { condition [someCondition, null] }";
                            const agent = {
                                someCondition: (arg: any) => assert.isNull(arg)
                            };
                            const tree = new BehaviourTree(definition, agent);

                            tree.step();
                        });

                        it("(JSON)", () => {
                            const definition: RootNodeDefinition = {
                                type: "root",
                                child: {
                                    type: "condition",
                                    call: "someCondition",
                                    args: [null]
                                }
                            };
                            const agent = {
                                someCondition: (arg: any) => assert.isNull(arg)
                            };
                            const tree = new BehaviourTree(definition, agent);

                            tree.step();
                        });
                    });
                });

                describe("there are multiple arguments", () => {
                    it("(MDSL)", () => {
                        const definition = 'root { condition [someCondition, 1.23, "hello world!", false, null] }';
                        const agent = {
                            someCondition: (arg0: any, arg1: any, arg2: any, arg3: any) => {
                                assert.strictEqual(arg0, 1.23);
                                assert.strictEqual(arg1, "hello world!");
                                assert.strictEqual(arg2, false);
                                assert.strictEqual(arg3, null);
                            }
                        };
                        const tree = new BehaviourTree(definition, agent);

                        tree.step();
                    });

                    it("(JSON)", () => {
                        const definition: RootNodeDefinition = {
                            type: "root",
                            child: {
                                type: "condition",
                                call: "someCondition",
                                args: [1.23, "hello world!", false, null]
                            }
                        };
                        const agent = {
                            someCondition: (arg0: any, arg1: any, arg2: any, arg3: any) => {
                                assert.strictEqual(arg0, 1.23);
                                assert.strictEqual(arg1, "hello world!");
                                assert.strictEqual(arg2, false);
                                assert.strictEqual(arg3, null);
                            }
                        };
                        const tree = new BehaviourTree(definition, agent);

                        tree.step();
                    });
                });
            });
        });
    });
});
