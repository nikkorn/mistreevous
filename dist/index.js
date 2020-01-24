(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Mistreevous"] = factory();
	else
		root["Mistreevous"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
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
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return State; });
/**
 * Enumeration of node states.
 */
const State = {
    READY: Symbol("mistreevous.ready"),
    RUNNING: Symbol("mistreevous.running"),
    SUCCEEDED: Symbol("mistreevous.succeeded"),
    FAILED: Symbol("mistreevous.failed")
};



/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Composite;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__node__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__state__ = __webpack_require__(0);



/**
 * A composite node that wraps child nodes.
 * @param type The node type.
 * @param decorators The node decorators.
 * @param children The child nodes. 
 */
function Composite(type, decorators, children) {
    __WEBPACK_IMPORTED_MODULE_0__node__["a" /* default */].call(this, type, decorators);

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
     */
    this.reset = () => {
        // Reset the state of this node.
        this.setState(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].READY);

        // Reset the state of any child nodes.
        this.getChildren().forEach(child => child.reset());
    };

    /**
     * Abort the running of this node.
     * @param board The board.
     */
    this.abort = board => {
        // There is nothing to do if this node is not in the running state.
        if (!this.is(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].RUNNING)) {
            return;
        }

        // Abort any child nodes.
        this.getChildren().forEach(child => child.abort(board));

        // Reset the state of this node.
        this.reset();

        // Try to get the exit decorator for this node.
        const exitDecorator = this.getDecorator("exit");

        // Call the exit decorator function if it exists.
        if (exitDecorator) {
            exitDecorator.callBlackboardFunction(board, false, true);
        }
    };
};

Composite.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__node__["a" /* default */].prototype);

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Decorator;
/**
 * A base node decorator.
 * @param type The node decorator type.
 */
function Decorator(type) {

  /**
   * Gets the type of the node.
   */
  this.getType = () => type;

  /**
   * Gets whether the decorator is a guard.
   */
  this.isGuard = () => false;

  /**
   * Gets the decorator details.
   */
  this.getDetails = () => ({ type: this.getType() });
};

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Leaf;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__node__ = __webpack_require__(5);


/**
 * A leaf node.
 * @param type The node type.
 * @param decorators The node decorators.
 */
function Leaf(type, decorators) {
  __WEBPACK_IMPORTED_MODULE_0__node__["a" /* default */].call(this, type, decorators);

  /**
   * Gets whether this node is a leaf node.
   */
  this.isLeafNode = () => true;
};

Leaf.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__node__["a" /* default */].prototype);

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = GuardUnsatisifedException;
/**
 * An exception thrown when evaluating node guard path conditions and a conditions fails.
 * @param source The node at which a guard condition failed. 
 */
function GuardUnsatisifedException(source) {

  /**
   * The exception message.
   */
  this.message = "A guard path condition has failed";

  /**
   * Gets whether the specified node is the node at which a guard condition failed.
   * @param node The node to check against the source node.
   * @returns Whether the specified node is the node at which a guard condition failed.
   */
  this.isSourceNode = node => node === source;
}

GuardUnsatisifedException.prototype = new Error();

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Node;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__decorators_guards_guardUnsatisifedException__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__state__ = __webpack_require__(0);



/**
 * A base node.
 * @param type The node type.
 * @param decorators The node decorators.
 */
function Node(type, decorators) {
  /**
   * The node uid.
   */
  const uid = createNodeUid();
  /**
   * The node state.
   */
  let state = __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].READY;
  /**
   * The guard path to evaluate as part of a node update.
   */
  let guardPath;

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
   * Gets the node decorators.
   */
  this.getDecorators = () => decorators || [];

  /**
   * Gets the node decorator with the specified type, or null if it does not exist.
   */
  this.getDecorator = type => this.getDecorators().filter(decorator => decorator.getType().toUpperCase() === type.toUpperCase())[0] || null;

  /**
   * Gets the node decorators.
   */
  this.getGuardDecorators = () => this.getDecorators().filter(decorator => decorator.isGuard());

  /**
   * Sets the guard path to evaluate as part of a node update.
   */
  this.setGuardPath = value => guardPath = value;

  /**
   * Gets whether a guard path is assigned to this node.
   */
  this.hasGuardPath = () => !!guardPath;

  /**
   * Gets whether this node is in the specified state.
   * @param value The value to compare to the node state.
   */
  this.is = value => {
    return state === value;
  };

  /**
   * Reset the state of the node.
   */
  this.reset = () => {
    // Reset the state of this node.
    this.setState(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].READY);
  };

  /**
   * Abort the running of this node.
   * @param board The board.
   */
  this.abort = board => {
    // There is nothing to do if this node is not in the running state.
    if (!this.is(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].RUNNING)) {
      return;
    }

    // Reset the state of this node.
    this.reset();

    // Try to get the exit decorator for this node.
    const exitDecorator = this.getDecorator("exit");

    // Call the exit decorator function if it exists.
    if (exitDecorator) {
      exitDecorator.callBlackboardFunction(board, false, true);
    }
  };

  /**
   * Update the node.
   * @param board The board.
   * @returns The result of the update.
   */
  this.update = board => {
    // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
    if (this.is(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].SUCCEEDED) || this.is(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].FAILED)) {
      // We have not changed state.
      return {};
    }

    try {
      // Evaluate all of the guard path conditions for the current tree path.
      guardPath.evaluate(board);

      // If this node is in the READY state then call the ENTRY decorator for this node if it exists.
      if (this.is(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].READY)) {
        const entryDecorator = this.getDecorator("entry");

        // Call the entry decorator function if it exists.
        if (entryDecorator) {
          entryDecorator.callBlackboardFunction(board);
        }
      }

      // Try to get the step decorator for this node.
      const stepDecorator = this.getDecorator("step");

      // Call the step decorator function if it exists.
      if (stepDecorator) {
        stepDecorator.callBlackboardFunction(board);
      }

      // Do the actual update.
      this.onUpdate(board);

      // If this node is now in a 'SUCCEEDED' or 'FAILED' state then call the EXIT decorator for this node if it exists.
      if (this.is(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].SUCCEEDED) || this.is(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].FAILED)) {
        const exitDecorator = this.getDecorator("exit");

        // Call the exit decorator function if it exists.
        if (exitDecorator) {
          exitDecorator.callBlackboardFunction(board, this.is(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].SUCCEEDED), false);
        }
      }
    } catch (error) {
      // If the error is a GuardUnsatisfiedException then we need to determine if this node is the source.
      if (error instanceof __WEBPACK_IMPORTED_MODULE_0__decorators_guards_guardUnsatisifedException__["a" /* default */] && error.isSourceNode(this)) {
        // Abort the current node.
        this.abort(board);

        // Any node that is the source of an abort will be a failed node.
        this.setState(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].FAILED);
      } else {
        throw error;
      }
    }
  };
};

