import { assert } from "chai";

import { RootNodeDefinition } from "../src/BehaviourTreeDefinition";
import { BehaviourTree } from "../src/index";
import buildRootNode from "../src/BehaviourTreeBuilder";
import Sequence from "../src/nodes/composite/Sequence";
import Action from "../src/nodes/leaf/Action";
import Flip from "../src/nodes/decorator/Flip";

describe("The BehaviourTreeBuilder class has a buildRootNode function which takes an array of root node JSON definitions and", () => {
    beforeEach(() => BehaviourTree.unregisterAll());

    it("returns a populated Root node instance based on those definitions", () => {
        const definition: RootNodeDefinition[] = [
            {
                type: "root",
                child: {
                    type: "sequence",
                    children: [
                        {
                            type: "action",
                            call: "noop"
                        }
                    ]
                }
            }
        ];

        const rootNode = buildRootNode(definition, {});

        assert.isDefined(rootNode);
        assert.strictEqual(rootNode.getType(), "root");

        const sequenceNode = rootNode.getChildren()[0] as Sequence;
        assert.isDefined(sequenceNode);
        assert.strictEqual(sequenceNode.getType(), "sequence");
        assert.strictEqual(sequenceNode.getChildren().length, 1);

        const actionNode = sequenceNode.getChildren()[0] as Action;
        assert.isDefined(actionNode);
        assert.strictEqual(actionNode.getType(), "action");
    });

    describe("resolves branch node definitions", () => {
        describe("where the referenced subtree root node is", () => {
            it("included as part of the definition", () => {
                const definition: RootNodeDefinition[] = [
                    {
                        type: "root",
                        child: {
                            type: "flip",
                            child: {
                                type: "branch",
                                ref: "sub-tree"
                            }
                        }
                    },
                    {
                        type: "root",
                        id: "sub-tree",
                        child: {
                            type: "action",
                            call: "noop"
                        }
                    }
                ];

                const rootNode = buildRootNode(definition, {});

                assert.isDefined(rootNode);
                assert.strictEqual(rootNode.getType(), "root");

                const flipNode = rootNode.getChildren()[0] as Flip;
                assert.isDefined(flipNode);
                assert.strictEqual(flipNode.getType(), "flip");
                assert.strictEqual(flipNode.getChildren().length, 1);

                const actionNode = flipNode.getChildren()[0] as Action;
                assert.isDefined(actionNode);
                assert.strictEqual(actionNode.getType(), "action");
            });

            it("globally registered", () => {
                BehaviourTree.register("sub-tree", {
                    type: "root",
                    child: {
                        type: "action",
                        call: "noop"
                    }
                });

                const definition: RootNodeDefinition[] = [
                    {
                        type: "root",
                        child: {
                            type: "flip",
                            child: {
                                type: "branch",
                                ref: "sub-tree"
                            }
                        }
                    }
                ];

                const rootNode = buildRootNode(definition, {});

                assert.isDefined(rootNode);
                assert.strictEqual(rootNode.getType(), "root");

                const flipNode = rootNode.getChildren()[0] as Flip;
                assert.isDefined(flipNode);
                assert.strictEqual(flipNode.getType(), "flip");
                assert.strictEqual(flipNode.getChildren().length, 1);

                const actionNode = flipNode.getChildren()[0] as Action;
                assert.isDefined(actionNode);
                assert.strictEqual(actionNode.getType(), "action");
            });
        });

        it("and errors if any referenced subtree root node is not included as part of the definition and is not a globally registered subtree", () => {
            const definition: RootNodeDefinition[] = [
                {
                    type: "root",
                    child: {
                        type: "flip",
                        child: {
                            type: "branch",
                            ref: "sub-tree"
                        }
                    }
                }
            ];

            assert.throws(
                () => buildRootNode(definition, {}),
                Error,
                "primary tree has branch node that references root node 'sub-tree' which has not been defined"
            );
        });
    });
});
