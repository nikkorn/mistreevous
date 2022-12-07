import Action from "./nodes/leaf/action";
import Condition from "./nodes/leaf/condition";
import Wait from "./nodes/leaf/wait";
import Root from "./nodes/decorator/root";
import Repeat from "./nodes/decorator/repeat";
import Retry from "./nodes/decorator/retry";
import Flip from "./nodes/decorator/flip";
import Succeed from "./nodes/decorator/succeed";
import Fail from "./nodes/decorator/fail";
import Lotto from "./nodes/composite/lotto";
import Selector from "./nodes/composite/selector";
import Sequence from "./nodes/composite/sequence";
import Parallel from "./nodes/composite/parallel";
import Node from "./nodes/node";
import While from "./attributes/guards/while";
import Until from "./attributes/guards/until";
import Entry from "./attributes/callbacks/entry";
import Exit from "./attributes/callbacks/exit";
import Step from "./attributes/callbacks/step";
import Callback from "./attributes/callbacks/callback";
import Guard from "./attributes/guards/guard";
import Attribute from "./attributes/attribute";
import Composite from "./nodes/composite/composite";
import Decorator from "./nodes/decorator/decorator";
import Leaf from "./nodes/leaf/leaf";

export type Argument<T> = {
    value: T;
    type: string; // Used for validation.
};
type NullArgument = Argument<null> & {
    type: "null";
};
type BooleanArgument = Argument<boolean> & {
    type: "boolean";
};
type NumberArgument = Argument<number> & {
    type: "number";
    isInteger: boolean; // Used for validation.
};
type StringPlaceholderArgument = Argument<string> & {
    type: "string";
};
type IdentifierArgument = Argument<string> & {
    type: "identifier";
};
export type AnyArgument =
    | NullArgument
    | BooleanArgument
    | NumberArgument
    | StringPlaceholderArgument
    | IdentifierArgument;

/**
 * The node attribute factories.
 */
const AttributeFactories: {
    [key: string]: (functionName: string, attributeArguments: AnyArgument[]) => Callback | Guard;
} = {
    WHILE: (condition: string, attributeArguments: AnyArgument[]) => new While(condition, attributeArguments),
    UNTIL: (condition: string, attributeArguments: AnyArgument[]) => new Until(condition, attributeArguments),
    ENTRY: (functionName: string, attributeArguments: AnyArgument[]) => new Entry(functionName, attributeArguments),
    EXIT: (functionName: string, attributeArguments: AnyArgument[]) => new Exit(functionName, attributeArguments),
    STEP: (functionName: string, attributeArguments: AnyArgument[]) => new Step(functionName, attributeArguments)
};

type NamedRootNodeProvider = (name: string) => RootAstNode;
type NodeInstanceCreator<T extends Node> = (
    namedRootNodeProvider: NamedRootNodeProvider,
    visitedBranches: string[]
) => T;
type Placeholders = { [key: string]: string };
// "definitionLevelNode"

type Validatable = {
    children?: AstNode<Node>[];
    validate: (depth: number) => void;
};

export type AstNode<T extends Node> = Validatable & {
    type: string;
    createNodeInstance: NodeInstanceCreator<T>;
};

export type InitialAstNode = AstNode<Node> & {
    createNodeInstance: NodeInstanceCreator<Node>;
};

export type BranchAstNode = AstNode<Node> & {
    type: "branch";
    branchName: "" | string;
    createNodeInstance: NodeInstanceCreator<Node>;
};

export type CompositeAstNode = AstNode<Composite> & {
    type: "lotto" | "parallel" | "selector" | "sequence";
    createNodeInstance: NodeInstanceCreator<Composite>;
    attributes: Attribute[] | null;
    children: AstNode<Node>[];
};
export type LottoAstNode = CompositeAstNode &
    AstNode<Lotto> & {
        type: "lotto";
        createNodeInstance: NodeInstanceCreator<Lotto>;
        tickets: number[];
    };

export type DecoratorAstNode = AstNode<Decorator> & {
    type: "fail" | "flip" | "repeat" | "retry" | "root" | "succeed";
    createNodeInstance: NodeInstanceCreator<Decorator>;
    attributes: Attribute[] | null; // TODO Should these be nullable?
    children: AstNode<Node>[];
};
export type RootAstNode = DecoratorAstNode &
    AstNode<Root> & {
        type: "root";
        createNodeInstance: NodeInstanceCreator<Root>;
        name: null | string;
    };
