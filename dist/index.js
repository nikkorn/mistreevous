/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* WEBPACK VAR INJECTION */(function(module) {/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__behaviourtree__ = __webpack_require__(2);


const Mistreevous = {
    BehaviourTree: __WEBPACK_IMPORTED_MODULE_0__behaviourtree__["a" /* default */],
    State: {
        READY: Symbol("mistreevous.ready"),
        RUNNING: Symbol("mistreevous.running"),
        SUCCEEDED: Symbol("mistreevous.succeeded"),
        FAILED: Symbol("mistreevous.failed")
    }
};

// Export Mistreevous.
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Mistreevous;
} else {
    if (typeof define === 'function' && __webpack_require__(12)) {
        define([], function () {
            return Mistreevous;
        });
    } else {
        window.Mistreevous = Mistreevous;
    }
}
/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(1)(module)))

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = function(originalModule) {
	if(!originalModule.webpackPolyfill) {
		var module = Object.create(originalModule);
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		Object.defineProperty(module, "exports", {
			enumerable: true,
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = BehaviourTree;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__nodes_action__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__nodes_condition__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__nodes_flip__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__nodes_lotto__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__nodes_repeat__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__nodes_root__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__nodes_selector__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__nodes_sequence__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__nodes_wait__ = __webpack_require__(11);










/**
 * The behaviour tree.
 * @param definition The tree definition.
 * @param board The board.
 */
function BehaviourTree(definition, board) {

    /**
     * Get a randomly generated uid.
     */
    const getUid = () => {
        var S4 = function () {
            return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
        };
        return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
    };

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
                return new __WEBPACK_IMPORTED_MODULE_5__nodes_root__["a" /* default */](this.uid, this.children[0].createNodeInstance());
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
                return new __WEBPACK_IMPORTED_MODULE_6__nodes_selector__["a" /* default */](this.uid, this.children.map(child => child.createNodeInstance()));
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
                return new __WEBPACK_IMPORTED_MODULE_7__nodes_sequence__["a" /* default */](this.uid, this.children.map(child => child.createNodeInstance()));
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
                return new __WEBPACK_IMPORTED_MODULE_3__nodes_lotto__["a" /* default */](this.uid, this.tickets, this.children.map(child => child.createNodeInstance()));
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
                return new __WEBPACK_IMPORTED_MODULE_4__nodes_repeat__["a" /* default */](this.uid, this.iterations, this.maximumIterations, this.conditionFunction, this.children[0].createNodeInstance());
            }
        }),
        "CONDITION": () => ({
            uid: getUid(),
            type: "condition",
            conditionFunction: "",
            validate: function () {},
            createNodeInstance: function () {
                return new __WEBPACK_IMPORTED_MODULE_1__nodes_condition__["a" /* default */](this.uid, this.conditionFunction);
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
                return new __WEBPACK_IMPORTED_MODULE_2__nodes_flip__["a" /* default */](this.uid, this.children[0].createNodeInstance());
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
                return new __WEBPACK_IMPORTED_MODULE_8__nodes_wait__["a" /* default */](this.uid, this.duration, this.longestDuration);
            }
        }),
        "ACTION": () => ({
            uid: getUid(),
            type: "action",
            actionName: "",
            validate: function () {},
            createNodeInstance: function () {
                return new __WEBPACK_IMPORTED_MODULE_0__nodes_action__["a" /* default */](this.uid, this.actionName);
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
    this._init = function () {
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
    this._parseDefinition = function () {
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
    this._createRootASTNode = function (tokens) {
        // There must be at least 3 tokens for the tree definition to be valid. 'ROOT', '{' and '}'.
        if (tokens.length < 3) {
            throw "invalid token count";
        }

        // The first token MUST be our 'ROOT' token.
        if (tokens[0].toUpperCase() !== "ROOT") {
            throw "initial node must be the 'ROOT' node";
        }

        // We should have a matching number of '{' and '}' tokens. If not, then there are scopes that have not been properly closed.
        if (tokens.filter(token => token === "{").length !== tokens.filter(token => token === "}").length) {
            throw "scope character mismatch";
        }

        // Helper function to pop the next raw token off of the stack and throw an error if it wasn't the expected one.
        const popAndCheck = expected => {
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
        };

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
                    stack[stack.length - 1].push(node);

                    popAndCheck("{");

                    // The new scope is that of the new SELECTOR nodes children.
                    stack.push(node.children);
                    break;

                case "SEQUENCE":
                    // Create a SEQUENCE AST node.
                    node = ASTNodeFactories.SEQUENCE();

                    // Push the SEQUENCE node into the current scope.
                    stack[stack.length - 1].push(node);

                    popAndCheck("{");

                    // The new scope is that of the new SEQUENCE nodes children.
                    stack.push(node.children);
                    break;

                case "LOTTO":
                    // Create a LOTTO AST node.
                    node = ASTNodeFactories.LOTTO();

                    // Push the LOTTO node into the current scope.
                    stack[stack.length - 1].push(node);

                    // If the next token is a '[' character then some ticket counts have been defined as arguments.
                    if (tokens[0] === "[") {
                        // Get the ticket count arguments, each argument must be a number.
                        node.tickets = getArguments(arg => !isNaN(arg) && parseFloat(arg, 10) === parseInt(arg, 10), "lotto node ticket counts must be integer values");
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
                    stack[stack.length - 1].push(node);

                    popAndCheck("{");

                    // The new scope is that of the new FLIP nodes children.
                    stack.push(node.children);
                    break;

                case "WAIT":
                    // Create a WAIT AST node.
                    node = ASTNodeFactories.WAIT();

                    // Push the WAIT node into the current scope.
                    stack[stack.length - 1].push(node);

                    // Get the duration and potential longest duration of the wait.
                    const durations = getArguments(arg => !isNaN(arg) && parseFloat(arg, 10) === parseInt(arg, 10), "wait node durations must be integer values");

                    // We should have got one or two durations.
                    if (durations.length === 1) {
                        // A static duration was defined.
                        node.duration = parseInt(durations[0], 10);
                    } else if (durations.length === 2) {
                        // A shortest and longest duration was defined.
                        node.duration = parseInt(durations[0], 10);
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
                    stack[stack.length - 1].push(node);

                    // Check for iteration counts ([]) or condition function (:SomeCondition) 
                    if (tokens[0] === "[") {
                        // An iteration count has been defined. Get the iteration and potential maximum iteration of the wait.
                        const iterationArguments = getArguments(arg => !isNaN(arg) && parseFloat(arg, 10) === parseInt(arg, 10), "repeat node iteration counts must be integer values");

                        // We should have got one or two iteration counts.
                        if (iterationArguments.length === 1) {
                            // A static iteration count was defined.
                            node.iterations = parseInt(iterationArguments[0], 10);
                        } else if (iterationArguments.length === 2) {
                            // A minimum and maximum iteration count was defined.
                            node.iterations = parseInt(iterationArguments[0], 10);
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
                    stack[stack.length - 1].push(node);

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
                    throw "unexpected token: " + token;
            }
        }

        // Validate each of the nodes.
        const validateASTNode = node => {
            // Validate the node.
            node.validate();

            // Validate each child of the node.
            (node.children || []).forEach(child => validateASTNode(child));
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

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Action;
/**
 * An Action node.
 * This represents an immediate or ongoing state of behaviour.
 * @param uid The unique node it.
 * @param actionName The action name.
 */
function Action(uid, actionName) {
    /**
     * The node state.
     */
    let state = Mistreevous.State.READY;

    /**
     * Update the node and get whether the node state has changed.
     * @param board The board.
     * @returns Whether the state of this node has changed as part of the update.
     */
    this.update = function (board) {
        // Get the pre-update node state.
        const initialState = state;

        // An action node should be updated until it fails or succeeds.
        if (state === Mistreevous.State.READY || state === Mistreevous.State.RUNNING) {
            // Get the corresponding action object.
            const action = board[actionName];

            // Validate the action.
            this._validateAction(action);

            // If the state of this node is 'READY' then this is the fist time that we are updating this node, so call onStart if it exists.
            if (state === Mistreevous.State.READY && typeof action.onStart === "function") {
                action.onStart();
            }

            // Call the action update, the result of which will be the new state of this action node, or 'RUNNING' if undefined.
            state = action.onUpdate() || Mistreevous.State.RUNNING;

            // If the new action node state is either 'SUCCEEDED' or 'FAILED' then we are finished, so call onFinish if it exists.
            if ((state === Mistreevous.State.SUCCEEDED || state === Mistreevous.State.FAILED) && typeof action.onFinish === "function") {
                action.onFinish(state === Mistreevous.State.SUCCEEDED, false);
            }
        }

        // Return whether the state of this node has changed.
        return state !== initialState;
    };

    /**
     * Gets the state of the node.
     */
    this.getState = () => state;

    /**
     * Gets the name of the node.
     */
    this.getName = () => actionName;

    /**
     * Gets the state of the node.
     */
    this.getChildren = () => null;

    /**
     * Gets the type of the node.
     */
    this.getType = () => "action";

    /**
     * Gets the unique id of the node.
     */
    this.getUid = () => uid;

    /**
     * Reset the state of the node.
     */
    this.reset = () => {
        // Reset the state of this node.
        state = Mistreevous.State.READY;
    };

    /**
     * Validate an action.
     * @param action The action to validate.
     */
    this._validateAction = action => {
        // The action should be defined.
        if (!action) {
            throw `cannot update action node as action '${actionName}' is not defined in the blackboard`;
        }

        // The action should at the very least have a onUpdate function defined.
        if (typeof action.onUpdate !== "function") {
            throw `action '${actionName}' does not have an 'onUpdate()' function defined`;
        }
    };
};

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Condition;
/**
 * A Condition node.
 * This acts as a guard and will succeed or fail immediately based on a board predicate, without moving to the 'RUNNING' state.
 * @param uid The unique node it.
 * @param conditionFunction The condition function. 
 */
function Condition(uid, conditionFunction) {
    /**
     * The node state.
     */
    let state = Mistreevous.State.READY;

    /**
     * Update the node and get whether the node state has changed.
     * @param board The board.
     * @returns Whether the state of this node has changed as part of the update.
     */
    this.update = function (board) {
        // Get the pre-update node state.
        const initialState = state;

        // Call the condition function to determine the state of this node, but it must exist in the blackboard.
        if (typeof board[conditionFunction] === "function") {
            state = !!board[conditionFunction]() ? Mistreevous.State.SUCCEEDED : Mistreevous.State.FAILED;
        } else {
            throw `cannot update condition node as function '${conditionFunction}' is not defined in the blackboard`;
        }

        // Return whether the state of this node has changed.
        return state !== initialState;
    };

    /**
     * Gets the state of the node.
     */
    this.getState = () => state;

    /**
     * Gets the name of the node.
     */
    this.getName = () => conditionFunction;

    /**
     * Gets the state of the node.
     */
    this.getChildren = () => null;

    /**
     * Gets the type of the node.
     */
    this.getType = () => "condition";

    /**
     * Gets the unique id of the node.
     */
    this.getUid = () => uid;

    /**
     * Reset the state of the node.
     */
    this.reset = () => {
        // Reset the state of this node.
        state = Mistreevous.State.READY;

        // Reset the child node.
        child.reset();
    };
};

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Flip;
/**
 * A Flip node.
 * This node wraps a single child and will flip the state of the child state.
 * @param uid The unique node it.
 * @param child The child node. 
 */
function Flip(uid, child) {
    /**
     * The node state.
     */
    let state = Mistreevous.State.READY;

    /**
     * Update the node and get whether the node state has changed.
     * @param board The board.
     * @returns Whether the state of this node has changed as part of the update.
     */
    this.update = function (board) {
        // Get the pre-update node state.
        const initialState = state;

        // If the child has never been updated or is running then we will need to update it now.
        if (child.getState() === Mistreevous.State.READY || child.getState() === Mistreevous.State.RUNNING) {
            child.update(board);
        }

        // The state of this node will depend in the state of its child.
        switch (child.getState()) {
            case Mistreevous.State.RUNNING:
                state = Mistreevous.State.RUNNING;
                break;

            case Mistreevous.State.SUCCEEDED:
                state = Mistreevous.State.FAILED;
                break;

            case Mistreevous.State.FAILED:
                state = Mistreevous.State.SUCCEEDED;
                break;
            default:
                state = Mistreevous.State.READY;
        }

        // Return whether the state of this node has changed.
        return state !== initialState;
    };

    /**
     * Gets the state of the node.
     */
    this.getState = () => state;

    /**
     * Gets the name of the node.
     */
    this.getName = () => "FLIP";

    /**
     * Gets the state of the node.
     */
    this.getChildren = () => [child];

    /**
     * Gets the type of the node.
     */
    this.getType = () => "flip";

    /**
     * Gets the unique id of the node.
     */
    this.getUid = () => uid;

    /**
     * Reset the state of the node.
     */
    this.reset = () => {
        // Reset the state of this node.
        state = Mistreevous.State.READY;

        // Reset the child node.
        child.reset();
    };
};

/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Lotto;
/**
 * A LOTTO node.
 * A winning child is picked on the initial update of this node, based on ticket weighting.
 * The state of this node will match the state of the winning child.
 * @param uid The unique node it.
 * @param tickets The child node tickets
 * @param children The child nodes. 
 */
function Lotto(uid, tickets, children) {
    /**
     * The node state.
     */
    let state = Mistreevous.State.READY;

    /**
     * The winning child node.
     */
    let winningChild;

    /**
     * Represents a lotto draw.
     */
    function LottoDraw() {
        /**
         * The participants
         */
        this.participants = [];

        /**
         * Add a participant.
         * @param participant The participant.
         * @param tickets The number of tickets held by the participant.
         */
        this.add = function (participant, tickets) {
            this.participants.push({ participant, tickets });
            return this;
        };

        /**
         * Draw a winning participant.
         * @returns A winning participant.
         */
        this.draw = function () {
            // We cannot do anything if there are no participants.
            if (!this.participants.length) {
                throw "cannot draw a lotto winner when there are no participants";
            }

            const pickable = [];

            this.participants.forEach(({ participant, tickets }) => {
                for (let ticketCount = 0; ticketCount < tickets; ticketCount++) {
                    pickable.push(participant);
                }
            });

            return this.getRandomItem(pickable);
        };

        /**
         * Get a random item form an array. 
         * @param items Th array of items.
         * @returns The randomly picked item.
         */
        this.getRandomItem = function (items) {
            // We cant pick a random item from an empty array.
            if (!items.length) {
                return undefined;
            }

            // Return a random item.
            return items[Math.floor(Math.random() * items.length)];
        };
    }

    /**
     * Update the node and get whether the node state has changed.
     * @param board The board.
     * @returns Whether the state of this node has changed as part of the update.
     */
    this.update = function (board) {
        // Get the pre-update node state.
        const initialState = state;

        // If this node is in the READY state then we need to pick a winning child node.
        if (state === Mistreevous.State.READY) {
            // Create a lotto draw.
            const lottoDraw = new LottoDraw();

            // Add each child of this node to a lotto draw, with each child's corresponding ticket weighting, or a single ticket if not defined.
            children.forEach((child, index) => lottoDraw.add(child, tickets[index] || 1));

            // Randomly pick a child based on ticket weighting.
            winningChild = lottoDraw.draw();
        }

        // If the winning child has never been updated or is running then we will need to update it now.
        if (winningChild.getState() === Mistreevous.State.READY || winningChild.getState() === Mistreevous.State.RUNNING) {
            winningChild.update(board);
        }

        // The state of the lotto node is the state of its winning child.
        state = winningChild.getState();

        // Return whether the state of this node has changed.
        return state !== initialState;
    };

    /**
     * Gets the state of the node.
     */
    this.getState = () => state;

    /**
     * Gets the name of the node.
     */
    this.getName = () => tickets.length ? `LOTTO [${tickets.join(",")}]` : "LOTTO";

    /**
     * Gets the state of the node.
     */
    this.getChildren = () => children;

    /**
     * Gets the type of the node.
     */
    this.getType = () => "lotto";

    /**
     * Gets the unique id of the node.
     */
    this.getUid = () => uid;

    /**
     * Reset the state of the node.
     */
    this.reset = () => {
        // Reset the state of this node.
        state = Mistreevous.State.READY;

        // Reset each child node.
        children.forEach(child => child.reset());
    };
};

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Repeat;
/**
 * A REPEAT node.
 * The node has a single child which can have:
 * -- A number of iterations for which to repeat the child node.
 * -- A condition function that determines whether to repeat the update of the child node.
 * -- An infinite repeat loop if neither an iteration count or a condition function is defined.
 * The REPEAT node will stop and have a 'FAILED' state if its child is ever in a 'FAILED' state after an update.
 * The REPEAT node will attempt to move on to the next iteration if its child is ever in a 'SUCCEEDED' state.
 * @param uid The unique node it.
 * @param iterations The number of iterations to repeat the child node, or the minimum number of iterations if maximumIterations is defined.
 * @param maximumIterations The maximum number of iterations to repeat the child node.
 * @param conditionFunction The name of the condition function that determines whether to repeat the update of the child node.
 * @param child The child node. 
 */
function Repeat(uid, iterations, maximumIterations, conditionFunction, child) {
    /**
     * The node state.
     */
    let state = Mistreevous.State.READY;

    /**
     * The condition function name.
     */
    let conditionFunctionName = null;

    /**
     * The number of target iterations to make.
     */
    let targetIterationCount = null;

    /**
     * The current iteration count.
     */
    let currentIterationCount = 0;

    /**
     * Update the node and get whether the node state has changed.
     * @param board The board.
     * @returns Whether the state of this node has changed as part of the update.
     */
    this.update = function (board) {
        // Get the pre-update node state.
        const initialState = state;

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (state === Mistreevous.State.SUCCEEDED || state === Mistreevous.State.FAILED) {
            // We have not changed state.
            return false;
        }

        // If this node is in the READY state then we need to reset the iteration count and determine which method we will use as a repeat condition.
        if (state === Mistreevous.State.READY) {
            // Reset the current iteration count.
            currentIterationCount = 0;

            // Reset the child node.
            child.reset();

            // Are we dealing with a set number of iterations or a condition function?
            if (typeof iterations === "number") {
                // If we have maximumIterations defined then we will want a random iteration count bounded by iterations and maximumIterations.
                targetIterationCount = typeof maximumIterations === "number" ? Math.floor(Math.random() * (maximumIterations - iterations + 1) + iterations) : iterations;
            } else if (typeof conditionFunction === "string") {
                // We are dealing with a condition function.
                conditionFunctionName = conditionFunction;
            }

            // Do an initial check to see if we can iterate. If we can then this node will be in the 'RUNNING' state.
            // If we cannot iterate then we have immediately failed our condition or hit our target iteration count, then the node has succeeded.
            if (this._canIterate(board)) {
                // This node is in the running state and can do its initial iteration.
                state = Mistreevous.State.RUNNING;
            } else {
                // This node is in the 'SUCCEEDED' state.
                state = Mistreevous.State.SUCCEEDED;

                // Return whether the state of this node has changed.
                return state !== initialState;
            }
        }

        do {
            // Reset the child node if it is already in the 'SUCCEEDED' state.
            if (child.getState() === Mistreevous.State.SUCCEEDED) {
                child.reset();
            }

            // If the child has never been updated or is running then we will need to update it now.
            if (child.getState() === Mistreevous.State.READY || child.getState() === Mistreevous.State.RUNNING) {
                child.update(board);
            }

            // If the child node is in the 'SUCCEEDED' state then we may be moving on to the next iteration or setting this 
            // node as 'SUCCEEDED' if we cant. If this node is in the 'FAILED' state then this node has completely failed.
            if (child.getState() === Mistreevous.State.SUCCEEDED) {
                // The child node has reached the 'SUCCEEDED' state, so we have completed an iteration.
                currentIterationCount += 1;
            } else if (child.getState() === Mistreevous.State.FAILED) {
                // The has failed, meaning that this node has failed.
                state = Mistreevous.State.FAILED;

                // Return whether the state of this node has changed.
                return state !== initialState;
            } else if (child.getState() === Mistreevous.State.RUNNING) {
                // This node is in the running state as its child is in the running state.
                state = Mistreevous.State.RUNNING;

                // Return whether the state of this node has changed.
                return state !== initialState;
            }
        } while (this._canIterate(board));

        // If we were able to complete our iterations without our child going into the 'FAILED' state then this node has succeeded.
        state = Mistreevous.State.SUCCEEDED;

        // Return whether the state of this node has changed.
        return state !== initialState;
    };

    /**
     * Gets the state of the node.
     */
    this.getState = () => state;

    /**
     * Gets the name of the node.
     */
    this.getName = () => {
        if (iterations !== null) {
            return `REPEAT ${maximumIterations ? iterations + "x-" + maximumIterations + "x" : iterations + "x"}`;
        } else if (conditionFunction !== null) {
            return `WHILE ${conditionFunction}`;
        }

        // Return the default repeat node name.
        return "REPEAT";
    };

    /**
     * Gets the state of the node.
     */
    this.getChildren = () => [child];

    /**
     * Gets the type of the node.
     */
    this.getType = () => "repeat";

    /**
     * Gets the unique id of the node.
     */
    this.getUid = () => uid;

    /**
     * Reset the state of the node.
     */
    this.reset = () => {
        // Reset the state of this node.
        state = Mistreevous.State.READY;

        // Reset the child node.
        child.reset();
    };

    /**
     * Gets whether an iteration can be made.
     * @param board The board.
     * @returns Whether an iteration can be made.
     */
    this._canIterate = board => {
        if (targetIterationCount !== null) {
            // We can iterate as long as we have not reached our target iteration count.
            return currentIterationCount < targetIterationCount;
        } else if (conditionFunctionName !== null) {
            // Call the condition function to determine whether we can iterate.
            if (typeof board[conditionFunctionName] === "function") {
                return !!board[conditionFunctionName]();
            } else {
                throw `cannot update repeat node as condition function '${conditionFunction}' is not defined in the blackboard`;
            }
        }

        // If neither an iteration count or a condition function were defined then we can iterate indefinitely.
        return true;
    };
};

/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Root;
/**
 * A Root node.
 * The root node will have a single child.
 * @param uid The unique node it.
 * @param child The child node. 
 */
function Root(uid, child) {
  /**
   * The node state.
   */
  let state = Mistreevous.State.READY;

  /**
   * Update the node and get whether the node state has changed.
   * @param board The board.
   * @returns Whether the state of this node has changed as part of the update.
   */
  this.update = function (board) {
    // Get the pre-update node state.
    const initialState = state;

    // If the child has never been updated or is running then we will need to update it now.
    if (child.getState() === Mistreevous.State.READY || child.getState() === Mistreevous.State.RUNNING) {
      child.update(board);
    }

    // The state of the root node is the state of its child.
    state = child.getState();

    // Return whether the state of this node has changed.
    return state !== initialState;
  };

  /**
   * Gets the state of the node.
   */
  this.getState = () => state;

  /**
   * Gets the name of the node.
   */
  this.getName = () => "ROOT";

  /**
   * Gets the state of the node.
   */
  this.getChildren = () => [child];

  /**
   * Gets the type of the node.
   */
  this.getType = () => "root";

  /**
   * Gets the unique id of the node.
   */
  this.getUid = () => uid;

  /**
   * Reset the state of the node.
   */
  this.reset = () => {
    // Reset the state of this node.
    state = Mistreevous.State.READY;

    // Reset the child node.
    child.reset();
  };
};

/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Selector;
/**
 * A SELECTOR node.
 * The child nodes are executed in sequence until one succeeds or all fail.
 * @param uid The unique node it.
 * @param children The child nodes. 
 */
function Selector(uid, children) {
    /**
     * The node state.
     */
    let state = Mistreevous.State.READY;

    /**
     * Update the node and get whether the node state has changed.
     * @param board The board.
     * @returns Whether the state of this node has changed as part of the update.
     */
    this.update = function (board) {
        // Get the pre-update node state.
        const initialState = state;

        // Iterate over all of the children of this node.
        for (const child of children) {
            // If the child has never been updated or is running then we will need to update it now.
            if (child.getState() === Mistreevous.State.READY || child.getState() === Mistreevous.State.RUNNING) {
                child.update(board);
            }

            // If the current child has a state of 'SUCCEEDED' then this node is also a 'SUCCEEDED' node.
            if (child.getState() === Mistreevous.State.SUCCEEDED) {
                // This node is a 'SUCCEEDED' node.
                state = Mistreevous.State.SUCCEEDED;

                // There is no need to check the rest of the selector nodes.
                return state !== initialState;
            }

            // If the current child has a state of 'FAILED' then we should move on to the next child.
            if (child.getState() === Mistreevous.State.FAILED) {
                // Find out if the current child is the last one in the selector.
                // If it is then this sequence node has also failed.
                if (children.indexOf(child) === children.length - 1) {
                    // This node is a 'FAILED' node.
                    state = Mistreevous.State.FAILED;

                    // There is no need to check the rest of the selector as we have completed it.
                    return state !== initialState;
                } else {
                    // The child node failed, try the next one.
                    continue;
                }
            }

            // The node should be in the 'RUNNING' state.
            if (child.getState() === Mistreevous.State.RUNNING) {
                // This node is a 'RUNNING' node.
                state = Mistreevous.State.RUNNING;

                // There is no need to check the rest of the selector as the current child is still running.
                return state !== initialState;
            }

            // The child node was not in an expected state.
            throw "Error: child node was not in an expected state.";
        }
    };

    /**
     * Gets the state of the node.
     */
    this.getState = () => state;

    /**
     * Gets the name of the node.
     */
    this.getName = () => "SELECTOR";

    /**
     * Gets the state of the node.
     */
    this.getChildren = () => children;

    /**
     * Gets the type of the node.
     */
    this.getType = () => "selector";

    /**
     * Gets the unique id of the node.
     */
    this.getUid = () => uid;

    /**
     * Reset the state of the node.
     */
    this.reset = () => {
        // Reset the state of this node.
        state = Mistreevous.State.READY;

        // Reset each child node.
        children.forEach(child => child.reset());
    };
};

/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Sequence;
/**
 * A SEQUENCE node.
 * The child nodes are executed in sequence until one fails or all succeed.
 * @param uid The unique node it.
 * @param children The child nodes. 
 */
function Sequence(uid, children) {
    /**
     * The node state.
     */
    let state = Mistreevous.State.READY;

    /**
     * Update the node and get whether the node state has changed.
     * @param board The board.
     * @returns Whether the state of this node has changed as part of the update.
     */
    this.update = function (board) {
        // Get the pre-update node state.
        const initialState = state;

        // Iterate over all of the children of this node.
        for (const child of children) {
            // If the child has never been updated or is running then we will need to update it now.
            if (child.getState() === Mistreevous.State.READY || child.getState() === Mistreevous.State.RUNNING) {
                child.update(board);
            }

            // If the current child has a state of 'SUCCEEDED' then we should move on to the next child.
            if (child.getState() === Mistreevous.State.SUCCEEDED) {
                // Find out if the current child is the last one in the sequence.
                // If it is then this sequence node has also succeeded.
                if (children.indexOf(child) === children.length - 1) {
                    // This node is a 'SUCCEEDED' node.
                    state = Mistreevous.State.SUCCEEDED;

                    // There is no need to check the rest of the sequence as we have completed it.
                    return state !== initialState;
                } else {
                    // The child node succeeded, but we have not finished the sequence yet.
                    continue;
                }
            }

            // If the current child has a state of 'FAILED' then this node is also a 'FAILED' node.
            if (child.getState() === Mistreevous.State.FAILED) {
                // This node is a 'FAILED' node.
                state = Mistreevous.State.FAILED;

                // There is no need to check the rest of the sequence.
                return state !== initialState;
            }

            // The node should be in the 'RUNNING' state.
            if (child.getState() === Mistreevous.State.RUNNING) {
                // This node is a 'RUNNING' node.
                state = Mistreevous.State.RUNNING;

                // There is no need to check the rest of the sequence as the current child is still running.
                return state !== initialState;
            }

            // The child node was not in an expected state.
            throw "Error: child node was not in an expected state.";
        }
    };

    /**
     * Gets the state of the node.
     */
    this.getState = () => state;

    /**
     * Gets the name of the node.
     */
    this.getName = () => "SEQUENCE";

    /**
     * Gets the state of the node.
     */
    this.getChildren = () => children;

    /**
     * Gets the type of the node.
     */
    this.getType = () => "sequence";

    /**
     * Gets the unique id of the node.
     */
    this.getUid = () => uid;

    /**
     * Reset the state of the node.
     */
    this.reset = () => {
        // Reset the state of this node.
        state = Mistreevous.State.READY;

        // Reset each child node.
        children.forEach(child => child.reset());
    };
};

/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Wait;
/**
 * A WAIT node.
 * The state of this node will change to SUCCEEDED after a duration of time.
 * @param uid The unique node it.
 * @param duration The duration that this node will wait to succeed in milliseconds, or the earliest if longestDuration is defined.
 * @param longestDuration The longest possible duration in milliseconds that this node will wait to succeed.
 */
function Wait(uid, duration, longestDuration) {
    /**
     * The node state.
     */
    let state = Mistreevous.State.READY;

    /** 
     * The time in milliseconds at which this node was first updated.
     */
    let initialUpdateTime;

    /**
     * The duration in milliseconds that this node will be waiting for. 
     */
    let waitDuration;

    /**
     * Update the node and get whether the node state has changed.
     * @param board The board.
     * @returns Whether the state of this node has changed as part of the update.
     */
    this.update = function (board) {
        // Get the pre-update node state.
        const initialState = state;

        // If this node is in the READY state then we need to set the initial update time.
        if (state === Mistreevous.State.READY) {
            // Set the initial update time.
            initialUpdateTime = new Date().getTime();

            // If a longestDuration value was defined then we will be randomly picking a duration between the
            // shortest and longest duration. If it was not defined, then we will be just using the duration.
            waitDuration = longestDuration ? Math.floor(Math.random() * (longestDuration - duration + 1) + duration) : duration;

            // The node is now running until we finish waiting.
            state = Mistreevous.State.RUNNING;
        }

        // Have we waited long enough?
        if (new Date().getTime() >= initialUpdateTime + waitDuration) {
            // We have finished waiting!
            state = Mistreevous.State.SUCCEEDED;
        }

        // Return whether the state of this node has changed.
        return state !== initialState;
    };

    /**
     * Gets the state of the node.
     */
    this.getState = () => state;

    /**
     * Gets the name of the node.
     */
    this.getName = () => `WAIT ${longestDuration ? duration + "ms-" + longestDuration + "ms" : duration + "ms"}`;

    /**
     * Gets the state of the node.
     */
    this.getChildren = () => [];

    /**
     * Gets the type of the node.
     */
    this.getType = () => "wait";

    /**
     * Gets the unique id of the node.
     */
    this.getUid = () => uid;

    /**
     * Reset the state of the node.
     */
    this.reset = () => {
        // Reset the state of this node.
        state = Mistreevous.State.READY;
    };
};

/***/ }),
/* 12 */
/***/ (function(module, exports) {

/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {/* globals __webpack_amd_options__ */
module.exports = __webpack_amd_options__;

/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ })
/******/ ]);