import Action from './nodes/action'
import Condition from './nodes/condition'
import Flip from './nodes/flip'
import Lotto from './nodes/lotto'
import Repeat from './nodes/repeat'
import While from './nodes/while'
import Root from './nodes/root'
import Selector from './nodes/selector'
import Sequence from './nodes/sequence'
import Wait from './nodes/wait'

/**
 * The behaviour tree.
 * @param definition The tree definition.
 * @param board The board.
 */
export default function BehaviourTree(definition, board) {
    
    /**
     * Get a randomly generated uid.
     * @returns A randomly generated uid.
     */
    const getUid = () => {
        var S4 = function() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }

    /**
     * Node factories.
     */
    const ASTNodeFactories = {
        "ROOT": () => ({ 
            type: "root",
            name: null,
            children: [],
            validate: function () {
                // A root node must have a single node.
                if (this.children.length !== 1) {
                    throw "a root node must have a single child";
                }
            },
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) { 
                return new Root(getUid(), this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice()));
            }
        }),
        "BRANCH": () => ({ 
            type: "branch",
            branchName: "",
            validate: function () {},
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
                // Try to find the root node with a matching branch name.
                const targetRootNode = namedRootNodeProvider(this.branchName);

                // If we have already visited this branch then we have a circular dependency.
                if (visitedBranches.indexOf(this.branchName) !== -1) {
                    throw `circular dependency found in branch node references for branch '${this.branchName}'`;
                }

                // If we have a target root node, then the node instance we want will be the first and only child of the referenced root node.
                if (targetRootNode) {
                    return targetRootNode.createNodeInstance(namedRootNodeProvider, visitedBranches.concat(this.branchName)).getChildren()[0];
                } else {
                    throw `branch references root node '${this.branchName}' which has not been defined`;
                }
            }
        }),
        "SELECTOR": () => ({
            type: "selector",
            children: [],
            validate: function () {
                // A selector node must have at least a single node.
                if (this.children.length < 1) {
                    throw "a selector node must have at least a single child";
                }
            },
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) { 
                return new Selector(getUid(), this.children.map((child) => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice())));
            }
        }),
        "SEQUENCE": () => ({
            type: "sequence",
            children: [], 
            validate: function () {
                // A sequence node must have at least a single node.
                if (this.children.length < 1) {
                    throw "a sequence node must have at least a single child";
                }
            },
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) { 
                return new Sequence(getUid(), this.children.map((child) => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice())));
            }
        }),
        "LOTTO": () => ({
            type: "lotto",
            children: [],
            tickets: [], 
            validate: function () {
                // A lotto node must have at least a single node.
                if (this.children.length < 1) {
                    throw "a lotto node must have at least a single child";
                }
            },
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) { 
                return new Lotto(getUid(), this.tickets, this.children.map((child) => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice())));
            }
        }),
        "REPEAT": () => ({
            type: "repeat",
            iterations: null,
            maximumIterations: null,
            children: [],
            validate: function () {
                // A repeat node must have a single node.
                if (this.children.length !== 1) {
                    throw "a repeat node must have a single child";
                }

                // A repeat node must have a positive number of iterations if defined. 
                if (this.iterations !== null && this.iterations < 0) {
                    throw "a repeat node must have a positive number of iterations if defined";
                }

                // There is validation to carry out if a longest duration was defined.
                if (this.maximumIterations !== null) {
                    // A repeat node must have a positive maximum iterations count if defined. 
                    if (this.maximumIterations < 0) {
                        throw "a repeat node must have a positive maximum iterations count if defined";
                    }

                    // A repeat node must not have an iteration count that exceeds the maximum iteration count.
                    if (this.iterations > this.maximumIterations) {
                        throw "a repeat node must not have an iteration count that exceeds the maximum iteration count";
                    }
                }
            },
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) { 
                return new Repeat(getUid(), this.iterations, this.maximumIterations, this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice()));
            }
        }),
        "WHILE": () => ({
            type: "while",
            conditionFunction: null,
            children: [],
            validate: function () {
                // A while node must have a single node.
                if (this.children.length !== 1) {
                    throw "a while node must have a single child";
                }
            },
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) { 
                return new While(getUid(), this.conditionFunction, this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice()));
            }
        }),
        "CONDITION": () => ({
            type: "condition",
            conditionFunction: "",
            validate: function () {},
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) { 
                return new Condition(getUid(), this.conditionFunction);
            }
        }),
        "FLIP": () => ({
            type: "flip",
            children: [],
            validate: function () {
                // A flip node must have a single node.
                if (this.children.length !== 1) {
                    throw "a flip node must have a single child";
                }
            },
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) { 
                return new Flip(getUid(), this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice()));
            }
        }),
        "WAIT": () => ({
            type: "wait",
            duration: null,
            longestDuration: null,
            validate: function () {
                // A wait node must have a positive duration. 
                if (this.duration < 0) {
                    throw "a wait node must have a positive duration";
                }

                // There is validation to carry out if a longest duration was defined.
                if (this.longestDuration) {
                    // A wait node must have a positive longest duration. 
                    if (this.longestDuration < 0) {
                        throw "a wait node must have a positive longest duration if one is defined";
                    }

                    // A wait node must not have a duration that exceeds the longest duration.
                    if (this.duration > this.longestDuration) {
                        throw "a wait node must not have a shortest duration that exceeds the longest duration";
                    }
                }
            },
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) { 
                return new Wait(getUid(), this.duration, this.longestDuration);
            }
        }),
        "ACTION": () => ({
            type: "action",
            actionName: "",
            validate: function () {},
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
                return new Action(getUid(), this.actionName);
            }
        })
    };

    /**
     * The tree definition.
     */
    this._definition = definition;

    /**
     * The blackboard.
     */
    this._blackboard = board;

    /**
     * The main root tree node.
     */
    this._rootNode;

    /**
     * The flattened array of tree nodes.
     */
    this._flattenedTreeNodes;

    /**
     * Mistreevous init logic.
     */
    this._init = function() {
        // The tree definition must be defined.
        if (typeof definition !== "string") {
            throw "TypeError: the tree definition must be defined";
        }

        // The blackboard must be defined.
        if (typeof board !== 'object' || board === null) {
            throw "TypeError: the blackboard must be defined";
        }

        // Convert the definition into some tokens.
        const tokens = this._parseDefinition();

        try {
            // Try to create the behaviour tree AST from tokens, this could fail if the definition is invalid.
            const rootASTNodes = this._createRootASTNodes(tokens);

            // Create a symbol to use as the main root key in our root node mapping.
            const mainRootNodeKey = Symbol("__root__");

            // Create a mapping of root node names to root AST tokens. The main root node will have a key of Symbol("__root__").
            const rootNodeMap = {};
            for (const rootASTNode of rootASTNodes) {
                rootNodeMap[rootASTNode.name === null ? mainRootNodeKey : rootASTNode.name] = rootASTNode;
            }

            // Create a provider for named root nodes.
            const namedRootNodeProvider = function (name) { return rootNodeMap[name]; };

            // Convert the AST to our actual tree.
            this._rootNode = rootNodeMap[mainRootNodeKey].createNodeInstance(namedRootNodeProvider, []);
        } catch (exception) {
            // There was an issue in trying to parse and build the tree definition.
            throw `TreeParseError: ${exception}`;
        }

        // Get a flattened array of tree nodes.
        this._flattenedTreeNodes = [];
        let currentNodeScopeId   = 0;
        const findNestedNodes = (node, depth, nodeScopeId) => {
            this._flattenedTreeNodes.push({ node, depth, nodeScopeId });

            nodeScopeId = ++currentNodeScopeId;

            // Find each child of the node.
            (node.getChildren() || []).forEach((child) => findNestedNodes(child, depth + 1, nodeScopeId));
        };
        findNestedNodes(this._rootNode, 0, currentNodeScopeId);
    };

    /**
     * Parse the BT tree definition into an array of raw tokens.
     */
    this._parseDefinition = function() {
        // Firstly, create a copy of the raw definition.
        let cleansedDefinition = definition;

        // Add some space around various important characters so that they can be plucked out easier as individual tokens.
        cleansedDefinition = cleansedDefinition.replace(/\{/g, " { ");
        cleansedDefinition = cleansedDefinition.replace(/\}/g, " } ");
        cleansedDefinition = cleansedDefinition.replace(/\]/g, " ] ");
        cleansedDefinition = cleansedDefinition.replace(/\[/g, " [ ");
        cleansedDefinition = cleansedDefinition.replace(/\,/g, " , ");

        // Split the definition into raw token form and return it.
        return cleansedDefinition.replace(/\s+/g, " ").trim().split(" ");
    };

    /**
     * Create an array of root AST nodes based on the remaining tokens.
     * @param tokens The remaining tokens.
     */
    this._createRootASTNodes = function(tokens) {
        // There must be at least 3 tokens for the tree definition to be valid. 'ROOT', '{' and '}'.
        if (tokens.length < 3) {
            throw "invalid token count";
        }

        // We should have a matching number of '{' and '}' tokens. If not, then there are scopes that have not been properly closed.
        if (tokens.filter((token) => token === "{").length !== tokens.filter((token) => token === "}").length) {
            throw "scope character mismatch";
        }

        // Helper function to pop the next raw token off of the stack and throw an error if it wasn't the expected one.
        const popAndCheck = (expected) => {
            // Get and remove the next token.
            const popped = tokens.shift();

            // We were expecting another token.
            if (popped === undefined) {
                throw "unexpected end of definition"; 
            }

            // Was it the expected token?
            if (popped.toUpperCase() !== expected.toUpperCase()) {
                throw "unexpected token found on the stack. Expected '" + expected + "' but got '" + popped + "'"; 
            }
        };

        // Helper function to pull an argument list off of the stack.
        const getArguments = (argumentValidator, validationFailedMessage) => {
            // Any lists of arguments will always be wrapped in '[]'. so we are looking for an opening
            popAndCheck("[");

            const argumentListTokens = [];
            const argumentList       = [];

            // Grab all tokens between the '[' and ']'.
            while (tokens.length && tokens[0] !== "]") {
                // The next token is part of our arguments list.
                argumentListTokens.push(tokens.shift());
            }

            // Validate the order of the argument tokens. Each token must either be a ',' or a single argument that satisfies the validator.
            argumentListTokens.forEach((token, index) => {
                // Get whether this token should be an actual argument.
                const shouldBeArgumentToken = !(index & 1);

                // If the current token should be an actual argument then validate it,otherwise it should be a ',' token.
                if (shouldBeArgumentToken) {
                    // Try to validate the argument.
                    if (argumentValidator && !argumentValidator(token)) {
                        throw validationFailedMessage;
                    }

                    // This is a valid argument!
                    argumentList.push(token);
                } else {
                    // The current token should be a ',' token.
                    if (token !== ",") {
                        throw `invalid argument list, expected ',' or ']' but got '${token}'`;
                    }
                }
            });

            // The arguments list should terminate with a ']' token.
            popAndCheck("]");

            // Return the argument list.
            return argumentList;
        }

        // Create a stack of node children arrays, starting with a definition scope.
        const stack = [[]];

        // We should keep processing the raw tokens until we run out of them.
        while (tokens.length) {
            // Grab the next token.
            const token = tokens.shift();

            let node;

            // How we create the next AST token depends on the current raw token value.
            switch (token.toUpperCase()) {
                case "ROOT": 
                    // Create a ROOT AST node.
                    node = ASTNodeFactories.ROOT();

                    // Push the ROOT node into the current scope.
                    stack[stack.length - 1].push(node);

                    // We may have a root node name defined as an argument.
                    if (tokens[0] === "[") {
                        const rootArguments = getArguments();

                        // We should have only a single argument that is not an empty string for a root node, which is the root name.
                        if (rootArguments.length === 1 && rootArguments[0] !== "") {
                            // The root  name will be the first and only node argument.
                            node.name = rootArguments[0];
                        } else {
                            throw "expected single root name argument";
                        }
                    }

                    popAndCheck("{");

                    // The new scope is that of the new ROOT nodes children.
                    stack.push(node.children);
                    break;

                case "BRANCH": 
                    // Create a BRANCH AST node.
                    node = ASTNodeFactories.BRANCH();

                    // Push the BRANCH node into the current scope.
                    stack[stack.length - 1].push(node);

                    // We must have arguments defined, as we require a branch name argument.
                    if (tokens[0] !== "[") {
                        throw "expected single branch name argument";
                    } 

                    // The branch name will be defined as a node argument.
                    const branchArguments = getArguments();

                    // We should have only a single argument that is not an empty string for a branch node, which is the branch name.
                    if (branchArguments.length === 1 && branchArguments[0] !== "") {
                        // The branch name will be the first and only node argument.
                        node.branchName = branchArguments[0];
                    } else {
                        throw "expected single branch name argument";
                    } 
                    break;

                case "SELECTOR": 
                    // Create a SELECTOR AST node.
                    node = ASTNodeFactories.SELECTOR();

                    // Push the SELECTOR node into the current scope.
                    stack[stack.length-1].push(node);

                    popAndCheck("{");

                    // The new scope is that of the new SELECTOR nodes children.
                    stack.push(node.children);
                    break;

                case "SEQUENCE":
                    // Create a SEQUENCE AST node.
                    node = ASTNodeFactories.SEQUENCE();

                    // Push the SEQUENCE node into the current scope.
                    stack[stack.length-1].push(node);

                    popAndCheck("{");

                    // The new scope is that of the new SEQUENCE nodes children.
                    stack.push(node.children);
                    break;

                case "LOTTO":
                    // Create a LOTTO AST node.
                    node = ASTNodeFactories.LOTTO();

                    // Push the LOTTO node into the current scope.
                    stack[stack.length-1].push(node);

                    // If the next token is a '[' character then some ticket counts have been defined as arguments.
                    if (tokens[0] === "[") {
                        // Get the ticket count arguments, each argument must be a number.
                        node.tickets = getArguments((arg) => (!isNaN(arg)) && parseFloat(arg, 10) === parseInt(arg, 10), "lotto node ticket counts must be integer values");
                    }

                    popAndCheck("{");

                    // The new scope is that of the new LOTTO nodes children.
                    stack.push(node.children);
                    break;

                case "CONDITION": 
                    // Create a CONDITION AST node.
                    node = ASTNodeFactories.CONDITION();

                    // Push the CONDITION node into the current scope.
                    stack[stack.length - 1].push(node);

                    // We must have arguments defined, as we require a condition function name argument.
                    if (tokens[0] !== "[") {
                        throw "expected single condition name argument";
                    } 

                    // The condition name will be defined as a node argument.
                    const conditionArguments = getArguments();

                    // We should have only a single argument that is not an empty string for a condition node, which is the condition function name.
                    if (conditionArguments.length === 1 && conditionArguments[0] !== "") {
                        // The condition function name will be the first and only node argument.
                        node.conditionFunction = conditionArguments[0];
                    } else {
                        throw "expected single condition name argument";
                    } 
                    break;

                case "FLIP":
                    // Create a FLIP AST node.
                    node = ASTNodeFactories.FLIP();

                    // Push the Flip node into the current scope.
                    stack[stack.length-1].push(node);

                    popAndCheck("{");

                    // The new scope is that of the new FLIP nodes children.
                    stack.push(node.children);
                    break;

                case "WAIT":
                    // Create a WAIT AST node.
                    node = ASTNodeFactories.WAIT();

                    // Push the WAIT node into the current scope.
                    stack[stack.length-1].push(node);

                    // Get the duration and potential longest duration of the wait.
                    const durations = getArguments((arg) => (!isNaN(arg)) && parseFloat(arg, 10) === parseInt(arg, 10), "wait node durations must be integer values");

                    // We should have got one or two durations.
                    if (durations.length === 1) {
                        // A static duration was defined.
                        node.duration = parseInt(durations[0], 10);
                    } else if (durations.length === 2) {
                        // A shortest and longest duration was defined.
                        node.duration        = parseInt(durations[0], 10);
                        node.longestDuration = parseInt(durations[1], 10);
                    } else {
                        // An incorrect number of durations was defined.
                        throw "invalid number of wait node duration arguments defined";
                    }
                    break;

                case "REPEAT":
                    // Create a REPEAT AST node.
                    node = ASTNodeFactories.REPEAT();

                    // Push the REPEAT node into the current scope.
                    stack[stack.length-1].push(node);

                    // Check for iteration counts ([])
                    if (tokens[0] === "[") {
                        // An iteration count has been defined. Get the iteration and potential maximum iteration of the wait.
                        const iterationArguments = getArguments((arg) => (!isNaN(arg)) && parseFloat(arg, 10) === parseInt(arg, 10), "repeat node iteration counts must be integer values");

                        // We should have got one or two iteration counts.
                        if (iterationArguments.length === 1) {
                            // A static iteration count was defined.
                            node.iterations = parseInt(iterationArguments[0], 10);
                        } else if (iterationArguments.length === 2) {
                            // A minimum and maximum iteration count was defined.
                            node.iterations        = parseInt(iterationArguments[0], 10);
                            node.maximumIterations = parseInt(iterationArguments[1], 10);
                        } else {
                            // An incorrect number of iteration counts was defined.
                            throw "invalid number of repeat node iteration count arguments defined";
                        }
                    }

                    popAndCheck("{");

                    // The new scope is that of the new REPEAT nodes children.
                    stack.push(node.children);
                    break;

                case "WHILE":
                    // Create a WHILE AST node.
                    node = ASTNodeFactories.WHILE();

                    // Push the WHILE node into the current scope.
                    stack[stack.length-1].push(node);

                    // We must have arguments defined, as we require a condition function name argument.
                    if (tokens[0] !== "[") {
                        throw "expected single while condition name argument";
                    } 

                    // The condition name will be defined as a node argument.
                    const whileArguments = getArguments();

                    // We should have only a single argument that is not an empty string for a while node, which is the while condition function name.
                    if (whileArguments.length === 1 && whileArguments[0] !== "") {
                        // The condition function name will be the first and only node argument.
                        node.conditionFunction = whileArguments[0];
                    } else {
                        throw "expected single while condition name argument";
                    }

                    // A while node must wrap other nodes.
                    popAndCheck("{");

                    // The new scope is that of the new WHILE nodes children.
                    stack.push(node.children);
                    break;

                case "ACTION":
                    // Create a ACTION AST node.
                    node = ASTNodeFactories.ACTION();

                    // Push the ACTION node into the current scope.
                    stack[stack.length-1].push(node);

                    // We must have arguments defined, as we require an action name argument.
                    if (tokens[0] !== "[") {
                        throw "expected single action name argument";
                    } 

                    // The action name will be defined as a node argument.
                    const actionArguments = getArguments();

                    // We should have only a single argument that is not an empty string for an action node, which is the action name.
                    if (actionArguments.length === 1 && actionArguments[0] !== "") {
                        // The action name will be the first and only node argument.
                        node.actionName = actionArguments[0];
                    } else {
                        throw "expected single action name argument";
                    } 
                    break;

                case "}": 
                    // The '}' character closes the current scope.
                    stack.pop();
                    break;

                default:
                    throw "unexpected token: " + token
            }
        }

        // Validate each of the nodes.
        const validateASTNode = (node) => {
            // Validate the node.
            node.validate();

            // Validate each child of the node.
            (node.children ||[]).forEach((child) => validateASTNode(child));
        };
        // Start node validation from the definition root.
        validateASTNode({ 
            children: stack[0],
            validate: function () {
                // We must have at least one node defined as the definition scope, which should be a root node.
                if (this.children.length === 0) {
                    throw "expected root node to have been defined";
                }

                // Each node at the base of the definition scope MUST be a root node.
                for (const definitionLevelNode of this.children) {
                    if (definitionLevelNode.type !== "root") {
                        throw "expected root node at base of definition";
                    }
                }

                // Exactly one root node must not have a name defined. This will be the main root, others will have to be referenced via branch nodes.
                if (this.children.filter(function (definitionLevelNode) { return definitionLevelNode.name === null; }).length !== 1) {
                    throw "expected single unnamed root node at base of definition to act as main root";
                }

                // No two named root nodes can have matching names.
                const rootNodeNames = [];
                for (const definitionLevelNode of this.children) {
                    if (rootNodeNames.indexOf(definitionLevelNode.name) !== -1) {
                        throw `multiple root nodes found with duplicate name '${definitionLevelNode.name}'`;
                    } else {
                        rootNodeNames.push(definitionLevelNode.name);
                    }
                }
            }
        });

        // Return the root AST nodes.
        return stack[0];
    };

    // Call Mistreevous init logic.
    this._init();
}

/**
 *  Get the root node.
 */
BehaviourTree.prototype.getRootNode = function () {
    return this._rootNode;
};

/**
 * Step the tree.
 */
BehaviourTree.prototype.step = function () {
    try {
        this._rootNode.update(this._blackboard);
    } catch (exception) {
        throw `TreeStepError: ${exception}`;
    }
};

/**
 * Reset the tree from the root.
 */
BehaviourTree.prototype.reset = function () {
    this._rootNode.reset();
};