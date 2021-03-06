const mistreevous = require('../../dist/index');
const chai = require('chai');

var assert = chai.assert;

const findNode = (tree, type, caption) => tree.getFlattenedNodeDetails().find((node) => node.type === type && node.caption === caption);

describe("A Condition node", () => {
  describe("on tree initialisation", () => {
    it("will error if a condition name identifier is not the first node argument", () => {
      const definition = "root { condition [] }";
      assert.throws(() => new mistreevous.BehaviourTree(definition, {}), Error, "error parsing tree: expected condition name identifier argument");
    });
  });

  describe("when updated as part of a tree step", () => {
    describe("will call the blackboard function defined by the first node arguments and", () => {
      it("move to the SUCCESS state if the function returns a truthy value", () => {
        const definition = "root { condition [someCondition] }";
        const board = { someCondition: () => true };
        const tree = new mistreevous.BehaviourTree(definition, board);

        let node = findNode(tree, "condition", "someCondition");
        assert.strictEqual(node.state, mistreevous.State.READY);

        tree.step();

        node = findNode(tree, "condition", "someCondition");
        assert.strictEqual(node.state, mistreevous.State.SUCCEEDED);
      });

      it("move to the FAILED state if the function returns a falsy value", () => {
        const definition = "root { condition [someCondition] }";
        const board = { someCondition: () => false };
        const tree = new mistreevous.BehaviourTree(definition, board);

        let node = findNode(tree, "condition", "someCondition");
        assert.strictEqual(node.state, mistreevous.State.READY);

        tree.step();

        node = findNode(tree, "condition", "someCondition");
        assert.strictEqual(node.state, mistreevous.State.FAILED);
      });

      describe("pass any node arguments that follow the condition name identifier argument where", () => {
        describe("the argument is a", () => {
          it("string", () => {
            const definition = "root { condition [someCondition, \"hello world!\"] }";
            const board = { 
              someCondition: (arg) => assert.strictEqual(arg, "hello world!")
            };
            const tree = new mistreevous.BehaviourTree(definition, board);
            
            tree.step();
          });

          it("string with escaped quotes", () => {
            const definition = "root { condition [someCondition, \"hello \\\" world!\"] }";
            const board = { 
              someCondition: (arg) => assert.strictEqual(arg, "hello \" world!")
            };
            const tree = new mistreevous.BehaviourTree(definition, board);
            
            tree.step();
          });

          it("number", () => {
            const definition = "root { condition [someCondition, 23.4567] }";
            const board = { 
              someCondition: (arg) => assert.strictEqual(arg, 23.4567)
            };
            const tree = new mistreevous.BehaviourTree(definition, board);
            
            tree.step();
          });

          it("boolean 'true' literal", () => {
            const definition = "root { condition [someCondition, true] }";
            const board = { 
              someCondition: (arg) => assert.strictEqual(arg, true)
            };
            const tree = new mistreevous.BehaviourTree(definition, board);
            
            tree.step();
          });

          it("boolean 'false' literal", () => {
            const definition = "root { condition [someCondition, false] }";
            const board = { 
              someCondition: (arg) => assert.strictEqual(arg, false)
            };
            const tree = new mistreevous.BehaviourTree(definition, board);
            
            tree.step();
          });

          it("null", () => {
            const definition = "root { condition [someCondition, null] }";
            const board = { 
              someCondition: (arg) => assert.isNull(arg)
            };
            const tree = new mistreevous.BehaviourTree(definition, board);
            
            tree.step();
          });
        });

        it("there are multiple arguments", () => {
          const definition = "root { condition [someCondition, 1.23, \"hello world!\", false, null] }";
          const board = { 
            someCondition: (arg0, arg1, arg2, arg3) => {
              assert.strictEqual(arg0, 1.23);
              assert.strictEqual(arg1, "hello world!");
              assert.strictEqual(arg2, false);
              assert.strictEqual(arg3, null);
            } 
          };
          const tree = new mistreevous.BehaviourTree(definition, board);
          
          tree.step();
        });
      });
    });

    it("will error if there is no blackboard function that matches the condition name", () => {
      const definition = "root { condition [someCondition] }";
      let tree;
      assert.doesNotThrow(() => tree = new mistreevous.BehaviourTree(definition, {}), Error);
      assert.throws(() => tree.step(), Error, "error stepping tree: cannot update condition node as function 'someCondition' is not defined in the blackboard");
    });
  });
});