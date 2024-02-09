const mistreevous = require("../../../dist/index");
const chai = require("chai");

var assert = chai.assert;

describe("A Parallel node", () => {
    describe("on tree initialisation", () => {
        describe("will error if the node does not have at least one child", () => {
            it("(MDSL)", () => {
                const definition = "root { parallel {} }";
                assert.throws(
                    () => new mistreevous.BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: a parallel node must have at least a single child"
                );
            });

            it("(JSON)", () => {
                const definition = {
                    type: "root",
                    child: {
                        type: "parallel",
                        children: []
                    }
                };
                assert.throws(
                    () => new mistreevous.BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: expected non-empty 'children' array to be defined for parallel node at depth '1'"
                );
            });
        });
    });

    describe("when updated as part of a tree step will", () => {});
});
