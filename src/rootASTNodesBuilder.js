import Action from './nodes/leaf/action'
import Condition from './nodes/leaf/condition'
import Wait from './nodes/leaf/wait'
import Root from './nodes/decorator/root'
import Repeat from './nodes/decorator/repeat'
import Retry from './nodes/decorator/retry'
import Flip from './nodes/decorator/flip'
import Succeed from './nodes/decorator/succeed'
import Fail from './nodes/decorator/fail'
import Lotto from './nodes/composite/lotto'
import Selector from './nodes/composite/selector'
import Sequence from './nodes/composite/sequence'
import Parallel from './nodes/composite/parallel'
import While from './attributes/guards/while'
import Until from './attributes/guards/until'
import Entry from './attributes/callbacks/entry'
import Exit from './attributes/callbacks/exit'
import Step from './attributes/callbacks/step'

/**
 * The node decorator factories.
 */
const DecoratorFactories = {
    "WHILE": (condition, decoratorArguments) => new While(condition, decoratorArguments),
    "UNTIL": (condition, decoratorArguments) => new Until(condition, decoratorArguments),
    "ENTRY": (functionName, decoratorArguments) => new Entry(functionName, decoratorArguments),
    "EXIT": (functionName, decoratorArguments) => new Exit(functionName, decoratorArguments),
    "STEP": (functionName, decoratorArguments) => new Step(functionName, decoratorArguments)
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
                throw new Error("a root node cannot be the child of another node");
            }

            // A root node must have a single child node.
            if (this.children.length !== 1) {
                throw new Error("a root node must have a single child");
            }
        },
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) { 
            return new Root(
                this.decorators,
                this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
            );
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
                throw new Error(`circular dependency found in branch node references for branch '${this.branchName}'`);
            }

            // If we have a target root node, then the node instance we want will be the first and only child of the referenced root node.
            if (targetRootNode) {
                return targetRootNode.createNodeInstance(namedRootNodeProvider, visitedBranches.concat(this.branchName)).getChildren()[0];
            } else {
                throw new Error(`branch references root node '${this.branchName}' which has not been defined`);
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
                throw new Error("a selector node must have at least a single child");
            }
        },
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) { 
            return new Selector(
                this.decorators,
                this.children.map((child) => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice()))
            );
        }
    }),
    "SEQUENCE": () => ({
        type: "sequence",
        decorators: [],
        children: [], 
        validate: function (depth) {
            // A sequence node must have at least a single node.
            if (this.children.length < 1) {
                throw new Error("a sequence node must have at least a single child");
            }
        },
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) { 
            return new Sequence(
                this.decorators,
                this.children.map((child) => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice()))
            );
        }
    }),
    "PARALLEL": () => ({
        type: "parallel",
        decorators: [],
        children: [], 
        validate: function (depth) {
            // A parallel node must have at least a single node.
            if (this.children.length < 1) {
                throw new Error("a parallel node must have at least a single child");
            }
        },
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) { 
            return new Parallel(
                this.decorators,
                this.children.map((child) => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice()))
            );
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
                throw new Error("a lotto node must have at least a single child");
            }
        },
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) { 
            return new Lotto(
                this.decorators,
                this.tickets,
                this.children.map((child) => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice()))
            );
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
                throw new Error("a repeat node must have a single child");
            }

            // A repeat node must have a positive number of iterations if defined. 
            if (this.iterations !== null && this.iterations < 0) {
                throw new Error("a repeat node must have a positive number of iterations if defined");
            }

            // There is validation to carry out if a longest duration was defined.
            if (this.maximumIterations !== null) {
                // A repeat node must have a positive maximum iterations count if defined. 
                if (this.maximumIterations < 0) {
                    throw new Error("a repeat node must have a positive maximum iterations count if defined");
                }

                // A repeat node must not have an iteration count that exceeds the maximum iteration count.
                if (this.iterations > this.maximumIterations) {
                    throw new Error("a repeat node must not have an iteration count that exceeds the maximum iteration count");
                }
            }
        },
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) { 
            return new Repeat(
                this.decorators,
                this.iterations,
                this.maximumIterations,
                this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
            );
        }
    }),
    "RETRY": () => ({
        type: "retry",
        decorators: [],
        iterations: null,
        maximumIterations: null,
        children: [],
        validate: function (depth) {
            // A retry node must have a single node.
            if (this.children.length !== 1) {
                throw new Error("a retry node must have a single child");
            }

            // A retry node must have a positive number of iterations if defined. 
            if (this.iterations !== null && this.iterations < 0) {
                throw new Error("a retry node must have a positive number of iterations if defined");
            }

            // There is validation to carry out if a longest duration was defined.
            if (this.maximumIterations !== null) {
                // A retry node must have a positive maximum iterations count if defined. 
                if (this.maximumIterations < 0) {
                    throw new Error("a retry node must have a positive maximum iterations count if defined");
                }

                // A retry node must not have an iteration count that exceeds the maximum iteration count.
                if (this.iterations > this.maximumIterations) {
                    throw new Error("a retry node must not have an iteration count that exceeds the maximum iteration count");
                }
            }
        },
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) { 
            return new Retry(
                this.decorators,
                this.iterations,
                this.maximumIterations,
                this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
            );
        }
    }),
    "FLIP": () => ({
        type: "flip",
        decorators: [],
        children: [],
        validate: function (depth) {
            // A flip node must have a single node.
            if (this.children.length !== 1) {
                throw new Error("a flip node must have a single child");
            }
        },
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) { 
            return new Flip(
                this.decorators,
                this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
            );
        }
    }),
    "SUCCEED": () => ({
        type: "succeed",
        decorators: [],
        children: [],
        validate: function (depth) {
            // A succeed node must have a single node.
            if (this.children.length !== 1) {
                throw new Error("a succeed node must have a single child");
            }
        },
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) { 
            return new Succeed(
                this.decorators,
                this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
            );
        }
    }),
    "FAIL": () => ({
        type: "fail",
        decorators: [],
        children: [],
        validate: function (depth) {
            // A fail node must have a single node.
            if (this.children.length !== 1) {
                throw new Error("a fail node must have a single child");
            }
        },
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) { 
            return new Fail(
                this.decorators,
                this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
            );
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
                throw new Error("a wait node must have a positive duration");
            }

            // There is validation to carry out if a longest duration was defined.
            if (this.longestDuration) {
                // A wait node must have a positive longest duration. 
                if (this.longestDuration < 0) {
                    throw new Error("a wait node must have a positive longest duration if one is defined");
                }

                // A wait node must not have a duration that exceeds the longest duration.
                if (this.duration > this.longestDuration) {
                    throw new Error("a wait node must not have a shortest duration that exceeds the longest duration");
                }
            }
        },
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) { 
            return new Wait(
                this.decorators,
                this.duration,
                this.longestDuration
            );
        }
    }),
    "ACTION": () => ({
        type: "action",
        decorators: [],
        actionName: "",
        actionArguments: [],
        validate: function (depth) {},
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
            return new Action(
                this.decorators,
                this.actionName,
                this.actionArguments
            );
        }
    }),
    "CONDITION": () => ({
        type: "condition",
        decorators: [],
        conditionName: "",
        conditionArguments: [],
        validate: function (depth) {},
        createNodeInstance: function (namedRootNodeProvider, visitedBranches) { 
            return new Condition(
                this.decorators,
                this.conditionName,
                this.conditionArguments
            );
        }
    })
};

