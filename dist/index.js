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
    if (typeof define === 'function' && __webpack_require__(15)) {
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
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__nodes_root__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__nodes_selector__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__nodes_sequence__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__nodes_wait__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__guards_while__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__guards_until__ = __webpack_require__(14);












/**
 * The behaviour tree.
 * @param definition The tree definition.
 * @param board The board.
 */
function BehaviourTree(definition, board) {

    /**
     * Get a randomly generated uid.
     * @returns A randomly generated uid.
     */
    const getUid = () => {
        var S4 = function () {
            return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
        };
        return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
    };

    /**
     * The AST node factories.
     */
    const ASTNodeFactories = {
        "ROOT": () => ({
            type: "root",
            guard: null,
            name: null,
            children: [],
            validate: function (depth) {
                // A root node cannot be the child of another node.
                if (depth > 1) {
                    throw "a root node cannot be the child of another node";
                }

                // A root node must have a single child node.
                if (this.children.length !== 1) {
                    throw "a root node must have a single child";
                }
            },
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
                return new __WEBPACK_IMPORTED_MODULE_5__nodes_root__["a" /* default */](getUid(), this.guard, this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice()));
            }
        }),
        "BRANCH": () => ({
            type: "branch",
            branchName: "",
            validate: function (depth) {},
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
            guard: null,
            children: [],
            validate: function (depth) {
                // A selector node must have at least a single node.
                if (this.children.length < 1) {
                    throw "a selector node must have at least a single child";
                }
            },
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
                return new __WEBPACK_IMPORTED_MODULE_6__nodes_selector__["a" /* default */](getUid(), this.guard, this.children.map(child => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice())));
            }
        }),
        "SEQUENCE": () => ({
            type: "sequence",
            guard: null,
            children: [],
            validate: function (depth) {
                // A sequence node must have at least a single node.
                if (this.children.length < 1) {
                    throw "a sequence node must have at least a single child";
                }
            },
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
                return new __WEBPACK_IMPORTED_MODULE_7__nodes_sequence__["a" /* default */](getUid(), this.guard, this.children.map(child => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice())));
            }
        }),
        "LOTTO": () => ({
            type: "lotto",
            guard: null,
            children: [],
            tickets: [],
            validate: function (depth) {
                // A lotto node must have at least a single node.
                if (this.children.length < 1) {
                    throw "a lotto node must have at least a single child";
                }
            },
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
                return new __WEBPACK_IMPORTED_MODULE_3__nodes_lotto__["a" /* default */](getUid(), this.guard, this.tickets, this.children.map(child => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice())));
            }
        }),
        "REPEAT": () => ({
            type: "repeat",
            guard: null,
            iterations: null,
            maximumIterations: null,
            children: [],
            validate: function (depth) {
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
                return new __WEBPACK_IMPORTED_MODULE_4__nodes_repeat__["a" /* default */](getUid(), this.guard, this.iterations, this.maximumIterations, this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice()));
            }
        }),
        "FLIP": () => ({
            type: "flip",
            guard: null,
            children: [],
            validate: function (depth) {
                // A flip node must have a single node.
                if (this.children.length !== 1) {
                    throw "a flip node must have a single child";
                }
            },
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
                return new __WEBPACK_IMPORTED_MODULE_2__nodes_flip__["a" /* default */](getUid(), this.guard, this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice()));
            }
        }),
        "CONDITION": () => ({
            type: "condition",
            conditionFunction: "",
            validate: function (depth) {},
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
                return new __WEBPACK_IMPORTED_MODULE_1__nodes_condition__["a" /* default */](getUid(), this.conditionFunction);
            }
        }),
        "WAIT": () => ({
            type: "wait",
            guard: null,
            duration: null,
            longestDuration: null,
            validate: function (depth) {
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
                return new __WEBPACK_IMPORTED_MODULE_8__nodes_wait__["a" /* default */](getUid(), this.guard, this.duration, this.longestDuration);
            }
        }),
        "ACTION": () => ({
            type: "action",
            actionName: "",
            validate: function (depth) {},
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
                return new __WEBPACK_IMPORTED_MODULE_0__nodes_action__["a" /* default */](getUid(), this.actionName);
            }
        })
    };

    /**
     * The node guard factories.
     */
    const GuardFactories = {
        "WHILE": condition => new __WEBPACK_IMPORTED_MODULE_9__guards_while__["a" /* default */](condition),
        "UNTIL": condition => new __WEBPACK_IMPORTED_MODULE_10__guards_until__["a" /* default */](condition)
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
    this._init = function () {
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
            const namedRootNodeProvider = function (name) {
                return rootNodeMap[name];
            };

            // Convert the AST to our actual tree.
            this._rootNode = rootNodeMap[mainRootNodeKey].createNodeInstance(namedRootNodeProvider, []);
        } catch (exception) {
            // There was an issue in trying to parse and build the tree definition.
            throw `TreeParseError: ${exception}`;
        }

        // Get a flattened array of tree nodes.
        this._flattenedTreeNodes = [];
        let currentNodeScopeId = 0;
        const findNestedNodes = (node, depth, nodeScopeId) => {
            this._flattenedTreeNodes.push({ node, depth, nodeScopeId });

            nodeScopeId = ++currentNodeScopeId;

            // Find each child of the node.
            (node.getChildren() || []).forEach(child => findNestedNodes(child, depth + 1, nodeScopeId));
        };
        findNestedNodes(this._rootNode, 0, currentNodeScopeId);
    };

    /**
     * Parse the BT tree definition into an array of raw tokens.
     * @returns An array of tokens parsed from the definition.
     */
    this._parseDefinition = function () {
        // Firstly, create a copy of the raw definition.
        let cleansedDefinition = definition;

        // Add some space around various important characters so that they can be plucked out easier as individual tokens.
        cleansedDefinition = cleansedDefinition.replace(/\(/g, " ( ");
        cleansedDefinition = cleansedDefinition.replace(/\)/g, " ) ");
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
     * @returns The base definition AST nodes.
     */
    this._createRootASTNodes = function (tokens) {
        // There must be at least 3 tokens for the tree definition to be valid. 'ROOT', '{' and '}'.
        if (tokens.length < 3) {
            throw "invalid token count";
        }

        // We should have a matching number of '{' and '}' tokens. If not, then there are scopes that have not been properly closed.
        if (tokens.filter(token => token === "{").length !== tokens.filter(token => token === "}").length) {
            throw "scope character mismatch";
        }

        /**
         * Helper function to pop the next raw token off of the stack and throw an error if it wasn't the expected one.
         * @param expected An optional string that we expect the next popped token to match.
         * @returns The popped token.
         */
        const popAndCheck = expected => {
            // Get and remove the next token.
            const popped = tokens.shift();

            // We were expecting another token.
            if (popped === undefined) {
                throw "unexpected end of definition";
            }

            // If an expected token was defined, was it the expected one?
            if (expected && popped.toUpperCase() !== expected.toUpperCase()) {
                throw "unexpected token found on the stack. Expected '" + expected + "' but got '" + popped + "'";
            }

            // Return the popped token.
            return popped;
        };

        /**
         * Helper function to pull an argument list off of the token stack.
         * @param argumentValidator The argument validator function.
         * @param validationFailedMessage  The exception message to throw if argument validation fails.
         * @returns The arguments list.
         */
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
        };

        /**
         * Helper function to try to pull a guard off of the token stack.
         * @returns The guard defined by any directly following tokens, or null if not guard is defined.
         */
        const getGuard = () => {
            // Try to get the guard factory for the next token.
            const guardFactory = GuardFactories[(tokens[0] || "").toUpperCase()];

            // There is nothing to do if the next token is not a guard name token.
            if (!guardFactory) {
                return null;
            }

            // The guard definition should consist of the tokens 'NAME', '(', 'CONDITION' and ')'.
            popAndCheck(tokens[0].toUpperCase());
            popAndCheck("(");
            const condition = popAndCheck();
            popAndCheck(")");

            // Create and return the guard.
            return guardFactory(condition);
        };

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

                    // Try to pick a node guard off of the token stack.
                    node.guard = getGuard();

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
                    stack[stack.length - 1].push(node);

                    // Try to pick a node guard off of the token stack.
                    node.guard = getGuard();

                    popAndCheck("{");

                    // The new scope is that of the new SELECTOR nodes children.
                    stack.push(node.children);
                    break;

                case "SEQUENCE":
                    // Create a SEQUENCE AST node.
                    node = ASTNodeFactories.SEQUENCE();

                    // Push the SEQUENCE node into the current scope.
                    stack[stack.length - 1].push(node);

                    // Try to pick a node guard off of the token stack.
                    node.guard = getGuard();

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

                    // Try to pick a node guard off of the token stack.
                    node.guard = getGuard();

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
                    stack[stack.length - 1].push(node);

                    // Try to pick a node guard off of the token stack.
                    node.guard = getGuard();

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

                    // Try to pick a node guard off of the token stack.
                    node.guard = getGuard();
                    break;

                case "REPEAT":
                    // Create a REPEAT AST node.
                    node = ASTNodeFactories.REPEAT();

                    // Push the REPEAT node into the current scope.
                    stack[stack.length - 1].push(node);

                    // Check for iteration counts ([])
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
                    }

                    // Try to pick a node guard off of the token stack.
                    node.guard = getGuard();

                    popAndCheck("{");

                    // The new scope is that of the new REPEAT nodes children.
                    stack.push(node.children);
                    break;

                case "ACTION":
                    // Create a ACTION AST node.
                    node = ASTNodeFactories.ACTION();

                    // Push the ACTION node into the current scope.
                    stack[stack.length - 1].push(node);

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
                    throw "unexpected token: " + token;
            }
        }

        // A function to recursively validate each of the nodes in the AST.
        const validateASTNode = (node, depth) => {
            // Validate the node.
            node.validate(depth);

            // Validate each child of the node.
            (node.children || []).forEach(child => validateASTNode(child, depth + 1));
        };

        // Start node validation from the definition root.
        validateASTNode({
            children: stack[0],
            validate: function (depth) {
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
                if (this.children.filter(function (definitionLevelNode) {
                    return definitionLevelNode.name === null;
                }).length !== 1) {
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
        }, 0);

        // Return the root AST nodes.
        return stack[0];
    };

    // Call init logic.
    this._init();
}

