const Mistreevous = require('../dist/index');

const chai = require('chai');

var assert = chai.assert;

describe("A BehaviourTree instance", () => {
  describe("has initialisation logic that", () => {
    describe("should error when", () => {
      it("the tree definition argument is not a string", () => {
        assert.throws(() => new Mistreevous.BehaviourTree(null, {}), Error, "the tree definition must be a string");
      });

      it("the blackboard object is not defined", () => {
        assert.throws(() => new Mistreevous.BehaviourTree("", undefined), Error, "the blackboard must be defined");
      });
    });
  });
});