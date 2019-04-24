const definitionTextArea = document.getElementById("definition-text-area");
const resultTextArea     = document.getElementById("result-text-area");
const blackboardTextArea = document.getElementById("blackboard-text-area");
const treeViewWrapper    = document.getElementById("tree-view-wrapper");

/**
 * The behaviour tree.
 */
let behaviourTree;

/**
 * The behaviour tree blackboard.
 */
let blackboard;

// Set a test definition.
definitionTextArea.innerHTML =
`root {
    sequence {
        action [WalkToDoor]
        repeat [1,3] {
            sequence {
                wait [1000]
                wait [1000]
            }
        }
        wait [1000,2500]
        selector {
            condition [DoorIsOpen]
            action [OpenDoor]
            branch [AttemptDoorOpen]
            branch [AttemptDoorOpen]
            sequence {
                lotto [1,2] {
                    action [ScreamLoudly]
                    action [MutterAngrily]
                }
                action [SmashDoor]
            }
        }
        action [WalkThroughDoor]
        selector {
            condition [DoorIsSmashed]
            action [CloseDoor]
        }
    }
}

root [AttemptDoorOpen] {
    sequence {
        action [UnlockDoor]
        action [OpenDoor]
    }
}`;

// Set a test blackboard in the blackboard text area.
blackboardTextArea.innerHTML = 
`DoorIsOpen: () => false,
DoorIsSmashed: () => true,  

WalkToDoor: {
    onStart: () => {},
    onUpdate: () => Mistreevous.State.SUCCEEDED,
    onFinish: (succeeded) => {}
},

OpenDoor: {
    onStart: () => {},
    onUpdate: () => Mistreevous.State.FAILED,
    onFinish: (succeeded) => {}
},

UnlockDoor: {
    onStart: () => {},
    onUpdate: () => Mistreevous.State.FAILED,
    onFinish: (succeeded) => {}
},

SmashDoor: {
    onStart: () => {},
    onUpdate: () => {},
    onFinish: (succeeded) => {}
},

WalkThroughDoor: {
    onStart: () => {},
    onUpdate: () => Mistreevous.State.SUCCEEDED,
    onFinish: (succeeded) => {}
},

CloseDoor: {
    onStart: () => {},
    onUpdate: () => Mistreevous.State.SUCCEEDED,
    onFinish: (succeeded) => {}
},

ScreamLoudly: {
    onStart: () => {},
    onUpdate: () => Mistreevous.State.SUCCEEDED,
    onFinish: (succeeded) => {}
},

MutterAngrily: {
    onStart: () => {},
    onUpdate: () => Mistreevous.State.SUCCEEDED,
    onFinish: (succeeded) => {}
}`;

/**
 * Handles definition updates.
 */
function onDefinitionUpdate() {
    // Create the blackboard.
    // In this page the blackboard will be kept up-to-date with changes made to the blackboard text area. 
    blackboard = {};

    // Do the initial blackboard update.
    onBlackboardUpdate();

    behaviourTree = new Mistreevous.BehaviourTree(definitionTextArea.value, blackboard);
    try {
        // Try to create the behaviour tree.
        //behaviourTree = new Mistreevous.BehaviourTree(definitionTextArea.value, blackboard);

        // We created the behaviour tree without an issue.
        resultTextArea.innerHTML             = "OK";
        resultTextArea.style.backgroundColor = "#d6f9d4";
    } catch (exception) {
        // There was an error creating the behaviour tree!
        behaviourTree = null;

        // Show the exception on the page.
        resultTextArea.innerHTML             = exception;
        resultTextArea.style.backgroundColor = "#fcc2c2";

        // There is nothing left to do.
        return;
    }

    // Build the tree view.
    buildTreeView();
};

/**
 * Update the behaviour tree blackboard to match the blackboard defined in the editor.
 */
function onBlackboardUpdate() {
    // Create the blackboard proxy.
    const blackboardProxy = eval('({' + blackboardTextArea.value + '})');

    // Update the blackboard.
    for (var key in blackboardProxy) {
        if (blackboardProxy.hasOwnProperty(key)) {
            blackboard[key] = blackboardProxy[key];
        }
    }
};

/**
 * Handles clicks on the 'tick' button.
 */
function onTickButtonPressed() {
    // If there is no behaviour tree then there is nothing to do here.
    if (!behaviourTree) {
        return;
    }

    // Update the BT blackboard.
    onBlackboardUpdate();

    // Step the behaviour tree.
    behaviourTree.step();

    // Rebuild the tree view.
    buildTreeView();
};

/**
 * Handles clicks on the 'reset' button.
 */
function onResetButtonPressed() {
    // Do the definition update.
    onDefinitionUpdate();
};

/**
 * Build the tree view.
 */
function buildTreeView() {
    // Clear away the existing tree view.
    treeViewWrapper.innerHTML = "";

    const nodes = [];

    const processNode = (node, parentUid) => {
        // A function to convert a node state to a string.
        const convertNodeStateToString = (state) => {
            switch (state) {
                case Mistreevous.State.RUNNING:
                    return "running";
                case Mistreevous.State.SUCCEEDED:
                    return "succeeded";
                case Mistreevous.State.FAILED:
                    return "failed";
                default:
                    return "ready";
            }
        };

        // Push the current node into the nodes array.
        nodes.push({ 
            id: node.getUid(),
            type: node.getType(), 
            caption: node.getName(),
            state: convertNodeStateToString(node.getState()),
            parent: parentUid 
        });

        // Process each of the nodes children.
        (node.getChildren() || []).forEach((child) => processNode(child, node.getUid()));
    };

    // Convert the nested AST node structure into an array of nodes with which to build the tree view.
    processNode(behaviourTree.getRootNode(), null);

    // Build the tree view.
    var options = {
        data: nodes,
        nodeIdField: "id",
        nodeNameField: "caption",
        nodeTypeField: "type",
        nodeParentField: "parent",
        definition: {
            default: {
                tooltip: function (node) { return node.item.caption },
                template: (node) => `<div class='tree-view-node ${node.item.state}'>
                <div class='tree-view-icon tree-view-icon-${node.item.type}'>
                <img src="icons/${node.item.type}.png">
                </div>
                <div><p class='tree-view-caption' style="margin:0px;">${node.item.caption}</p></div>
                </div>`
            }
        },
        line: {
            type: "angled",
            thickness: 2,
            colour: "#a3a1a1",
            cap: "round"
        },
        layout: {
            rootNodeOrientation: "vertical",
            direction: "horizontal"
        }
    };

    // Create the behaviour tree view.
    new Workflo(treeViewWrapper, options);
};

// Do the initial definition update.
onDefinitionUpdate();