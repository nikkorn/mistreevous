const Mistreevous = require('./index');

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