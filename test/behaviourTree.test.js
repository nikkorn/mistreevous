const mistreevous = require('../dist/index');
const chai = require('chai');

var assert = chai.assert;

describe("A BehaviourTree instance", () => {
  describe("has initialisation logic that", () => {
    describe("should error when", () => {
      it("the tree definition argument is not a string", () => {
        assert.throws(() => new mistreevous.BehaviourTree(null, {}), Error, "the tree definition must be a string");
      });

      it("the tree definition argument is not a valid tree definition", () => {
        assert.throws(() => new mistreevous.BehaviourTree("", {}), Error, "error parsing tree: invalid token count");
      });

      it("the tree definition argument contains unexpected tokens", () => {
        assert.throws(() => new mistreevous.BehaviourTree("invalid-token { }", {}), Error, "error parsing tree: unexpected token: invalid-token");
      });

      it("the blackboard object is not defined", () => {
        assert.throws(() => new mistreevous.BehaviourTree("", undefined), Error, "the blackboard must be defined");
      });
    });

    it("should not error when the tree definition argument is a valid definition", () => {
      assert.doesNotThrow(() => new mistreevous.BehaviourTree("root { action [test] }", {}), Error);
    });
  });
});