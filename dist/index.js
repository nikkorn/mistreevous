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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Composite;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__node__ = __webpack_require__(2);


/**
 * A composite node that wraps child nodes.
 * @param uid The unique node id.
 * @param type The node type.
 * @param guard The node guard.
 * @param children The child nodes. 
 */
function Composite(uid, type, guard, children) {
    __WEBPACK_IMPORTED_MODULE_0__node__["a" /* default */].call(this, uid, type, guard);

    /**
     * Gets whether this node is a leaf node.
     */
    this.isLeafNode = () => false;

    /**
     * Gets the children of this node.
     */
    this.getChildren = () => children;

    /**
     * Reset the state of the node.
     * @param isAbort Whether the reset is part of an abort.
     */
    this.reset = isAbort => {
        // Reset the state of this node.
        this.setState(Mistreevous.State.READY);

        // Reset the state of any child nodes.
        this.getChildren().forEach(child => child.reset(isAbort));
    };
};

Composite.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__node__["a" /* default */].prototype);

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Leaf;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__node__ = __webpack_require__(2);


/**
 * A leaf node.
 * @param uid The unique node id.
 * @param type The node type.
 * @param guard The node guard.
 */
function Leaf(uid, type, guard) {
  __WEBPACK_IMPORTED_MODULE_0__node__["a" /* default */].call(this, uid, type, guard);

  /**
   * The guard path to evaluate as part of a node update.
   */
  let guardPath;

  /**
   * Gets/Sets the guard path to evaluate as part of a node update.
   */
  this.getGuardPath = () => guardPath;
  this.setGuardPath = value => guardPath = value;

  /**
   * Gets whether this node is a leaf node.
   */
  this.isLeafNode = () => true;
};

Leaf.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__node__["a" /* default */].prototype);

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Node;
/**
 * A base node.
 * @param uid The unique node id.
 * @param type The node type.
 * @param guard The node guard.
 */
function Node(uid, type, guard) {
  /**
   * The node state.
   */
  let state = Mistreevous.State.READY;

  /**
   * Gets/Sets the state of the node.
   */
  this.getState = () => state;
  this.setState = value => state = value;

  /**
   * Gets the unique id of the node.
   */
  this.getUid = () => uid;

  /**
   * Gets the type of the node.
   */
  this.getType = () => type;

  /**
   * Gets the guard of the node.
   */
  this.getGuard = () => guard;

  /**
   * Gets whether this node is in the specified state.
   * @param value The value to compare to the node state.
   */
  this.is = value => {
    return state === value;
  };

  /**
   * Reset the state of the node.
   * @param isAbort Whether the reset is part of an abort.
   */
  this.reset = isAbort => {
    // Reset the state of this node.
    this.setState(Mistreevous.State.READY);
  };
};

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* WEBPACK VAR INJECTION */(function(module) {/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__behaviourtree__ = __webpack_require__(5);


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
    if (typeof define === 'function' && __webpack_require__(17)) {
        define([], function () {
            return Mistreevous;
        });
    } else {
        window.Mistreevous = Mistreevous;
    }
}
/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(4)(module)))

/***/ }),
/* 4 */
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
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = BehaviourTree;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__nodes_action__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__nodes_condition__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__nodes_flip__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__nodes_lotto__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__nodes_repeat__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__nodes_root__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__nodes_selector__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__nodes_sequence__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__nodes_wait__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__guards_while__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__guards_until__ = __webpack_require__(16);












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

            // TODO Get all leaf nodes of the tree as well as an array of nodes (and their guards) on the way to it.
            // TODO Set a NodeGuardPath (to be made) on every leaf not ofr it to evaluate as part of its update.
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

            // Find each child of the node if it is not a leaf node..
            if (!node.isLeafNode()) {
                node.getChildren().forEach(child => findNestedNodes(child, depth + 1, nodeScopeId));
            }
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
 * Get flattened details of every node in the tree.
 * @returns The flattened details of every node in the tree.
 */