/**
 * Create an array of root AST nodes based on the given definition.
 * @param definition The definition to parse the AST nodes from.
 * @returns The base definition AST nodes.
 */
export default function buildRootASTNodes(definition) {
    // Swap out any node/decorator argument string literals with a placeholder and get a mapping of placeholders to original values as well as the processed definition.
    const { placeholders, processedDefinition } = substituteStringLiterals(definition);

    // Convert the processed definition (with substituted string literals) into an array of raw tokens.
    const tokens = parseTokensFromDefinition(processedDefinition);

    // There must be at least 3 tokens for the tree definition to be valid. 'ROOT', '{' and '}'.
    if (tokens.length < 3) {
        throw new Error("invalid token count");
    }

    // We should have a matching number of '{' and '}' tokens. If not, then there are scopes that have not been properly closed.
    if (tokens.filter((token) => token === "{").length !== tokens.filter((token) => token === "}").length) {
        throw new Error("scope character mismatch");
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
                    const rootArguments = getArguments(tokens, placeholders);

                    // We should have only a single argument that is not an empty string for a root node, which is the root name identifier.
                    if (rootArguments.length === 1 && rootArguments[0].type === "identifier") {
                        // The root name will be the first and only node argument.
                        node.name = rootArguments[0].value;
                    } else {
                        throw new Error("expected single root name argument");
                    }
                }

                // Try to pick any decorators off of the token stack.
                node.decorators = getDecorators(tokens, placeholders);

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
                    throw new Error("expected single branch name argument");
                } 

                // The branch name will be defined as a node argument.
                const branchArguments = getArguments(tokens, placeholders);

                // We should have only a single identifer argument for a branch node, which is the branch name.
                if (branchArguments.length === 1 && branchArguments[0].type === "identifier") {
                    // The branch name will be the first and only node argument.
                    node.branchName = branchArguments[0].value;
                } else {
                    throw new Error("expected single branch name argument");
                } 
                break;

            case "SELECTOR": 
                // Create a SELECTOR AST node.
                node = ASTNodeFactories.SELECTOR();

                // Push the SELECTOR node into the current scope.
                stack[stack.length-1].push(node);

                // Try to pick any decorators off of the token stack.
                node.decorators = getDecorators(tokens, placeholders);

                popAndCheck(tokens, "{");

                // The new scope is that of the new SELECTOR nodes children.
                stack.push(node.children);
                break;

            case "SEQUENCE":
                // Create a SEQUENCE AST node.
                node = ASTNodeFactories.SEQUENCE();

                // Push the SEQUENCE node into the current scope.
                stack[stack.length-1].push(node);

                // Try to pick any decorators off of the token stack.
                node.decorators = getDecorators(tokens, placeholders);

                popAndCheck(tokens, "{");

                // The new scope is that of the new SEQUENCE nodes children.
                stack.push(node.children);
                break;

            case "PARALLEL":
                // Create a PARALLEL AST node.
                node = ASTNodeFactories.PARALLEL();

                // Push the PARALLEL node into the current scope.
                stack[stack.length-1].push(node);

                // Try to pick any decorators off of the token stack.
                node.decorators = getDecorators(tokens, placeholders);

                popAndCheck(tokens, "{");

                // The new scope is that of the new PARALLEL nodes children.
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
                    node.tickets = getArguments(
                        tokens,
                        placeholders,
                        (arg) => arg.type === "number" && arg.isInteger, 
                        "lotto node ticket counts must be integer values"
                    ).map(argument => argument.value);
                }

                // Try to pick any decorators off of the token stack.
                node.decorators = getDecorators(tokens, placeholders);

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
                    throw new Error("expected condition name identifier argument");
                } 

                // Grab the condition node arguments.
                const conditionArguments = getArguments(tokens, placeholders);

                // We should have at least a single identifier argument for a condition node, which is the condition function name.
                if (conditionArguments.length && conditionArguments[0].type === "identifier") {
                    // The condition function name will be the first node argument.
                    node.conditionName = conditionArguments.shift().value;
                } else {
                    throw new Error("expected condition name identifier argument");
                }

                // Only the first argument should have been an identifier, all following arguments must be string, number, boolean or null.
                conditionArguments
                    .filter(arg => arg.type === "identifier")
                    .forEach(arg => { throw new Error("invalid condition node argument value '" + arg.value + "', must be string, number, boolean or null") });

                // Any node arguments that follow the condition name identifier will be treated as condition function arguments.
                node.conditionArguments = conditionArguments;

                // Try to pick any decorators off of the token stack.
                node.decorators = getDecorators(tokens, placeholders);
                break;

            case "FLIP":
                // Create a FLIP AST node.
                node = ASTNodeFactories.FLIP();

                // Push the Flip node into the current scope.
                stack[stack.length-1].push(node);

                // Try to pick any decorators off of the token stack.
                node.decorators = getDecorators(tokens, placeholders);

                popAndCheck(tokens, "{");

                // The new scope is that of the new FLIP nodes children.
                stack.push(node.children);
                break;

            case "SUCCEED":
                // Create a SUCCEED AST node.
                node = ASTNodeFactories.SUCCEED();

                // Push the Succeed node into the current scope.
                stack[stack.length-1].push(node);

                // Try to pick any decorators off of the token stack.
                node.decorators = getDecorators(tokens, placeholders);

                popAndCheck(tokens, "{");

                // The new scope is that of the new Succeed nodes children.
                stack.push(node.children);
                break;

            case "FAIL":
                // Create a FAIL AST node.
                node = ASTNodeFactories.FAIL();

                // Push the Fail node into the current scope.
                stack[stack.length-1].push(node);

                // Try to pick any decorators off of the token stack.
                node.decorators = getDecorators(tokens, placeholders);

                popAndCheck(tokens, "{");

                // The new scope is that of the new Fail nodes children.
                stack.push(node.children);
                break;

            case "WAIT":
                // Create a WAIT AST node.
                node = ASTNodeFactories.WAIT();

                // Push the WAIT node into the current scope.
                stack[stack.length-1].push(node);

                // Get the duration and potential longest duration of the wait.
                const durations = getArguments(
                    tokens,
                    placeholders,
                    (arg) => arg.type === "number" && arg.isInteger,
                    "wait node durations must be integer values"
                ).map(argument => argument.value);

                // We should have got one or two durations.
                if (durations.length === 1) {
                    // A static duration was defined.
                    node.duration = durations[0];
                } else if (durations.length === 2) {
                    // A shortest and longest duration was defined.
                    node.duration        = durations[0];
                    node.longestDuration = durations[1];
                } else {
                    // An incorrect number of durations was defined.
                    throw new Error("invalid number of wait node duration arguments defined");
                }

                // Try to pick any decorators off of the token stack.
                node.decorators = getDecorators(tokens, placeholders);
                break;

            case "REPEAT":
                // Create a REPEAT AST node.
                node = ASTNodeFactories.REPEAT();

                // Push the REPEAT node into the current scope.
                stack[stack.length-1].push(node);

                // Check for iteration counts ([])
                if (tokens[0] === "[") {
                    // An iteration count has been defined. Get the iteration and potential maximum iteration of the wait.
                    const iterationArguments = getArguments(
                        tokens,
                        placeholders,
                        (arg) => arg.type === "number" && arg.isInteger,
                        "repeat node iteration counts must be integer values"
                    ).map(argument => argument.value);

                    // We should have got one or two iteration counts.
                    if (iterationArguments.length === 1) {
                        // A static iteration count was defined.
                        node.iterations = iterationArguments[0];
                    } else if (iterationArguments.length === 2) {
                        // A minimum and maximum iteration count was defined.
                        node.iterations        = iterationArguments[0];
                        node.maximumIterations = iterationArguments[1];
                    } else {
                        // An incorrect number of iteration counts was defined.
                        throw new Error("invalid number of repeat node iteration count arguments defined");
                    }
                }

                // Try to pick any decorators off of the token stack.
                node.decorators = getDecorators(tokens, placeholders);

                popAndCheck(tokens, "{");

                // The new scope is that of the new REPEAT nodes children.
                stack.push(node.children);
                break;

            case "RETRY":
                // Create a RETRY AST node.
                node = ASTNodeFactories.RETRY();

                // Push the RETRY node into the current scope.
                stack[stack.length-1].push(node);

                // Check for iteration counts ([])
                if (tokens[0] === "[") {
                    // An iteration count has been defined. Get the iteration and potential maximum iteration of the wait.
                    const iterationArguments = getArguments(
                        tokens,
                        placeholders,
                        (arg) => arg.type === "number" && arg.isInteger,
                        "retry node iteration counts must be integer values"
                    ).map(argument => argument.value);

                    // We should have got one or two iteration counts.
                    if (iterationArguments.length === 1) {
                        // A static iteration count was defined.
                        node.iterations = iterationArguments[0];
                    } else if (iterationArguments.length === 2) {
                        // A minimum and maximum iteration count was defined.
                        node.iterations        = iterationArguments[0];
                        node.maximumIterations = iterationArguments[1];
                    } else {
                        // An incorrect number of iteration counts was defined.
                        throw new Error("invalid number of retry node iteration count arguments defined");
                    }
                }

                // Try to pick any decorators off of the token stack.
                node.decorators = getDecorators(tokens, placeholders);

                popAndCheck(tokens, "{");

                // The new scope is that of the new RETRY nodes children.
                stack.push(node.children);
                break;

            case "ACTION":
                // Create a ACTION AST node.
                node = ASTNodeFactories.ACTION();

                // Push the ACTION node into the current scope.
                stack[stack.length-1].push(node);

                // We must have arguments defined, as we require an action name argument.
                if (tokens[0] !== "[") {
                    throw new Error("expected action name identifier argument");
                } 

                // The action name will be defined as a node argument.
                const actionArguments = getArguments(tokens, placeholders);

                // We should have at least one identifer argument for an action node, which is the action name.
                if (actionArguments.length && actionArguments[0].type === "identifier") {
                    // The action name will be the first and only node argument.
                    node.actionName = actionArguments.shift().value;
                } else {
                    throw new Error("expected action name identifier argument");
                }

                // Only the first argument should have been an identifier, all following arguments must be string, number, boolean or null.
                actionArguments
                    .filter(arg => arg.type === "identifier")
                    .forEach(arg => { throw new Error("invalid action node argument value '" + arg.value + "', must be string, number, boolean or null") });

                // Any node arguments that follow the action name identifier will be treated as action function arguments.
                node.actionArguments = actionArguments;

                // Try to pick any decorators off of the token stack.
                node.decorators = getDecorators(tokens, placeholders);
                break;

            case "}": 
                // The '}' character closes the current scope.
                stack.pop();
                break;

            default:
                throw new Error("unexpected token: " + token);
        }
    }

    // A function to recursively validate each of the nodes in the AST.
    const validateASTNode = (node, depth) => {
        // Validate the node.
        node.validate(depth);

        // Validate each child of the node.
        (node.children ||[]).forEach((child) => validateASTNode(child, depth + 1));
    };

    // Start node validation from the definition root.
    validateASTNode({ 
        children: stack[0],
        validate: function (depth) {
            // We must have at least one node defined as the definition scope, which should be a root node.
            if (this.children.length === 0) {
                throw new Error("expected root node to have been defined");
            }

            // Each node at the base of the definition scope MUST be a root node.
            for (const definitionLevelNode of this.children) {
                if (definitionLevelNode.type !== "root") {
                    throw new Error("expected root node at base of definition");
                }
            }

            // Exactly one root node must not have a name defined. This will be the main root, others will have to be referenced via branch nodes.
            if (this.children.filter(function (definitionLevelNode) { return definitionLevelNode.name === null; }).length !== 1) {
                throw new Error("expected single unnamed root node at base of definition to act as main root");
            }

            // No two named root nodes can have matching names.
            const rootNodeNames = [];
            for (const definitionLevelNode of this.children) {
                if (rootNodeNames.indexOf(definitionLevelNode.name) !== -1) {
                    throw new Error(`multiple root nodes found with duplicate name '${definitionLevelNode.name}'`);
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
 * @param expected An optional string or array or items, one of which must match the next popped token.
 * @returns The popped token.
 */
function popAndCheck(tokens, expected) {
    // Get and remove the next token.
    const popped = tokens.shift();

    // We were expecting another token.
    if (popped === undefined) {
        throw new Error("unexpected end of definition"); 
    }

    // Do we have an expected token/tokens array?
    if (expected !== undefined) {
        // Check whether the popped token matches at least one of our expected items.
        var tokenMatchesExpectation = [].concat(expected).some(item => popped.toUpperCase() === item.toUpperCase());

        // Throw an error if the popped token didn't match any of our expected items.
        if (!tokenMatchesExpectation) {
            const expectationString = [].concat(expected).map(item => "'" + item + "'").join(" or ");
            throw new Error("unexpected token found. Expected " + expected + " but got '" + popped + "'"); 
        }
    }

    // Return the popped token.
    return popped;
};

/**
 * Pull an argument definition list off of the token stack.
 * @param tokens The array of remaining tokens.
 * @param stringArgumentPlaceholders The mapping of string literal node argument placeholders to original values.
 * @param argumentValidator The argument validator function.
 * @param validationFailedMessage  The exception message to throw if argument validation fails.
 * @returns The argument definition list.
 */
function getArguments(tokens, stringArgumentPlaceholders, argumentValidator, validationFailedMessage) {
    // Any lists of arguments will always be wrapped in '[]' for node arguments or '()' for decorator arguments.
    // We are looking for a '[' or '(' opener that wraps the argument tokens and the relevant closer.
    const closer = popAndCheck(tokens, ["[", "("]) === "[" ? "]" : ")";

    const argumentListTokens = [];
    const argumentList       = [];

    // Grab all tokens between the '[' and ']' or '(' and ')'.
    while (tokens.length && tokens[0] !== closer) {
        // The next token is part of our arguments list.
        argumentListTokens.push(tokens.shift());
    }

    // Validate the order of the argument tokens. Each token must either be a ',' or a single argument that satisfies the validator.
    argumentListTokens.forEach((token, index) => {
        // Get whether this token should be an actual argument.
        const shouldBeArgumentToken = !(index & 1);

        // If the current token should be an actual argument then validate it,otherwise it should be a ',' token.
        if (shouldBeArgumentToken) {
            // Get the argument definition.
            const argumentDefinition = getArgumentDefinition(token, stringArgumentPlaceholders);

            // Try to validate the argument.
            if (argumentValidator && !argumentValidator(argumentDefinition)) {
                throw new Error(validationFailedMessage);
            }

            // This is a valid argument!
            argumentList.push(argumentDefinition);
        } else {
            // The current token should be a ',' token.
            if (token !== ",") {
                throw new Error(`invalid argument list, expected ',' or ']' but got '${token}'`);
            }
        }
    });

    // The arguments list should terminate with a ']' or ')' token, depending on the opener.
    popAndCheck(tokens, closer);

    // Return the argument list.
    return argumentList;
};

/**
 * Gets an argument value definition.
 * @param token The argument token.
 * @param stringArgumentPlaceholders The mapping of string literal node argument placeholders to original values.
 * @returns An argument value definition.
 */
function getArgumentDefinition(token, stringArgumentPlaceholders) {
    // Check whether the token represents a null value.
    if (token === "null") {
        return { 
            value: null, 
            type: "null",
            toString: function() { return this.value; } 
        };
    }

    // Check whether the token represents a boolean value.
    if (token === "true" || token === "false") {
        return { 
            value: token === "true", 
            type: "boolean",
            toString: function() { return this.value; } 
        };
    }

    // Check whether the token represents a number value.
    if (!isNaN(token)) {
        return { 
            value: parseFloat(token, 10), 
            isInteger: parseFloat(token, 10) === parseInt(token, 10),
            type: "number",
            toString: function() { return this.value; } 
        };
    }

    // Check whether the token is a placeholder (e.g. @@0@@) representing a string literal.
    if (token.match(/^@@\d+@@$/g)) {
        return { 
            value: stringArgumentPlaceholders[token].replace('\\"', '"'), 
            type: "string",
            toString: function() { return "\"" + this.value + "\""; } 
        };
    }
    
    // The only remaining option is that the argument value is an identifier.
    return {
        value: token,
        type: "identifier",
        toString: function() { return this.value; } 
    };
};

/**
 * Pull any decorators off of the token stack.
 * @param tokens The array of remaining tokens.
 * @param stringArgumentPlaceholders The mapping of string literal node argument placeholders to original values.
 * @returns An array od decorators defined by any directly following tokens.
 */
function getDecorators(tokens, stringArgumentPlaceholders) {
	// Create an array to hold any decorators found. 
	const decorators = [];
  
    // Keep track of names of decorators that we have found on the token stack, as we cannot have duplicates.
    const decoratorsFound = [];
  
    // Try to get the decorator factory for the next token.
    let decoratorFactory = DecoratorFactories[(tokens[0] || "").toUpperCase()];

    // Pull decorator tokens off of the tokens stack until we have no more.
    while (decoratorFactory) {
        // Check to make sure that we have not already created a decorator of this type for this node.
        if (decoratorsFound.indexOf(tokens[0].toUpperCase()) !== -1) {
            throw new Error(`duplicate decorator '${tokens[0].toUpperCase()}' found for node`);
        }

        // Add the current decorator type to our array of found decorators.
        decoratorsFound.push(tokens.shift().toUpperCase());

        // Grab any decorator arguments.
        const decoratorArguments = getArguments(tokens, stringArgumentPlaceholders);

        // The first decorator argument has to be an identifer, this will reference a blackboard function.
        if (decoratorArguments.length === 0 || decoratorArguments[0].type !== "identifier") {
            throw new Error("expected blackboard function name identifier argument for decorator");
        }

        // Grab the first decorator which is an identifier that will reference a blackboard function.
        const decoratorFunctionName = decoratorArguments.shift();

        // Any remaining decorator arguments must have a type of string, number, boolean or null.
        decoratorArguments
            .filter(arg => arg.type === "identifier")
            .forEach(arg => { throw new Error("invalid decorator argument value '" + arg.value + "', must be string, number, boolean or null") });

        // Create the decorator and add it to the array of decorators found.
        decorators.push(decoratorFactory(decoratorFunctionName, decoratorArguments));

        // Try to get the next decorator name token, as there could be multiple.
        decoratorFactory = DecoratorFactories[(tokens[0] || "").toUpperCase()];
    }
  
	return decorators;
};


/**
 * Swaps out any node/decorator argument string literals with placeholders.
 * @param definition The definition.
 * @returns An object containing a mapping of placeholders to original string values as well as the processed definition string.
 */
function substituteStringLiterals(definition) {
    // Create an object to hold the mapping of placeholders to original string values.
    const placeholders = {};

    // Replace any string literals wrapped with double quotes in our definition with placeholders to be processed later.
    const processedDefinition = definition.replace(
        /\"(\\.|[^"\\])*\"/g,
        (match) => {
            var strippedMatch = match.substring(1, match.length - 1);
            var placeholder   = Object.keys(placeholders).find(key => placeholders[key] === strippedMatch);
            
            // If we have no existing string literal match then create a new placeholder.
            if (!placeholder) {
                placeholder = `@@${Object.keys(placeholders).length}@@`;
                placeholders[placeholder] = strippedMatch;
            } 
            
            return placeholder;
        }
    );

    return { placeholders, processedDefinition };
};

/**
 * Parse the tree definition into an array of raw tokens.
 * @param definition The definition.
 * @returns An array of tokens parsed from the definition.
 */
function parseTokensFromDefinition(definition) {
    // Add some space around various important characters so that they can be plucked out easier as individual tokens.
    definition = definition.replace(/\(/g, " ( ");
    definition = definition.replace(/\)/g, " ) ");
    definition = definition.replace(/\{/g, " { ");
    definition = definition.replace(/\}/g, " } ");
    definition = definition.replace(/\]/g, " ] ");
    definition = definition.replace(/\[/g, " [ ");
    definition = definition.replace(/\,/g, " , ");

    // Split the definition into raw token form and return it.
    return definition.replace(/\s+/g, " ").trim().split(" ");
};