/**
 * Create a randomly generated node uid.
 * @returns A randomly generated node uid.
 */
function createNodeUid() {
  var S4 = function () {
    return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
  };
  return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__behaviourtree__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__state__ = __webpack_require__(0);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "BehaviourTree", function() { return __WEBPACK_IMPORTED_MODULE_0__behaviourtree__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "State", function() { return __WEBPACK_IMPORTED_MODULE_1__state__["a"]; });





/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = BehaviourTree;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__decorators_guards_guardPath__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__rootASTNodesBuilder__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__state__ = __webpack_require__(0);




/**
 * The behaviour tree.
 * @param definition The tree definition.
 * @param board The board.
 */
function BehaviourTree(definition, board) {
    /**
     * The blackboard.
     */
    this._blackboard = board;
    /**
     * The main root tree node.
     */
    this._rootNode;

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

        // Convert the definition into an array of raw tokens.
        const tokens = this._parseTokensFromDefinition();

        try {
            // Try to create the behaviour tree AST from tokens, this could fail if the definition is invalid.
            const rootASTNodes = Object(__WEBPACK_IMPORTED_MODULE_1__rootASTNodesBuilder__["a" /* default */])(tokens);

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

            // Set a guard path on every leaf of the tree to evaluate as part of its update.
            this._applyLeafNodeGuardPaths();
        } catch (exception) {
            // There was an issue in trying to parse and build the tree definition.
            throw `TreeParseError: ${exception}`;
        }
    };

    /**
     * Parse the BT tree definition into an array of raw tokens.
     * @returns An array of tokens parsed from the definition.
     */
    this._parseTokensFromDefinition = function () {
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
     * Apply guard paths for every leaf node in the behaviour tree.
     */
    this._applyLeafNodeGuardPaths = function () {
        this._getAllNodePaths().forEach(path => {
            // Each node in the current path will have to be assigned a guard path, working from the root outwards.
            for (let depth = 0; depth < path.length; depth++) {
                // Get the node in the path at the current depth.
                const currentNode = path[depth];

                // The node may already have been assigned a guard path, if so just skip it.
                if (currentNode.hasGuardPath()) {
                    continue;
                }

                // Create the guard path for the current node.
                const guardPath = new __WEBPACK_IMPORTED_MODULE_0__decorators_guards_guardPath__["a" /* default */](path.slice(0, depth + 1).map(node => ({ node, guards: node.getGuardDecorators() })).filter(details => details.guards.length > 0));

                // Assign the guard path to the current node.
                currentNode.setGuardPath(guardPath);
            }
        });
    };

    /**
     * Gets a multi-dimensional array of root->leaf node paths.
     * @returns A multi-dimensional array of root->leaf node paths.
     */
    this._getAllNodePaths = function () {
        const nodePaths = [];

        const findLeafNodes = (path, node) => {
            // Add the current node to the path.
            path = path.concat(node);

            // Check whether the current node is a leaf node. 
            if (node.isLeafNode()) {
                nodePaths.push(path);
            } else {
                node.getChildren().forEach(child => findLeafNodes(path, child));
            }
        };

        // Find all leaf node paths, starting from the root.
        findLeafNodes([], this._rootNode);

        return nodePaths;
    };

    // Call init logic.
    this._init();
}

/**
 * Gets the root node.
 * @returns The root node.
 */
BehaviourTree.prototype.getRootNode = function () {
    return this._rootNode;
};

/**
 * Gets the flattened details of every node in the tree.
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
         * Helper function to get details for all node decorators.
         * @param decorators The node decorators.
         * @returns The decorator details for a node.
         */
        const getDecoratorDetails = decorators => decorators.length > 0 ? decorators.map(decorator => decorator.getDetails()) : null;

        // Push the current node into the flattened nodes array.
        flattenedTreeNodes.push({
            id: node.getUid(),
            type: node.getType(),
            caption: node.getName(),
            state: node.getState(),
            decorators: getDecoratorDetails(node.getDecorators()),
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
 * Gets whether the tree is in the running state.
 * @returns Whether the tree is in the running state.
 */
BehaviourTree.prototype.isRunning = function () {
    return this._rootNode.getState() === __WEBPACK_IMPORTED_MODULE_2__state__["a" /* default */].RUNNING;
};

/**
 * Gets the current tree state.
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
    if (this._rootNode.getState() === __WEBPACK_IMPORTED_MODULE_2__state__["a" /* default */].SUCCEEDED || this._rootNode.getState() === __WEBPACK_IMPORTED_MODULE_2__state__["a" /* default */].FAILED) {
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
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = GuardPath;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__guardUnsatisifedException__ = __webpack_require__(4);


/**
 * Represents a path of node guards along a root-to-leaf tree path.
 * @param nodes An array of objects defining a node instance -> guard link, ordered by node depth.
 */
function GuardPath(nodes) {
    /**
     * Evaluate guard conditions for all guards in the tree path, moving outwards from the root.
     * @param board The blackboard, required for guard evaluation.
     * @returns An evaluation results object.
     */
    this.evaluate = board => {
        // We need to evaluate guard conditions for nodes up the tree, moving outwards from the root.
        for (const details of nodes) {
            // There can be multiple guards per node.
            for (const guard of details.guards) {
                // Check whether the guard condition passes, and throw an exception if not.
                if (!guard.isSatisfied(board)) {
                    throw new __WEBPACK_IMPORTED_MODULE_0__guardUnsatisifedException__["a" /* default */](details.node);
                }
            }
        }
    };
};

/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = buildRootASTNodes;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__nodes_action__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__nodes_condition__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__nodes_flip__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__nodes_lotto__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__nodes_repeat__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__nodes_root__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__nodes_selector__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__nodes_sequence__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__nodes_parallel__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__nodes_wait__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__decorators_guards_while__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__decorators_guards_until__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__decorators_entry__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__decorators_exit__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__decorators_step__ = __webpack_require__(24);
















/**
 * The node decorator factories.
 */
const DecoratorFactories = {
    "WHILE": condition => new __WEBPACK_IMPORTED_MODULE_10__decorators_guards_while__["a" /* default */](condition),
    "UNTIL": condition => new __WEBPACK_IMPORTED_MODULE_11__decorators_guards_until__["a" /* default */](condition),
    "ENTRY": functionName => new __WEBPACK_IMPORTED_MODULE_12__decorators_entry__["a" /* default */](functionName),
    "EXIT": functionName => new __WEBPACK_IMPORTED_MODULE_13__decorators_exit__["a" /* default */](functionName),
    "STEP": functionName => new __WEBPACK_IMPORTED_MODULE_14__decorators_step__["a" /* default */](functionName)
};

/**
 * The AST node factories.
 */
const ASTNodeFactories = {
    "ROOT": () => ({
        type: "root",
        decorators: [],
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
            return new __WEBPACK_IMPORTED_MODULE_5__nodes_root__["a" /* default */](this.decorators, this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice()));
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
        decorators: [],
        children: [],
        validate: function (depth) {
            // A selector node must have at least a single node.
            if (this.children.length < 1) {
                throw "a selector node must have at least a single child";
            }
        },
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
            return new __WEBPACK_IMPORTED_MODULE_6__nodes_selector__["a" /* default */](this.decorators, this.children.map(child => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice())));
        }
    }),
    "SEQUENCE": () => ({
        type: "sequence",
        decorators: [],
        children: [],
        validate: function (depth) {
            // A sequence node must have at least a single node.
            if (this.children.length < 1) {
                throw "a sequence node must have at least a single child";
            }
        },
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
            return new __WEBPACK_IMPORTED_MODULE_7__nodes_sequence__["a" /* default */](this.decorators, this.children.map(child => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice())));
        }
    }),
    "PARALLEL": () => ({
        type: "parallel",
        decorators: [],
        children: [],
        validate: function (depth) {
            // A parallel node must have at least a single node.
            if (this.children.length < 1) {
                throw "a parallel node must have at least a single child";
            }
        },
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
            return new __WEBPACK_IMPORTED_MODULE_8__nodes_parallel__["a" /* default */](this.decorators, this.children.map(child => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice())));
        }
    }),
    "LOTTO": () => ({
        type: "lotto",
        decorators: [],
        children: [],
        tickets: [],
        validate: function (depth) {
            // A lotto node must have at least a single node.
            if (this.children.length < 1) {
                throw "a lotto node must have at least a single child";
            }
        },
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
            return new __WEBPACK_IMPORTED_MODULE_3__nodes_lotto__["a" /* default */](this.decorators, this.tickets, this.children.map(child => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice())));
        }
    }),
    "REPEAT": () => ({
        type: "repeat",
        decorators: [],
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
            return new __WEBPACK_IMPORTED_MODULE_4__nodes_repeat__["a" /* default */](this.decorators, this.iterations, this.maximumIterations, this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice()));
        }
    }),
    "FLIP": () => ({
        type: "flip",
        decorators: [],
        children: [],
        validate: function (depth) {
            // A flip node must have a single node.
            if (this.children.length !== 1) {
                throw "a flip node must have a single child";
            }
        },
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
            return new __WEBPACK_IMPORTED_MODULE_2__nodes_flip__["a" /* default */](this.decorators, this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice()));
        }
    }),
    "CONDITION": () => ({
        type: "condition",
        decorators: [],
        conditionFunction: "",
        validate: function (depth) {},
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
            return new __WEBPACK_IMPORTED_MODULE_1__nodes_condition__["a" /* default */](this.decorators, this.conditionFunction);
        }
    }),
    "WAIT": () => ({
        type: "wait",
        decorators: [],
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
            return new __WEBPACK_IMPORTED_MODULE_9__nodes_wait__["a" /* default */](this.decorators, this.duration, this.longestDuration);
        }
    }),
    "ACTION": () => ({
        type: "action",
        decorators: [],
        actionName: "",
        validate: function (depth) {},
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
            return new __WEBPACK_IMPORTED_MODULE_0__nodes_action__["a" /* default */](this.decorators, this.actionName);
        }
    })
};

