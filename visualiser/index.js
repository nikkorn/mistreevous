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

/**
 * Reload the visualiser.
 */
function reloadVisualiser() {
    // Stop any tree playback.
    if (playIntervalId) {
        clearInterval(playIntervalId);

        // Clear the play interval id.
        playIntervalId = null;
    }

    // There should be no running tree.
    setRunningState(false);

    try {
        // Create the blackboard.
        const blackboard = (new Function("IsKeyPressed", `return (${blackboardTextArea.value});`))((keyCode) => {
            return window.allPressedKeyCodes[keyCode];
        });

        // TODO Register some stuff :D
        mistreevous.BehaviourTree.register("wow", 'root { action[Bacon, "3"] }');
        mistreevous.BehaviourTree.register("yell", () => { console.log("YELLING!"); return mistreevous.State.SUCCEEDED; })

        // Try to create the behaviour tree.
        behaviourTree = new mistreevous.BehaviourTree(definitionTextArea.value, blackboard);

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
    let interval = prompt("Please enter a step interval in milliseconds", "100");

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
        if (!behaviourTree.isRunning()) {
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
    definitionTextArea.value = snippet.definition;

    // Update the blackboard textarea to match the snippet blackboard.
    blackboardTextArea.value = snippet.blackboard;

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

    // Get the behaviour tree details as an array of flattened nodes.
    const nodes = behaviourTree.getFlattenedNodeDetails();

    // A function to convert a node state to a string.
    const convertNodeStateToString = (state) => {
        switch (state) {
            case mistreevous.State.RUNNING:
                return "running";
            case mistreevous.State.SUCCEEDED:
                return "succeeded";
            case mistreevous.State.FAILED:
                return "failed";
            default:
                return "ready";
        }
    };

    // Build the tree view.
    var options = {
        data: nodes,
        nodeIdField: "id",
        nodeNameField: "caption",
        nodeTypeField: "type",
        nodeParentField: "parentId",
        definition: {
            default: {
                tooltip: function (node) { return node.item.caption },
                template: (node) => {
                    const getArgumentHTMl = (args) => args.length ? `[${args.map((arg) => `<i class='tree-view-arg ${arg.type}'>${arg}</i>`).join(",")}]` : "";

                    if (node.item.decorators) {
                        const getDecoratorHTMl = () => 
                            node.item.decorators.map((decorator) => {
                                return `<hr style="margin-top: 1px; margin-bottom: 1px;">
                                <i class='tree-view-caption'>${decorator.type.toUpperCase()} ${decorator.condition || decorator.functionName} ${getArgumentHTMl(decorator.arguments)}</i>`;
                            }).join("");

                        return `<div class='tree-view-node ${convertNodeStateToString(node.item.state)}'>
                            <div class='tree-view-icon tree-view-icon-${node.item.type}'>
                            <img src="icons/${node.item.type}.png">
                            </div>
                            <div>
                            <p class='tree-view-caption'>${node.item.caption + " " + getArgumentHTMl(node.item.arguments)}</p>
                            ${getDecoratorHTMl()}
                            </div>
                            </div>`;
                    } else {
                        return `<div class='tree-view-node ${convertNodeStateToString(node.item.state)}'>
                            <div class='tree-view-icon tree-view-icon-${node.item.type}'>
                            <img src="icons/${node.item.type}.png">
                            </div>
                            <div><p class='tree-view-caption'>${node.item.caption + " " + getArgumentHTMl(node.item.arguments)}</p></div>
                            </div>`;
                    }
                }
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

// Keep track of all key press states for use within the blackboard.
window.allPressedKeyCodes = {};
window.onkeyup = function (event) {
    this.allPressedKeyCodes[event.keyCode] = false;
}
window.onkeydown = function (event) {
    this.allPressedKeyCodes[event.keyCode] = true;
}

// Do the initial visualiser reload.
reloadVisualiser();

// Set the initial sidebar state so that it is not shown.
changeSidebarView(SidebarViewState.NONE);

// Simulate selection of the fist snippet list item.
onSnippetSelect();