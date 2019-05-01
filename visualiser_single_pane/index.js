/** The text areas. */
const definitionTextArea = document.getElementById("definition-text-area");
const resultTextArea     = document.getElementById("result-text-area");
const blackboardTextArea = document.getElementById("blackboard-text-area");

/** The tree view control buttons/panel. */
const runtimeButtonPanel  = document.getElementById("runtime-controls");
const playRuntimeButton   = document.getElementById("control-play-button");
const reloadRuntimeButton = document.getElementById("control-play-button");

/** The snippet selection input. */
const snippetSelectBox = document.getElementById("template-select-list");

/** The element wrapping the tree view. */
const treeViewWrapper = document.getElementById("tree-view-wrapper");

/** Enumeration of sidebar states. */
const SidebarViewState = { "NONE": 0, "DEFINITION": 1, "BOARD": 2 };

/**
 * The behaviour tree.
 */
let behaviourTree;

/**
 * The behaviour tree blackboard.
 */
let blackboard;

/**
 * The play interval id.
 * This will be set while playing a tree.
 */
let playIntervalId = null;

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
`{
    DoorIsOpen: () => false,
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
    }
}`;

/**
 * Reload the visualiser.
 */
function reloadVisualiser() {
    // Stop running the tree if we are running it.
    if (playIntervalId) {
        clearInterval(playIntervalId);

        // Clear the play interval id.
        playIntervalId = null;
    }

    // There should be no running tree.
    setRunningState(false);

    try {
        // Create the blackboard.
        const blackboard = eval('(' + blackboardTextArea.value + ')');

        // Try to create the behaviour tree.
        behaviourTree = new Mistreevous.BehaviourTree(definitionTextArea.value, blackboard);

        // We created the behaviour tree without an issue.
        resultTextArea.innerHTML             = "OK";
        resultTextArea.style.backgroundColor = "#d6f9d4";

        // Show the runtime controls.
        runtimeButtonPanel.style.display = "block";
    } catch (exception) {
        // There was an error creating the behaviour tree!
        behaviourTree = null;

        // Show the exception on the page.
        resultTextArea.innerHTML             = exception;
        resultTextArea.style.backgroundColor = "#fcc2c2";

        // Hide the runtime controls.
        runtimeButtonPanel.style.display = "none";

        // Clear any existing tree view as it is no longer valid.
        clearTreeView();

        // There is nothing left to do.
        return;
    }

    // Build the tree view.
    buildTreeView();
};

/**
 * Handles clicks on the 'play' button.
 */
function onPlayButtonPressed() {
    // If there is no behaviour tree then there is nothing to do here.
    if (!behaviourTree) {
        return;
    }

    // Reset the tree.
    behaviourTree.reset();

    // Get an interval duration with which to step the tree.
    let interval = prompt("Please enter a step interval in milliseconds", "1000");

    // Check to make sure that the user specified an integer value.
    if (isNaN(interval)) {
        alert("step interval must be an integer value");

        return;
    }

    // Set running state.
    setRunningState(true);

    // Create an interval to step the tree until it is finished.
    playIntervalId = setInterval(() => {
         // Step the behaviour tree, if anything goes wrong we will stop the tree playback.
        try {
            behaviourTree.step();
        } catch (exception) {
            // Notify the user of the exception.
            alert(exception);

            // Reload the visualiser.
            reloadVisualiser();
        }

        // Rebuild the tree view.
        buildTreeView();

        // If the tree root is in a finished state then stop the interval.
        if (behaviourTree.getRootNode().getState() !== Mistreevous.State.RUNNING) {
            clearInterval(playIntervalId);

            // Clear the play interval id.
            playIntervalId = null;
        }
    }, parseInt(interval, 10));
};

/**
 * Set the running state of the editor.
 */
function setRunningState(isRunning) {
    if (isRunning) {
        //  Make the definition/blackboard editors readonly based on 'isRunning'.
        definitionTextArea.setAttribute("readonly", "readonly");
        blackboardTextArea.setAttribute("readonly", "readonly");

        // Enable/disable runtime controls based on 'isRunning'.
        playRuntimeButton.style.display = "none";

        // Enable/disable the snipped drop-down based on 'isRunning'.
        snippetSelectBox.setAttribute("disabled", "disabled");
    } else {
        //  Make the definition/blackboard editors readonly based on 'isRunning'.
        definitionTextArea.removeAttribute("readonly");
        blackboardTextArea.removeAttribute("readonly");

        // Enable/disable runtime controls based on 'isRunning'.
        playRuntimeButton.style.display = "inline";

        // Enable/disable the snipped drop-down based on 'isRunning'.
        snippetSelectBox.removeAttribute("disabled");
    }
};

/**
 * Change the sidebar view.
 * @param view The view to show.
 */
function changeSidebarView(view) {
    // Get the sidebar view button elements.
    const definitionViewButton = document.getElementById("definition-view-button");
    const boardViewButton      = document.getElementById("board-view-button");
    const clearViewButton      = document.getElementById("clear-view-button");

    // Get the sidebar panel elements.
    const sidebarPanel    = document.getElementById("sidebar-panel");
    const definitionPanel = document.getElementById("definition-panel");
    const blackboardPanel = document.getElementById("blackboard-panel");

    switch (view) {
        case SidebarViewState.DEFINITION:
            // Show/hide the relevant sidebar buttons.
            definitionViewButton.style.display = "none";
            boardViewButton.style.display      = "inline";
            clearViewButton.style.display      = "inline";

            // Show/hide the relevant sidebar panels.
            sidebarPanel.style.display    = "flex";
            definitionPanel.style.display = "flex";
            blackboardPanel.style.display = "none";
            break;

        case SidebarViewState.BOARD:
            // Show/hide the relevant sidebar buttons.
            definitionViewButton.style.display = "inline";
            boardViewButton.style.display      = "none";
            clearViewButton.style.display      = "inline";

            // Show/hide the relevant sidebar panels.
            sidebarPanel.style.display    = "flex";
            definitionPanel.style.display = "none";
            blackboardPanel.style.display = "flex";
            break;

        case SidebarViewState.NONE:
            // Show/hide the relevant sidebar buttons.
            definitionViewButton.style.display = "inline";
            boardViewButton.style.display      = "inline";
            clearViewButton.style.display      = "none";

            // Show/hide the relevant sidebar panels.
            sidebarPanel.style.display    = "none";
            definitionPanel.style.display = "flex";
            blackboardPanel.style.display = "flex";
            break;

        default:
            // What the dickens!
    }
};

/**
 * Called in response to the snippet select input value changing.
 */
function onSnippetSelect() {
    // Clear away the existing tree view.
    clearTreeView();
    
    // Get the selected snippet.
    var snippet = example_snippets[document.getElementById("template-select-list").value];

    // Update the definition textarea to match the snippet definition.
    definitionTextArea.innerHTML = snippet.definition;

    // Update the blackboard textarea to match the snippet blackboard.
    blackboardTextArea.innerHTML = snippet.blackboard;

    // Now to reload the visualiser.
    reloadVisualiser();

    // Show the definition sidebar panel
    changeSidebarView(SidebarViewState.DEFINITION);
};

/**
 * Build the tree view.
 */
function buildTreeView() {
    // Clear away any existing tree view.
    clearTreeView();

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

/**
 * Clear the tree view.
 */
function clearTreeView() {
    treeViewWrapper.innerHTML = "";
    treeViewWrapper.className = "";
};

// Do the initial visualiser reload.
reloadVisualiser();

// Set the initial sidebar state so that it is not shown.
changeSidebarView(SidebarViewState.NONE);