export type IterableAstNode = DecoratorAstNode &
    AstNode<Repeat | Retry> & {
        type: "repeat" | "retry";
        createNodeInstance: NodeInstanceCreator<Repeat | Retry>;
        iterations: null | number;
        maximumIterations: null | number;
    };

export type LeafAstNode = AstNode<Leaf> & {
    type: "action" | "condition" | "wait";
    createNodeInstance: NodeInstanceCreator<Leaf>;
    attributes: Attribute[] | null; // TODO Should these be nullable?
};
export type ActionAstNode = LeafAstNode &
    AstNode<Action> & {
        type: "action";
        createNodeInstance: NodeInstanceCreator<Leaf>;
        actionName: string;
        actionArguments: AnyArgument[];
    };
export type ConditionAstNode = LeafAstNode &
    AstNode<Condition> & {
        type: "condition";
        createNodeInstance: NodeInstanceCreator<Condition>;
        conditionName: string;
        conditionArguments: AnyArgument[];
    };
export type WaitAstNode = LeafAstNode &
    AstNode<Wait> & {
        type: "wait";
        createNodeInstance: NodeInstanceCreator<Wait>;
        duration: number | null;
        longestDuration: number | null;
    };

export type AnyAstNode =
    | InitialAstNode
    | BranchAstNode
    | CompositeAstNode
    | LottoAstNode
    | DecoratorAstNode
    | RootAstNode
    | IterableAstNode
    | LeafAstNode
    | ActionAstNode
    | ConditionAstNode
    | WaitAstNode;

/**
 * The AST node factories.
 */
