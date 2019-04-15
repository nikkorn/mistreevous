import Action from './nodes/action'
import Condition from './nodes/condition'
import Flip from './nodes/flip'
import Lotto from './nodes/lotto'
import Repeat from './nodes/repeat'
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
            uid: getUid(),
            type: "root",
            children: [],
            validate: function () {
                // A root node must have a single node.
                if (this.children.length !== 1) {
                    throw "a root node must have a single child";
                }
            },
            createNodeInstance: function () { 
                return new Root(this.uid, this.children[0].createNodeInstance());
            }
        }),
        "SELECTOR": () => ({
            uid: getUid(),
            type: "selector",
            children: [],
            validate: function () {
                // A selector node must have at least a single node.
                if (this.children.length < 1) {
                    throw "a selector node must have at least a single child";
                }
            },
            createNodeInstance: function () { 
                return new Selector(this.uid, this.children.map((child) => child.createNodeInstance()));
            }
        }),
        "SEQUENCE": () => ({
            uid: getUid(),
            type: "sequence",
            children: [], 
            validate: function () {
                // A sequence node must have at least a single node.
                if (this.children.length < 1) {
                    throw "a sequence node must have at least a single child";
                }
            },
            createNodeInstance: function () { 
                return new Sequence(this.uid, this.children.map((child) => child.createNodeInstance()));
            }
        }),
        "LOTTO": () => ({
            uid: getUid(),
            type: "lotto",
            children: [],
            tickets: [], 
            validate: function () {
                // A lotto node must have at least a single node.
                if (this.children.length < 1) {
                    throw "a lotto node must have at least a single child";
                }
            },
            createNodeInstance: function () { 
                return new Lotto(this.uid, this.tickets, this.children.map((child) => child.createNodeInstance()));
            }
        }),
        "REPEAT": () => ({
            uid: getUid(),
            type: "repeat",
            iterations: null,
            maximumIterations: null,
            conditionFunction: null,
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
            createNodeInstance: function () { 
                return new Repeat(this.uid, this.iterations, this.maximumIterations, this.conditionFunction, this.children[0].createNodeInstance());
            }
        }),
        "CONDITION": () => ({
            uid: getUid(),
            type: "condition",
            conditionFunction: "",
            validate: function () {},
            createNodeInstance: function () { 
                return new Condition(this.uid, this.conditionFunction);
            }
        }),
        "FLIP": () => ({
            uid: getUid(),
            type: "flip",
            children: [],
            validate: function () {
                // A flip node must have a single node.
                if (this.children.length !== 1) {
                    throw "a flip node must have a single child";
                }
            },
            createNodeInstance: function () { 
                return new Flip(this.uid, this.children[0].createNodeInstance());
            }
        }),
        "WAIT": () => ({
            uid: getUid(),
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
            createNodeInstance: function () { 
                return new Wait(this.uid, this.duration, this.longestDuration);
            }
        }),
        "ACTION": () => ({
            uid: getUid(),
            type: "action",
            actionName: "",
            validate: function () {},
            createNodeInstance: function () {
                return new Action(this.uid, this.actionName);
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
     * The root tree node.
     */
    this._rootNode;

    /**
     * Mistreevous init logic.
     */
    this._init = function() {
        // Convert the definition into some tokens.
        const tokens = this._parseDefinition();

        // Try to create the behaviour tree AST from tokens, this could fail if the definition is invalid.
        let rootASTNode;
        try {
            rootASTNode = this._createRootASTNode(tokens);
        } catch (exception) {
            // There was an issue in trying to parse the tree definition.
            throw `TreeParseError: ${exception}`;
        }

        // Convert the AST to our actual tree.
        this._rootNode = rootASTNode.createNodeInstance();
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
        cleansedDefinition = cleansedDefinition.replace(/\:/g, " : ");

        // Split the definition into raw token form and return it.
        return cleansedDefinition.replace(/\s+/g, " ").trim().split(" ");
    };

    /**
     * Create a BT AST node based on the remaining tokens.
     * @param tokens The remaining tokens.
     */
    this._createRootASTNode = function(tokens) {
        // There must be at least 3 tokens for the tree definition to be valid. 'ROOT', '{' and '}'.
        if (tokens.length < 3) {
            throw "invalid token count";
        }

        // The first token MUST be our 'ROOT' token.
        if (tokens[0].toUpperCase() !== "ROOT") {
            throw "initial node must be the 'ROOT' node";
        }

        // We should have a matching number of '{' and '}' tokens. If not, then there are scopes that have not been properly closed.
        if (tokens.filter((token) => token === "{").length !== tokens.filter((token) => token === "}").length) {
            throw "scope character mismatch";
        }

        // Helper function to pop the next raw token off of the stack and throw an error if it wasn't the expected one.
        const popAndCheck = (expected) => {
            // Get and remove the next token.
            const popped = tokens.shift();

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
            const argumentList = [];

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
                    if (!argumentValidator(token)) {
                        throw validationFailedMessage;
                    }

                    // This is a valid argument!
                    argumentList.push(token);
                } else {
                    // The current token should be a ',' token.
                    if (token !== ",") {
                        throw `invalid argument list, expected ',' but got '${token}'`;
                    }
                }

            });

            // The arguments list should terminate with a ']' token.
            popAndCheck("]");

            // Return the argument list.
            return argumentList;
        }

        // Throw the 'ROOT' and opening '{' token away.
        popAndCheck("root");
        popAndCheck("{");

        // Create the root node.
        const rootASTNode = ASTNodeFactories.ROOT();

        // Create a stack of node children arrays, with the root child array as the initial one.
        const stack = [rootASTNode.children];

        // We should keep processing the raw tokens until we run out of them.
        while (tokens.length) {
            // Grab the next token.
            const token = tokens.shift();

            let node;

            // How we create the next AST token depends on the current raw token value.
            switch (token.toUpperCase()) {
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
                    stack[stack.length-1].push(node);

                    // A ':' character splits the 'CONDITION' token and the target function name token.
                    popAndCheck(":");

                    // If the next token is a '}' then there is a missing condition name token.
                    if (tokens[0] === "}") {
                        throw "missing condition name";
                    }

                    // The next token should be the name of the condition function. 
                    node.conditionFunction = tokens.shift();
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

                    // Check for iteration counts ([]) or condition function (:SomeCondition) 
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
                    } else if (tokens[0] === ":") {
                        // A condition function name has been defined. If the next token is a '}' then there is a missing condition name token.
                        if (tokens[0] === "}") {
                            throw "missing repeat condition name";
                        }

                        // A ':' character splits the 'CONDITION' token and the target function name token.
                        popAndCheck(":");

                        // Check whether we are missing a condition name.
                        if (tokens[0] === "{") {
                            throw "missing repeat condition name";
                        }

                        // The next token should be the name of the condition function. 
                        node.conditionFunction = tokens.shift();
                    }

                    popAndCheck("{");

                    // The new scope is that of the new REPEAT nodes children.
                    stack.push(node.children);
                    break;

                case "ACTION":
                    // Create a ACTION AST node.
                    node = ASTNodeFactories.ACTION();

                    // Push the ACTION node into the current scope.
                    stack[stack.length-1].push(node);

                    // A ':' character splits the 'ACTION' token and the target action name token.
                    popAndCheck(":");

                    // If the next token is a '}' then there is a missing action name token.
                    if (tokens[0] === "}") {
                        throw "missing action name";
                    }

                    // The next token should be the name of the action. 
                    node.actionName = tokens.shift();
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
        validateASTNode(rootASTNode);

        // Return the root BT AST node.
        return rootASTNode;
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