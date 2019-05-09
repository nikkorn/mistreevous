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
    SomeAction: {
        onStart: () => {},
        onUpdate: () => Mistreevous.State.SUCCEEDED,
        onFinish: (succeeded) => {}
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
    }
};