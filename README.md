# ![logo](resources/icons/icon-small.png) Mistreevous
[![npm version](https://badge.fury.io/js/mistreevous.svg)](https://badge.fury.io/js/mistreevous)
[![Node.js CI](https://github.com/nikkorn/mistreevous/actions/workflows/node.js.yml/badge.svg?branch=master)](https://github.com/nikkorn/mistreevous/actions/workflows/node.js.yml)

A library to declaratively define, build and execute behaviour trees, written in TypeScript for Node and browsers. Behaviour trees are used to create complex AI via the modular hierarchical composition of individual tasks.

Using this tool, trees can be defined with either JSON or a simple and minimal built-in DSL (MDSL), avoiding the need to write verbose definitions in JSON.

![Sorting Lunch](resources/images/sorting-lunch-example.png?raw=true "Sorting Lunch")

There is an in-browser editor and tree visualiser that you can try [HERE](https://nikkorn.github.io/mistreevous-visualiser/index.html?example=sorting-lunch)

## Install

```sh
$ npm install --save mistreevous
```
This package is built using esbuild to target both Node and browsers. If you would like to use this package in a browser you can just use `dist/mistreevous.js` or `dist/mistreevous.min.js`.

# Example
```js
import { State, BehaviourTree } from "mistreevous";

/** Define some behaviour for an agent. */
const definition = `root {
    sequence {
        action [Walk]
        action [Fall]
        action [Laugh]
    }
}`;

/** Create an agent that we will be modelling the behaviour for. */
const agent = {
    Walk: () => {
        console.log("walking!");
        return State.SUCCEEDED;
    },
    Fall: () => {
        console.log("falling!");
        return State.SUCCEEDED;
    },
    Laugh: () => {
        console.log("laughing!");
        return State.SUCCEEDED;
    },
};

/** Create the behaviour tree, passing our tree definition and the agent that we are modelling behaviour for. */
const behaviourTree = new BehaviourTree(definition, agent);

/** Step the tree. */
behaviourTree.step();

// 'walking!'
// 'falling!
// 'laughing!'
```
# Behaviour Tree Methods

#### isRunning()
Returns `true` if the tree is in the `RUNNING` state, otherwise `false`.

#### getState()
Gets the current tree state of `SUCCEEDED`, `FAILED` or `RUNNING`.

#### step()
Carries out a node update that traverses the tree from the root node outwards to any child nodes, skipping those that are already in a resolved state of `SUCCEEDED` or `FAILED`. After being updated, leaf nodes will have a state of `SUCCEEDED`, `FAILED` or `RUNNING`. Leaf nodes that are left in the `RUNNING` state as part of a tree step will be revisited each subsequent step until they move into a resolved state of either `SUCCEEDED` or `FAILED`, after which execution will move through the tree to the next node with a state of `READY`.

Calling this method when the tree is already in a resolved state of `SUCCEEDED` or `FAILED` will cause it to be reset before tree traversal begins.

#### reset()
Resets the tree from the root node outwards to each nested node, giving each a state of `READY`.

#### getTreeNodeDetails()
Gets the details of every node in the tree, starting from the root. This will include the current state of each node, which is useful for debugging a running tree instance.

# Behaviour Tree Options
The `BehaviourTree` constructor can take an options object as an argument, the properties of which are shown below.

| Option          |Type | Description |
| :--------------------|:- |:- |
| getDeltaTime |() => number| A function returning a delta time in seconds that is used to calculate the elapsed duration of any `wait` nodes. If this function is not defined then `Date.prototype.getTime()` is used instead by default.  |
| random |() => number| A function returning a floating-point number between 0 (inclusive) and 1 (exclusive). If defined, this function is used to source a pseudo-random number to use in operations such as the selection of active children for any `lotto` nodes as well as the selection of durations for `wait` nodes, iterations for `repeat` nodes and attempts for `retry` nodes when minimum and maximum bounds are defined. If not defined then `Math.random()` will be used instead by default. This function can be useful in seeding all random numbers used in the running of a tree instance to make any behaviour completely deterministic. |
| onNodeStateChange |(change: NodeStateChange) => void| An event handler that is called whenever the state of a node changes. The change object will contain details of the updated node and will include the previous state and current state. |

# Nodes

## States
Behaviour tree nodes can be in one of the following states:
- **READY** A node is in the `READY` state when it has not been visited yet in the execution of the tree.
- **RUNNING** A node is in the `RUNNING` state when it is still being processed, these nodes will usually represent or encompass a long-running action.
- **SUCCEEDED** A node is in a `SUCCEEDED` state when it is no longer being processed and has succeeded.
- **FAILED** A node is in the `FAILED` state when it is no longer being processed but has failed.


## Composite Nodes
Composite nodes wrap one or more child nodes, each of which will be processed in a sequence determined by the type of the composite node. A composite node will remain in the `RUNNING` state until it is finished processing the child nodes, after which the state of the composite node will reflect the success or failure of the child nodes.

### Sequence
This composite node will update each child node in sequence. It will move to the `SUCCEEDED` state if all of its children have moved to the `SUCCEEDED` state and will move to the `FAILED` state if any of its children move to the `FAILED` state. This node will remain in the `RUNNING` state if one of its children remains in the `RUNNING` state.
[Example](https://nikkorn.github.io/mistreevous-visualiser/index.html?example=sequence)

*MDSL*
```
root {
    sequence {
        action [Walk]
        action [Fall]
        action [Laugh]
    }
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "sequence",
        "children": [
            {
                "type": "action",
                "call": "Walk"
            },
            {
                "type": "action",
                "call": "Fall"
            },
            {
                "type": "action",
                "call": "Laugh"
            }
        ]
    }
}
```

### Selector
This composite node will update each child node in sequence. It will move to the `FAILED` state if all of its children have moved to the `FAILED` state and will move to the `SUCCEEDED` state if any of its children move to the `SUCCEEDED` state. This node will remain in the `RUNNING` state if one of its children is in the `RUNNING` state.
[Example](https://nikkorn.github.io/mistreevous-visualiser/index.html?example=selector)

*MDSL*
```
root {
    selector {
        action [TryThis]
        action [ThenTryThis]
        action [TryThisLast]
    }
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "selector",
        "children": [
            {
                "type": "action",
                "call": "TryThis"
            },
            {
                "type": "action",
                "call": "ThenTryThis"
            },
            {
                "type": "action",
                "call": "TryThisLast"
            }
        ]
    }
}
```

### Parallel
This composite node will update each child node concurrently. It will move to the `SUCCEEDED` state if all of its children have moved to the `SUCCEEDED` state and will move to the `FAILED` state if any of its children move to the `FAILED` state, otherwise it will remain in the `RUNNING` state.
[Example](https://nikkorn.github.io/mistreevous-visualiser/index.html?example=parallel)

*MDSL*
```
root {
    parallel {
        action [RubBelly]
        action [PatHead]
    }
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "parallel",
        "children": [
            {
                "type": "action",
                "call": "RubBelly"
            },
            {
                "type": "action",
                "call": "PatHead"
            }
        ]
    }
}
```

### Race
This composite node will update each child node concurrently. It will move to the `SUCCEEDED` state if any of its children have moved to the `SUCCEEDED` state and will move to the `FAILED` state if all of its children move to the `FAILED` state, otherwise it will remain in the `RUNNING` state.
[Example](https://nikkorn.github.io/mistreevous-visualiser/index.html?example=race)

*MDSL*
```
root {
    race {
        action [UnlockDoor]
        action [FindAlternativePath]
    }
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "race",
        "children": [
            {
                "type": "action",
                "call": "UnlockDoor"
            },
            {
                "type": "action",
                "call": "FindAlternativePath"
            }
        ]
    }
}
```

### All
This composite node will update each child node concurrently. It will stay in the `RUNNING` state until all of its children have moved to either the `SUCCEEDED` or `FAILED` state, after which this node will move to the `SUCCEEDED` state if any of its children have moved to the `SUCCEEDED` state, otherwise it will move to the `FAILED` state.
[Example](https://nikkorn.github.io/mistreevous-visualiser/index.html?example=all)

*MDSL*
```
root {
    all {
        action [Reload]
        action [MoveToCover]
    }
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "all",
        "children": [
            {
                "type": "action",
                "call": "Reload"
            },
            {
                "type": "action",
                "call": "MoveToCover"
            }
        ]
    }
}
```

### Lotto
This composite node will select a single child at random to run as the active running node. The state of this node will reflect the state of the active child.
[Example](https://nikkorn.github.io/mistreevous-visualiser/index.html?example=lotto)

*MDSL*
```
root {
    lotto {
        action [MoveLeft]
        action [MoveRight]
    }
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "lotto",
        "children": [
            {
                "type": "action",
                "call": "MoveLeft"
            },
            {
                "type": "action",
                "call": "MoveRight"
            }
        ]
    }
}
```

A probability weight can be defined for each child node as an optional integer node argument in MDSL, influencing the likelihood that a particular child will be picked. In JSON this would be done by setting a value of an array containing the integer weight values for the `weights` property.
[Example](https://nikkorn.github.io/mistreevous-visualiser/index.html?example=weighted-lotto)

*MDSL*
```
root {
    lotto [10,5,3,1] {
        action [CommonAction]
        action [UncommonAction]
        action [RareAction]
        action [VeryRareAction]
    }
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "lotto",
        "children": [
            {
                "type": "action",
                "call": "CommonAction"
            },
            {
                "type": "action",
                "call": "UncommonAction"
            },
            {
                "type": "action",
                "call": "RareAction"
            },
            {
                "type": "action",
                "call": "VeryRareAction"
            }
        ],
        "weights": [10, 5, 3, 1]
    }
}
```

## Decorator Nodes
A decorator node is similar to a composite node, but it can only have a single child node. The state of a decorator node is usually some transformation of the state of the child node. Decorator nodes are also used to repeat or terminate the execution of a particular node.

### Root
This decorator node represents the root of a behaviour tree and cannot be the child of another composite node.

The state of a root node will reflect the state of its child node.

*MDSL*
```
root {
    action [Dance]
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "action",
        "call": "Dance"
    }
}
```

Additional named root nodes can be defined and reused throughout a definition. Other root nodes can be referenced via the **branch** node. Exactly one root node must be left unnamed, this root node will be used as the main root node for the entire tree.

*MDSL*
```
root {
    branch [SomeOtherTree]
}

root [SomeOtherTree] {
    action [Dance]
}
```

*JSON*
```json
[
    {
        "type": "root",
        "child": {
            "type": "branch",
            "ref": "SomeOtherTree"
        }
    },
    {
        "type": "root",
        "id": "SomeOtherTree",
        "child": {
            "type": "action",
            "call": "Dance",
            "args": []
        }
    }
]
```

### Repeat
This decorator node will repeat the execution of its child node if the child moves to the `SUCCEEDED` state. It will do this until either the child moves to the `FAILED` state, at which point the repeat node will move to the `FAILED` state, or the maximum number of iterations is reached, which moves the repeat node to the `SUCCEEDED` state. This node will be in the `RUNNING` state if its child is also in the `RUNNING` state, or if further iterations need to be made.
[Example](https://nikkorn.github.io/mistreevous-visualiser/index.html?example=repeat)

The maximum number of iterations can be defined as a single integer iteration argument in MDSL, or by setting the `iterations` property in JSON. In the example below, we would be repeating the action **SomeAction** 5 times.

*MDSL*
```
root {
    repeat [5] {
        action [SomeAction]
    }
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "repeat",
        "iterations": 5,
        "child": {
            "type": "action",
            "call": "SomeAction"
        }
    }
}
```

The number of iterations to make can be selected at random within a lower and upper bound if these are defined as two integer arguments in MDSL, or by setting a value of an array containing two integer values for the `iterations` property in JSON. In the example below, we would be repeating the action **SomeAction** between 1 and 5 times.

*MDSL*
```
root {
    repeat [1,5] {
        action [SomeAction]
    }
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "repeat",
        "iterations": [1, 5],
        "child": {
            "type": "action",
            "call": "SomeAction"
        }
    }
}
```

The maximum number of iterations to make can be omitted. This would result in the child node being run infinitely, as can be seen in the example below.

*MDSL*
```
root {
    repeat {
        action [SomeAction]
    }
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "repeat",
        "child": {
            "type": "action",
            "call": "SomeAction"
        }
    }
}
```

### Retry
This decorator node will repeat the execution of its child node if the child moves to the `FAILED` state. It will do this until either the child moves to the `SUCCEEDED` state, at which point the retry node will move to the `SUCCEEDED` state or the maximum number of attempts is reached, which moves the retry node to the `FAILED` state. This node will be in a `RUNNING` state if its child is also in the `RUNNING` state, or if further attempts need to be made.

The maximum number of attempts can be defined as a single integer attempt argument in MDSL, or by setting the `attempts` property in JSON. In the example below, we would be retrying the action **SomeAction** 5 times.

*MDSL*
```
root {
    retry [5] {
        action [SomeAction]
    }
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "retry",
        "attempts": 5,
        "child": {
            "type": "action",
            "call": "SomeAction"
        }
    }
}
```

The number of attempts to make can be selected at random within a lower and upper bound if these are defined as two integer arguments in MDSL, or by setting a value of an array containing two integer values for the `attempts` property in JSON. In the example below, we would be retrying the action **SomeAction** between 1 and 5 times.

*MDSL*
```
root {
    retry [1,5] {
        action [SomeAction]
    }
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "retry",
        "attempts": [1, 5],
        "child": {
            "type": "action",
            "call": "SomeAction"
        }
    }
}
```

The maximum number of attempts to make can be omitted. This would result in the child node being run infinitely until it moves to the `SUCCEEDED` state, as can be seen in the example below.

*MDSL*
```
root {
    retry {
        action [SomeAction]
    }
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "retry",
        "child": {
            "type": "action",
            "call": "SomeAction"
        }
    }
}
```

### Flip
This decorator node will move to the `SUCCEEDED` state when its child moves to the `FAILED` state, and it will move to the `FAILED` if its child moves to the `SUCCEEDED` state. This node will remain in the `RUNNING` state if its child is in the `RUNNING` state.
[Example](https://nikkorn.github.io/mistreevous-visualiser/index.html?example=flip)

*MDSL*
```
root {
    flip {
        action [SomeAction]
    }
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "flip",
        "child": {
            "type": "action",
            "call": "SomeAction"
        }
    }
}
```

### Succeed
This decorator node will move to the `SUCCEEDED` state when its child moves to either the `FAILED` state or the `SUCCEEDED` state. This node will remain in the `RUNNING` state if its child is in the `RUNNING` state.
[Example](https://nikkorn.github.io/mistreevous-visualiser/index.html?example=succeed)

*MDSL*
```
root {
    succeed {
        action [SomeAction]
    }
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "succeed",
        "child": {
            "type": "action",
            "call": "SomeAction"
        }
    }
}
```

### Fail
This decorator node will move to the `FAILED` state when its child moves to either the `FAILED` state or the `SUCCEEDED` state. This node will remain in the `RUNNING` state if its child is in the `RUNNING` state.
[Example](https://nikkorn.github.io/mistreevous-visualiser/index.html?example=fail)

*MDSL*
```
root {
    fail {
        action [SomeAction]
    }
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "fail",
        "child": {
            "type": "action",
            "call": "SomeAction"
        }
    }
}
```

## Leaf Nodes
Leaf nodes are the lowest-level node type and cannot be the parent of other child nodes.

### Action
An action node represents an action that can be completed immediately as part of a single tree step, or ongoing behaviour that can take a prolonged amount of time and may take multiple tree steps to complete. Each action node will correspond to some action that can be carried out by the agent, where the first action node argument (if using MDSL, or the `call` property if using JSON) will be an identifier matching the name of the corresponding agent action function or globally registered function.
[Example](https://nikkorn.github.io/mistreevous-visualiser/index.html?example=action)

An agent action function can optionally return a value of **State.SUCCEEDED**, **State.FAILED** or **State.RUNNING**. If the **State.SUCCEEDED** or **State.FAILED** state is returned, then the action will move to that state.


*MDSL*
```
root {
    action [Attack]
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "action",
        "call": "Attack"
    }
}
```

```js
const agent = {
    //...
    Attack: () => {
        // If we do not have a weapon then we cannot attack.
        if (!this.isHoldingWeapon()) {
            // We have failed to carry out an attack!
            return Mistreevous.State.FAILED;
        }

        // ... Attack with swiftness and precision ...

        // We have carried out our attack.
        return Mistreevous.State.SUCCEEDED;
    }
    // ...
};
```

If no value or a value of **State.RUNNING** is returned from the action function the action node will move into the `RUNNING` state and no following nodes will be processed as part of the current tree step. In the example below, any action node that references **WalkToPosition** will remain in the `RUNNING` state until the target position is reached.

```js
const agent = {
    //...
    WalkToPosition: () => {
        // ... Walk towards the position we are trying to reach ...

        // Check whether we have finally reached the target position.
        if (this.isAtTargetPosition()) {
            // We have finally reached the target position!
            return Mistreevous.State.SUCCEEDED;
        }

        // We have not reached the target position yet.
        return Mistreevous.State.RUNNING;
    }
    // ...
};
```

Further steps of the tree will resume processing from leaf nodes that were left in the `RUNNING` state until those nodes move to either the `SUCCEEDED` or `FAILED` state or processing of the running branch is aborted via a guard.

#### Promise-based Actions
As well as returning a finished action state from an action function, you can also return a promise that should eventually resolve with a finished state of **State.SUCCEEDED** or **State.FAILED** as its value. The action will remain in the `RUNNING` state until the promise is fulfilled, and any following tree steps will not call the action function again.
[Example](https://nikkorn.github.io/mistreevous-visualiser/index.html?example=async-action)

```js
const agent = {
    //...
    SomeAsyncAction: () => {
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                resolve(Mistreevous.State.SUCCEEDED);
            }, 5000);
        });
    }
    // ...
};
```

#### Optional Arguments
Arguments can optionally be passed to agent action functions. In MDSL these optional arguments must be defined after the action name identifier argument and can be a `number`, `string`, `boolean` or `null`. If using JSON then these arguments are defined in an `args` array and these arguments can be any valid JSON.
[Example](https://nikkorn.github.io/mistreevous-visualiser/index.html?example=action-with-args)

*MDSL*
```
root {
    action [Say, "hello world", 5, true]
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "action",
        "call": "Say",
        "args": ["hello world", 5, true]
    }
}
```

```js
const agent = {
    //...
    Say: (dialog, times = 1, sayLoudly = false) => 
    {
        for (var index = 0; index < times; index++) {
            showDialog(sayLoudly ? dialog.toUpperCase() + "!!!" : dialog);
        }

        return Mistreevous.State.SUCCEEDED;
    }
    // ...
};
```

### Condition
A Condition node will immediately move into either a `SUCCEEDED` or `FAILED` state based on the boolean result of calling either an agent function or globally registered function. The first condition node argument will be an identifier matching the name of the corresponding agent condition function or globally registered function (if using MDSL, or the `call` property if using JSON).
[Example](https://nikkorn.github.io/mistreevous-visualiser/index.html?example=condition)

*MDSL*
```
root {
    sequence {
        condition [HasWeapon]
        action [Attack]
    }
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "sequence",
        "children": [
            {
                "type": "condition",
                "call": "HasWeapon"
            },
            {
                "type": "action",
                "call": "Attack"
            }
        ]
    }
}
```

```js
const agent = {
    //...
    HasWeapon: () => this.isHoldingWeapon(),
    //...
    Attack: () => this.attackPlayer(),
    // ...
};
```

#### Optional Arguments
Arguments can optionally be passed to agent condition functions in the same way as action nodes. In MDSL these optional arguments must be defined after the condition name identifier argument, and can be a `number`, `string`, `boolean` or `null`, or can be any valid JSON when using a JSON definition.
[Example](https://nikkorn.github.io/mistreevous-visualiser/index.html?example=condition-with-args)

*MDSL*
```
root {
    sequence {
        condition [HasItem, "potion"]
    }
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "sequence",
        "children": [
            {
                "type": "condition",
                "call": "HasItem",
                "args": ["potion"]
            }
        ]
    }
}
```

```js
const agent = {
    //...
    HasItem: (itemName) => this.inventory.includes(itemName),
    // ...
};
```

### Wait
A wait node will remain in a `RUNNING` state for a specified duration, after which it will move into the `SUCCEEDED` state. The duration in milliseconds can be defined as an optional single integer node argument in MDSL, or by setting a value for the `duration` property in JSON.
[Example](https://nikkorn.github.io/mistreevous-visualiser/index.html?example=wait)

*MDSL*
```
root {
    repeat {
        sequence {
            action [FireWeapon]
            wait [2000]
        }
    }
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "repeat",
        "child": {
            "type": "sequence",
            "children": [
                {
                    "type": "action",
                    "call": "FireWeapon"
                },
                {
                    "type": "wait",
                    "duration": 2000
                }
            ]
        }
    }
}
```

In the above example, we are using a wait node to wait 2 seconds between each run of the **FireWeapon** action.

The duration to wait in milliseconds can also be selected at random within a lower and upper bound if these are defined as two integer node arguments in MDSL, or by setting a value of an array containing two integer values for the `duration` property in JSON. In the example below, we would run the **PickUpProjectile** action and then wait for 2 to 8 seconds before running the **ThrowProjectile** action.
[Example](https://nikkorn.github.io/mistreevous-visualiser/index.html?example=wait)

*MDSL*
```
root {
    sequence {
        action [PickUpProjectile]
        wait [2000, 8000]
        action [ThrowProjectile]
    }
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "sequence",
        "children": [
            {
                "type": "action",
                "call": "PickUpProjectile"
            },
            {
                "type": "wait",
                "duration": [2000, 8000]
            },
            {
                "type": "action",
                "call": "ThrowProjectile"
            }
        ]
    }
}
```

If no duration is defined then the wait node will remain in the `RUNNING` state indefinitely until it is aborted.
[Example](https://nikkorn.github.io/mistreevous-visualiser/index.html?example=wait)

*MDSL*
```
root {
    wait
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "wait"
    }
}
```

### Branch
Named root nodes can be referenced using the **branch** node. This node acts as a placeholder that will be replaced by the child node of the referenced root node. All definitions below are synonymous.
[Example](https://nikkorn.github.io/mistreevous-visualiser/index.html?example=branch)

*MDSL*
```
root {
    branch [SomeOtherTree]
}

root [SomeOtherTree] {
    action [Dance]
}
```

```
root {
    action [Dance]
}
```

*JSON*
```json
[
    {
        "type": "root",
        "child": {
            "type": "branch",
            "ref": "SomeOtherTree"
        }
    },
    {
        "type": "root",
        "id": "SomeOtherTree",
        "child": {
            "type": "action",
            "call": "Dance"
        }
    }
]
```

```json
{
    "type": "root",
    "child": {
        "type": "action",
        "call": "Dance"
    }
}

```

## Callbacks
Callbacks can be defined for tree nodes and will be invoked as the node is processed during a tree step. Any number of callbacks can be attached to a node as long as there are not multiple callbacks of the same type.
[Example](https://nikkorn.github.io/mistreevous-visualiser/index.html?example=callbacks)

Optional arguments can be defined for callback functions in the same way as action and condition functions.

### Entry
An **entry** callback defines an agent function or globally registered function to call whenever the associated node moves into the `RUNNING` state when it is first visited.

*MDSL*
```
root {
    sequence entry(StartWalkingAnimation)  {
        action [WalkNorthOneSpace]
        action [WalkEastOneSpace]
        action [WalkSouthOneSpace]
        action [WalkWestOneSpace]
    }
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "sequence",
        "entry": {
            "call": "StartWalkingAnimation"
        },
        "children": [
            {
                "type": "action",
                "call": "WalkNorthOneSpace"
            },
            {
                "type": "action",
                "call": "WalkEastOneSpace"
            },
            {
                "type": "action",
                "call": "WalkSouthOneSpace"
            },
            {
                "type": "action",
                "call": "WalkWestOneSpace"
            }
        ]
    }
}
```

### Exit
An **exit** callback defines an agent function or globally registered function to call whenever the associated node moves to a state of `SUCCEEDED` or `FAILED` or is aborted. A results object is passed to the referenced function containing the **succeeded** and **aborted** boolean properties.

*MDSL*
```
root {
    sequence entry(StartWalkingAnimation) exit(StopWalkingAnimation) {
        action [WalkNorthOneSpace]
        action [WalkEastOneSpace]
        action [WalkSouthOneSpace]
        action [WalkWestOneSpace]
    }
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "sequence",
        "entry": {
            "call": "StartWalkingAnimation"
        },
        "exit": {
            "call": "StopWalkingAnimation"
        },
        "children": [
            {
                "type": "action",
                "call": "WalkNorthOneSpace"
            },
            {
                "type": "action",
                "call": "WalkEastOneSpace"
            },
            {
                "type": "action",
                "call": "WalkSouthOneSpace"
            },
            {
                "type": "action",
                "call": "WalkWestOneSpace"
            }
        ]
    }
}
```

### Step
A **step** callback defines an agent function or globally registered function to call whenever the associated node is updated as part of a tree step.

*MDSL*
```
root {
    sequence step(OnMoving) {
        action [WalkNorthOneSpace]
        action [WalkEastOneSpace]
        action [WalkSouthOneSpace]
        action [WalkWestOneSpace]
    }
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "sequence",
        "step": {
            "call": "OnMoving"
        },
        "children": [
            {
                "type": "action",
                "call": "WalkNorthOneSpace"
            },
            {
                "type": "action",
                "call": "WalkEastOneSpace"
            },
            {
                "type": "action",
                "call": "WalkSouthOneSpace"
            },
            {
                "type": "action",
                "call": "WalkWestOneSpace"
            }
        ]
    }
}
```

#### Optional Arguments
Arguments can optionally be passed to agent callback functions and can be a `number`, `string`, `boolean` or `null` if using MDSL, or any valid JSON when using a JSON definition.

*MDSL*
```
root {
    action [Walk] entry(OnMovementStart, "walking")
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "action",
        "call": "Walk",
        "entry": {
            "call": "OnMovementStart",
            "args": [
                "walking"
            ]
        }
    }
}
```

## Guards
A guard defines a condition that must be met in order for the associated node to remain active. Any nodes in the `RUNNING` state will have their guard condition evaluated for each leaf node update and will move to the `FAILED` state by default if the guard condition is not met.
[Example](https://nikkorn.github.io/mistreevous-visualiser/index.html?example=guards)

This functionality is useful as a means of aborting long-running actions or branches that span across multiple steps of the tree.

*MDSL*
```
root {
    wait while(CanWait)
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "wait",
        "while": {
            "call": "CanWait"
        }
    }
}
```

In the above example, we have a **wait** node that waits indefinitely. We are using a **while** guard to give up on waiting if the guard function **CanWait** returns false during a tree step.

#### Optional Arguments
Arguments can optionally be passed to agent guard functions and can be a `number`, `string`, `boolean` or `null` if using MDSL, or any valid JSON when using a JSON definition.

*MDSL*
```
root {
    action [Run] while(HasItemEquipped, "running-shoes")
}
```
```
root {
    action [Gamble] until(HasGold, 1000)
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "action",
        "call": "Run",
        "while": {
            "call": "HasItemEquipped",
            "args": [
                "running-shoes"
            ]
        }
    }
}
```
```json
{
    "type": "root",
    "child": {
        "type": "action",
        "call": "Gamble",
        "until": {
            "call": "HasGold",
            "args": [
                1000
            ]
        }
    }
}
```

### While
A **while** guard will be satisfied as long as its condition evaluates to true.

*MDSL*
```
root {
    sequence while(IsWandering) {
        action [Whistle]
        wait [5000]
        action [Yawn]
        wait [5000]
    }
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "sequence",
        "while": {
            "call": "IsWandering"
        },
        "children": [
            {
                "type": "action",
                "call": "Whistle"
            },
            {
                "type": "wait",
                "duration": 5000
            },
            {
                "type": "action",
                "call": "Yawn"
            },
            {
                "type": "wait",
                "duration": 5000
            }
        ]
    }
}
```

### Until
An **until** guard will be satisfied as long as its condition evaluates to false.

*MDSL*
```
root {
    sequence until(CanSeePlayer) {
        action [LookLeft]
        wait [5000]
        action [LookRight]
        wait [5000]
    }
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "sequence",
        "until": {
            "call": "CanSeePlayer"
        },
        "children": [
            {
                "type": "action",
                "call": "LookLeft"
            },
            {
                "type": "wait",
                "duration": 5000
            },
            {
                "type": "action",
                "call": "LookRight"
            },
            {
                "type": "wait",
                "duration": 5000
            }
        ]
    }
}
```

### Defining Aborted Node State
When aborted via a guard, a node will mode to the `FAILED` state by default. Optionally, the state that the node should move to when aborted can be specified with `then succeed` or `then fail` following the guard definition when using MDSL, or by setting the `succeedOnAbort` boolean property when using a JSON definition.

*MDSL*
```
root {
    sequence {
        wait until(CanAttack) then succeed
        action [Attack]
    }
}
```

*JSON*
```json
{
    "type": "root",
    "child": {
        "type": "sequence",
        "children": [
            {
                "type": "wait",
                "until": {
                    "call": "CanAttack",
                    "succeedOnAbort": true
                }
            },
            {
                "type": "action",
                "call": "Attack"
            }
        ]
    }
}
```
 
## Globals

When dealing with multiple agents, each with its own behaviour tree instance, it can often be useful to have functions and subtrees that can be registered globally once and referenced by any instance.

### Global Subtrees
We can globally register a subtree that can be referenced from any behaviour tree via a **branch** node.
[Example](https://nikkorn.github.io/mistreevous-visualiser/index.html?example=global-subtrees)

```js
/** Register the global subtree for some celebratory behaviour. We can also pass a JSON defintion here. */
BehaviourTree.register("Celebrate", `root {
    sequence {
        action [Jump]
        action [Say, "Yay!"]
        action [Jump]
        action [Say, "We did it!"]
    }
}`);

/** Define some behaviour for an agent that references our registered 'Celebrate' subtree. */
const definition = `root {
    sequence {
        action [AttemptDifficultTask]
        branch [Celebrate]
    }
}`;

/** Create our agent behaviour tree. */
const agentBehaviourTree = new BehaviourTree(definition, agent);
```

### Global Functions
We can globally register functions to be invoked in place of any agent instance functions, these functions can be referenced throughout a tree definition anywhere that we can reference an agent instance function. The primary difference between these globally registered functions and any agent instance functions is that all global functions that are invoked will take the invoking agent object as the first argument, followed by any optional arguments.
[Example](https://nikkorn.github.io/mistreevous-visualiser/index.html?example=global-functions)

In a situation where a tree will reference a function by name that is defined on both the agent instance as well as a function that is registered globally, the agent instance function will take precedence.

```js
/** Register the 'speak' global function that any agent tree can invoke for an action. */
BehaviourTree.register("Speak", (agent, text) => {
    showInfoToast(`${agent.getName()}: ${text}`);
    return State.SUCCEEDED;
});

/** Register the 'IsSimulationRunning' global function that any agent tree can invoke for a condition. */
BehaviourTree.register("IsSimulationRunning", (agent) => {
    return simulation.isRunning();
});

/** Define some behaviour for an agent that references our registered functions. */
const definition = `root {
    sequence {
        condition [IsSimulationRunning]
        action [Speak, "I still have work to do"]
    }
}`;

/** Create our agent behaviour tree. */
const agentBehaviourTree = new BehaviourTree(definition, agent);
```

## Further Reading
[Behavior trees for AI: How they work](https://www.gamedeveloper.com/programming/behavior-trees-for-ai-how-they-work)
A great overview of behaviour trees, tackling the basic concepts.

[Designing AI Agents’ Behaviors with Behavior Trees](https://towardsdatascience.com/designing-ai-agents-behaviors-with-behavior-trees-b28aa1c3cf8a)
A practical look at behaviour trees and a good example of modelling behaviour for agents in a game of Pacman.


## Version History
| Version        | Notes |
| -------------- |:----------------------------------------------------------------------------------------|
| 4.2.0          | Added support for single and multi line comments in MDSL using /* ... */ syntax |
| 4.1.1          | Added linter and updated dependencies |
| 4.1.0          | Added Race and All node types |
|                | Added onNodeStateChange callback to behaviour tree options | 
|                | Added getTreeNodeDetails method to BehaviourTree | 
| 4.0.0          | Added support for JSON tree definitions |
|                | Added validateDefinition function to use in validating JSON/MDSL definitions | 
|                | Added convertMDSLToJSON function to convert existing MDSL definitions to JSON | 
|                | Tidied up error handling for agent and registered function invocation | 
|                | Action functions can now explictly return a value of State.RUNNING instead of having to return undefined  | 
|                | Fixed issue where rejected action function promises were not handled correctly |
|                | Fixed issue where registered functions were called with incorrect arguments |
|                | Fixed some typings | 
|                | Added a BUNCH of tests | 
| 3.2.0          | The 'random' function option is used for iteration and attempt selection for `repeat` and `retry` nodes respectively when minimum and maximum bounds are defined | 
| 3.1.0          | Added 'random' function option to allow users to provide psuedo-random numbers for use in operations such as `lotto` node child selection and wait node duration selection when a minimum and maximum duration are defined. Wait nodes will now remain in the running state indefinitely until they are aborted if no duration is defined for them | 
| 3.0.0          | Converted to Typescript | 
| 2.3.0          | Added Global Functions and Subtrees | 
| 2.2.0          | Added Succeed, Fail and Retry decorators | 
| 2.1.0          | Added optional arguments for actions, conditions and decorators  | 
| 2.0.1          | Fixed isses with inconsistent guard condition evaluation for composite nodes | 
| 2.0.0          | Fixed broken typings | 
| 1.1.0          | Added parallel composite node |
| 1.0.0          | Calls to action, condition and guard agent functions are now bound to the agent instance |
| 0.0.6          | Added promisey actions |