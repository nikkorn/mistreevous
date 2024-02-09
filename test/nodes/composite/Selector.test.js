const mistreevous = require("../../../dist/index");
const chai = require("chai");

var assert = chai.assert;

describe("A Selector node", () => {
    describe("on tree initialisation", () => {
        describe("will error if the node does not have at least one child", () => {
            it("(MDSL)", () => {
                const definition = "root { selector {} }";
                assert.throws(
                    () => new mistreevous.BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: a selector node must have at least a single child"
                );
            });

            it("(JSON)", () => {
                const definition = {
                    type: "root",
                    child: {
                        type: "selector",
                        children: []
                    }
                };
                assert.throws(
                    () => new mistreevous.BehaviourTree(definition, {}),
                    Error,
                    "invalid definition: expected non-empty 'children' array to be defined for selector node at depth '1'"
                );
            });
        });
    });

    describe("when updated as part of a tree step will", () => {});
});
