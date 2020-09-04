/**
 * A collection of definition/blackboard snippets. 
 */
const example_snippets = {
    "none": {
        "definition": "root { }",
        "blackboard": "{}"
    },





    "basic-action": {
        "definition": `root {
    action [SomeAction]
}`,
        "blackboard": `{
    SomeAction: () => Mistreevous.State.SUCCEEDED
}`
    },


    "action-with-args": {
        "definition": `root {
    action [Say, "hello world", 5, true]
}`,
        "blackboard": `{
    Say: (dialog, times = 1, sayLoudly = false) => 
    {
        for (var index = 0; index < times; index++) {
            console.log(sayLoudly ? dialog.toUpperCase() + "!!!" : dialog);
        }

        return Mistreevous.State.SUCCEEDED;
    }
}`
    },




    "async-action": {
        "definition": `root {
    action [SomeAsyncAction]
}`,
        "blackboard": `{
  SomeAsyncAction: () => {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve(Mistreevous.State.SUCCEEDED);
      }, 3000);
    });
  }
}`
    },





    "basic-condition": {
        "definition": `root {
    condition [SomeCondition]
}`,
        "blackboard": `{
    SomeCondition: () => true
}`
    },


    "condition-with-args": {
        "definition": `root {
    condition [HasItem, "gold", 500]
}`,
        "blackboard": `{
    HasItem: (item, quantity = 1) => 
    {
        console.log("check whether we have " + quantity + " " + item);
        return Mistreevous.State.SUCCEEDED;
    }
}`
    },





    "wait-one-second": {
        "definition": `root {
    wait [1000]
}`,
        "blackboard": "{}"
    },


    "wait-for-one-to-five-seconds": {
        "definition": `root {
    wait [1000, 5000]
}`,
        "blackboard": "{}"
    },





    "basic-sequence": {
        "definition": `root {
    sequence {
        action [Walk]
        action [Fall]
        action [Laugh]
    }
}`,
        "blackboard": `{
    Walk: () => {
        console.log("walking!");
        return Mistreevous.State.SUCCEEDED;
    },
    Fall: () => {
        console.log("falling!");
        return Mistreevous.State.SUCCEEDED;
    },
    Laugh: () => {
        console.log("laughing!");
        return Mistreevous.State.SUCCEEDED;
    },
}`
    },



    "basic-lotto": {
        "definition": `root {
    lotto {
        action [PickLeftPath]
        action [PickRightPath]
    }
}`,
        "blackboard": `{
    PickLeftPath: () => Mistreevous.State.SUCCEEDED,
    PickRightPath: () => Mistreevous.State.SUCCEEDED
}`
    },




    "weighted-lotto": {
        "definition": `root {
    lotto [10,5,3,1] {
        action [CommonAction]
        action [UncommonAction]
        action [RareAction]
        action [VeryRareAction]
    }
}`,
        "blackboard": `{
    CommonAction: () => Mistreevous.State.SUCCEEDED,
    UncommonAction: () => Mistreevous.State.SUCCEEDED,
    RareAction: () => Mistreevous.State.SUCCEEDED,
    VeryRareAction: () => Mistreevous.State.SUCCEEDED
}`
    },




    "node-guards": {
        "definition": `root {
  selector {
    repeat until(IsSpaceKeyPressed) {
      action [Succeed]
    }
    repeat while(IsSpaceKeyPressed) {
      action [Succeed]
    }
    repeat until(IsSpaceKeyPressed) {
      action [Succeed]
    }
    repeat while(IsSpaceKeyPressed) {
      action [Succeed]
    }
  }
}`,
        "blackboard": `{
    // An action that will immediately succeed.
    Succeed: () => Mistreevous.State.SUCCEEDED,

    // A condition that returns whether the space key is currently pressed.
    IsSpaceKeyPressed: function () {
        // Is the space key pressed?
        return IsKeyPressed(32);
    }
}`
    },


    "nested-until-node-guard": {
        "definition": `root {
    sequence until(IsSpaceKeyPressed) {
            sequence {
                wait[1000]
                wait[1000]
                wait[1000]
            }
            sequence {
                wait[1000]
                wait[1000]
                wait[1000]
            }
            sequence {
                wait[1000]
                wait[1000]
                wait[1000]
            }
    }
}`,
        "blackboard": `{
    // An action that will immediately succeed.
    Succeed: () => Mistreevous.State.SUCCEEDED,

    // A condition that returns whether the space key is currently pressed.
    IsSpaceKeyPressed: function () {
        // Is the space key pressed?
        return IsKeyPressed(32);
    }
}`
    },



    "flip-node": {
        "definition": `root {
    sequence {
        flip {
            condition [IsFalse]
        }
        flip {
            condition [IsTrue]
        }
    }
}`,
        "blackboard": `{
    IsTrue: () => true,
    IsFalse: () => false
}`
    },



    "entry-exit-step-decorators": {
        "definition": `root entry(OnRootStart) exit(OnRootFinish) {
    sequence entry(OnSequenceStart) exit(OnSequenceFinish) {
        wait[3000] entry(OnWaitStart) exit(OnWaitFinish) step(OnWaiting)
    }
}`,
        "blackboard": `{
    OnWaitStart: () => console.log("starting to wait!"),
    OnWaiting: () => console.log("waiting!"),
    OnWaitFinish: () => console.log("finished waiting!"),

    OnRootStart: () => console.log("starting root!"),
    OnRootFinish: () => console.log("finished root!"),

    OnSequenceStart: () => console.log("starting sequence!"),
    OnSequenceFinish: () => console.log("finished sequence!")
}`
    },




    "parallel-node": {
        "definition": `root {
    parallel {
        sequence {
            wait[500, 2500]
            wait[500, 2500]
            wait[500, 2500]
            wait[500, 2500]
            wait[500, 2500]
            action [Succeed]
        }
        sequence {
            wait[500, 2500]
            wait[500, 2500]
            wait[500, 2500]
            wait[500, 2500]
            wait[500, 2500]
            action [Fail]
        }
    }
}`,
        "blackboard": `{
    // An action that will immediately succeed.
    Succeed: () => Mistreevous.State.SUCCEEDED,

    // An action that will immediately fail.
    Fail: () => Mistreevous.State.FAILED
}`
    },




    "basic-enemy": {
        "definition": `root {
    selector {
        selector while(CanSeePlayer) {
            sequence {
                condition [PlayerIsClose]
                wait [500]
                action [AttackPlayer]
            }
            action [MoveTowardsPlayer]
        }
        sequence {
            condition [IsHungry]
            condition [CanSeeFood]
            action [EatFood]
        }
        lotto {
            action [Complain]
            action [Wander]
            action [Sleep]
        }
    }
}`,
        "blackboard": `{
    CanSeePlayer: () => true,
    PlayerIsClose: () => false,
    IsHungry: () => false,
    CanSeeFood: () => false,  

    AttackPlayer: () => Mistreevous.State.SUCCEEDED,
    MoveTowardsPlayer: () => Mistreevous.State.SUCCEEDED,
    EatFood: () => Mistreevous.State.SUCCEEDED,
    Complain: () => Mistreevous.State.SUCCEEDED,
    Wander: () => Mistreevous.State.SUCCEEDED,
    Sleep: () => Mistreevous.State.SUCCEEDED
}`
    }
};