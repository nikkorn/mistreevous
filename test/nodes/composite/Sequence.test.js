const mistreevous = require("../../../dist/index");
const chai = require("chai");

var assert = chai.assert;

describe("A Sequence node", () => {
    describe("on tree initialisation", () => {
        describe("will error if the node does not have at least one child", () => {
            it("(MDSL)", () => {
                const definition = "root { sequence {} }";
                assert.throws(
                    () => new mistreevous.BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: a sequence node must have at least a single child"
                );
            });

            it("(JSON)", () => {
                const definition = {
                    type: "root",
                    child: {
                        type: "sequence",
                        children: []
                    }
                };
                assert.throws(
                    () => new mistreevous.BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: expected non-empty 'children' array to be defined for sequence node at depth '1'"
                );
            });
        });
    });

    describe("when updated as part of a tree step will", () => {});
});