const ASTNodeFactories = {
    ROOT: (): RootAstNode => ({
        type: "root",
        attributes: [],
        name: null,
        children: [],
        validate(depth: number) {
            // A root node cannot be the child of another node.
            if (depth > 1) {
                throw new Error("a root node cannot be the child of another node");
            }

            // A root node must have a single child node.
            if (this.children.length !== 1) {
                throw new Error("a root node must have a single child");
            }
        },
        createNodeInstance(namedRootNodeProvider, visitedBranches) {
            return new Root(
                this.attributes,
                this.children![0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
            );
        }
    }),
    BRANCH: (): BranchAstNode => ({
        type: "branch",
        branchName: "",
        validate() {},
        createNodeInstance(namedRootNodeProvider, visitedBranches) {
            // Try to find the root node with a matching branch name.
            const targetRootNode = namedRootNodeProvider(this.branchName);

            // If we have already visited this branch then we have a circular dependency.
            if (visitedBranches.indexOf(this.branchName) !== -1) {
                throw new Error(`circular dependency found in branch node references for branch '${this.branchName}'`);
            }

            // If we have a target root node, then the node instance we want will be the first and only child of the referenced root node.
            if (targetRootNode) {
                return targetRootNode
                    .createNodeInstance(namedRootNodeProvider, visitedBranches.concat(this.branchName))
                    .getChildren()[0];
            } else {
                throw new Error(`branch references root node '${this.branchName}' which has not been defined`);
            }
        }
    }),
    SELECTOR: (): CompositeAstNode => ({
        type: "selector",
        attributes: [],
        children: [],
        validate() {
            // A selector node must have at least a single node.
            if (this.children.length < 1) {
                throw new Error("a selector node must have at least a single child");
            }
        },
        createNodeInstance(namedRootNodeProvider, visitedBranches) {
            return new Selector(
                this.attributes,
                this.children.map((child) => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice()))
            );
        }
    }),
    SEQUENCE: (): CompositeAstNode => ({
        type: "sequence",
        attributes: [],
        children: [],
        validate() {
            // A sequence node must have at least a single node.
            if (this.children.length < 1) {
                throw new Error("a sequence node must have at least a single child");
            }
        },
        createNodeInstance(namedRootNodeProvider, visitedBranches) {
            return new Sequence(
                this.attributes,
                this.children.map((child) => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice()))
            );
        }
    }),
    PARALLEL: (): CompositeAstNode => ({
        type: "parallel",
        attributes: [],
        children: [],
        validate() {
            // A parallel node must have at least a single node.
            if (this.children.length < 1) {
                throw new Error("a parallel node must have at least a single child");
            }
        },
        createNodeInstance(namedRootNodeProvider, visitedBranches) {
            return new Parallel(
                this.attributes,
                this.children.map((child) => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice()))
            );
        }
    }),
    LOTTO: (): LottoAstNode => ({
        type: "lotto",
        attributes: [],
        children: [],
        tickets: [],
        validate() {
            // A lotto node must have at least a single node.
            if (this.children!.length < 1) {
                throw new Error("a lotto node must have at least a single child");
            }
        },
        createNodeInstance(namedRootNodeProvider, visitedBranches) {
            return new Lotto(
                this.attributes,
                this.tickets!,
                this.children!.map((child) => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice()))
            );
        }
    }),
    REPEAT: (): IterableAstNode => ({
        type: "repeat",
        attributes: [],
        iterations: null,
        maximumIterations: null,
        children: [],
        validate() {
            // A repeat node must have a single node.
            if (this.children!.length !== 1) {
                throw new Error("a repeat node must have a single child");
            }

            // A repeat node must have a positive number of iterations if defined.
            if (this.iterations !== null && this.iterations! < 0) {
                throw new Error("a repeat node must have a positive number of iterations if defined");
            }

            // There is validation to carry out if a longest duration was defined.
            if (this.maximumIterations !== null) {
                // A repeat node must have a positive maximum iterations count if defined.
                if (this.maximumIterations! < 0) {
                    throw new Error("a repeat node must have a positive maximum iterations count if defined");
                }

                // A repeat node must not have an iteration count that exceeds the maximum iteration count.
                if (this.iterations! > this.maximumIterations!) {
                    throw new Error(
                        "a repeat node must not have an iteration count that exceeds the maximum iteration count"
                    );
                }
            }
        },
        createNodeInstance(namedRootNodeProvider, visitedBranches) {
            return new Repeat(
                this.attributes,
                this.iterations!,
                this.maximumIterations!,
                this.children![0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
            );
        }
    }),
    RETRY: (): IterableAstNode => ({
        type: "retry",
        attributes: [],
        iterations: null,
        maximumIterations: null,
        children: [],
        validate() {
            // A retry node must have a single node.
            if (this.children!.length !== 1) {
                throw new Error("a retry node must have a single child");
            }

            // A retry node must have a positive number of iterations if defined.
            if (this.iterations !== null && this.iterations! < 0) {
                throw new Error("a retry node must have a positive number of iterations if defined");
            }

            // There is validation to carry out if a longest duration was defined.
            if (this.maximumIterations !== null) {
                // A retry node must have a positive maximum iterations count if defined.
                if (this.maximumIterations! < 0) {
                    throw new Error("a retry node must have a positive maximum iterations count if defined");
                }

                // A retry node must not have an iteration count that exceeds the maximum iteration count.
                if (this.iterations! > this.maximumIterations!) {
                    throw new Error(
                        "a retry node must not have an iteration count that exceeds the maximum iteration count"
                    );
                }
            }
        },
        createNodeInstance(namedRootNodeProvider, visitedBranches) {
            return new Retry(
                this.attributes,
                this.iterations!,
                this.maximumIterations!,
                this.children![0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
            );
        }
    }),
    FLIP: (): DecoratorAstNode => ({
        type: "flip",
        attributes: [],
        children: [],
        validate() {
            // A flip node must have a single node.
            if (this.children!.length !== 1) {
                throw new Error("a flip node must have a single child");
            }
        },
        createNodeInstance(namedRootNodeProvider, visitedBranches) {
            return new Flip(
                this.attributes,
                this.children![0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
            );
        }
    }),
    SUCCEED: (): DecoratorAstNode => ({
        type: "succeed",
        attributes: [],
        children: [],
        validate() {
            // A succeed node must have a single node.
            if (this.children!.length !== 1) {
                throw new Error("a succeed node must have a single child");
            }
        },
        createNodeInstance(namedRootNodeProvider, visitedBranches) {
            return new Succeed(
                this.attributes,
                this.children![0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
            );
        }
    }),
    FAIL: (): DecoratorAstNode => ({
        type: "fail",
        attributes: [],
        children: [],
        validate() {
            // A fail node must have a single node.
            if (this.children!.length !== 1) {
                throw new Error("a fail node must have a single child");
            }
        },
        createNodeInstance(namedRootNodeProvider, visitedBranches) {
            return new Fail(
                this.attributes,
                this.children![0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
            );
        }
    }),
    WAIT: (): WaitAstNode => ({
        type: "wait",
        attributes: [],
        duration: null,
        longestDuration: null,
        validate() {
            // A wait node must have a positive duration.
            if (this.duration! < 0) {
                throw new Error("a wait node must have a positive duration");
            }

            // There is validation to carry out if a longest duration was defined.
            if (this.longestDuration) {
                // A wait node must have a positive longest duration.
                if (this.longestDuration < 0) {
                    throw new Error("a wait node must have a positive longest duration if one is defined");
                }

                // A wait node must not have a duration that exceeds the longest duration.
                if (this.duration! > this.longestDuration) {
                    throw new Error("a wait node must not have a shortest duration that exceeds the longest duration");
                }
            }
        },
        createNodeInstance() {
            return new Wait(this.attributes, this.duration!, this.longestDuration!);
        }
    }),
    ACTION: (): ActionAstNode => ({
        type: "action",
        attributes: [],
        actionName: "",
        actionArguments: [],
        validate() {},
        createNodeInstance() {
            return new Action(this.attributes, this.actionName!, this.actionArguments!);
        }
    }),
    CONDITION: (): ConditionAstNode => ({
        type: "condition",
        attributes: [],
        conditionName: "",
        conditionArguments: [],
        validate() {},
        createNodeInstance() {
            return new Condition(this.attributes, this.conditionName!, this.conditionArguments!);
        }
    })
};

type OtherAstNodes = AstNode<Node>[];

/**
 * Create an array of root AST nodes based on the given definition.
 * @param definition The definition to parse the AST nodes from.
 * @returns The base definition AST nodes.
 */
export default function buildRootASTNodes(definition: string): RootAstNode[] {
    // Swap out any node/attribute argument string literals with a placeholder and get a mapping of placeholders to original values as well as the processed definition.
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
    const stack: [RootAstNode[], ...OtherAstNodes[]] = [[]];
    const rootScope = stack[0];

    // We should keep processing the raw tokens until we run out of them.
    while (tokens.length) {
        // Grab the next token.
        const token = tokens.shift();

        const currentScope = (stack[stack.length - 1] as OtherAstNodes);

        // How we create the next AST token depends on the current raw token value.
        switch (token!.toUpperCase()) {
            case "ROOT": {
                // Create a ROOT AST node.
                const node = ASTNodeFactories.ROOT();

                // Push the ROOT node into the current scope.
                rootScope.push(node);

                // We may have a root node name defined as an argument.
                if (tokens[0] === "[") {
                    const rootArguments = getArguments(tokens, placeholders);

                    // We should have only a single argument that is not an empty string for a root node, which is the root name identifier.
                    if (rootArguments.length === 1 && rootArguments[0].type === "identifier") {
                        // The root name will be the first and only node argument.
                        node.name = rootArguments[0].value as string;
                    } else {
                        throw new Error("expected single root name argument");
                    }
                }

                // Try to pick any attributes off of the token stack.
                node.attributes = getAttributes(tokens, placeholders);

                popAndCheck(tokens, "{");

                // The new scope is that of the new ROOT nodes children.
                stack.push(node.children!);
                break;
            }

            case "BRANCH": {
                // Create a BRANCH AST node.
                const node = ASTNodeFactories.BRANCH();

                // Push the BRANCH node into the current scope.
                currentScope.push(node);

                // We must have arguments defined, as we require a branch name argument.
                if (tokens[0] !== "[") {
                    throw new Error("expected single branch name argument");
                }

                // The branch name will be defined as a node argument.
                const branchArguments = getArguments(tokens, placeholders);

                // We should have only a single identifer argument for a branch node, which is the branch name.
                if (branchArguments.length === 1 && branchArguments[0].type === "identifier") {
                    // The branch name will be the first and only node argument.
                    node.branchName = branchArguments[0].value as string;
                } else {
                    throw new Error("expected single branch name argument");
                }
                break;
            }

            case "SELECTOR": {
                // Create a SELECTOR AST node.
                const node = ASTNodeFactories.SELECTOR();

                // Push the SELECTOR node into the current scope.
                currentScope.push(node);

                // Try to pick any attributes off of the token stack.
                node.attributes = getAttributes(tokens, placeholders);

                popAndCheck(tokens, "{");

                // The new scope is that of the new SELECTOR nodes children.
                stack.push(node.children!);
                break;
            }

            case "SEQUENCE": {
                // Create a SEQUENCE AST node.
                const node = ASTNodeFactories.SEQUENCE();

                // Push the SEQUENCE node into the current scope.
                currentScope.push(node);

                // Try to pick any attributes off of the token stack.
                node.attributes = getAttributes(tokens, placeholders);

                popAndCheck(tokens, "{");

                // The new scope is that of the new SEQUENCE nodes children.
                stack.push(node.children!);
                break;
            }

            case "PARALLEL": {
                // Create a PARALLEL AST node.
                const node = ASTNodeFactories.PARALLEL();

                // Push the PARALLEL node into the current scope.
                currentScope.push(node);

                // Try to pick any attributes off of the token stack.
                node.attributes = getAttributes(tokens, placeholders);

                popAndCheck(tokens, "{");

                // The new scope is that of the new PARALLEL nodes children.
                stack.push(node.children!);
                break;
            }

            case "LOTTO": {
                // Create a LOTTO AST node.
                const node = ASTNodeFactories.LOTTO();

                // Push the LOTTO node into the current scope.
                currentScope.push(node);

                // If the next token is a '[' character then some ticket counts have been defined as arguments.
                if (tokens[0] === "[") {
                    // Get the ticket count arguments, each argument must be a number.
                    node.tickets = getArguments(
                        tokens,
                        placeholders,
                        (arg) => arg.type === "number" && !!arg.isInteger,
                        "lotto node ticket counts must be integer values"
                    ).map((argument) => argument.value as number);
                }

                // Try to pick any attributes off of the token stack.
                node.attributes = getAttributes(tokens, placeholders);

                popAndCheck(tokens, "{");

                // The new scope is that of the new LOTTO nodes children.
                stack.push(node.children!);
                break;
            }

            case "CONDITION": {
                // Create a CONDITION AST node.
                const node = ASTNodeFactories.CONDITION();

                // Push the CONDITION node into the current scope.
                currentScope.push(node);

                // We must have arguments defined, as we require a condition function name argument.
                if (tokens[0] !== "[") {
                    throw new Error("expected condition name identifier argument");
                }

                // Grab the condition node arguments.
                const conditionArguments = getArguments(tokens, placeholders);

                // We should have at least a single identifier argument for a condition node, which is the condition function name.
                if (conditionArguments.length && conditionArguments[0].type === "identifier") {
                    // The condition function name will be the first node argument.
                    node.conditionName = conditionArguments.shift()!.value as string;
                } else {
                    throw new Error("expected condition name identifier argument");
                }

                // Only the first argument should have been an identifier, all following arguments must be string, number, boolean or null.
                conditionArguments
                    .filter((arg) => arg.type === "identifier")
                    .forEach((arg) => {
                        throw new Error(
                            "invalid condition node argument value '" +
                                arg.value +
                                "', must be string, number, boolean or null"
                        );
                    });

                // Any node arguments that follow the condition name identifier will be treated as condition function arguments.
                node.conditionArguments = conditionArguments;

                // Try to pick any attributes off of the token stack.
                node.attributes = getAttributes(tokens, placeholders);
                break;
            }

            case "FLIP": {
                // Create a FLIP AST node.
                const node = ASTNodeFactories.FLIP();

                // Push the Flip node into the current scope.
                currentScope.push(node);

                // Try to pick any attributes off of the token stack.
                node.attributes = getAttributes(tokens, placeholders);

                popAndCheck(tokens, "{");

                // The new scope is that of the new FLIP nodes children.
                stack.push(node.children!);
                break;
            }

            case "SUCCEED": {
                // Create a SUCCEED AST node.
                const node = ASTNodeFactories.SUCCEED();

                // Push the Succeed node into the current scope.
                currentScope.push(node);

                // Try to pick any attributes off of the token stack.
                node.attributes = getAttributes(tokens, placeholders);

                popAndCheck(tokens, "{");

                // The new scope is that of the new Succeed nodes children.
                stack.push(node.children!);
                break;
            }

            case "FAIL": {
                // Create a FAIL AST node.
                const node = ASTNodeFactories.FAIL();

                // Push the Fail node into the current scope.
                currentScope.push(node);

                // Try to pick any attributes off of the token stack.
                node.attributes = getAttributes(tokens, placeholders);

                popAndCheck(tokens, "{");

                // The new scope is that of the new Fail nodes children.
                stack.push(node.children!);
                break;
            }

            case "WAIT": {
                // Create a WAIT AST node.
                const node = ASTNodeFactories.WAIT();

                // Push the WAIT node into the current scope.
                currentScope.push(node);

                // Get the duration and potential longest duration of the wait.
                const durations = getArguments(
                    tokens,
                    placeholders,
                    (arg) => arg.type === "number" && !!arg.isInteger,
                    "wait node durations must be integer values"
                ).map((argument) => argument.value);

                // We should have got one or two durations.
                if (durations.length === 1) {
                    // A static duration was defined.
                    node.duration = durations[0] as number;
                } else if (durations.length === 2) {
                    // A shortest and longest duration was defined.
                    node.duration = durations[0] as number;
                    node.longestDuration = durations[1] as number;
                } else {
                    // An incorrect number of durations was defined.
                    throw new Error("invalid number of wait node duration arguments defined");
                }

                // Try to pick any attributes off of the token stack.
                node.attributes = getAttributes(tokens, placeholders);
                break;
            }

            case "REPEAT": {
                // Create a REPEAT AST node.
                const node = ASTNodeFactories.REPEAT();

                // Push the REPEAT node into the current scope.
                currentScope.push(node);

                // Check for iteration counts ([])
                if (tokens[0] === "[") {
                    // An iteration count has been defined. Get the iteration and potential maximum iteration of the wait.
                    const iterationArguments = getArguments(
                        tokens,
                        placeholders,
                        (arg) => arg.type === "number" && !!arg.isInteger,
                        "repeat node iteration counts must be integer values"
                    ).map((argument) => argument.value);

                    // We should have got one or two iteration counts.
                    if (iterationArguments.length === 1) {
                        // A static iteration count was defined.
                        node.iterations = iterationArguments[0] as number;
                    } else if (iterationArguments.length === 2) {
                        // A minimum and maximum iteration count was defined.
                        node.iterations = iterationArguments[0] as number;
                        node.maximumIterations = iterationArguments[1] as number;
                    } else {
                        // An incorrect number of iteration counts was defined.
                        throw new Error("invalid number of repeat node iteration count arguments defined");
                    }
                }

                // Try to pick any attributes off of the token stack.
                node.attributes = getAttributes(tokens, placeholders);

                popAndCheck(tokens, "{");

                // The new scope is that of the new REPEAT nodes children.
                stack.push(node.children!);
                break;
            }

            case "RETRY": {
                // Create a RETRY AST node.
                const node = ASTNodeFactories.RETRY();

                // Push the RETRY node into the current scope.
                currentScope.push(node);

                // Check for iteration counts ([])
                if (tokens[0] === "[") {
                    // An iteration count has been defined. Get the iteration and potential maximum iteration of the wait.
                    const iterationArguments = getArguments(
                        tokens,
                        placeholders,
                        (arg) => arg.type === "number" && !!arg.isInteger,
                        "retry node iteration counts must be integer values"
                    ).map((argument) => argument.value);

                    // We should have got one or two iteration counts.
                    if (iterationArguments.length === 1) {
                        // A static iteration count was defined.
                        node.iterations = iterationArguments[0] as number;
                    } else if (iterationArguments.length === 2) {
                        // A minimum and maximum iteration count was defined.
                        node.iterations = iterationArguments[0] as number;
                        node.maximumIterations = iterationArguments[1] as number;
                    } else {
                        // An incorrect number of iteration counts was defined.
                        throw new Error("invalid number of retry node iteration count arguments defined");
                    }
                }

                // Try to pick any attributes off of the token stack.
                node.attributes = getAttributes(tokens, placeholders);

                popAndCheck(tokens, "{");

                // The new scope is that of the new RETRY nodes children.
                stack.push(node.children!);
                break;
            }

            case "ACTION": {
                // Create a ACTION AST node.
                const node = ASTNodeFactories.ACTION();

                // Push the ACTION node into the current scope.
                currentScope.push(node);

                // We must have arguments defined, as we require an action name argument.
                if (tokens[0] !== "[") {
                    throw new Error("expected action name identifier argument");
                }

                // The action name will be defined as a node argument.
                const actionArguments = getArguments(tokens, placeholders);

                // We should have at least one identifer argument for an action node, which is the action name.
                if (actionArguments.length && actionArguments[0].type === "identifier") {
                    // The action name will be the first and only node argument.
                    node.actionName = actionArguments.shift()!.value as string;
                } else {
                    throw new Error("expected action name identifier argument");
                }

                // Only the first argument should have been an identifier, all following arguments must be string, number, boolean or null.
                actionArguments
                    .filter((arg) => arg.type === "identifier")
                    .forEach((arg) => {
                        throw new Error(
                            "invalid action node argument value '" +
                                arg.value +
                                "', must be string, number, boolean or null"
                        );
                    });

                // Any node arguments that follow the action name identifier will be treated as action function arguments.
                node.actionArguments = actionArguments;

                // Try to pick any attributes off of the token stack.
                node.attributes = getAttributes(tokens, placeholders);
                break;
            }

            case "}": {
                // The '}' character closes the current scope.
                stack.pop();
                break;
            }

            default: {
                throw new Error("unexpected token: " + token);
            }
        }
    }

    // A function to recursively validate each of the nodes in the AST.
    const validateASTNode = (node: Validatable, depth: number): void => {
        // Validate the node.
        node.validate(depth);

        // Validate each child of the node.
        (node.children || []).forEach((child) => validateASTNode(child, depth + 1));
    };

    // Start node validation from the definition root.
    validateASTNode(
        {
            children: stack[0] as RootAstNode[],
            validate(this: { children: RootAstNode[] }) {
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
                if (
                    this.children.filter(
                        (definitionLevelNode) => definitionLevelNode.name === null
                    ).length !== 1
                ) {
                    throw new Error("expected single unnamed root node at base of definition to act as main root");
                }

                // No two named root nodes can have matching names.
                const rootNodeNames: string[] = [];
                for (const definitionLevelNode of this.children) {
                    if (rootNodeNames.indexOf(definitionLevelNode.name!) !== -1) {
                        throw new Error(
                            `multiple root nodes found with duplicate name '${
                                definitionLevelNode.name
                            }'`
                        );
                    } else {
                        rootNodeNames.push(definitionLevelNode.name!);
                    }
                }
            }
        },
        0
    );

    // Return the root AST nodes.
    return stack[0];
}

/**
 * Pop the next raw token off of the stack and throw an error if it wasn't the expected one.
 * @param tokens The array of remaining tokens.
 * @param expected An optional string or array or items, one of which must match the next popped token.
 * @returns The popped token.
 */
function popAndCheck(tokens: string[], expected: string | string[]) {
    // Get and remove the next token.
    const popped = tokens.shift();

    // We were expecting another token.
    if (popped === undefined) {
        throw new Error("unexpected end of definition");
    }

    // Do we have an expected token/tokens array?
    if (expected !== undefined) {
        // Check whether the popped token matches at least one of our expected items.
        var tokenMatchesExpectation = ([] as string[])
            .concat(expected)
            .some((item) => popped.toUpperCase() === item.toUpperCase());

        // Throw an error if the popped token didn't match any of our expected items.
        if (!tokenMatchesExpectation) {
            const expectationString = ([] as string[])
                .concat(expected)
                .map((item) => "'" + item + "'")
                .join(" or ");
            throw new Error("unexpected token found. Expected " + expectationString + " but got '" + popped + "'");
        }
    }

    // Return the popped token.
    return popped;
}

/**
 * Pull an argument definition list off of the token stack.
 * @param tokens The array of remaining tokens.
 * @param stringArgumentPlaceholders The mapping of string literal node argument placeholders to original values.
 * @param argumentValidator The argument validator function.
 * @param validationFailedMessage  The exception message to throw if argument validation fails.
 * @returns The argument definition list.
 */
function getArguments(
    tokens: string[],
    stringArgumentPlaceholders: Placeholders,
    argumentValidator?: (arg: AnyArgument) => boolean,
    validationFailedMessage?: string
) {
    // Any lists of arguments will always be wrapped in '[]' for node arguments or '()' for attribute arguments.
    // We are looking for a '[' or '(' opener that wraps the argument tokens and the relevant closer.
    const closer = popAndCheck(tokens, ["[", "("]) === "[" ? "]" : ")";

    const argumentListTokens: string[] = [];
    const argumentList: AnyArgument[] = [];

    // Grab all tokens between the '[' and ']' or '(' and ')'.
    while (tokens.length && tokens[0] !== closer) {
        // The next token is part of our arguments list.
        argumentListTokens.push(tokens.shift()!);
    }

    // Validate the order of the argument tokens. Each token must either be a ',' or a single argument that satisfies the validator.
    argumentListTokens.forEach((token, index) => {
        // Get whether this token should be an actual argument.
        const shouldBeArgumentToken = !(index & 1);

        // If the current token should be an actual argument then validate it,otherwise it should be a ',' token.
        if (shouldBeArgumentToken) {
            // Get the argument definition.
            const argumentDefinition = getArgumentDefinition(token!, stringArgumentPlaceholders);

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
}

/**
 * Gets an argument value definition.
 * @param token The argument token.
 * @param stringArgumentPlaceholders The mapping of string literal node argument placeholders to original values.
 * @returns An argument value definition.
 */
function getArgumentDefinition(token: string, stringArgumentPlaceholders: Placeholders): AnyArgument {
    // Check whether the token represents a null value.
    if (token === "null") {
        return {
            value: null,
            type: "null"
        } as NullArgument;
    }

    // Check whether the token represents a boolean value.
    if (token === "true" || token === "false") {
        return {
            value: token === "true",
            type: "boolean"
        } as BooleanArgument;
    }

    // Check whether the token represents a number value.
    // TODO: Relies on broken isNaN - see MDN.
    // if (!Number.isNaN(token)) {
    if (!isNaN(token as any)) {
        return {
            value: parseFloat(token),
            isInteger: parseFloat(token) === parseInt(token, 10),
            type: "number"
        } as NumberArgument;
    }

    // Check whether the token is a placeholder (e.g. @@0@@) representing a string literal.
    if (token.match(/^@@\d+@@$/g)) {
        return {
            value: stringArgumentPlaceholders[token].replace('\\"', '"'),
            type: "string"
        } as StringPlaceholderArgument;
    }

    // The only remaining option is that the argument value is an identifier.
    return {
        value: token,
        type: "identifier"
    } as IdentifierArgument;
}

/**
 * Pull any attributes off of the token stack.
 * @param tokens The array of remaining tokens.
 * @param stringArgumentPlaceholders The mapping of string literal node argument placeholders to original values.
 * @returns An array of attributes defined by any directly following tokens.
 */
function getAttributes(tokens: string[], stringArgumentPlaceholders: Placeholders) {
    // Create an array to hold any attributes found.
    const attributes: Attribute[] = [];

    // Keep track of names of attribute that we have found on the token stack, as we cannot have duplicates.
    const attributesFound: string[] = [];

    // Try to get the attribute factory for the next token.
    let attributeFactory = AttributeFactories[(tokens[0] || "").toUpperCase()];

    // Pull attribute tokens off of the tokens stack until we have no more.
    while (attributeFactory) {
        // Check to make sure that we have not already created a attribute of this type for this node.
        if (attributesFound.indexOf(tokens[0].toUpperCase()) !== -1) {
            throw new Error(`duplicate attribute '${tokens[0].toUpperCase()}' found for node`);
        }

        // Add the current attribute type to our array of found attributes.
        attributesFound.push(tokens.shift()!.toUpperCase());

        // Grab any attribute arguments.
        const attributeArguments = getArguments(tokens, stringArgumentPlaceholders);

        // The first attribute argument has to be an identifer, this will reference an agent function.
        if (attributeArguments.length === 0 || attributeArguments[0].type !== "identifier") {
            throw new Error("expected agent function name identifier argument for attribute");
        }

        // Grab the first attribute which is an identifier that will reference an agent function.
        const attributeFunctionName = attributeArguments.shift()! as IdentifierArgument;

        // Any remaining attribute arguments must have a type of string, number, boolean or null.
        attributeArguments
            .filter((arg) => arg.type === "identifier")
            .forEach((arg) => {
                throw new Error(
                    "invalid attribute argument value '" + arg.value + "', must be string, number, boolean or null"
                );
            });

        // Create the attribute and add it to the array of attributes found.
        // TODO: Is this a bug? Passing an IdentifierArgument as a string.
        attributes.push(attributeFactory(attributeFunctionName as any as string, attributeArguments));

        // Try to get the next attribute name token, as there could be multiple.
        attributeFactory = AttributeFactories[(tokens[0] || "").toUpperCase()];
    }

    return attributes;
}

/**
 * Swaps out any node/attribute argument string literals with placeholders.
 * @param definition The definition.
 * @returns An object containing a mapping of placeholders to original string values as well as the processed definition string.
 */
function substituteStringLiterals(definition: string): {
    placeholders: { [key: string]: string };
    processedDefinition: string;
} {
    // Create an object to hold the mapping of placeholders to original string values.
    const placeholders: Placeholders = {};

    // Replace any string literals wrapped with double quotes in our definition with placeholders to be processed later.
    const processedDefinition = definition.replace(/\"(\\.|[^"\\])*\"/g, (match) => {
        var strippedMatch = match.substring(1, match.length - 1);
        var placeholder = Object.keys(placeholders).find((key) => placeholders[key] === strippedMatch);

        // If we have no existing string literal match then create a new placeholder.
        if (!placeholder) {
            placeholder = `@@${Object.keys(placeholders).length}@@`;
            placeholders[placeholder] = strippedMatch;
        }

        return placeholder;
    });

    return { placeholders, processedDefinition };
}

/**
 * Parse the tree definition into an array of raw tokens.
 * @param definition The definition.
 * @returns An array of tokens parsed from the definition.
 */
function parseTokensFromDefinition(definition: string): string[] {
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
}