/**
 * Get the root node.
 * @returns The root node.
 */
BehaviourTree.prototype.getRootNode = function () {
    return this._rootNode;
};

/**
 * Get whether the tree is in the running state.
 * @returns Whether the tree is in the running state.
 */
BehaviourTree.prototype.isRunning = function () {
    return this._rootNode.getState() === Mistreevous.State.RUNNING;
};

/**
 * Get the current tree state.
 * @returns The current tree state.
 */
BehaviourTree.prototype.getState = function () {
    return this._rootNode.getState();
};

/**
 * Step the tree.
 */
BehaviourTree.prototype.step = function () {
    // If the root node has already been stepped to completion then we need to reset it.
    if (this._rootNode.getState() === Mistreevous.State.SUCCEEDED || this._rootNode.getState() === Mistreevous.State.FAILED) {
        this._rootNode.reset();
    }

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
 * @param uid The unique node id.
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

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (state === Mistreevous.State.SUCCEEDED || state === Mistreevous.State.FAILED) {
            // We have not changed state.
            return false;
        }

        // Get the corresponding action object or function.
        const action = board[actionName];

        // Validate the action.
        this._validateAction(action);

        // If the state of this node is 'READY' then this is the first time that we are updating this node, so call onStart if it exists.
        if (state === Mistreevous.State.READY && typeof action === "object" && typeof action.onStart === "function") {
            action.onStart();
        }

        // Call the action 'onUpdate' function, the result of which will be the new state of this action node, or 'RUNNING' if undefined.
        const updateResult = typeof action === "function" ? action() : action.onUpdate();

        // Validate the returned value.
        this._validateUpdateResult(updateResult);

        // Set the state of this node, this may be undefined, which just means that the node is still in the 'RUNNING' state.
        state = updateResult || Mistreevous.State.RUNNING;

        // If the new action node state is either 'SUCCEEDED' or 'FAILED' then we are finished, so call onFinish if it exists.
        if ((state === Mistreevous.State.SUCCEEDED || state === Mistreevous.State.FAILED) && typeof action === "object" && typeof action.onFinish === "function") {
            action.onFinish(state === Mistreevous.State.SUCCEEDED);
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
     * Gets the guard of the node.
     */
    this.getGuard = () => null;

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

        // The action will need to be a function or an object, anything else is not valid.
        if (typeof action !== "function" || typeof action !== "object") {
            return `action '${actionName}' must be a function or object`;
        }

        // The action should at the very least have a onUpdate function defined.
        // Unlike 'onStart' and 'onFinish', this function must be defined as it is critical in determining node state.
        if (typeof action === "object" && typeof action.onUpdate !== "function") {
            throw `action '${actionName}' does not have an 'onUpdate()' function defined`;
        }
    };

    /**
     * Validate the result of an update function call.
     * @param result The result of an update function call.
     */
    this._validateUpdateResult = result => {
        switch (result) {
            case Mistreevous.State.SUCCEEDED:
            case Mistreevous.State.FAILED:
            case undefined:
                return;
            default:
                throw `action '${actionName}' 'onUpdate' returned an invalid response, expected an optional Mistreevous.State.SUCCEEDED or Mistreevous.State.FAILED value to be returned`;
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
 * @param uid The unique node id.
 * @param condition The name of the condition function. 
 */
function Condition(uid, condition) {
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

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (state === Mistreevous.State.SUCCEEDED || state === Mistreevous.State.FAILED) {
            // We have not changed state.
            return false;
        }

        // Call the condition function to determine the state of this node, but it must exist in the blackboard.
        if (typeof board[condition] === "function") {
            state = !!board[condition]() ? Mistreevous.State.SUCCEEDED : Mistreevous.State.FAILED;
        } else {
            throw `cannot update condition node as function '${condition}' is not defined in the blackboard`;
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
    this.getName = () => condition;

    /**
     * Gets the state of the node.
     */
    this.getChildren = () => null;

    /**
     * Gets the guard of the node.
     */
    this.getGuard = () => null;

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
 * @param uid The unique node id.
 * @param guard The node guard.
 * @param child The child node. 
 */
function Flip(uid, guard, child) {
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

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (state === Mistreevous.State.SUCCEEDED || state === Mistreevous.State.FAILED) {
            // We have not changed state.
            return false;
        }

        // If a guard has been defined for the node, this node will move into the FAILED state if it is not satisfied.
        if (guard && !guard.isSatisfied(board)) {
            // The guard is not satisfied and therefore we are finished with the node.
            state = Mistreevous.State.FAILED;

            // The node has moved to the FAILED state.
            return true;
        }

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
     * Gets the guard of the node.
     */
    this.getGuard = () => guard;

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
 * @param uid The unique node id.
 * @param guard The node guard.
 * @param tickets The child node tickets
 * @param children The child nodes. 
 */
function Lotto(uid, guard, tickets, children) {
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

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (state === Mistreevous.State.SUCCEEDED || state === Mistreevous.State.FAILED) {
            // We have not changed state.
            return false;
        }

        // If a guard has been defined for the node, this node will move into the FAILED state if it is not satisfied.
        if (guard && !guard.isSatisfied(board)) {
            // The guard is not satisfied and therefore we are finished with the node.
            state = Mistreevous.State.FAILED;

            // The node has moved to the FAILED state.
            return true;
        }

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
     * Gets the guard of the node.
     */
    this.getGuard = () => guard;

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
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_constants__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_constants___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_constants__);


/**
 * A REPEAT node.
 * The node has a single child which can have:
 * -- A number of iterations for which to repeat the child node.
 * -- An infinite repeat loop if neither an iteration count or a condition function is defined.
 * The REPEAT node will stop and have a 'FAILED' state if its child is ever in a 'FAILED' state after an update.
 * The REPEAT node will attempt to move on to the next iteration if its child is ever in a 'SUCCEEDED' state.
 * @param uid The unique node id.
 * @param guard The node guard.
 * @param iterations The number of iterations to repeat the child node, or the minimum number of iterations if maximumIterations is defined.
 * @param maximumIterations The maximum number of iterations to repeat the child node.
 * @param child The child node. 
 */
function Repeat(uid, guard, iterations, maximumIterations, child) {
    /**
     * The node state.
     */
    let state = Mistreevous.State.READY;

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

        // If a guard has been defined for the node, this node will move into the FAILED state if it is not satisfied.
        if (guard && !guard.isSatisfied(board)) {
            // The guard is not satisfied and therefore we are finished with the node.
            state = Mistreevous.State.FAILED;

            // The node has moved to the FAILED state.
            return true;
        }

        // If this node is in the READY state then we need to reset the child and the target iteration count.
        if (state === Mistreevous.State.READY) {
            // Reset the child node.
            child.reset();

            // Set the target iteration count.
            this._setTargetIterationCount();
        }

        // Do a check to see if we can iterate. If we can then this node will move into the 'RUNNING' state.
        // If we cannot iterate then we have hit our target iteration count, which means that the node has succeeded.
        if (this._canIterate()) {
            // This node is in the running state and can do its initial iteration.
            state = Mistreevous.State.RUNNING;

            // We may have already completed an iteration, meaning that the child node will be in the SUCCEEDED state.
            // If this is the case then we will have to reset the child node now.
            if (child.getState() === Mistreevous.State.SUCCEEDED) {
                child.reset();
            }

            // Update the child node.
            child.update(board);

            // If the child moved into the FAILED state when we updated it then there is nothing left to do and this node has also failed.
            // If it has moved into the SUCCEEDED state then we have completed the current iteration.
            if (child.getState() === Mistreevous.State.FAILED) {
                // The child has failed, meaning that this node has failed.
                state = Mistreevous.State.FAILED;

                // Return whether the state of this node has changed.
                return state !== initialState;
            } else if (child.getState() === Mistreevous.State.SUCCEEDED) {
                // We have completed an iteration.
                currentIterationCount += 1;
            }
        } else {
            // This node is in the 'SUCCEEDED' state as we cannot iterate any more.
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
    this.getName = () => {
        if (iterations !== null) {
            return `REPEAT ${maximumIterations ? iterations + "x-" + maximumIterations + "x" : iterations + "x"}`;
        }

        // Return the default repeat node name.
        return "REPEAT";
    };

    /**
     * Gets the state of the node.
     */
    this.getChildren = () => [child];

    /**
     * Gets the guard of the node.
     */
    this.getGuard = () => guard;

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

        // Reset the current iteration count.
        currentIterationCount = 0;

        // Reset the child node.
        child.reset();
    };

    /**
     * Gets whether an iteration can be made.
     * @returns Whether an iteration can be made.
     */
    this._canIterate = () => {
        if (targetIterationCount !== null) {
            // We can iterate as long as we have not reached our target iteration count.
            return currentIterationCount < targetIterationCount;
        }

        // If neither an iteration count or a condition function were defined then we can iterate indefinitely.
        return true;
    };

    /**
     * Sets the target iteration count.
     */
    this._setTargetIterationCount = () => {
        // Are we dealing with a finite number of iterations?
        if (typeof iterations === "number") {
            // If we have maximumIterations defined then we will want a random iteration count bounded by iterations and maximumIterations.
            targetIterationCount = typeof maximumIterations === "number" ? Math.floor(Math.random() * (maximumIterations - iterations + 1) + iterations) : iterations;
        } else {
            targetIterationCount = null;
        }
    };
};

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = {"O_RDONLY":0,"O_WRONLY":1,"O_RDWR":2,"S_IFMT":61440,"S_IFREG":32768,"S_IFDIR":16384,"S_IFCHR":8192,"S_IFBLK":24576,"S_IFIFO":4096,"S_IFLNK":40960,"S_IFSOCK":49152,"O_CREAT":512,"O_EXCL":2048,"O_NOCTTY":131072,"O_TRUNC":1024,"O_APPEND":8,"O_DIRECTORY":1048576,"O_NOFOLLOW":256,"O_SYNC":128,"O_SYMLINK":2097152,"O_NONBLOCK":4,"S_IRWXU":448,"S_IRUSR":256,"S_IWUSR":128,"S_IXUSR":64,"S_IRWXG":56,"S_IRGRP":32,"S_IWGRP":16,"S_IXGRP":8,"S_IRWXO":7,"S_IROTH":4,"S_IWOTH":2,"S_IXOTH":1,"E2BIG":7,"EACCES":13,"EADDRINUSE":48,"EADDRNOTAVAIL":49,"EAFNOSUPPORT":47,"EAGAIN":35,"EALREADY":37,"EBADF":9,"EBADMSG":94,"EBUSY":16,"ECANCELED":89,"ECHILD":10,"ECONNABORTED":53,"ECONNREFUSED":61,"ECONNRESET":54,"EDEADLK":11,"EDESTADDRREQ":39,"EDOM":33,"EDQUOT":69,"EEXIST":17,"EFAULT":14,"EFBIG":27,"EHOSTUNREACH":65,"EIDRM":90,"EILSEQ":92,"EINPROGRESS":36,"EINTR":4,"EINVAL":22,"EIO":5,"EISCONN":56,"EISDIR":21,"ELOOP":62,"EMFILE":24,"EMLINK":31,"EMSGSIZE":40,"EMULTIHOP":95,"ENAMETOOLONG":63,"ENETDOWN":50,"ENETRESET":52,"ENETUNREACH":51,"ENFILE":23,"ENOBUFS":55,"ENODATA":96,"ENODEV":19,"ENOENT":2,"ENOEXEC":8,"ENOLCK":77,"ENOLINK":97,"ENOMEM":12,"ENOMSG":91,"ENOPROTOOPT":42,"ENOSPC":28,"ENOSR":98,"ENOSTR":99,"ENOSYS":78,"ENOTCONN":57,"ENOTDIR":20,"ENOTEMPTY":66,"ENOTSOCK":38,"ENOTSUP":45,"ENOTTY":25,"ENXIO":6,"EOPNOTSUPP":102,"EOVERFLOW":84,"EPERM":1,"EPIPE":32,"EPROTO":100,"EPROTONOSUPPORT":43,"EPROTOTYPE":41,"ERANGE":34,"EROFS":30,"ESPIPE":29,"ESRCH":3,"ESTALE":70,"ETIME":101,"ETIMEDOUT":60,"ETXTBSY":26,"EWOULDBLOCK":35,"EXDEV":18,"SIGHUP":1,"SIGINT":2,"SIGQUIT":3,"SIGILL":4,"SIGTRAP":5,"SIGABRT":6,"SIGIOT":6,"SIGBUS":10,"SIGFPE":8,"SIGKILL":9,"SIGUSR1":30,"SIGSEGV":11,"SIGUSR2":31,"SIGPIPE":13,"SIGALRM":14,"SIGTERM":15,"SIGCHLD":20,"SIGCONT":19,"SIGSTOP":17,"SIGTSTP":18,"SIGTTIN":21,"SIGTTOU":22,"SIGURG":16,"SIGXCPU":24,"SIGXFSZ":25,"SIGVTALRM":26,"SIGPROF":27,"SIGWINCH":28,"SIGIO":23,"SIGSYS":12,"SSL_OP_ALL":2147486719,"SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION":262144,"SSL_OP_CIPHER_SERVER_PREFERENCE":4194304,"SSL_OP_CISCO_ANYCONNECT":32768,"SSL_OP_COOKIE_EXCHANGE":8192,"SSL_OP_CRYPTOPRO_TLSEXT_BUG":2147483648,"SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS":2048,"SSL_OP_EPHEMERAL_RSA":0,"SSL_OP_LEGACY_SERVER_CONNECT":4,"SSL_OP_MICROSOFT_BIG_SSLV3_BUFFER":32,"SSL_OP_MICROSOFT_SESS_ID_BUG":1,"SSL_OP_MSIE_SSLV2_RSA_PADDING":0,"SSL_OP_NETSCAPE_CA_DN_BUG":536870912,"SSL_OP_NETSCAPE_CHALLENGE_BUG":2,"SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG":1073741824,"SSL_OP_NETSCAPE_REUSE_CIPHER_CHANGE_BUG":8,"SSL_OP_NO_COMPRESSION":131072,"SSL_OP_NO_QUERY_MTU":4096,"SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION":65536,"SSL_OP_NO_SSLv2":16777216,"SSL_OP_NO_SSLv3":33554432,"SSL_OP_NO_TICKET":16384,"SSL_OP_NO_TLSv1":67108864,"SSL_OP_NO_TLSv1_1":268435456,"SSL_OP_NO_TLSv1_2":134217728,"SSL_OP_PKCS1_CHECK_1":0,"SSL_OP_PKCS1_CHECK_2":0,"SSL_OP_SINGLE_DH_USE":1048576,"SSL_OP_SINGLE_ECDH_USE":524288,"SSL_OP_SSLEAY_080_CLIENT_DH_BUG":128,"SSL_OP_SSLREF2_REUSE_CERT_TYPE_BUG":0,"SSL_OP_TLS_BLOCK_PADDING_BUG":512,"SSL_OP_TLS_D5_BUG":256,"SSL_OP_TLS_ROLLBACK_BUG":8388608,"ENGINE_METHOD_DSA":2,"ENGINE_METHOD_DH":4,"ENGINE_METHOD_RAND":8,"ENGINE_METHOD_ECDH":16,"ENGINE_METHOD_ECDSA":32,"ENGINE_METHOD_CIPHERS":64,"ENGINE_METHOD_DIGESTS":128,"ENGINE_METHOD_STORE":256,"ENGINE_METHOD_PKEY_METHS":512,"ENGINE_METHOD_PKEY_ASN1_METHS":1024,"ENGINE_METHOD_ALL":65535,"ENGINE_METHOD_NONE":0,"DH_CHECK_P_NOT_SAFE_PRIME":2,"DH_CHECK_P_NOT_PRIME":1,"DH_UNABLE_TO_CHECK_GENERATOR":4,"DH_NOT_SUITABLE_GENERATOR":8,"NPN_ENABLED":1,"RSA_PKCS1_PADDING":1,"RSA_SSLV23_PADDING":2,"RSA_NO_PADDING":3,"RSA_PKCS1_OAEP_PADDING":4,"RSA_X931_PADDING":5,"RSA_PKCS1_PSS_PADDING":6,"POINT_CONVERSION_COMPRESSED":2,"POINT_CONVERSION_UNCOMPRESSED":4,"POINT_CONVERSION_HYBRID":6,"F_OK":0,"R_OK":4,"W_OK":2,"X_OK":1,"UV_UDP_REUSEADDR":4}

/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Root;
/**
 * A Root node.
 * The root node will have a single child.
 * @param uid The unique node id.
 * @param guard The node guard.
 * @param child The child node. 
 */
function Root(uid, guard, child) {
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

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (state === Mistreevous.State.SUCCEEDED || state === Mistreevous.State.FAILED) {
            // We have not changed state.
            return false;
        }

        // If a guard has been defined for the node, this node will move into the FAILED state if it is not satisfied.
        if (guard && !guard.isSatisfied(board)) {
            // The guard is not satisfied and therefore we are finished with the node.
            state = Mistreevous.State.FAILED;

            // The node has moved to the FAILED state.
            return true;
        }

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
     * Gets the guard of the node.
     */
    this.getGuard = () => guard;

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
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Selector;
/**
 * A SELECTOR node.
 * The child nodes are executed in sequence until one succeeds or all fail.
 * @param uid The unique node id.
 * @param guard The node guard.
 * @param children The child nodes.
 */
function Selector(uid, guard, children) {
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

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (state === Mistreevous.State.SUCCEEDED || state === Mistreevous.State.FAILED) {
            // We have not changed state.
            return false;
        }

        // Iterate over all of the children of this node.
        for (const child of children) {
            // If a guard has been defined for the node, this node will move into the FAILED state if it is not satisfied.
            // The guard is checked once per child pre-update in order to better respond to changes of state between child updates.
            if (guard && !guard.isSatisfied(board)) {
                // The guard is not satisfied and therefore we are finished with the node.
                state = Mistreevous.State.FAILED;

                // The node has moved to the FAILED state.
                return true;
            }

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
     * Gets the guard of the node.
     */
    this.getGuard = () => guard;

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
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Sequence;
/**
 * A SEQUENCE node.
 * The child nodes are executed in sequence until one fails or all succeed.
 * @param uid The unique node id.
 * @param guard The node guard.
 * @param children The child nodes. 
 */
function Sequence(uid, guard, children) {
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

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (state === Mistreevous.State.SUCCEEDED || state === Mistreevous.State.FAILED) {
            // We have not changed state.
            return false;
        }

        // Iterate over all of the children of this node.
        for (const child of children) {
            // If a guard has been defined for the node, this node will move into the FAILED state if it is not satisfied.
            // The guard is checked once per child pre-update in order to better respond to changes of state between child updates.
            if (guard && !guard.isSatisfied(board)) {
                // The guard is not satisfied and therefore we are finished with the node.
                state = Mistreevous.State.FAILED;

                // The node has moved to the FAILED state.
                return true;
            }

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
     * Gets the guard of the node.
     */
    this.getGuard = () => guard;

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
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Wait;
/**
 * A WAIT node.
 * The state of this node will change to SUCCEEDED after a duration of time.
 * @param uid The unique node id.
 * @param guard The node guard.
 * @param duration The duration that this node will wait to succeed in milliseconds, or the earliest if longestDuration is defined.
 * @param longestDuration The longest possible duration in milliseconds that this node will wait to succeed.
 */
function Wait(uid, guard, duration, longestDuration) {
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

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (state === Mistreevous.State.SUCCEEDED || state === Mistreevous.State.FAILED) {
            // We have not changed state.
            return false;
        }

        // If a guard has been defined for the node, this node will move into the FAILED state if it is not satisfied.
        if (guard && !guard.isSatisfied(board)) {
            // The guard is not satisfied and therefore we are finished with the node.
            state = Mistreevous.State.FAILED;

            // The node has moved to the FAILED state.
            return true;
        }

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
     * Gets the guard of the node.
     */
    this.getGuard = () => guard;

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
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = While;
/**
 * A WHILE guard which is satisfied as long as the given condition remains true.
 * @param condition The name of the condition function that determines whether the guard is satisfied.
 */
function While(condition) {

    /**
     * Gets the type of the guard.
     */
    this.getType = () => "while";

    /**
     * Gets the condition of the guard.
     */
    this.getCondition = () => condition;

    /**
     * Gets whether the guard is satisfied.
     * @param board The board.
     * @returns Whether the guard is satisfied.
     */
    this.isSatisfied = board => {
        // Call the condition function to determine whether this guard is satisfied.
        if (typeof board[condition] === "function") {
            return !!board[condition]();
        } else {
            throw `cannot evaluate node guard as function '${condition}' is not defined in the blackboard`;
        }
    };
};

/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Until;
/**
 * An UNTIL guard which is satisfied as long as the given condition remains false.
 * @param condition The name of the condition function that determines whether the guard is satisfied.
 */
function Until(condition) {

    /**
     * Gets the type of the guard.
     */
    this.getType = () => "until";

    /**
     * Gets the condition of the guard.
     */
    this.getCondition = () => condition;

    /**
     * Gets whether the guard is satisfied.
     * @param board The board.
     * @returns Whether the guard is satisfied.
     */
    this.isSatisfied = board => {
        // Call the condition function to determine whether this guard is satisfied.
        if (typeof board[condition] === "function") {
            return !!!board[condition]();
        } else {
            throw `cannot evaluate node guard as function '${condition}' is not defined in the blackboard`;
        }
    };
};

/***/ }),
/* 15 */
/***/ (function(module, exports) {

/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {/* globals __webpack_amd_options__ */
module.exports = __webpack_amd_options__;

/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ })
/******/ ]);