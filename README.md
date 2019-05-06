# ![logo](https://github.com/nikkorn/mistreevous/raw/master/icons/icon-small.png) Mistreevous 

A tool to declaratively define and generate behaviour trees in JavaScript. Behaviour trees are used to create complex AI via the modular heirarchical composition of individual tasks.

Using this tool, trees can be defined with a simple and minimal built-in DSL, avoiding the need to write verbose definitions in JSON.

## Example
```js
/** Define some behaviour for an entity. */
const definition = `root {
    sequence {
        action [Walk]
        action [Fall]
        action [Laugh]
    }
}`;

/** Create the blackboard, the object to hold tasks and state for a tree instance. */
const board = {
    Walk: () => {
        console.log("walking!");
        return Mistreevous.State.SUCCEEDED;
    },
    Fall: {
        onStart: () => {
            console.log("starting to fall!");
        },
        onUpdate: () => Mistreevous.State.SUCCEEDED,
        onFinish: (succeeded) => {
            console.log("finished falling!");
        }
    },
    Laugh: () => {
        console.log("laughing!");
        return Mistreevous.State.SUCCEEDED;
    },
};

/** Create the behaviour tree. */
const behaviourTree = new Mistreevous.BehaviourTree(definition, board);

/** Step the tree. */
behaviourTree.step();

// 'walking!'
// 'starting to fall!
// 'finished falling!'
// 'laughing!'
```