/**
* Create an array of root AST nodes based on the remaining tokens.
* @param tokens The remaining tokens.
* @returns The base definition AST nodes.
*/
function buildRootASTNodes(tokens) {
    // There must be at least 3 tokens for the tree definition to be valid. 'ROOT', '{' and '}'.
    if (tokens.length < 3) {
        throw "invalid token count";
    }

    // We should have a matching number of '{' and '}' tokens. If not, then there are scopes that have not been properly closed.
    if (tokens.filter(token => token === "{").length !== tokens.filter(token => token === "}").length) {
        throw "scope character mismatch";
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
                    const rootArguments = getArguments(tokens);

                    // We should have only a single argument that is not an empty string for a root node, which is the root name.
                    if (rootArguments.length === 1 && rootArguments[0] !== "") {
                        // The root  name will be the first and only node argument.
                        node.name = rootArguments[0];
                    } else {
                        throw "expected single root name argument";
                    }
                }

                // Try to pick any decorators off of the token stack.
                node.decorators = getDecorators(tokens);

                popAndCheck(tokens, "{");

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
                const branchArguments = getArguments(tokens);

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

                // Try to pick any decorators off of the token stack.
                node.decorators = getDecorators(tokens);

                popAndCheck(tokens, "{");

                // The new scope is that of the new SELECTOR nodes children.
                stack.push(node.children);
                break;

            case "SEQUENCE":
                // Create a SEQUENCE AST node.
                node = ASTNodeFactories.SEQUENCE();

                // Push the SEQUENCE node into the current scope.
                stack[stack.length - 1].push(node);

                // Try to pick any decorators off of the token stack.
                node.decorators = getDecorators(tokens);

                popAndCheck(tokens, "{");

                // The new scope is that of the new SEQUENCE nodes children.
                stack.push(node.children);
                break;

            case "PARALLEL":
                // Create a PARALLEL AST node.
                node = ASTNodeFactories.PARALLEL();

                // Push the PARALLEL node into the current scope.
                stack[stack.length - 1].push(node);

                // Try to pick any decorators off of the token stack.
                node.decorators = getDecorators(tokens);

                popAndCheck(tokens, "{");

                // The new scope is that of the new PARALLEL nodes children.
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
                    node.tickets = getArguments(tokens, arg => !isNaN(arg) && parseFloat(arg, 10) === parseInt(arg, 10), "lotto node ticket counts must be integer values");
                }

                // Try to pick any decorators off of the token stack.
                node.decorators = getDecorators(tokens);

                popAndCheck(tokens, "{");

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
                const conditionArguments = getArguments(tokens);

                // We should have only a single argument that is not an empty string for a condition node, which is the condition function name.
                if (conditionArguments.length === 1 && conditionArguments[0] !== "") {
                    // The condition function name will be the first and only node argument.
                    node.conditionFunction = conditionArguments[0];
                } else {
                    throw "expected single condition name argument";
                }

                // Try to pick any decorators off of the token stack.
                node.decorators = getDecorators(tokens);
                break;

            case "FLIP":
                // Create a FLIP AST node.
                node = ASTNodeFactories.FLIP();

                // Push the Flip node into the current scope.
                stack[stack.length - 1].push(node);

                // Try to pick any decorators off of the token stack.
                node.decorators = getDecorators(tokens);

                popAndCheck(tokens, "{");

                // The new scope is that of the new FLIP nodes children.
                stack.push(node.children);
                break;

            case "WAIT":
                // Create a WAIT AST node.
                node = ASTNodeFactories.WAIT();

                // Push the WAIT node into the current scope.
                stack[stack.length - 1].push(node);

                // Get the duration and potential longest duration of the wait.
                const durations = getArguments(tokens, arg => !isNaN(arg) && parseFloat(arg, 10) === parseInt(arg, 10), "wait node durations must be integer values");

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

                // Try to pick any decorators off of the token stack.
                node.decorators = getDecorators(tokens);
                break;

            case "REPEAT":
                // Create a REPEAT AST node.
                node = ASTNodeFactories.REPEAT();

                // Push the REPEAT node into the current scope.
                stack[stack.length - 1].push(node);

                // Check for iteration counts ([])
                if (tokens[0] === "[") {
                    // An iteration count has been defined. Get the iteration and potential maximum iteration of the wait.
                    const iterationArguments = getArguments(tokens, arg => !isNaN(arg) && parseFloat(arg, 10) === parseInt(arg, 10), "repeat node iteration counts must be integer values");

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

                // Try to pick any decorators off of the token stack.
                node.decorators = getDecorators(tokens);

                popAndCheck(tokens, "{");

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
                const actionArguments = getArguments(tokens);

                // We should have only a single argument that is not an empty string for an action node, which is the action name.
                if (actionArguments.length === 1 && actionArguments[0] !== "") {
                    // The action name will be the first and only node argument.
                    node.actionName = actionArguments[0];
                } else {
                    throw "expected single action name argument";
                }

                // Try to pick any decorators off of the token stack.
                node.decorators = getDecorators(tokens);
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

/**
 * Pop the next raw token off of the stack and throw an error if it wasn't the expected one.
 * @param tokens The array of remaining tokens.
 * @param expected An optional string that we expect the next popped token to match.
 * @returns The popped token.
 */
function popAndCheck(tokens, expected) {
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
 * Pull an argument list off of the token stack.
 * @param tokens The array of remaining tokens.
 * @param argumentValidator The argument validator function.
 * @param validationFailedMessage  The exception message to throw if argument validation fails.
 * @returns The arguments list.
 */
function getArguments(tokens, argumentValidator, validationFailedMessage) {
    // Any lists of arguments will always be wrapped in '[]'. so we are looking for an opening
    popAndCheck(tokens, "[");

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
    popAndCheck(tokens, "]");

    // Return the argument list.
    return argumentList;
};

/**
 * Pull any decorators off of the token stack.
 * @param tokens The array of remaining tokens.
 * @returns An array od decorators defined by any directly following tokens.
 */
function getDecorators(tokens) {
    // Create an array to hold any decorators found. 
    const decorators = [];

    // Keep track of names of decorators that we have found on the token stack, as we cannot have duplicates.
    const decoratorsFound = [];

    // Try to get the decorator factory for the next token.
    let decoratorFactory = DecoratorFactories[(tokens[0] || "").toUpperCase()];

    // Pull decorator tokens off of the tokens stack until we have no more.
    while (decoratorFactory) {
        // Check to make sure that we have not already created a decorator of this type for this node.
        if (decoratorsFound.indexOf(tokens[0]) !== -1) {
            throw `duplicate decorator '${tokens[0].toUpperCase()}' found for node`;
        }

        decoratorsFound.push(tokens[0]);

        // The decorator definition should consist of the tokens 'NAME', '(', 'ARGUMENT' and ')'.
        popAndCheck(tokens, tokens[0].toUpperCase());
        popAndCheck(tokens, "(");
        const decoratorArgument = popAndCheck(tokens);
        popAndCheck(tokens, ")");

        // Create the decorator and add it to the array of decorators found.
        decorators.push(decoratorFactory(decoratorArgument));

        // Try to get the next decorator name token, as there could be multiple.
        decoratorFactory = DecoratorFactories[(tokens[0] || "").toUpperCase()];
    }

    return decorators;
};

/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Action;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__leaf__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__state__ = __webpack_require__(0);



/**
 * An Action leaf node.
 * This represents an immediate or ongoing state of behaviour.
 * @param decorators The node decorators.
 * @param actionName The action name.
 */
function Action(decorators, actionName) {
    __WEBPACK_IMPORTED_MODULE_0__leaf__["a" /* default */].call(this, "action", decorators);

    /**
     * Whether there is a pending update promise. 
     */
    let isUsingUpdatePromise = false;

    /**
     * The finished state result of an update promise.
     */
    let updatePromiseStateResult = null;

    /**
     * Update the node.
     * @param board The board.
     * @returns The result of the update.
     */
    this.onUpdate = function (board) {
        // Get the corresponding action object or function.
        const action = board[actionName];

        // If the result of this action depends on an update promise then there is nothing to do until
        // it resolves, unless there has been a value set as a result of the update promise resolving.
        if (isUsingUpdatePromise) {
            // Check whether the update promise has resolved with a state value.
            if (updatePromiseStateResult) {
                // Set the state of this node to match the state returned by the promise.
                this.setState(updatePromiseStateResult);
            }

            return;
        }

        // Validate the action.
        this._validateAction(action);

        // Call the action 'onUpdate' function, the result of which may be:
        // - The finished state of this action node.
        // - A promise to return a finished node state.
        // - Undefined if the node should remain in the running state.
        const updateResult = action.call(board);

        if (updateResult instanceof Promise) {
            updateResult.then(result => {
                // If 'isUpdatePromisePending' is null then the promise was cleared as it was resolving, probably via an abort of reset.
                if (!isUsingUpdatePromise) {
                    return;
                }

                // Check to make sure the result is a valid finished state.
                if (result !== __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].SUCCEEDED && result !== __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].FAILED) {
                    throw "action node promise resolved with an invalid value, expected a State.SUCCEEDED or State.FAILED value to be returned";
                }

                // Set pending update promise state result to be processed on next update.
                updatePromiseStateResult = result;
            }, reason => {
                // If 'isUpdatePromisePending' is null then the promise was cleared as it was resolving, probably via an abort of reset.
                if (!isUsingUpdatePromise) {
                    return;
                }

                // Just throw whatever was returned as the rejection argument.
                throw reason;
            });

            // This node will be in the 'RUNNING' state until the update promise resolves.
            this.setState(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].RUNNING);

            // We are now waiting for the promise returned by the use to resolve before we know what state this node is in.
            isUsingUpdatePromise = true;
        } else {
            // Validate the returned value.
            this._validateUpdateResult(updateResult);

            // Set the state of this node, this may be undefined, which just means that the node is still in the 'RUNNING' state.
            this.setState(updateResult || __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].RUNNING);
        }
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => actionName;

    /**
     * Reset the state of the node.
     */
    this.reset = () => {
        // Reset the state of this node.
        this.setState(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].READY);

        // There is no longer an update promise that we care about.
        isUsingUpdatePromise = false;
        updatePromiseStateResult = null;
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
            return `action '${actionName}' must be a function`;
        }
    };

    /**
     * Validate the result of an update function call.
     * @param result The result of an update function call.
     */
    this._validateUpdateResult = result => {
        switch (result) {
            case __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].SUCCEEDED:
            case __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].FAILED:
            case undefined:
                return;
            default:
                throw `action '${actionName}' 'onUpdate' returned an invalid response, expected an optional State.SUCCEEDED or State.FAILED value to be returned`;
        }
    };
};

