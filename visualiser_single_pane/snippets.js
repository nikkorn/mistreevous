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
    }
};