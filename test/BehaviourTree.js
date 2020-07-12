const mistreevous = require('../dist/index');
const chai = require('chai');

var assert = chai.assert;

describe("A BehaviourTree instance", () => {
  describe("has initialisation logic that", () => {

    describe("should error when", () => {
      it("the tree definition argument is not a string", () => {
        const scenario = () => new mistreevous.BehaviourTree(null, {})
        assert.throws(scenario, Error, mistreevous.BehaviourTree.ERROR_DEFINITION_IS_NOT_A_STRING);
      });

      it("the blackboard object is not defined", () => {
        assert.throws(() => new mistreevous.BehaviourTree("", undefined), Error, "the blackboard must be defined");
      });
    });

    describe("should not error when", () => {
      it("the tree definition contains conditions with arguments", () => {
        const definition = `
          root {
            selector {
                repeat until(keyIsDown spacebar) {
                    sequence {
                        wait [1000, 2500]
                    }
                }
            }
          }
        `;

        const blackboard = {
          keyIsDown: (key) => !!key
        }

        const scenario = () => new mistreevous.BehaviourTree(definition, blackboard);
        assert.doesNotThrow(scenario, Error);

      })

      it("the tree definition contains actions with arguments", () => {
        const definition = `
          root {
            lotto {
                action [mutter angrily]
                action [mutter loudly]
                action [mutter nonsense]
            }
          }
        `;

        const blackboard = {
          mutter: (content) => `[mutters] ${content}`
        }

        const scenario = () => new mistreevous.BehaviourTree(definition, blackboard);
        assert.doesNotThrow(scenario, Error);

      })
    })
  });
});