Action.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__leaf__["a" /* default */].prototype);

/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Condition;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__leaf__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__state__ = __webpack_require__(0);



/**
 * A Condition leaf node.
 * This will succeed or fail immediately based on a board predicate, without moving to the 'RUNNING' state.
 * @param decorators The node decorators.
 * @param condition The name of the condition function. 
 */
function Condition(decorators, condition) {
    __WEBPACK_IMPORTED_MODULE_0__leaf__["a" /* default */].call(this, "condition", decorators);

    /**
     * Update the node.
     * @param board The board.
     * @returns The result of the update.
     */
    this.onUpdate = function (board) {
        // Call the condition function to determine the state of this node, but it must exist in the blackboard.
        if (typeof board[condition] === "function") {
            this.setState(!!board[condition].call(board) ? __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].SUCCEEDED : __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].FAILED);
        } else {
            throw `cannot update condition node as function '${condition}' is not defined in the blackboard`;
        }
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => condition;
};

Condition.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__leaf__["a" /* default */].prototype);

/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Flip;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__composite__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__state__ = __webpack_require__(0);



/**
 * A Flip node.
 * This node wraps a single child and will flip the state of the child state.
 * @param decorators The node decorators.
 * @param child The child node. 
 */
function Flip(decorators, child) {
    __WEBPACK_IMPORTED_MODULE_0__composite__["a" /* default */].call(this, "flip", decorators, [child]);

    /**
     * Update the node.
     * @param board The board.
     * @returns The result of the update.
     */
    this.onUpdate = function (board) {
        // If the child has never been updated or is running then we will need to update it now.
        if (child.getState() === __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].READY || child.getState() === __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].RUNNING) {
            child.update(board);
        }

        // The state of this node will depend in the state of its child.
        switch (child.getState()) {
            case __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].RUNNING:
                this.setState(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].RUNNING);
                break;

            case __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].SUCCEEDED:
                this.setState(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].FAILED);
                break;

            case __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].FAILED:
                this.setState(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].SUCCEEDED);
                break;

            default:
                this.setState(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].READY);
        }
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => "FLIP";
};

