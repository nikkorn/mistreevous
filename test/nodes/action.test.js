const mistreevous = require('../../dist/index');
const chai = require('chai');

var assert = chai.assert;

describe("An Action node", () => {
  describe("on tree initialisation", () => {
    it("will error if an action name identifier is not the first node argument", () => {
      const definition = "root { action [] }";
      assert.throws(() => new mistreevous.BehaviourTree(definition, {}), Error, "error parsing tree: expected action name identifier argument");
    });
  });

  describe("when updated as part of a tree step", () => {
    describe("will call the blackboard function defined by the first node arguments and", () => {
      it("move to the SUCCESS state if the function returns a value of State.SUCCEEDED", () => {
        const definition = "root { action [doAction] }";
        const board = { doAction: () => mistreevous.State.SUCCEEDED };
        const tree = new mistreevous.BehaviourTree(definition, board);

        tree.step();

        console.log(tree.getState());


        // TODO
      });

      it("move to the FAILED state if the function returns a value of State.FAILED", () => {
        // TODO
      });

      describe("move to the RUNNING state if", () => {
        it("the function returns undefined", () => {
          // TODO
        });

        it("the function returns a promise to return a value of State.SUCCEEDED or State.FAILED", () => {
          // TODO
        });
      });

      it("will error if the returned value is not State.SUCCEEDED or State.FAILED", () => {
        // TODO
      });

      describe("pass any node arguments that follow the action name identifier argument where", () => {
        it("there are multiple arguments", () => {
          // TODO
        });

        describe("the argument is a", () => {
          it("string", () => {
            // TODO
          });

          it("string with escaped quotes", () => {
            // TODO
          });

          it("number", () => {
            // TODO
          });

          it("boolean", () => {
            // TODO
          });

          it("null", () => {
            // TODO
          });
        });
      });
    });

    it("will error if there is no blackboard function that matches the action name", () => {
      const definition = "root { action [DoTheThing] }";
      let tree;
      assert.doesNotThrow(() => tree = new mistreevous.BehaviourTree(definition, {}), Error);
      assert.throws(() => tree.step(), Error, "error stepping tree: cannot update action node as action 'DoTheThing' is not defined in the blackboard");
    });
  });
});