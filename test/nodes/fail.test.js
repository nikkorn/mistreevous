const mistreevous = require('../../dist/index');
const chai = require('chai');

var assert = chai.assert;

const findNode = (tree, type, caption) => tree.getFlattenedNodeDetails().find((node) => node.type === type && node.caption === caption);

describe("A Fail node", () => {
  describe("on tree initialisation", () => {
    it("will error if the node does not have a single child", () => {
      const definition = "root { fail {} }";
      assert.throws(() => new mistreevous.BehaviourTree(definition, {}), Error, "error parsing tree: a fail node must have a single child");
    });
  });

  describe("when updated as part of a tree step will", () => {
    describe("move to the FAILED state if the child node moves to the", () => {
      it("FAILED state", () => {
        const definition = "root { fail { condition [someCondition] } }";
        const board = { someCondition: () => false };
        const tree = new mistreevous.BehaviourTree(definition, board);
  
        let node = findNode(tree, "fail", "FAIL");
        assert.strictEqual(node.state, mistreevous.State.READY);
  
        tree.step();
  
        node = findNode(tree, "fail", "FAIL");
        assert.strictEqual(node.state, mistreevous.State.FAILED);
      });
  
      it("SUCCESS state", () => {
        const definition = "root { fail { condition [someCondition] } }";
        const board = { someCondition: () => true };
        const tree = new mistreevous.BehaviourTree(definition, board);
  
        let node = findNode(tree, "fail", "FAIL");
        assert.strictEqual(node.state, mistreevous.State.READY);
  
        tree.step();
  
        node = findNode(tree, "fail", "FAIL");
        assert.strictEqual(node.state, mistreevous.State.FAILED);
      });
    });

    it("move to the RUNNING state if the child node does not move to the SUCCESS or FAILED state", () => {
      const definition = "root { fail { action [someAction] } }";
      const board = { someAction: () => {} };
      const tree = new mistreevous.BehaviourTree(definition, board);

      let node = findNode(tree, "fail", "FAIL");
      assert.strictEqual(node.state, mistreevous.State.READY);

      tree.step();

      node = findNode(tree, "fail", "FAIL");
      assert.strictEqual(node.state, mistreevous.State.RUNNING);
    });
  });
});