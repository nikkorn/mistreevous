const mistreevous = require('../../dist/index');
const chai = require('chai');

var assert = chai.assert;

const findNode = (tree, type, caption) => tree.getFlattenedNodeDetails().find((node) => node.type === type && node.caption === caption);

describe("A Retry node", () => {
  describe("on tree initialisation", () => {
    it("will error if the node does not have a single child", () => {
      const definition = "root { retry {} }";
      assert.throws(() => new mistreevous.BehaviourTree(definition, {}), Error, "error parsing tree: a retry node must have a single child");
    });
  });

  describe("when updated as part of a tree step", () => {
    it("will move to the SUCCEEDED state if the child node moves to the SUCCEEDED state", () => {
      const definition = "root { retry { condition [someCondition] } }";
      const board = { someCondition: () => true };
      const tree = new mistreevous.BehaviourTree(definition, board);

      let node = findNode(tree, "retry", "RETRY");
      assert.strictEqual(node.state, mistreevous.State.READY);

      tree.step();

      node = findNode(tree, "retry", "RETRY");
      assert.strictEqual(node.state, mistreevous.State.SUCCEEDED);
    });

    it("will move to the RUNNING state if the child node moves to the FAILED state", () => {
      const definition = "root { retry { condition [someCondition] } }";
      const board = { someCondition: () => false };
      const tree = new mistreevous.BehaviourTree(definition, board);

      let node = findNode(tree, "retry", "RETRY");
      assert.strictEqual(node.state, mistreevous.State.READY);

      tree.step();

      node = findNode(tree, "retry", "RETRY");
      assert.strictEqual(node.state, mistreevous.State.RUNNING);
    });

    it("and a maximum attempt node argument is defined will attempt to re-run the child node until the maximum attempt is reached", () => {
      const definition = "root { retry [3] { condition [someCondition] } }";
      const board = { someCondition: () => false };
      const tree = new mistreevous.BehaviourTree(definition, board);

      let node = findNode(tree, "retry", "RETRY 3x");
      assert.strictEqual(node.state, mistreevous.State.READY);

      tree.step();

      node = findNode(tree, "retry", "RETRY 3x");
      assert.strictEqual(node.state, mistreevous.State.RUNNING);

      tree.step();

      node = findNode(tree, "retry", "RETRY 3x");
      assert.strictEqual(node.state, mistreevous.State.RUNNING);

      tree.step();

      node = findNode(tree, "retry", "RETRY 3x");
      assert.strictEqual(node.state, mistreevous.State.RUNNING);

      tree.step();

      node = findNode(tree, "retry", "RETRY 3x");
      assert.strictEqual(node.state, mistreevous.State.FAILED);
    });
  });
});