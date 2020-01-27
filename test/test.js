const Mistreevous = require('../dist/index');

const tree = new Mistreevous.BehaviourTree("root { action[Run] }", {
    Run: () => {
        console.log("Running!");

        return Mistreevous.State.SUCCEEDED;
    }
});

console.log(tree.getState());
console.log("Stepping the tree!");
tree.step();
console.log(tree.getState());
console.log("Finished!");


var assert = require('assert');

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});