Flip.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__composite__["a" /* default */].prototype);

/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Lotto;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__composite__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__state__ = __webpack_require__(0);



/**
 * A LOTTO node.
 * A winning child is picked on the initial update of this node, based on ticket weighting.
 * The state of this node will match the state of the winning child.
 * @param decorators The node decorators.
 * @param tickets The child node tickets
 * @param children The child nodes. 
 */
function Lotto(decorators, tickets, children) {
    __WEBPACK_IMPORTED_MODULE_0__composite__["a" /* default */].call(this, "lotto", decorators, children);

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
    this.onUpdate = function (board) {
        // If this node is in the READY state then we need to pick a winning child node.
        if (this.is(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].READY)) {
            // Create a lotto draw.
            const lottoDraw = new LottoDraw();

            // Add each child of this node to a lotto draw, with each child's corresponding ticket weighting, or a single ticket if not defined.
            children.forEach((child, index) => lottoDraw.add(child, tickets[index] || 1));

            // Randomly pick a child based on ticket weighting.
            winningChild = lottoDraw.draw();
        }

        // If the winning child has never been updated or is running then we will need to update it now.
        if (winningChild.getState() === __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].READY || winningChild.getState() === __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].RUNNING) {
            winningChild.update(board);
        }

        // The state of the lotto node is the state of its winning child.
        this.setState(winningChild.getState());
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => tickets.length ? `LOTTO [${tickets.join(",")}]` : "LOTTO";
};