BehaviourTree.prototype.getFlattenedNodeDetails = function () {
    // Create an empty flattened array of tree nodes.
    const flattenedTreeNodes = [];

    /**
     * Helper function to process a node instance and push details into the flattened tree nodes array.
     * @param node The current node.
     * @param parentUid The UID of the node parent, or null if the node is the main root node.
     */
    const processNode = (node, parentUid) => {

        /**
         * Helper function to get details for a node guard.
         * @param guard The node guard.
         * @returns The details for a guard node.
         */
        const getGuardDetails = guard => {
            return {
                type: guard.getType(),
                condition: guard.getCondition()
            };
        };

        // Push the current node into the flattened nodes array.
        flattenedTreeNodes.push({
            id: node.getUid(),
            type: node.getType(),
            caption: node.getName(),
            state: node.getState(),
            guard: node.getGuard() ? getGuardDetails(node.getGuard()) : null,
            parentId: parentUid
        });

        // Process each of the nodes children if it is not a leaf node.
        if (!node.isLeafNode()) {
            node.getChildren().forEach(child => processNode(child, node.getUid()));
        }
    };

    // Convert the nested node structure into a flattened array of node details.
    processNode(this._rootNode, null);

    return flattenedTreeNodes;
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
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Action;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__leaf__ = __webpack_require__(1);


/**
 * An Action leaf node.
 * This represents an immediate or ongoing state of behaviour.
 * @param uid The unique node id.
 * @param actionName The action name.
 */
function Action(uid, actionName) {
    __WEBPACK_IMPORTED_MODULE_0__leaf__["a" /* default */].call(this, uid, "action", null);

    /**
     * The onFinish action function, if one was defined.
     */
    let onFinish;

    /**
     * Update the node.
     * @param board The board.
     * @returns The result of the update.
     */
    this.update = function (board) {
        // Get the pre-update node state.
        const initialState = this.getState();

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (this.is(Mistreevous.State.SUCCEEDED) || this.is(Mistreevous.State.FAILED)) {
            // We have not changed state.
            return { hasStateChanged: false };
        }

        // Get a reference to the onFinish action function if it exists so that we can call it outside of an update.
        if (this.is(Mistreevous.State.READY) && typeof action === "object" && typeof action.onFinish === "function") {
            onFinish = action.onFinish;
        }

        // Evaluate all of the guard path conditions for the current tree path and return result if any guard conditions fail.
        const guardPathEvaluationResult = this.getGuardPath().evaluate(board);
        if (guardPathEvaluationResult.hasFailedCondition) {
            // We have not changed state, but a node guard condition has failed.
            return {
                hasStateChanged: false,
                failedGuardNode: guardPathEvaluationResult.node
            };
        }

        // Get the corresponding action object or function.
        const action = board[actionName];

        // Validate the action.
        this._validateAction(action);

        // If the state of this node is 'READY' then this is the first time that we are updating this node, so call onStart if it exists.
        if (this.is(Mistreevous.State.READY) && typeof action === "object" && typeof action.onStart === "function") {
            action.onStart();
        }

        // Call the action 'onUpdate' function, the result of which will be the new state of this action node, or 'RUNNING' if undefined.
        const updateResult = typeof action === "function" ? action() : action.onUpdate();

        // Validate the returned value.
        this._validateUpdateResult(updateResult);

        // Set the state of this node, this may be undefined, which just means that the node is still in the 'RUNNING' state.
        this.setState(updateResult || Mistreevous.State.RUNNING);

        // If the new action node state is either 'SUCCEEDED' or 'FAILED' then we are finished, so call onFinish if it exists.
        if ((this.is(Mistreevous.State.SUCCEEDED) || this.is(Mistreevous.State.FAILED)) && onFinish) {
            onFinish({ succeeded: this.is(Mistreevous.State.SUCCEEDED), aborted: false });
        }

        // Return whether the state of this node has changed.
        return { hasStateChanged: this.getState() !== initialState };
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => actionName;

    /**
     * Reset the state of the node.
     * @param isAbort Whether the reset is part of an abort.
     */
    this.reset = isAbort => {
        // If the reset is due to an abort, and this node is running, call onFinish() if it is defined.
        if (isAbort && state === Mistreevous.State.RUNNING && onFinish) {
            onFinish({ succeeded: false, aborted: true });
        }

        // Reset the state of this node.
        this.setState(Mistreevous.State.READY);
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

Action.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__leaf__["a" /* default */].prototype);

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Condition;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__leaf__ = __webpack_require__(1);


/**
 * A Condition leaf node.
 * This will succeed or fail immediately based on a board predicate, without moving to the 'RUNNING' state.
 * @param uid The unique node id.
 * @param condition The name of the condition function. 
 */
function Condition(uid, condition) {
    __WEBPACK_IMPORTED_MODULE_0__leaf__["a" /* default */].call(this, uid, "condition", null);

    /**
     * Update the node.
     * @param board The board.
     * @returns The result of the update.
     */
    this.update = function (board) {
        // Get the pre-update node state.
        const initialState = this.getState();

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (this.is(Mistreevous.State.SUCCEEDED) || this.is(state === Mistreevous.State.FAILED)) {
            // We have not changed state.
            return { hasStateChanged: false };
        }

        // Evaluate all of the guard path conditions for the current tree path and return result if any guard conditions fail.
        const guardPathEvaluationResult = this.getGuardPath().evaluate(board);
        if (guardPathEvaluationResult.hasFailedCondition) {
            // We have not changed state, but a node guard condition has failed.
            return {
                hasStateChanged: false,
                failedGuardNode: guardPathEvaluationResult.node
            };
        }

        // Call the condition function to determine the state of this node, but it must exist in the blackboard.
        if (typeof board[condition] === "function") {
            this.setState(!!board[condition]() ? Mistreevous.State.SUCCEEDED : Mistreevous.State.FAILED);
        } else {
            throw `cannot update condition node as function '${condition}' is not defined in the blackboard`;
        }

        // Return whether the state of this node has changed.
        return { hasStateChanged: this.getState() !== initialState };
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => condition;
};

Condition.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__leaf__["a" /* default */].prototype);

/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Flip;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__composite__ = __webpack_require__(0);


/**
 * A Flip node.
 * This node wraps a single child and will flip the state of the child state.
 * @param uid The unique node id.
 * @param guard The node guard.
 * @param child The child node. 
 */
function Flip(uid, guard, child) {
    __WEBPACK_IMPORTED_MODULE_0__composite__["a" /* default */].call(this, uid, "flip", guard, [child]);

    /**
     * Update the node.
     * @param board The board.
     * @returns The result of the update.
     */
    this.update = function (board) {
        // Get the pre-update node state.
        const initialState = this.getState();

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (this.is(Mistreevous.State.SUCCEEDED) || this.is(Mistreevous.State.FAILED)) {
            // We have not changed state.
            return { hasStateChanged: false };
        }

        // If the child has never been updated or is running then we will need to update it now.
        if (child.getState() === Mistreevous.State.READY || child.getState() === Mistreevous.State.RUNNING) {
            // Update the child of this node and get the result.
            const updateResult = child.update(board);

            // Check to see whether a node guard condition failed during the child node update.
            if (updateResult.failedGuardNode) {
                // Is this node the one with the failed guard condition?
                if (updateResult.failedGuardNode === this) {
                    // We need to reset this node, passing a flag to say that this is an abort.
                    this.reset(true);

                    // The guard condition for this node did not pass, so this node will move into the FAILED state.
                    this.setState(Mistreevous.State.FAILED);

                    // Return whether the state of this node has changed.
                    return { hasStateChanged: true };
                } else {
                    // A node guard condition has failed higher up the tree.
                    return {
                        hasStateChanged: false,
                        failedGuardNode: guardScopeEvaluationResult.node
                    };
                }
            }
        }

        // The state of this node will depend in the state of its child.
        switch (child.getState()) {
            case Mistreevous.State.RUNNING:
                this.setState(Mistreevous.State.RUNNING);
                break;

            case Mistreevous.State.SUCCEEDED:
                this.setState(Mistreevous.State.FAILED);
                break;

            case Mistreevous.State.FAILED:
                this.setState(Mistreevous.State.SUCCEEDED);
                break;

            default:
                this.setState(Mistreevous.State.READY);
        }

        // Return whether the state of this node has changed.
        return { hasStateChanged: this.getState() !== initialState };
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => "FLIP";
};

Flip.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__composite__["a" /* default */].prototype);

/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Lotto;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__composite__ = __webpack_require__(0);


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
    __WEBPACK_IMPORTED_MODULE_0__composite__["a" /* default */].call(this, uid, "lotto", guard, children);

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
        const initialState = this.getState();

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (this.is(Mistreevous.State.SUCCEEDED) || this.is(Mistreevous.State.FAILED)) {
            // We have not changed state.
            return { hasStateChanged: false };
        }

        // If this node is in the READY state then we need to pick a winning child node.
        if (this.is(Mistreevous.State.READY)) {
            // Create a lotto draw.
            const lottoDraw = new LottoDraw();

            // Add each child of this node to a lotto draw, with each child's corresponding ticket weighting, or a single ticket if not defined.
            children.forEach((child, index) => lottoDraw.add(child, tickets[index] || 1));

            // Randomly pick a child based on ticket weighting.
            winningChild = lottoDraw.draw();
        }

        // If the winning child has never been updated or is running then we will need to update it now.
        if (winningChild.getState() === Mistreevous.State.READY || winningChild.getState() === Mistreevous.State.RUNNING) {
            // Update the child of this node and get the result.
            const updateResult = child.update(board);

            // Check to see whether a node guard condition failed during the child node update.
            if (updateResult.failedGuardNode) {
                // Is this node the one with the failed guard condition?
                if (updateResult.failedGuardNode === this) {
                    // We need to reset this node, passing a flag to say that this is an abort.
                    this.reset(true);

                    // The guard condition for this node did not pass, so this node will move into the FAILED state.
                    this.setState(Mistreevous.State.FAILED);

                    // Return whether the state of this node has changed.
                    return { hasStateChanged: true };
                } else {
                    // A node guard condition has failed higher up the tree.
                    return {
                        hasStateChanged: false,
                        failedGuardNode: guardScopeEvaluationResult.node
                    };
                }
            }
        }

        // The state of the lotto node is the state of its winning child.
        this.setState(winningChild.getState());

        // Return whether the state of this node has changed.
        return { hasStateChanged: this.getState() !== initialState };
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => tickets.length ? `LOTTO [${tickets.join(",")}]` : "LOTTO";
};

Lotto.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__composite__["a" /* default */].prototype);

/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Repeat;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__composite__ = __webpack_require__(0);


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
    __WEBPACK_IMPORTED_MODULE_0__composite__["a" /* default */].call(this, uid, "repeat", guard, [child]);

    /**
     * The number of target iterations to make.
     */
    let targetIterationCount = null;

    /**
     * The current iteration count.
     */
    let currentIterationCount = 0;

    /**
     * Update the node.
     * @param board The board.
     * @returns The result of the update.
     */
    this.update = function (board) {
        // Get the pre-update node state.
        const initialState = this.getState();

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (this.is(Mistreevous.State.SUCCEEDED) || this.is(Mistreevous.State.FAILED)) {
            // We have not changed state.
            return { hasStateChanged: false };
        }

        // If this node is in the READY state then we need to reset the child and the target iteration count.
        if (this.is(Mistreevous.State.READY)) {
            // Reset the child node.
            child.reset();

            // Set the target iteration count.
            this._setTargetIterationCount();
        }

        // Do a check to see if we can iterate. If we can then this node will move into the 'RUNNING' state.
        // If we cannot iterate then we have hit our target iteration count, which means that the node has succeeded.
        if (this._canIterate()) {
            // This node is in the running state and can do its initial iteration.
            this.setState(Mistreevous.State.RUNNING);

            // We may have already completed an iteration, meaning that the child node will be in the SUCCEEDED state.
            // If this is the case then we will have to reset the child node now.
            if (child.getState() === Mistreevous.State.SUCCEEDED) {
                child.reset();
            }

            // Update the child of this node and get the result.
            const updateResult = child.update(board);

            // Check to see whether a node guard condition failed during the child node update.
            if (updateResult.failedGuardNode) {
                // Is this node the one with the failed guard condition?
                if (updateResult.failedGuardNode === this) {
                    // We need to reset this node, passing a flag to say that this is an abort.
                    this.reset(true);

                    // The guard condition for this node did not pass, so this node will move into the FAILED state.
                    this.setState(Mistreevous.State.FAILED);

                    // Return whether the state of this node has changed.
                    return { hasStateChanged: true };
                } else {
                    // A node guard condition has failed higher up the tree.
                    return {
                        hasStateChanged: false,
                        failedGuardNode: guardScopeEvaluationResult.node
                    };
                }
            }

            // If the child moved into the FAILED state when we updated it then there is nothing left to do and this node has also failed.
            // If it has moved into the SUCCEEDED state then we have completed the current iteration.
            if (child.getState() === Mistreevous.State.FAILED) {
                // The child has failed, meaning that this node has failed.
                this.setState(Mistreevous.State.FAILED);

                // Return whether the state of this node has changed.
                return { hasStateChanged: state !== initialState };
            } else if (child.getState() === Mistreevous.State.SUCCEEDED) {
                // We have completed an iteration.
                currentIterationCount += 1;
            }
        } else {
            // This node is in the 'SUCCEEDED' state as we cannot iterate any more.
            this.setState(Mistreevous.State.SUCCEEDED);
        }

        // Return whether the state of this node has changed.
        return { hasStateChanged: this.getState() !== initialState };
    };

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
     * Reset the state of the node.
     * @param isAbort Whether the reset is part of an abort.
     */
    this.reset = isAbort => {
        // Reset the state of this node.
        this.setState(Mistreevous.State.READY);

        // Reset the current iteration count.
        currentIterationCount = 0;

        // Reset the child node.
        child.reset(isAbort);
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

Repeat.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__composite__["a" /* default */].prototype);

/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Root;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__composite__ = __webpack_require__(0);


/**
 * A Root node.
 * The root node will have a single child.
 * @param uid The unique node id.
 * @param guard The node guard.
 * @param child The child node. 
 */
function Root(uid, guard, child) {
    __WEBPACK_IMPORTED_MODULE_0__composite__["a" /* default */].call(this, uid, "root", guard, [child]);

    /**
     * Update the node and get whether the node state has changed.
     * @param board The board.
     * @returns Whether the state of this node has changed as part of the update.
     */
    this.update = function (board) {
        // Get the pre-update node state.
        const initialState = this.getState();

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (this.is(Mistreevous.State.SUCCEEDED) || this.is(Mistreevous.State.FAILED)) {
            // We have not changed state.
            return { hasStateChanged: false };
        }

        // If the child has never been updated or is running then we will need to update it now.
        if (child.getState() === Mistreevous.State.READY || child.getState() === Mistreevous.State.RUNNING) {
            // Update the child of this node and get the result.
            const updateResult = child.update(board);

            // Check to see whether a node guard condition failed during the child node update.
            if (updateResult.failedGuardNode) {
                // Is this node the one with the failed guard condition?
                if (updateResult.failedGuardNode === this) {
                    // We need to reset this node, passing a flag to say that this is an abort.
                    this.reset(true);

                    // The guard condition for this node did not pass, so this node will move into the FAILED state.
                    this.setState(Mistreevous.State.FAILED);

                    // Return whether the state of this node has changed.
                    return { hasStateChanged: true };
                } else {
                    // As this is the tree root node, it should not be possible for the failed guard node not to have handle the failed condition by now.
                    throw "Guard condition failed but no node was found to handle it";
                }
            }
        }

        // The state of the root node is the state of its child.
        this.setState(child.getState());

        // Return whether the state of this node has changed.
        return { hasStateChanged: this.getState() !== initialState };
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => "ROOT";
};

Root.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__composite__["a" /* default */].prototype);

/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Selector;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__composite__ = __webpack_require__(0);


/**
 * A SELECTOR node.
 * The child nodes are executed in sequence until one succeeds or all fail.
 * @param uid The unique node id.
 * @param guard The node guard.
 * @param children The child nodes.
 */
function Selector(uid, guard, children) {
    __WEBPACK_IMPORTED_MODULE_0__composite__["a" /* default */].call(this, uid, "selector", guard, children);

    /**
     * Update the node and get whether the node state has changed.
     * @param board The board.
     * @returns Whether the state of this node has changed as part of the update.
     */
    this.update = function (board) {
        // Get the pre-update node state.
        const initialState = this.getState();

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (this.is(Mistreevous.State.SUCCEEDED) || this.is(Mistreevous.State.FAILED)) {
            // We have not changed state.
            return { hasStateChanged: false };
        }

        // Iterate over all of the children of this node.
        for (const child of children) {
            // If the child has never been updated or is running then we will need to update it now.
            if (child.getState() === Mistreevous.State.READY || child.getState() === Mistreevous.State.RUNNING) {
                // Update the child of this node and get the result.
                const updateResult = child.update(board);

                // Check to see whether a node guard condition failed during the child node update.
                if (updateResult.failedGuardNode) {
                    // Is this node the one with the failed guard condition?
                    if (updateResult.failedGuardNode === this) {
                        // We need to reset this node, passing a flag to say that this is an abort.
                        this.reset(true);

                        // The guard condition for this node did not pass, so this node will move into the FAILED state.
                        this.setState(Mistreevous.State.FAILED);

                        // Return whether the state of this node has changed.
                        return { hasStateChanged: true };
                    } else {
                        // A node guard condition has failed higher up the tree.
                        return {
                            hasStateChanged: false,
                            failedGuardNode: guardScopeEvaluationResult.node
                        };
                    }
                }
            }

            // If the current child has a state of 'SUCCEEDED' then this node is also a 'SUCCEEDED' node.
            if (child.getState() === Mistreevous.State.SUCCEEDED) {
                // This node is a 'SUCCEEDED' node.
                this.setState(Mistreevous.State.SUCCEEDED);

                // There is no need to check the rest of the selector nodes.
                return { hasStateChanged: this.getState() !== initialState };
            }

            // If the current child has a state of 'FAILED' then we should move on to the next child.
            if (child.getState() === Mistreevous.State.FAILED) {
                // Find out if the current child is the last one in the selector.
                // If it is then this sequence node has also failed.
                if (children.indexOf(child) === children.length - 1) {
                    // This node is a 'FAILED' node.
                    this.setState(Mistreevous.State.FAILED);

                    // There is no need to check the rest of the selector as we have completed it.
                    return { hasStateChanged: this.getState() !== initialState };
                } else {
                    // The child node failed, try the next one.
                    continue;
                }
            }

            // The node should be in the 'RUNNING' state.
            if (child.getState() === Mistreevous.State.RUNNING) {
                // This node is a 'RUNNING' node.
                this.setState(Mistreevous.State.RUNNING);

                // There is no need to check the rest of the selector as the current child is still running.
                return { hasStateChanged: this.getState() !== initialState };
            }

            // The child node was not in an expected state.
            throw "Error: child node was not in an expected state.";
        }
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => "SELECTOR";
};

Selector.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__composite__["a" /* default */].prototype);

/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Sequence;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__composite__ = __webpack_require__(0);


/**
 * A SEQUENCE node.
 * The child nodes are executed in sequence until one fails or all succeed.
 * @param uid The unique node id.
 * @param guard The node guard.
 * @param children The child nodes. 
 */
function Sequence(uid, guard, children) {
    __WEBPACK_IMPORTED_MODULE_0__composite__["a" /* default */].call(this, uid, "sequence", guard, children);

    /**
     * Update the node and get whether the node state has changed.
     * @param board The board.
     * @returns Whether the state of this node has changed as part of the update.
     */
    this.update = function (board) {
        // Get the pre-update node state.
        const initialState = this.getState();

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (this.is(Mistreevous.State.SUCCEEDED) || this.is(Mistreevous.State.FAILED)) {
            // We have not changed state.
            return { hasStateChanged: false };
        }

        // Iterate over all of the children of this node.
        for (const child of children) {
            // If the child has never been updated or is running then we will need to update it now.
            if (child.getState() === Mistreevous.State.READY || child.getState() === Mistreevous.State.RUNNING) {
                // Update the child of this node and get the result.
                const updateResult = child.update(board);

                // Check to see whether a node guard condition failed during the child node update.
                if (updateResult.failedGuardNode) {
                    // Is this node the one with the failed guard condition?
                    if (updateResult.failedGuardNode === this) {
                        // We need to reset this node, passing a flag to say that this is an abort.
                        this.reset(true);

                        // The guard condition for this node did not pass, so this node will move into the FAILED state.
                        this.setState(Mistreevous.State.FAILED);

                        // Return whether the state of this node has changed.
                        return { hasStateChanged: true };
                    } else {
                        // A node guard condition has failed higher up the tree.
                        return {
                            hasStateChanged: false,
                            failedGuardNode: guardScopeEvaluationResult.node
                        };
                    }
                }
            }

            // If the current child has a state of 'SUCCEEDED' then we should move on to the next child.
            if (child.getState() === Mistreevous.State.SUCCEEDED) {
                // Find out if the current child is the last one in the sequence.
                // If it is then this sequence node has also succeeded.
                if (children.indexOf(child) === children.length - 1) {
                    // This node is a 'SUCCEEDED' node.
                    this.setState(Mistreevous.State.SUCCEEDED);

                    // There is no need to check the rest of the sequence as we have completed it.
                    return { hasStateChanged: this.getState() !== initialState };
                } else {
                    // The child node succeeded, but we have not finished the sequence yet.
                    continue;
                }
            }

            // If the current child has a state of 'FAILED' then this node is also a 'FAILED' node.
            if (child.getState() === Mistreevous.State.FAILED) {
                // This node is a 'FAILED' node.
                this.setState(Mistreevous.State.FAILED);

                // There is no need to check the rest of the sequence.
                return { hasStateChanged: this.getState() !== initialState };
            }

            // The node should be in the 'RUNNING' state.
            if (child.getState() === Mistreevous.State.RUNNING) {
                // This node is a 'RUNNING' node.
                this.setState(Mistreevous.State.RUNNING);

                // There is no need to check the rest of the sequence as the current child is still running.
                return { hasStateChanged: this.getState() !== initialState };
            }

            // The child node was not in an expected state.
            throw "Error: child node was not in an expected state.";
        }
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => "SEQUENCE";
};

Sequence.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__composite__["a" /* default */].prototype);

/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Wait;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__leaf__ = __webpack_require__(1);


/**
 * A WAIT node.
 * The state of this node will change to SUCCEEDED after a duration of time.
 * @param uid The unique node id.
 * @param guard The node guard.
 * @param duration The duration that this node will wait to succeed in milliseconds, or the earliest if longestDuration is defined.
 * @param longestDuration The longest possible duration in milliseconds that this node will wait to succeed.
 */
function Wait(uid, guard, duration, longestDuration) {
    __WEBPACK_IMPORTED_MODULE_0__leaf__["a" /* default */].call(this, uid, "wait", guard);

    /** 
     * The time in milliseconds at which this node was first updated.
     */
    let initialUpdateTime;

    /**
     * The duration in milliseconds that this node will be waiting for. 
     */
    let waitDuration;

    /**
     * Update the node.
     * @param board The board.
     * @returns The result of the update.
     */
    this.update = function (board) {
        // Get the pre-update node state.
        const initialState = this.getState();

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (this.is(Mistreevous.State.SUCCEEDED) || this.is(Mistreevous.State.FAILED)) {
            // We have not changed state.
            return { hasStateChanged: false };
        }

        // Evaluate guard path and return result if any guard conditions fail.
        const guardPathEvaluationResult = this.getGuardPath().evaluate(board);
        if (guardPathEvaluationResult.hasFailedCondition) {
            // Is this node the one with the failed guard condition?
            if (guardPathEvaluationResult.node === this) {
                // The guard condition for this node did not pass, so this node will move into the FAILED state.
                state = Mistreevous.State.FAILED;

                // Return whether the state of this node has changed.
                return { hasStateChanged: true };
            } else {
                // A node guard condition has failed higher up the tree.
                return {
                    hasStateChanged: false,
                    failedGuardNode: guardPathEvaluationResult.node
                };
            }
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
        return { hasStateChanged: this.getState() !== initialState };
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => `WAIT ${longestDuration ? duration + "ms-" + longestDuration + "ms" : duration + "ms"}`;
};

Wait.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__leaf__["a" /* default */].prototype);

/***/ }),
/* 15 */
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
/* 16 */
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
/* 17 */
/***/ (function(module, exports) {

/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {/* globals __webpack_amd_options__ */
module.exports = __webpack_amd_options__;

/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ })
/******/ ]);