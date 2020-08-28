const mistreevous = require('../../dist/index');
const chai = require('chai');

var assert = chai.assert;

const findNode = (tree, type, caption) => tree.getFlattenedNodeDetails().find((node) => node.type === type && node.caption === caption);

describe("A Flip node", () => {
  describe("on tree initialisation", () => {
    it("will error if the node does not have a single child", () => {
      const definition = "root { flip {} }";
      assert.throws(() => new mistreevous.BehaviourTree(definition, {}), Error, "error parsing tree: a flip node must have a single child");
    });
  });

  describe("when updated as part of a tree step will", () => {
    it("move to the SUCCESS state if the child node moves to the FAILED state", () => {
      const definition = "root { flip { condition [someCondition] } }";
      const board = { someCondition: () => false };
      const tree = new mistreevous.BehaviourTree(definition, board);

      let node = findNode(tree, "flip", "FLIP");
      assert.strictEqual(node.state, mistreevous.State.READY);

      tree.step();

      node = findNode(tree, "flip", "FLIP");
      assert.strictEqual(node.state, mistreevous.State.SUCCEEDED);
    });

    it("move to the FAILED state if the child node moves to the SUCCESS state", () => {
      const definition = "root { flip { condition [someCondition] } }";
      const board = { someCondition: () => true };
      const tree = new mistreevous.BehaviourTree(definition, board);

      let node = findNode(tree, "flip", "FLIP");
      assert.strictEqual(node.state, mistreevous.State.READY);

      tree.step();

      node = findNode(tree, "flip", "FLIP");
      assert.strictEqual(node.state, mistreevous.State.FAILED);
    });

    it("move to the RUNNING state if the child node dos not move to the SUCCESS or FAILED state", () => {
      const definition = "root { flip { action [someAction] } }";
      const board = { someAction: () => {} };
      const tree = new mistreevous.BehaviourTree(definition, board);

      let node = findNode(tree, "flip", "FLIP");
      assert.strictEqual(node.state, mistreevous.State.READY);

      tree.step();

      node = findNode(tree, "flip", "FLIP");
      assert.strictEqual(node.state, mistreevous.State.RUNNING);
    });
  });
});