Lotto.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__composite__["a" /* default */].prototype);

/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Repeat;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__composite__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__state__ = __webpack_require__(0);



/**
 * A REPEAT node.
 * The node has a single child which can have:
 * -- A number of iterations for which to repeat the child node.
 * -- An infinite repeat loop if neither an iteration count or a condition function is defined.
 * The REPEAT node will stop and have a 'FAILED' state if its child is ever in a 'FAILED' state after an update.
 * The REPEAT node will attempt to move on to the next iteration if its child is ever in a 'SUCCEEDED' state.
 * @param decorators The node decorators.
 * @param iterations The number of iterations to repeat the child node, or the minimum number of iterations if maximumIterations is defined.
 * @param maximumIterations The maximum number of iterations to repeat the child node.
 * @param child The child node. 
 */
function Repeat(decorators, iterations, maximumIterations, child) {
    __WEBPACK_IMPORTED_MODULE_0__composite__["a" /* default */].call(this, "repeat", decorators, [child]);

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
    this.onUpdate = function (board) {
        // If this node is in the READY state then we need to reset the child and the target iteration count.
        if (this.is(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].READY)) {
            // Reset the child node.
            child.reset();

            // Set the target iteration count.
            this._setTargetIterationCount();
        }

        // Do a check to see if we can iterate. If we can then this node will move into the 'RUNNING' state.
        // If we cannot iterate then we have hit our target iteration count, which means that the node has succeeded.
        if (this._canIterate()) {
            // This node is in the running state and can do its initial iteration.
            this.setState(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].RUNNING);

            // We may have already completed an iteration, meaning that the child node will be in the SUCCEEDED state.
            // If this is the case then we will have to reset the child node now.
            if (child.getState() === __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].SUCCEEDED) {
                child.reset();
            }

            // Update the child of this node.
            child.update(board);

            // If the child moved into the FAILED state when we updated it then there is nothing left to do and this node has also failed.
            // If it has moved into the SUCCEEDED state then we have completed the current iteration.
            if (child.getState() === __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].FAILED) {
                // The child has failed, meaning that this node has failed.
                this.setState(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].FAILED);

                return;
            } else if (child.getState() === __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].SUCCEEDED) {
                // We have completed an iteration.
                currentIterationCount += 1;
            }
        } else {
            // This node is in the 'SUCCEEDED' state as we cannot iterate any more.
            this.setState(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].SUCCEEDED);
        }
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
     */
    this.reset = () => {
        // Reset the state of this node.
        this.setState(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].READY);

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

Repeat.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__composite__["a" /* default */].prototype);

/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Root;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__composite__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__state__ = __webpack_require__(0);



/**
 * A Root node.
 * The root node will have a single child.
 * @param decorators The node decorators.
 * @param child The child node. 
 */
function Root(decorators, child) {
  __WEBPACK_IMPORTED_MODULE_0__composite__["a" /* default */].call(this, "root", decorators, [child]);

  /**
   * Update the node and get whether the node state has changed.
   * @param board The board.
   * @returns Whether the state of this node has changed as part of the update.
   */
  this.onUpdate = function (board) {
    // If the child has never been updated or is running then we will need to update it now.
    if (child.getState() === __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].READY || child.getState() === __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].RUNNING) {
      // Update the child of this node.
      child.update(board);
    }

    // The state of the root node is the state of its child.
    this.setState(child.getState());
  };

  /**
   * Gets the name of the node.
   */
  this.getName = () => "ROOT";
};

Root.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__composite__["a" /* default */].prototype);

/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Selector;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__composite__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__state__ = __webpack_require__(0);



/**
 * A SELECTOR node.
 * The child nodes are executed in sequence until one succeeds or all fail.
 * @param decorators The node decorators.
 * @param children The child nodes.
 */
function Selector(decorators, children) {
    __WEBPACK_IMPORTED_MODULE_0__composite__["a" /* default */].call(this, "selector", decorators, children);

    /**
     * Update the node and get whether the node state has changed.
     * @param board The board.
     * @returns Whether the state of this node has changed as part of the update.
     */
    this.onUpdate = function (board) {
        // Iterate over all of the children of this node.
        for (const child of children) {
            // If the child has never been updated or is running then we will need to update it now.
            if (child.getState() === __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].READY || child.getState() === __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].RUNNING) {
                // Update the child of this node.
                child.update(board);
            }

            // If the current child has a state of 'SUCCEEDED' then this node is also a 'SUCCEEDED' node.
            if (child.getState() === __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].SUCCEEDED) {
                // This node is a 'SUCCEEDED' node.
                this.setState(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].SUCCEEDED);

                // There is no need to check the rest of the selector nodes.
                return;
            }

            // If the current child has a state of 'FAILED' then we should move on to the next child.
            if (child.getState() === __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].FAILED) {
                // Find out if the current child is the last one in the selector.
                // If it is then this sequence node has also failed.
                if (children.indexOf(child) === children.length - 1) {
                    // This node is a 'FAILED' node.
                    this.setState(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].FAILED);

                    // There is no need to check the rest of the selector as we have completed it.
                    return;
                } else {
                    // The child node failed, try the next one.
                    continue;
                }
            }

            // The node should be in the 'RUNNING' state.
            if (child.getState() === __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].RUNNING) {
                // This node is a 'RUNNING' node.
                this.setState(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].RUNNING);

                // There is no need to check the rest of the selector as the current child is still running.
                return;
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
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Sequence;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__composite__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__state__ = __webpack_require__(0);



