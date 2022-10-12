const mistreevous = require('../../../dist/index');
const chai = require('chai');

var assert = chai.assert;

const findNode = (tree, type, caption) => tree.getFlattenedNodeDetails().find((node) => node.type === type && node.caption === caption);

describe("A Repeat node", () => {
  describe("on tree initialisation", () => {
    it("will error if the node does not have a single child", () => {
      const definition = "root { repeat {} }";
      assert.throws(() => new mistreevous.BehaviourTree(definition, {}), Error, "error parsing tree: a repeat node must have a single child");
    });
  });

  describe("when updated as part of a tree step", () => {
    it("will move to the FAILED state if the child node moves to the FAILED state", () => {
      const definition = "root { repeat { condition [someCondition] } }";
      const agent = { someCondition: () => false };
      const tree = new mistreevous.BehaviourTree(definition, agent);

      let node = findNode(tree, "repeat", "REPEAT");
      assert.strictEqual(node.state, mistreevous.State.READY);

      tree.step();

      node = findNode(tree, "repeat", "REPEAT");
      assert.strictEqual(node.state, mistreevous.State.FAILED);
    });

    it("will move to the RUNNING state if the child node moves to the SUCCEEDED state", () => {
      const definition = "root { repeat { condition [someCondition] } }";
      const agent = { someCondition: () => true };
      const tree = new mistreevous.BehaviourTree(definition, agent);

      let node = findNode(tree, "repeat", "REPEAT");
      assert.strictEqual(node.state, mistreevous.State.READY);

      tree.step();

      node = findNode(tree, "repeat", "REPEAT");
      assert.strictEqual(node.state, mistreevous.State.RUNNING);
    });

    it("and a maximum iteration node argument is defined will attempt to re-run the child node until the maximum iteration is reached", () => {
      const definition = "root { repeat [3] { condition [someCondition] } }";
      const agent = { someCondition: () => true };
      const tree = new mistreevous.BehaviourTree(definition, agent);

      let node = findNode(tree, "repeat", "REPEAT 3x");
      assert.strictEqual(node.state, mistreevous.State.READY);

      tree.step();

      node = findNode(tree, "repeat", "REPEAT 3x");
      assert.strictEqual(node.state, mistreevous.State.RUNNING);

      tree.step();

      node = findNode(tree, "repeat", "REPEAT 3x");
      assert.strictEqual(node.state, mistreevous.State.RUNNING);

      tree.step();

      node = findNode(tree, "repeat", "REPEAT 3x");
      assert.strictEqual(node.state, mistreevous.State.RUNNING);

      tree.step();

      node = findNode(tree, "repeat", "REPEAT 3x");
      assert.strictEqual(node.state, mistreevous.State.SUCCEEDED);
    });
  });
});