# ![logo](https://github.com/nikkorn/mistreevous/raw/master/icons/icon-small.png) Mistreevous 

A tool to declaratively define and generate behaviour trees in JavaScript. Behaviour trees are used to create complex AI via the modular heirarchical composition of individual tasks.

Using this tool, trees can be defined with a simple and minimal built-in DSL, avoiding the need to write verbose definitions in JSON.

# Example
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

# Nodes

## States
Behaviour tree nodes can be in one of the following states:
- **READY** A node is in a ready state when it has not been visited yet in the execution of the tree.
- **RUNNING** A node is in a running state when it is is still being processed, these nodes will usually represent or encompass a long running action.
- **SUCCEEDED** A node is in a succeeded state when it is no longer being processed and has succeeded.
- **FAILED** A node is in a failed state when it is no longer being processed but has failed.

## Composite Nodes

### Root
This node represents the root of a behaviour tree and cannot be the child of another composite node.

A root node can only have a single child node. The state of a root node will reflect the state of this single child.

```
root {
    action [Dance]
}
```

Additional named root nodes can be defined and reused throughout a definition. Other root nodes can be referenced via the **branch** node. Exactly one root node must be left unnamed, this root node will be used as the main root node for the entire tree.

```
root {
    branch [SomeOtherTree]
}

root [SomeOtherTree] {
    action [Dance]
}
```

### Sequence
This node will update each child node in sequence. It will succeed if all of its children have succeeded and will fail if any of its children fail. This node will remain in the running state if one of its children is running.

```
root {
    sequence {
        action [Walk]
        action [Fall]
        action [Laugh]
    }
}
```

### Selector
This node will update each child node in sequence. It will fail if all of its children have failed and will succeed if any of its children succeed. This node will remain in the running state if one of its children is running.

```
root {
    selector {
        action [TryThis]
        action [ThenTryThis]
        action [TryThisLast]
    }
}
```

### Lotto
This node will select a single child at random to run as the active running node. The state of this node will reflect the state of the active child.

```
root {
    lotto {
        action [MoveLeft]
        action [MoveRight]
    }
}
```

A probability weight can be defined for each child node as an optional integer node argument, influencing the likelihood that a particular child will be picked.

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

### Repeat
A repeat node can only have a single child node which it will run repeatedly. It will do this until either the child fails, at which point the repeat node will fail, or the maximum number of iterations is reached, which moves the repeat node to a succeeded state. This node will be in a running state if its child is also in a running state, or if further iterations need to be made.

The maximum number of iterations can be defined as a single integer node argument. In the example below, we would be repeating the action **SomeAction** 5 times.

```
root {
    repeat [5] {
        action [SomeAction]
    }
}
```
The number of iterations to make can be selected at random within a lower and upper bound if these are defined as two integer node arguments. In the example below, we would be repeating the action **SomeAction** between 1 and 5 times.

```
root {
    repeat [1,5] {
        action [SomeAction]
    }
}
```
The maximum number of iterations to make can be omitted as a node argument. This would result in the child node being run infinitely, as can be seen in the example below.

```
root {
    repeat {
        action [SomeAction]
    }
}
```

### Flip
A flip node can only have a single child node. This node will succeed when its child moves to the failed state, and it will fail if its child moves to the succeeded state. This node will remain in the running state if its children is running.

```
root {
    flip {
        action [SomeAction]
    }
}
```

## Leaf Nodes

### Action
An action node represents an action that needs to be taken immediately, or ongoing behaviour that can take a prolonged amount of time. Each action node will correspond to functionality defined within the blackboard.

TODO

### Condition
TODO

### Wait
TODO

### Branch
TODO

## Guards
Any composite node, as well as the **wait** node, can be decorated with a guard. A guard defines a condition that must be met in order for the node to remain active. Any running nodes will have their guard condition evaluated per tree step, and will move to a failed state if the guard condition is not met.

This functionality is useful as a means of aborting long running actions or branches that span across multiple steps of the tree.

```
root {
    wait [10000] while(CanWait)
}
```

In the above example, we have a **wait** node that waits for 10 seconds before moving to a succeeded state. We are using a **while** guard to give up on waiting this long if the condition **CanWait** evaluates to false during a tree step.

### While
TODO


### Until
TODO

# Visualiser
A visualiser/editor can be found as part of this repo within the *visualiser* directory, and includes most of the the examples included in this README.

![visualiser](https://github.com/nikkorn/mistreevous/raw/master/resources/mistreevous-visualiser-screenshot.png "Visualiser")