/**
 * A SEQUENCE node.
 * The child nodes are executed in sequence until one fails or all succeed.
 * @param decorators The node decorators.
 * @param children The child nodes. 
 */
function Sequence(decorators, children) {
    __WEBPACK_IMPORTED_MODULE_0__composite__["a" /* default */].call(this, "sequence", decorators, children);

    /**
     * Update the node and get whether the node state has changed.
     * @param board The board.
     * @returns Whether the state of this node has changed as part of the update.
     */
    this.onUpdate = function (board) {
        // Iterate over all of the children of this node.
        for (const child of children) {
            // If the child has never been updated or is running then we will need to update it now.
            if (child.getState() === __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].READY || child.getState() === __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].RUNNING) {
                // Update the child of this node.
                child.update(board);
            }

            // If the current child has a state of 'SUCCEEDED' then we should move on to the next child.
            if (child.getState() === __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].SUCCEEDED) {
                // Find out if the current child is the last one in the sequence.
                // If it is then this sequence node has also succeeded.
                if (children.indexOf(child) === children.length - 1) {
                    // This node is a 'SUCCEEDED' node.
                    this.setState(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].SUCCEEDED);

                    // There is no need to check the rest of the sequence as we have completed it.
                    return;
                } else {
                    // The child node succeeded, but we have not finished the sequence yet.
                    continue;
                }
            }

            // If the current child has a state of 'FAILED' then this node is also a 'FAILED' node.
            if (child.getState() === __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].FAILED) {
                // This node is a 'FAILED' node.
                this.setState(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].FAILED);

                // There is no need to check the rest of the sequence.
                return;
            }

            // The node should be in the 'RUNNING' state.
            if (child.getState() === __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].RUNNING) {
                // This node is a 'RUNNING' node.
                this.setState(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].RUNNING);

                // There is no need to check the rest of the sequence as the current child is still running.
                return;
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
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Parallel;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__composite__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__state__ = __webpack_require__(0);



/**
 * A PARALLEL node.
 * The child nodes are executed concurrently until one fails or all succeed.
 * @param decorators The node decorators.
 * @param children The child nodes. 
 */
function Parallel(decorators, children) {
    __WEBPACK_IMPORTED_MODULE_0__composite__["a" /* default */].call(this, "parallel", decorators, children);

    /**
     * Update the node and get whether the node state has changed.
     * @param board The board.
     * @returns Whether the state of this node has changed as part of the update.
     */
    this.onUpdate = function (board) {
        // Keep a count of the number of succeeded child nodes.
        let succeededCount = 0;

        let hasChildFailed = false;

        // Iterate over all of the children of this node.
        for (const child of children) {
            // If the child has never been updated or is running then we will need to update it now.
            if (child.getState() === __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].READY || child.getState() === __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].RUNNING) {
                // Update the child of this node.
                child.update(board);
            }

            // If the current child has a state of 'SUCCEEDED' then we should move on to the next child.
            if (child.getState() === __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].SUCCEEDED) {
                // The child node has succeeded, keep track of this to determine if all children have.
                succeededCount++;

                // The child node succeeded, but we have not finished checking every child node yet.
                continue;
            }

            // If the current child has a state of 'FAILED' then this node is also a 'FAILED' node.
            if (child.getState() === __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].FAILED) {
                hasChildFailed = true;

                // There is no need to check the rest of the children.
                break;
            }

            // The node should be in the 'RUNNING' state.
            if (child.getState() !== __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].RUNNING) {
                // The child node was not in an expected state.
                throw "Error: child node was not in an expected state.";
            }
        }

        if (hasChildFailed) {
            // This node is a 'FAILED' node.
            this.setState(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].FAILED);

            // Abort every running child.
            for (const child of children) {
                if (child.getState() === __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].RUNNING) {
                    child.abort(board);
                }
            }
        } else {
            // If all children have succeeded then this node has also succeeded, otherwise it is still running.
            this.setState(succeededCount === children.length ? __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].SUCCEEDED : __WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].RUNNING);
        }
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => "PARALLEL";
};

Parallel.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__composite__["a" /* default */].prototype);

/***/ }),
/* 19 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Wait;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__leaf__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__state__ = __webpack_require__(0);



/**
 * A WAIT node.
 * The state of this node will change to SUCCEEDED after a duration of time.
 * @param decorators The node decorators.
 * @param duration The duration that this node will wait to succeed in milliseconds, or the earliest if longestDuration is defined.
 * @param longestDuration The longest possible duration in milliseconds that this node will wait to succeed.
 */
function Wait(decorators, duration, longestDuration) {
    __WEBPACK_IMPORTED_MODULE_0__leaf__["a" /* default */].call(this, "wait", decorators);

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
    this.onUpdate = function (board) {
        // If this node is in the READY state then we need to set the initial update time.
        if (this.is(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].READY)) {
            // Set the initial update time.
            initialUpdateTime = new Date().getTime();

            // If a longestDuration value was defined then we will be randomly picking a duration between the
            // shortest and longest duration. If it was not defined, then we will be just using the duration.
            waitDuration = longestDuration ? Math.floor(Math.random() * (longestDuration - duration + 1) + duration) : duration;

            // The node is now running until we finish waiting.
            this.setState(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].RUNNING);
        }

        // Have we waited long enough?
        if (new Date().getTime() >= initialUpdateTime + waitDuration) {
            // We have finished waiting!
            this.setState(__WEBPACK_IMPORTED_MODULE_1__state__["a" /* default */].SUCCEEDED);
        }
    };

    /**
     * Gets the name of the node.
     */
    this.getName = () => `WAIT ${longestDuration ? duration + "ms-" + longestDuration + "ms" : duration + "ms"}`;
};

Wait.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__leaf__["a" /* default */].prototype);

