import { assert } from "chai";
import sinon from "sinon";

import { BehaviourTree, State } from "../../../src/index";
import { RootNodeDefinition } from "../../../src/BehaviourTreeDefinition";

import { findNode } from "../../TestUtilities";

describe("An Action node", () => {
    beforeEach(() => BehaviourTree.unregisterAll());

    describe("on tree initialisation", () => {
        describe("will error if no action function name is defined", () => {
            it("(MDSL)", () => {
                const definition = "root { action [] }";
                assert.throws(
                    () => new BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: expected action name identifier argument"
                );
            });

            it("(JSON)", () => {
                const definition = {
                    type: "root",
                    child: {
                        type: "action"
                    }
                } as any;
                assert.throws(
                    () => new BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: expected non-empty string for 'call' property of action node at depth '1'"
                );
            });
        });
    });

    describe("when updated as part of a tree step", () => {
        describe("will call the function defined by the first node argument", () => {
            describe("when the referenced function is", () => {
                describe("a registered function", () => {
                    it("(MDSL)", () => {
                        const registeredActionFunction = sinon.stub().returns(State.SUCCEEDED);
                        BehaviourTree.register("doAction", registeredActionFunction);

                        const definition = `root { action [doAction, "some-argument"] }`;
                        const agent = { mock: "agent" };
                        const tree = new BehaviourTree(definition, agent);

                        tree.step();

                        const node = findNode(tree, "action", "doAction");
                        assert.strictEqual(node.state, State.SUCCEEDED);
                        assert.isTrue(registeredActionFunction.calledWith(agent, "some-argument"));
                    });

                    it("(JSON)", () => {
                        const registeredActionFunction = sinon.stub().returns(State.SUCCEEDED);
                        BehaviourTree.register("doAction", registeredActionFunction);

                        const definition: RootNodeDefinition = {
                            type: "root",
                            child: {
                                type: "action",
                                call: "doAction",
                                args: ["some-argument"]
                            }
                        };
                        const agent = { mock: "agent" };
                        const tree = new BehaviourTree(definition, agent);

                        tree.step();

                        const node = findNode(tree, "action", "doAction");
                        assert.strictEqual(node.state, State.SUCCEEDED);
                        assert.isTrue(registeredActionFunction.calledWith(agent, "some-argument"));
                    });
                });

                describe("an agent function", () => {
                    it("(MDSL)", () => {
                        const definition = "root { action [doAction] }";
                        const agent = { doAction: () => State.SUCCEEDED };
                        const tree = new BehaviourTree(definition, agent);

                        tree.step();

                        const node = findNode(tree, "action", "doAction");
                        assert.strictEqual(node.state, State.SUCCEEDED);
                    });

                    it("(JSON)", () => {
                        const definition: RootNodeDefinition = {
                            type: "root",
                            child: {
                                type: "action",
                                call: "doAction"
                            }
                        };
                        const agent = { doAction: () => State.SUCCEEDED };
                        const tree = new BehaviourTree(definition, agent);

                        tree.step();

                        const node = findNode(tree, "action", "doAction");
                        assert.strictEqual(node.state, State.SUCCEEDED);
                    });
                });
            });

            describe("and will error if", () => {
                describe("there is no agent function or registered function that matches the action name", () => {
                    it("(MDSL)", () => {
                        const definition = "root { action [DoTheThing] }";
                        let tree: BehaviourTree;
                        assert.doesNotThrow(() => (tree = new BehaviourTree(definition, {})), Error);
                        assert.throws(
                            () => tree.step(),
                            Error,
                            "error stepping tree: cannot update action node as the action 'DoTheThing' function is not defined on the agent and has not been registered"
                        );
                    });

                    it("(JSON)", () => {
                        const definition: RootNodeDefinition = {
                            type: "root",
                            child: {
                                type: "action",
                                call: "DoTheThing"
                            }
                        };
                        let tree: BehaviourTree;
                        assert.doesNotThrow(() => (tree = new BehaviourTree(definition, {})), Error);
                        assert.throws(
                            () => tree.step(),
                            Error,
                            "error stepping tree: cannot update action node as the action 'DoTheThing' function is not defined on the agent and has not been registered"
                        );
                    });
                });

                describe("the action function", () => {
                    describe("throws an error object", () => {
                        it("(MDSL)", () => {
                            const definition = "root { action [doAction] }";
                            const agent = {
                                doAction: () => {
                                    throw new Error("some-error");
                                }
                            };
                            const tree = new BehaviourTree(definition, agent);

                            assert.throws(
                                () => tree.step(),
                                Error,
                                "error stepping tree: action function 'doAction' threw: Error: some-error"
                            );
                        });

                        it("(JSON)", () => {
                            const definition: RootNodeDefinition = {
                                type: "root",
                                child: {
                                    type: "action",
                                    call: "doAction"
                                }
                            };
                            const agent = {
                                doAction: () => {
                                    throw new Error("some-error");
                                }
                            };
                            const tree = new BehaviourTree(definition, agent);

                            assert.throws(
                                () => tree.step(),
                                Error,
                                "error stepping tree: action function 'doAction' threw: Error: some-error"
                            );
                        });
                    });

                    describe("throws something that isn't an error object", () => {
                        it("(MDSL)", () => {
                            const definition = "root { action [doAction] }";
                            const agent = {
                                doAction: () => {
                                    throw "some-error";
                                }
                            };
                            const tree = new BehaviourTree(definition, agent);

                            assert.throws(
                                () => tree.step(),
                                Error,
                                "error stepping tree: action function 'doAction' threw: some-error"
                            );
                        });

                        it("(JSON)", () => {
                            const definition: RootNodeDefinition = {
                                type: "root",
                                child: {
                                    type: "action",
                                    call: "doAction"
                                }
                            };
                            const agent = {
                                doAction: () => {
                                    throw "some-error";
                                }
                            };
                            const tree = new BehaviourTree(definition, agent);

                            assert.throws(
                                () => tree.step(),
                                Error,
                                "error stepping tree: action function 'doAction' threw: some-error"
                            );
                        });
                    });

                    describe("returns an unexpected value", () => {
                        it("(MDSL)", () => {
                            const definition = "root { action [doAction] }";
                            const agent = {
                                doAction: () => "invalid-result"
                            };
                            const tree = new BehaviourTree(definition, agent);

                            assert.throws(
                                () => tree.step(),
                                Error,
                                "error stepping tree: expected action function 'doAction' to return an optional State.SUCCEEDED or State.FAILED value but returned 'invalid-result'"
                            );
                        });

                        it("(JSON)", () => {
                            const definition: RootNodeDefinition = {
                                type: "root",
                                child: {
                                    type: "action",
                                    call: "doAction"
                                }
                            };
                            const agent = {
                                doAction: () => "invalid-result"
                            };
                            const tree = new BehaviourTree(definition, agent);

                            assert.throws(
                                () => tree.step(),
                                Error,
                                "error stepping tree: expected action function 'doAction' to return an optional State.SUCCEEDED or State.FAILED value but returned 'invalid-result'"
                            );
                        });
                    });

                    describe("returns a rejected promise", () => {
                        it("(MDSL)", (done) => {
                            const definition = "root { action [doAction] }";
                            const result: Promise<State.SUCCEEDED> = new Promise(() => {
                                throw new Error("some-error");
                            });
                            const agent = { doAction: () => result };
                            const tree = new BehaviourTree(definition, agent);

                            assert.strictEqual(findNode(tree, "action", "doAction").state, State.READY);

                            tree.step();

                            assert.strictEqual(findNode(tree, "action", "doAction").state, State.RUNNING);

                            setTimeout(() => {
                                assert.throws(
                                    () => tree.step(),
                                    Error,
                                    "error stepping tree: action function 'doAction' promise rejected with 'Error: some-error'"
                                );

                                done();
                            }, 0);
                        });

                        it("(JSON)", (done) => {
                            const definition: RootNodeDefinition = {
                                type: "root",
                                child: {
                                    type: "action",
                                    call: "doAction"
                                }
                            };
                            const result: Promise<State.SUCCEEDED> = new Promise(() => {
                                throw new Error("some-error");
                            });
                            const agent = { doAction: () => result };
                            const tree = new BehaviourTree(definition, agent);

                            assert.strictEqual(findNode(tree, "action", "doAction").state, State.READY);

                            tree.step();

                            assert.strictEqual(findNode(tree, "action", "doAction").state, State.RUNNING);

                            setTimeout(() => {
                                assert.throws(
                                    () => tree.step(),
                                    Error,
                                    "error stepping tree: action function 'doAction' promise rejected with 'Error: some-error'"
                                );

                                done();
                            }, 0);
                        });
                    });
                });
            });

            describe("and move to", () => {
                describe("the SUCCESS state if the function returns a value of State.SUCCEEDED", () => {
                    it("(MDSL)", () => {
                        const definition = "root { action [doAction] }";
                        const agent = { doAction: () => State.SUCCEEDED };
                        const tree = new BehaviourTree(definition, agent);

                        let node = findNode(tree, "action", "doAction");
                        assert.strictEqual(node.state, State.READY);

                        tree.step();

                        node = findNode(tree, "action", "doAction");
                        assert.strictEqual(node.state, State.SUCCEEDED);
                    });

                    it("(JSON)", () => {
                        const definition: RootNodeDefinition = {
                            type: "root",
                            child: {
                                type: "action",
                                call: "doAction"
                            }
                        };
                        const agent = { doAction: () => State.SUCCEEDED };
                        const tree = new BehaviourTree(definition, agent);

                        let node = findNode(tree, "action", "doAction");
                        assert.strictEqual(node.state, State.READY);

                        tree.step();

                        node = findNode(tree, "action", "doAction");
                        assert.strictEqual(node.state, State.SUCCEEDED);
                    });
                });

                describe("the FAILED state if the function returns a value of State.FAILED", () => {
                    it("(MDSL)", () => {
                        const definition = "root { action [doAction] }";
                        const agent = { doAction: () => State.FAILED };
                        const tree = new BehaviourTree(definition, agent);

                        let node = findNode(tree, "action", "doAction");
                        assert.strictEqual(node.state, State.READY);

                        tree.step();

                        node = findNode(tree, "action", "doAction");
                        assert.strictEqual(node.state, State.FAILED);
                    });

                    it("(JSON)", () => {
                        const definition: RootNodeDefinition = {
                            type: "root",
                            child: {
                                type: "action",
                                call: "doAction"
                            }
                        };
                        const agent = { doAction: () => State.FAILED };
                        const tree = new BehaviourTree(definition, agent);

                        let node = findNode(tree, "action", "doAction");
                        assert.strictEqual(node.state, State.READY);

                        tree.step();

                        node = findNode(tree, "action", "doAction");
                        assert.strictEqual(node.state, State.FAILED);
                    });
                });

                describe("the RUNNING state if", () => {
                    describe("the function returns undefined", () => {
                        it("(MDSL)", () => {
                            const definition = "root { action [doAction] }";
                            const agent = { doAction: () => State.RUNNING };
                            const tree = new BehaviourTree(definition, agent);

                            let node = findNode(tree, "action", "doAction");
                            assert.strictEqual(node.state, State.READY);

                            tree.step();

                            node = findNode(tree, "action", "doAction");
                            assert.strictEqual(node.state, State.RUNNING);
                        });

                        it("(JSON)", () => {
                            const definition: RootNodeDefinition = {
                                type: "root",
                                child: {
                                    type: "action",
                                    call: "doAction"
                                }
                            };
                            const agent = { doAction: () => State.RUNNING };
                            const tree = new BehaviourTree(definition, agent);

                            let node = findNode(tree, "action", "doAction");
                            assert.strictEqual(node.state, State.READY);

                            tree.step();

                            node = findNode(tree, "action", "doAction");
                            assert.strictEqual(node.state, State.RUNNING);
                        });
                    });

                    describe("the function returns a value of State.RUNNING", () => {
                        it("(MDSL)", () => {
                            const definition = "root { action [doAction] }";
                            const agent = { doAction: () => State.RUNNING };
                            const tree = new BehaviourTree(definition, agent);

                            let node = findNode(tree, "action", "doAction");
                            assert.strictEqual(node.state, State.READY);

                            tree.step();

                            node = findNode(tree, "action", "doAction");
                            assert.strictEqual(node.state, State.RUNNING);
                        });

                        it("(JSON)", () => {
                            const definition: RootNodeDefinition = {
                                type: "root",
                                child: {
                                    type: "action",
                                    call: "doAction"
                                }
                            };
                            const agent = { doAction: () => State.RUNNING };
                            const tree = new BehaviourTree(definition, agent);

                            let node = findNode(tree, "action", "doAction");
                            assert.strictEqual(node.state, State.READY);

                            tree.step();

                            node = findNode(tree, "action", "doAction");
                            assert.strictEqual(node.state, State.RUNNING);
                        });
                    });

                    describe("the function returns a promise to return a value of State.SUCCEEDED or State.FAILED", () => {
                        it("(MDSL)", (done) => {
                            const definition = "root { action [doAction] }";

                            const result: Promise<State.SUCCEEDED> = new Promise((resolve) => resolve(State.SUCCEEDED));
                            const agent = { doAction: () => result };
                            const tree = new BehaviourTree(definition, agent);

                            assert.strictEqual(findNode(tree, "action", "doAction").state, State.READY);

                            tree.step();

                            assert.strictEqual(findNode(tree, "action", "doAction").state, State.RUNNING);

                            setTimeout(() => {
                                tree.step();

                                assert.strictEqual(findNode(tree, "action", "doAction").state, State.SUCCEEDED);

                                done();
                            }, 0);
                        });

                        it("(JSON)", (done) => {
                            const definition: RootNodeDefinition = {
                                type: "root",
                                child: {
                                    type: "action",
                                    call: "doAction"
                                }
                            };

                            const result: Promise<State.SUCCEEDED> = new Promise((resolve) => resolve(State.SUCCEEDED));
                            const agent = { doAction: () => result };
                            const tree = new BehaviourTree(definition, agent);

                            assert.strictEqual(findNode(tree, "action", "doAction").state, State.READY);

                            tree.step();

                            assert.strictEqual(findNode(tree, "action", "doAction").state, State.RUNNING);

                            setTimeout(() => {
                                tree.step();

                                assert.strictEqual(findNode(tree, "action", "doAction").state, State.SUCCEEDED);

                                done();
                            }, 0);
                        });
                    });
                });
            });

            describe("and pass any node arguments that follow the action name identifier argument where", () => {
                describe("the argument is a", () => {
                    describe("string", () => {
                        it("(MDSL)", () => {
                            const definition = 'root { action [doAction, "hello world!"] }';
                            const agent = {
                                doAction: (arg: any) => assert.strictEqual(arg, "hello world!")
                            };
                            const tree = new BehaviourTree(definition, agent);

                            tree.step();
                        });

                        it("(JSON)", () => {
                            const definition: RootNodeDefinition = {
                                type: "root",
                                child: {
                                    type: "action",
                                    call: "doAction",
                                    args: ["hello world!"]
                                }
                            };
                            const agent = {
                                doAction: (arg: any) => assert.strictEqual(arg, "hello world!")
                            };
                            const tree = new BehaviourTree(definition, agent);

                            tree.step();
                        });
                    });

                    describe("string with escaped quotes", () => {
                        it("(MDSL)", () => {
                            const definition = 'root { action [doAction, "hello \\" world!"] }';
                            const agent = {
                                doAction: (arg: any) => assert.strictEqual(arg, 'hello " world!')
                            };
                            const tree = new BehaviourTree(definition, agent);

                            tree.step();
                        });

                        it("(JSON)", () => {
                            const definition: RootNodeDefinition = {
                                type: "root",
                                child: {
                                    type: "action",
                                    call: "doAction",
                                    args: ['hello " world!']
                                }
                            };
                            const agent = {
                                doAction: (arg: any) => assert.strictEqual(arg, 'hello " world!')
                            };
                            const tree = new BehaviourTree(definition, agent);

                            tree.step();
                        });
                    });

                    describe("number", () => {
                        it("(MDSL)", () => {
                            const definition = "root { action [doAction, 23.4567] }";
                            const agent = {
                                doAction: (arg: any) => assert.strictEqual(arg, 23.4567)
                            };
                            const tree = new BehaviourTree(definition, agent);

                            tree.step();
                        });

                        it("(JSON)", () => {
                            const definition: RootNodeDefinition = {
                                type: "root",
                                child: {
                                    type: "action",
                                    call: "doAction",
                                    args: [23.4567]
                                }
                            };
                            const agent = {
                                doAction: (arg: any) => assert.strictEqual(arg, 23.4567)
                            };
                            const tree = new BehaviourTree(definition, agent);

                            tree.step();
                        });
                    });

                    describe("boolean 'true' literal", () => {
                        it("(MDSL)", () => {
                            const definition = "root { action [doAction, true] }";
                            const agent = {
                                doAction: (arg: any) => assert.strictEqual(arg, true)
                            };
                            const tree = new BehaviourTree(definition, agent);

                            tree.step();
                        });

                        it("(JSON)", () => {
                            const definition: RootNodeDefinition = {
                                type: "root",
                                child: {
                                    type: "action",
                                    call: "doAction",
                                    args: [true]
                                }
                            };
                            const agent = {
                                doAction: (arg: any) => assert.strictEqual(arg, true)
                            };
                            const tree = new BehaviourTree(definition, agent);

                            tree.step();
                        });
                    });

                    describe("boolean 'false' literal", () => {
                        it("(MDSL)", () => {
                            const definition = "root { action [doAction, false] }";
                            const agent = {
                                doAction: (arg: any) => assert.strictEqual(arg, false)
                            };
                            const tree = new BehaviourTree(definition, agent);

                            tree.step();
                        });

                        it("(JSON)", () => {
                            const definition: RootNodeDefinition = {
                                type: "root",
                                child: {
                                    type: "action",
                                    call: "doAction",
                                    args: [false]
                                }
                            };
                            const agent = {
                                doAction: (arg: any) => assert.strictEqual(arg, false)
                            };
                            const tree = new BehaviourTree(definition, agent);

                            tree.step();
                        });
                    });

                    describe("null", () => {
                        it("(MDSL)", () => {
                            const definition = "root { action [doAction, null] }";
                            const agent = {
                                doAction: (arg: any) => assert.isNull(arg)
                            };
                            const tree = new BehaviourTree(definition, agent);

                            tree.step();
                        });

                        it("(JSON)", () => {
                            const definition: RootNodeDefinition = {
                                type: "root",
                                child: {
                                    type: "action",
                                    call: "doAction",
                                    args: [null]
                                }
                            };
                            const agent = {
                                doAction: (arg: any) => assert.isNull(arg)
                            };
                            const tree = new BehaviourTree(definition, agent);

                            tree.step();
                        });
                    });

                    describe("agent property reference", () => {
                        it("(MDSL)", () => {
                            const definition = "root { action [doAction, $someProperty] }";
                            const agent = {
                                doAction: (arg: any) => {
                                    assert.strictEqual(arg, "some-property-value");
                                },
                                someProperty: "some-property-value"
                            };
                            const tree = new BehaviourTree(definition, agent);

                            tree.step();
                        });

                        it("(JSON)", () => {
                            const definition: RootNodeDefinition = {
                                type: "root",
                                child: {
                                    type: "action",
                                    call: "doAction",
                                    args: [{ $: "someProperty" }]
                                }
                            };
                            const agent = {
                                doAction: (arg: any) => assert.strictEqual(arg, "some-property-value"),
                                someProperty: "some-property-value"
                            };
                            const tree = new BehaviourTree(definition, agent);

                            tree.step();
                        });
                    });
                });

                describe("there are multiple arguments", () => {
                    it("(MDSL)", () => {
                        const definition =
                            'root { action [doAction, 1.23, "hello world!", false, null, $someProperty] }';
                        const agent = {
                            doAction: (arg0: any, arg1: any, arg2: any, arg3: any, arg4: any) => {
                                assert.strictEqual(arg0, 1.23);
                                assert.strictEqual(arg1, "hello world!");
                                assert.strictEqual(arg2, false);
                                assert.strictEqual(arg3, null);
                                assert.strictEqual(arg4, "some-property-value");
                            },
                            someProperty: "some-property-value"
                        };
                        const tree = new BehaviourTree(definition, agent);

                        tree.step();
                    });

                    it("(JSON)", () => {
                        const definition: RootNodeDefinition = {
                            type: "root",
                            child: {
                                type: "action",
                                call: "doAction",
                                args: [1.23, "hello world!", false, null, { $: "someProperty" }]
                            }
                        };
                        const agent = {
                            doAction: (arg0: any, arg1: any, arg2: any, arg3: any, arg4: any) => {
                                assert.strictEqual(arg0, 1.23);
                                assert.strictEqual(arg1, "hello world!");
                                assert.strictEqual(arg2, false);
                                assert.strictEqual(arg3, null);
                                assert.strictEqual(arg4, "some-property-value");
                            },
                            someProperty: "some-property-value"
                        };
                        const tree = new BehaviourTree(definition, agent);

                        tree.step();
                    });
                });
            });
        });
    });
});