/***/ }),
/* 20 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = While;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__decorator__ = __webpack_require__(2);


/**
 * A WHILE guard which is satisfied as long as the given condition remains true.
 * @param condition The name of the condition function that determines whether the guard is satisfied.
 */
function While(condition) {
    __WEBPACK_IMPORTED_MODULE_0__decorator__["a" /* default */].call(this, "while");

    /**
     * Gets whether the decorator is a guard.
     */
    this.isGuard = () => true;

    /**
     * Gets the condition of the guard.
     */
    this.getCondition = () => condition;

    /**
     * Gets the decorator details.
     */
    this.getDetails = () => {
        return {
            type: this.getType(),
            isGuard: this.isGuard(),
            condition: this.getCondition()
        };
    };

    /**
     * Gets whether the guard is satisfied.
     * @param board The board.
     * @returns Whether the guard is satisfied.
     */
    this.isSatisfied = board => {
        // Call the condition function to determine whether this guard is satisfied.
        if (typeof board[condition] === "function") {
            return !!board[condition].call(board);
        } else {
            throw `cannot evaluate node guard as function '${condition}' is not defined in the blackboard`;
        }
    };
};

While.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__decorator__["a" /* default */].prototype);

/***/ }),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Until;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__decorator__ = __webpack_require__(2);


/**
 * An UNTIL guard which is satisfied as long as the given condition remains false.
 * @param condition The name of the condition function that determines whether the guard is satisfied.
 */
function Until(condition) {
    __WEBPACK_IMPORTED_MODULE_0__decorator__["a" /* default */].call(this, "until");

    /**
     * Gets whether the decorator is a guard.
     */
    this.isGuard = () => true;

    /**
     * Gets the condition of the guard.
     */
    this.getCondition = () => condition;

    /**
     * Gets the decorator details.
     */
    this.getDetails = () => {
        return {
            type: this.getType(),
            isGuard: this.isGuard(),
            condition: this.getCondition()
        };
    };

    /**
     * Gets whether the guard is satisfied.
     * @param board The board.
     * @returns Whether the guard is satisfied.
     */
    this.isSatisfied = board => {
        // Call the condition function to determine whether this guard is satisfied.
        if (typeof board[condition] === "function") {
            return !!!board[condition].call(board);
        } else {
            throw `cannot evaluate node guard as function '${condition}' is not defined in the blackboard`;
        }
    };
};

Until.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__decorator__["a" /* default */].prototype);

/***/ }),
/* 22 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Entry;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__decorator__ = __webpack_require__(2);


/**
 * An ENTRY decorator which defines a blackboard function to call when the decorated node is updated and moves out of running state.
 * @param functionName The name of the blackboard function to call.
 */
function Entry(functionName) {
    __WEBPACK_IMPORTED_MODULE_0__decorator__["a" /* default */].call(this, "entry");

    /**
     * Gets the function name.
     */
    this.getFunctionName = () => functionName;

    /**
     * Gets the decorator details.
     */
    this.getDetails = () => {
        return {
            type: this.getType(),
            isGuard: this.isGuard(),
            functionName: this.getFunctionName()
        };
    };

    /**
     * Attempt to call the blackboard function that this decorator refers to.
     * @param board The board.
     */
    this.callBlackboardFunction = board => {
        // Call the blackboard function if it exists.
        if (typeof board[functionName] === "function") {
            board[functionName].call(board);
        } else {
            throw `cannot call entry decorator function '${functionName}' is not defined in the blackboard`;
        }
    };
};

Entry.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__decorator__["a" /* default */].prototype);

/***/ }),
/* 23 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Exit;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__decorator__ = __webpack_require__(2);


/**
 * An EXIT decorator which defines a blackboard function to call when the decorated node is updated and moves to a finished state or is aborted.
 * @param functionName The name of the blackboard function to call.
 */
function Exit(functionName) {
    __WEBPACK_IMPORTED_MODULE_0__decorator__["a" /* default */].call(this, "exit");

    /**
     * Gets the function name.
     */
    this.getFunctionName = () => functionName;

    /**
     * Gets the decorator details.
     */
    this.getDetails = () => {
        return {
            type: this.getType(),
            isGuard: this.isGuard(),
            functionName: this.getFunctionName()
        };
    };

    /**
     * Attempt to call the blackboard function that this decorator refers to.
     * @param board The board.
     * @param isSuccess Whether the decorated node was left with a success state.
     * @param isAborted Whether the decorated node was aborted.
     */
    this.callBlackboardFunction = (board, isSuccess, isAborted) => {
        // Call the blackboard function if it exists.
        if (typeof board[functionName] === "function") {
            board[functionName].call(board, { succeeded: isSuccess, aborted: isAborted });
        } else {
            throw `cannot call exit decorator function '${functionName}' is not defined in the blackboard`;
        }
    };
};

Exit.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__decorator__["a" /* default */].prototype);

/***/ }),
/* 24 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Step;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__decorator__ = __webpack_require__(2);


/**
 * A STEP decorator which defines a blackboard function to call when the decorated node is updated.
 * @param functionName The name of the blackboard function to call.
 */
function Step(functionName) {
    __WEBPACK_IMPORTED_MODULE_0__decorator__["a" /* default */].call(this, "step");

    /**
     * Gets the function name.
     */
    this.getFunctionName = () => functionName;

    /**
     * Gets the decorator details.
     */
    this.getDetails = () => {
        return {
            type: this.getType(),
            isGuard: this.isGuard(),
            functionName: this.getFunctionName()
        };
    };

    /**
     * Attempt to call the blackboard function that this decorator refers to.
     * @param board The board.
     */
    this.callBlackboardFunction = board => {
        // Call the blackboard function if it exists.
        if (typeof board[functionName] === "function") {
            board[functionName].call(board);
        } else {
            throw `cannot call entry decorator function '${functionName}' is not defined in the blackboard`;
        }
    };
};

Step.prototype = Object.create(__WEBPACK_IMPORTED_MODULE_0__decorator__["a" /* default */].prototype);

/***/ })
/******/ ]);
});