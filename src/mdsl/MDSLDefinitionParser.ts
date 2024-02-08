import {
    ActionNodeDefinition,
    AnyChildNodeDefinition,
    AnyNodeDefinition,
    BranchNodeDefinition,
    ConditionNodeDefinition,
    FailNodeDefinition,
    FlipNodeDefinition,
    LottoNodeDefinition,
    ParallelNodeDefinition,
    RepeatNodeDefinition,
    RetryNodeDefinition,
    RootNodeDefinition,
    SelectorNodeDefinition,
    SequenceNodeDefinition,
    SucceedNodeDefinition,
    WaitNodeDefinition
} from "../BehaviourTreeDefinition";
import {
    isCompositeNode,
    isDecoratorNode,
    isLeafNode,
    isNullOrUndefined,
    isRootNode
} from "../BehaviourTreeDefinitionUtilities";
import { parseArgumentTokens } from "./MDSLNodeArgumentParser";
import { parseAttributeTokens } from "./MDSLNodeAttributeParser";
import {
    StringLiteralPlaceholders,
    parseTokensFromDefinition,
    popAndCheck,
    substituteStringLiterals
} from "./MDSLUtilities";

/**
 * Convert the MDSL tree definition string into an equivalent JSON definition.
 * @param definition The tree definition string as MDSL.
 * @returns The root node JSON definitions.
 */
export function convertMDSLToJSON(definition: string): RootNodeDefinition[] {
    // Swap out any node/attribute argument string literals with a placeholder and get a mapping of placeholders to original values as well as the processed definition.
    const { placeholders, processedDefinition } = substituteStringLiterals(definition);

    // Parse our definition definition string into an array of raw tokens.
    const tokens = parseTokensFromDefinition(processedDefinition);

    return convertTokensToJSONDefinition(tokens, placeholders);
}

/**
 * Converts the specified tree definition tokens into a JSON definition.
 * @param tokens The tree definition tokens.
 * @param stringLiteralPlaceholders The substituted string literal placeholders.
 * @returns The root node JSON definitions.
 */
function convertTokensToJSONDefinition(
    tokens: string[],
    stringLiteralPlaceholders: StringLiteralPlaceholders
): RootNodeDefinition[] {
    // There must be at least 3 tokens for the tree definition to be valid. 'ROOT', '{' and '}'.
    if (tokens.length < 3) {
        throw new Error("invalid token count");
    }

    // We should have a matching number of '{' and '}' tokens. If not, then there are scopes that have not been properly closed.
    if (tokens.filter((token) => token === "{").length !== tokens.filter((token) => token === "}").length) {
        throw new Error("scope character mismatch");
    }

    // Create an array of tree stack arrays where root nodes will always be at the botton and the current composite/decorator node at the top.
    // There should be an element in this array for every root node defined and every element should be an array with a root note as the first element.
    // E.g. A definition with two root nodes defined:
    // [
    //    [root, lotto, sequence],
    //    [root, selector]
    // ]
    const treeStacks: [Partial<RootNodeDefinition>, ...Partial<AnyChildNodeDefinition>[]][] = [];

    // Create an array of all root node definitions that we create.
    const rootNodes: Partial<RootNodeDefinition>[] = [];

    // A helper function used to push node definitions onto the tree stack.
    const pushNode = (node: AnyNodeDefinition) => {
        // If the node is a root node then we need to create a new tree stack array with the root node at the root.
        if (isRootNode(node)) {
            // We need to double-check that this root node is not the child of another node.
            // We can do this by checking whether the top tree stack is not empty (contains an existing node)
            if (treeStacks[treeStacks.length - 1]?.length) {
                throw new Error("a root node cannot be the child of another node");
            }

            // Add the root node definition to our array of all parsed root node definitions.
            rootNodes.push(node);

            // Add the root node definition to the root of a new tree stack.
            treeStacks.push([node]);

            return;
        }

        // All non-root nodes should be pushed after their root nodes so handle cases
        // where we may not have any tree stacks or our top-most tree stack is empty.
        if (!treeStacks.length || !treeStacks[treeStacks.length - 1].length) {
            throw new Error("expected root node at base of definition");
        }

        // Get the current tree stack that we are populating.
        const topTreeStack = treeStacks[treeStacks.length - 1];

        // Get the top-most node in the current tree stack, this will be a composite/decorator node
        // for which we will populate its children array if composite or setting its child if a decorator.
        const topTreeStackTopNode = topTreeStack[topTreeStack.length - 1] as AnyNodeDefinition;

        // If the top-most node in the current root stack is a composite or decorator
        // node then the current node should be added as a child of the top-most node.
        if (isCompositeNode(topTreeStackTopNode)) {
            topTreeStackTopNode.children = topTreeStackTopNode.children || [];
            topTreeStackTopNode.children.push(node);
        } else if (isDecoratorNode(topTreeStackTopNode)) {
            // If the top node already has a child node set then throw an error as a decorator should only have a single child.
            if (topTreeStackTopNode.child) {
                throw new Error("a decorator node must only have a single child node");
            }

            topTreeStackTopNode.child = node;
        }

        // If the node we are adding is also a composite or decorator node, then we should push it
        // onto the current tree stack, as subsequent nodes will be added as its child/children.
        if (!isLeafNode(node)) {
            topTreeStack.push(node);
        }
    };

    // A helper function used to pop the top-most node definition off of the tree stack and return it.
    const popNode = (): AnyNodeDefinition | null => {
        let poppedNode: AnyNodeDefinition | null = null;

        // Get the current tree stack that we are populating.
        const topTreeStack = treeStacks[treeStacks.length - 1];

        // Pop the top-most node in the current tree stack if there is one.
        if (topTreeStack.length) {
            poppedNode = topTreeStack.pop() as AnyNodeDefinition;
        }

        // We don't want any empty tree stacks in our stack of tree stacks.
        if (!topTreeStack.length) {
            treeStacks.pop();
        }

        return poppedNode;
    };

    // We should keep processing the raw tokens until we run out of them.
    while (tokens.length) {
        // Grab the next token.
        const token = tokens.shift()!;

        // How we create the next node depends on the current raw token value.
        switch (token.toUpperCase()) {
            case "ROOT": {
                pushNode(createRootNode(tokens, stringLiteralPlaceholders));
                break;
            }

            case "SUCCEED": {
                pushNode(createSucceedNode(tokens, stringLiteralPlaceholders));
                break;
            }

            case "FAIL": {
                pushNode(createFailNode(tokens, stringLiteralPlaceholders));
                break;
            }

            case "FLIP": {
                pushNode(createFlipNode(tokens, stringLiteralPlaceholders));
                break;
            }

            case "REPEAT": {
                pushNode(createRepeatNode(tokens, stringLiteralPlaceholders));
                break;
            }

            case "RETRY": {
                pushNode(createRetryNode(tokens, stringLiteralPlaceholders));
                break;
            }

            case "SEQUENCE": {
                pushNode(createSequenceNode(tokens, stringLiteralPlaceholders));
                break;
            }

            case "SELECTOR": {
                pushNode(createSelectorNode(tokens, stringLiteralPlaceholders));
                break;
            }

            case "PARALLEL": {
                pushNode(createParallelNode(tokens, stringLiteralPlaceholders));
                break;
            }

            case "LOTTO": {
                pushNode(createLottoNode(tokens, stringLiteralPlaceholders));
                break;
            }

            case "ACTION": {
                pushNode(createActionNode(tokens, stringLiteralPlaceholders));
                break;
            }

            case "CONDITION": {
                pushNode(createConditionNode(tokens, stringLiteralPlaceholders));
                break;
            }

            case "WAIT": {
                pushNode(createWaitNode(tokens, stringLiteralPlaceholders));
                break;
            }

            case "BRANCH": {
                pushNode(createBranchNode(tokens, stringLiteralPlaceholders));
                break;
            }

            case "}": {
                // The '}' character closes the current scope and means that we have to pop a node off of the current stack.
                const poppedNode = popNode();

                // Now that we have a node definition we can carry out any validation that may require the node to be fully populated.
                if (poppedNode) {
                    validatePoppedNode(poppedNode);
                }

                break;
            }

            default: {
                throw new Error(`unexpected token: ${token}`);
            }
        }
    }

    return rootNodes as RootNodeDefinition[];
}

/**
 * Creates a root node JSON definition.
 * @param tokens The tree definition tokens.
 * @param stringLiteralPlaceholders The substituted string literal placeholders.
 * @returns The root node JSON definition.
 */
function createRootNode(tokens: string[], stringLiteralPlaceholders: StringLiteralPlaceholders): RootNodeDefinition {
    // Create the root node definition.
    let node = {
        type: "root",
        id: undefined
    } as RootNodeDefinition;

    // Parse any node arguments, we should only have one if any which will be an identifier argument for the root identifier.
    const nodeArguments = parseArgumentTokens(tokens, stringLiteralPlaceholders);

    // Check whether any node arguments were defined.
    if (nodeArguments.length) {
        // We should only have one argument, if any, which will be an identifier argument for the root identifier.
        if (nodeArguments.length === 1 && nodeArguments[0].type === "identifier") {
            // The root node identifier will be the first and only node argument value.
            node.id = nodeArguments[0].value as string;
        } else {
            throw new Error("expected single root name argument");
        }
    }

    // Grab any node attribute definitions and spread them into the node definition.
    node = { ...node, ...parseAttributeTokens(tokens, stringLiteralPlaceholders) };

    // This is a decorator node, so we expect an opening '{'.
    popAndCheck(tokens, "{");

    // Return the root node definition.
    return node;
}

/**
 * Creates a succeed node JSON definition.
 * @param tokens The tree definition tokens.
 * @param stringLiteralPlaceholders The substituted string literal placeholders.
 * @returns The succeed node JSON definition.
 */
function createSucceedNode(
    tokens: string[],
    stringLiteralPlaceholders: StringLiteralPlaceholders
): SucceedNodeDefinition {
    const node = {
        type: "succeed",
        ...parseAttributeTokens(tokens, stringLiteralPlaceholders)
    } as SucceedNodeDefinition;

    // This is a decorator node, so we expect an opening '{'.
    popAndCheck(tokens, "{");

    // Return the succeed node definition.
    return node;
}

/**
 * Creates a fail node JSON definition.
 * @param tokens The tree definition tokens.
 * @param stringLiteralPlaceholders The substituted string literal placeholders.
 * @returns The fail node JSON definition.
 */
function createFailNode(tokens: string[], stringLiteralPlaceholders: StringLiteralPlaceholders): FailNodeDefinition {
    const node = {
        type: "fail",
        ...parseAttributeTokens(tokens, stringLiteralPlaceholders)
    } as FailNodeDefinition;

    // This is a decorator node, so we expect an opening '{'.
    popAndCheck(tokens, "{");

    // Return the fail node definition.
    return node;
}

/**
 * Creates a flip node JSON definition.
 * @param tokens The tree definition tokens.
 * @param stringLiteralPlaceholders The substituted string literal placeholders.
 * @returns The flip node JSON definition.
 */
function createFlipNode(tokens: string[], stringLiteralPlaceholders: StringLiteralPlaceholders): FlipNodeDefinition {
    const node = {
        type: "flip",
        ...parseAttributeTokens(tokens, stringLiteralPlaceholders)
    } as FlipNodeDefinition;

    // This is a decorator node, so we expect an opening '{'.
    popAndCheck(tokens, "{");

    // Return the flip node definition.
    return node;
}

/**
 * Creates a repeat node JSON definition.
 * @param tokens The tree definition tokens.
 * @param stringLiteralPlaceholders The substituted string literal placeholders.
 * @returns The repeat node JSON definition.
 */
function createRepeatNode(
    tokens: string[],
    stringLiteralPlaceholders: StringLiteralPlaceholders
): RepeatNodeDefinition {
    let node = { type: "repeat" } as RepeatNodeDefinition;

    // Get the node arguments.
    const nodeArguments = parseArgumentTokens(tokens, stringLiteralPlaceholders);

    // The arguments of a repeat node are optional. We may have:
    // - No node arguments, in which case the repeat note will iterate indefinitely.
    // - One node argument which will be the explicit number of iterations to make.
    // - Two node arguments which define the min and max iteration bounds from which a random iteration count will be picked.
    if (nodeArguments.length) {
        // All repeat node arguments MUST be of type number and must be integer.
        nodeArguments
            .filter((arg) => arg.type !== "number" || !arg.isInteger)
            .forEach(() => {
                throw new Error(`repeat node iteration counts must be integer values`);
            });

        // We should have got one or two iteration counts.
        if (nodeArguments.length === 1) {
            // A static iteration count was defined.
            node.iterations = nodeArguments[0].value as number;

            // A repeat node must have a positive number of iterations if defined.
            if (node.iterations < 0) {
                throw new Error("a repeat node must have a positive number of iterations if defined");
            }
        } else if (nodeArguments.length === 2) {
            // A minimum and maximum iteration count was defined.
            node.iterations = [nodeArguments[0].value as number, nodeArguments[1].value as number];

            // A repeat node must have a positive min and max iteration count if they are defined.
            if (node.iterations[0] < 0 || node.iterations[1] < 0) {
                throw new Error("a repeat node must have a positive minimum and maximum iteration count if defined");
            }

            // A repeat node must not have an minimum iteration count that exceeds the maximum iteration count.
            if (node.iterations[0] > node.iterations[1]) {
                throw new Error(
                    "a repeat node must not have a minimum iteration count that exceeds the maximum iteration count"
                );
            }
        } else {
            // An incorrect number of iteration counts was defined.
            throw new Error("invalid number of repeat node iteration count arguments defined");
        }
    }

    // Grab any node attribute definitions and spread them into the node definition.
    node = { ...node, ...parseAttributeTokens(tokens, stringLiteralPlaceholders) };

    // This is a decorator node, so we expect an opening '{'.
    popAndCheck(tokens, "{");

    // Return the repeat node definition.
    return node;
}

/**
 * Creates a retry node JSON definition.
 * @param tokens The tree definition tokens.
 * @param stringLiteralPlaceholders The substituted string literal placeholders.
 * @returns The retry node JSON definition.
 */
function createRetryNode(tokens: string[], stringLiteralPlaceholders: StringLiteralPlaceholders): RetryNodeDefinition {
    let node = { type: "retry" } as RetryNodeDefinition;

    // Get the node arguments.
    const nodeArguments = parseArgumentTokens(tokens, stringLiteralPlaceholders);

    // The arguments of a retry node are optional. We may have:
    // - No node arguments, in which case the retry note will attempt indefinitely.
    // - One node argument which will be the explicit number of attempts to make.
    // - Two node arguments which define the min and max attempt bounds from which a random attempt count will be picked.
    if (nodeArguments.length) {
        // All retry node arguments MUST be of type number and must be integer.
        nodeArguments
            .filter((arg) => arg.type !== "number" || !arg.isInteger)
            .forEach(() => {
                throw new Error(`retry node attempt counts must be integer values`);
            });

        // We should have got one or two attempt counts.
        if (nodeArguments.length === 1) {
            // A static attempt count was defined.
            node.attempts = nodeArguments[0].value as number;

            // A retry node must have a positive number of attempts if defined.
            if (node.attempts < 0) {
                throw new Error("a retry node must have a positive number of attempts if defined");
            }
        } else if (nodeArguments.length === 2) {
            // A minimum and maximum attempt count was defined.
            node.attempts = [nodeArguments[0].value as number, nodeArguments[1].value as number];

            // A retry node must have a positive min and max attempts count if they are defined.
            if (node.attempts[0] < 0 || node.attempts[1] < 0) {
                throw new Error("a retry node must have a positive minimum and maximum attempt count if defined");
            }

            // A retry node must not have a minimum attempt count that exceeds the maximum attempt count.
            if (node.attempts[0] > node.attempts[1]) {
                throw new Error(
                    "a retry node must not have a minimum attempt count that exceeds the maximum attempt count"
                );
            }
        } else {
            // An incorrect number of attempt counts was defined.
            throw new Error("invalid number of retry node attempt count arguments defined");
        }
    }

    // Grab any node attribute definitions and spread them into the node definition.
    node = { ...node, ...parseAttributeTokens(tokens, stringLiteralPlaceholders) };

    // This is a decorator node, so we expect an opening '{'.
    popAndCheck(tokens, "{");

    // Return the retry node definition.
    return node;
}

/**
 * Creates a sequence node JSON definition.
 * @param tokens The tree definition tokens.
 * @param stringLiteralPlaceholders The substituted string literal placeholders.
 * @returns The sequence node JSON definition.
 */
function createSequenceNode(
    tokens: string[],
    stringLiteralPlaceholders: StringLiteralPlaceholders
): SequenceNodeDefinition {
    const node = {
        type: "sequence",
        ...parseAttributeTokens(tokens, stringLiteralPlaceholders)
    } as SequenceNodeDefinition;

    // This is a composite node, so we expect an opening '{'.
    popAndCheck(tokens, "{");

    // Return the sequence node definition.
    return node;
}

/**
 * Creates a selector node JSON definition.
 * @param tokens The tree definition tokens.
 * @param stringLiteralPlaceholders The substituted string literal placeholders.
 * @returns The selector node JSON definition.
 */
function createSelectorNode(
    tokens: string[],
    stringLiteralPlaceholders: StringLiteralPlaceholders
): SelectorNodeDefinition {
    const node = {
        type: "selector",
        ...parseAttributeTokens(tokens, stringLiteralPlaceholders)
    } as SelectorNodeDefinition;

    // This is a composite node, so we expect an opening '{'.
    popAndCheck(tokens, "{");

    // Return the selector node definition.
    return node;
}

/**
 * Creates a parallel node JSON definition.
 * @param tokens The tree definition tokens.
 * @param stringLiteralPlaceholders The substituted string literal placeholders.
 * @returns The parallel node JSON definition.
 */
function createParallelNode(
    tokens: string[],
    stringLiteralPlaceholders: StringLiteralPlaceholders
): ParallelNodeDefinition {
    const node = {
        type: "parallel",
        ...parseAttributeTokens(tokens, stringLiteralPlaceholders)
    } as ParallelNodeDefinition;

    // This is a composite node, so we expect an opening '{'.
    popAndCheck(tokens, "{");

    // Return the parallel node definition.
    return node;
}

/**
 * Creates a lotto node JSON definition.
 * @param tokens The tree definition tokens.
 * @param stringLiteralPlaceholders The substituted string literal placeholders.
 * @returns The lotto node JSON definition.
 */
function createLottoNode(tokens: string[], stringLiteralPlaceholders: StringLiteralPlaceholders): LottoNodeDefinition {
    // If any node arguments have been defined then they must be our weights.
    const nodeArguments = parseArgumentTokens(tokens, stringLiteralPlaceholders);

    // All lotto node arguments MUST be of type number and must be integer.
    nodeArguments
        .filter((arg) => arg.type !== "number" || !arg.isInteger)
        .forEach(() => {
            throw new Error(`lotto node weight arguments must be integer values`);
        });

    const node = {
        type: "lotto",
        weights: nodeArguments.map(({ value }) => value),
        ...parseAttributeTokens(tokens, stringLiteralPlaceholders)
    } as LottoNodeDefinition;

    // This is a composite node, so we expect an opening '{'.
    popAndCheck(tokens, "{");

    // Return the lotto node definition.
    return node;
}

/**
 * Creates an action node JSON definition.
 * @param tokens The tree definition tokens.
 * @param stringLiteralPlaceholders The substituted string literal placeholders.
 * @returns The action node JSON definition.
 */
function createActionNode(
    tokens: string[],
    stringLiteralPlaceholders: StringLiteralPlaceholders
): ActionNodeDefinition {
    // Parse any node arguments, we should have at least one which will be an identifier argument for the action name
    // and agent function to invoke for the action, all other arguments are to be passed as arguments to that function.
    const [actionNameIdentifier, ...agentFunctionArgs] = parseArgumentTokens(tokens, stringLiteralPlaceholders);

    // Our first argument MUST be defined and be an identifier as we require an action name argument.
    if (actionNameIdentifier?.type !== "identifier") {
        throw new Error("expected action name identifier argument");
    }

    // Only the first argument should have been an identifier, all agent function arguments must be string, number, boolean or null.
    agentFunctionArgs
        .filter((arg) => arg.type === "identifier")
        .forEach((arg) => {
            throw new Error(
                `invalid action node argument value '${arg.value}', must be string, number, boolean or null`
            );
        });

    // Return the action node definition.
    return {
        type: "action",
        call: actionNameIdentifier.value,
        args: agentFunctionArgs.map(({ value }) => value),
        ...parseAttributeTokens(tokens, stringLiteralPlaceholders)
    };
}

/**
 * Creates a condition node JSON definition.
 * @param tokens The tree definition tokens.
 * @param stringLiteralPlaceholders The substituted string literal placeholders.
 * @returns The condition node JSON definition.
 */
function createConditionNode(
    tokens: string[],
    stringLiteralPlaceholders: StringLiteralPlaceholders
): ConditionNodeDefinition {
    // Parse any node arguments, we should have at least one which will be an identifier argument for the condition name
    // and agent function to invoke for the condition, all other arguments are to be passed as arguments to that function.
    const [conditionNameIdentifier, ...agentFunctionArgs] = parseArgumentTokens(tokens, stringLiteralPlaceholders);

    // Our first argument MUST be defined and be an identifier as we require a condition name argument.
    if (conditionNameIdentifier?.type !== "identifier") {
        throw new Error("expected condition name identifier argument");
    }

    // Only the first argument should have been an identifier, all agent function arguments must be string, number, boolean or null.
    agentFunctionArgs
        .filter((arg) => arg.type === "identifier")
        .forEach((arg) => {
            throw new Error(
                `invalid condition node argument value '${arg.value}', must be string, number, boolean or null`
            );
        });

    // Return the condition node definition.
    return {
        type: "condition",
        call: conditionNameIdentifier.value,
        args: agentFunctionArgs.map(({ value }) => value),
        ...parseAttributeTokens(tokens, stringLiteralPlaceholders)
    };
}

/**
 * Creates a wait node JSON definition.
 * @param tokens The tree definition tokens.
 * @param stringLiteralPlaceholders The substituted string literal placeholders.
 * @returns The wait node JSON definition.
 */
function createWaitNode(tokens: string[], stringLiteralPlaceholders: StringLiteralPlaceholders): WaitNodeDefinition {
    let node = { type: "wait" } as WaitNodeDefinition;

    // Get the node arguments.
    const nodeArguments = parseArgumentTokens(tokens, stringLiteralPlaceholders);

    // The arguments of a wait node are optional. We may have:
    // - No node arguments, in which case the wait will be indefinite until it is aborted.
    // - One node argument which will be the explicit duration of the wait.
    // - Two node arguments which define the min and max duration bounds from which a random duration will be picked.
    if (nodeArguments.length) {
        // All wait node arguments MUST be of type number and must be integer.
        nodeArguments
            .filter((arg) => arg.type !== "number" || !arg.isInteger)
            .forEach(() => {
                throw new Error(`wait node durations must be integer values`);
            });

        // We may have:
        // - One node argument which will be the explicit duration of the wait.
        // - Two node arguments which define the min and max duration bounds from which a random duration will be picked.
        // - Too many arguments, which is not valid.
        if (nodeArguments.length === 1) {
            // An explicit duration was defined.
            node.duration = nodeArguments[0].value as number;

            // If an explict duration was defined then it must be a positive number.
            if (node.duration < 0) {
                throw new Error("a wait node must have a positive duration");
            }
        } else if (nodeArguments.length === 2) {
            // Min and max duration bounds were defined from which a random duration will be picked.
            node.duration = [nodeArguments[0].value as number, nodeArguments[1].value as number];

            // A wait node must have a positive min and max duration.
            if (node.duration[0] < 0 || node.duration[1] < 0) {
                throw new Error("a wait node must have a positive minimum and maximum duration");
            }

            // A wait node must not have a minimum duration that exceeds the maximum duration.
            if (node.duration[0] > node.duration[1]) {
                throw new Error("a wait node must not have a minimum duration that exceeds the maximum duration");
            }
        } else if (nodeArguments.length > 2) {
            // An incorrect number of duration arguments were defined.
            throw new Error("invalid number of wait node duration arguments defined");
        }
    }

    // Return the wait node definition.
    return { ...node, ...parseAttributeTokens(tokens, stringLiteralPlaceholders) };
}

/**
 * Creates a branch node JSON definition.
 * @param tokens The tree definition tokens.
 * @param stringLiteralPlaceholders The substituted string literal placeholders.
 * @returns The branch node JSON definition.
 */
function createBranchNode(
    tokens: string[],
    stringLiteralPlaceholders: StringLiteralPlaceholders
): BranchNodeDefinition {
    // Parse any node arguments, we should have one which will be an identifier argument for the root ref.
    const nodeArguments = parseArgumentTokens(tokens, stringLiteralPlaceholders);

    // We should have only a single identifer argument for a branch node, which is the root ref.
    if (nodeArguments.length !== 1 || nodeArguments[0].type !== "identifier") {
        throw new Error("expected single branch name argument");
    }

    // Return the branch node definition.
    return { type: "branch", ref: nodeArguments[0].value };
}

/**
 * Validate a fully-populated node definition that was popped off of the tree stack.
 * @param node The popped node to validate.
 */
function validatePoppedNode(node: AnyNodeDefinition): void {
    // Decorators MUST have a child defined.
    if (isDecoratorNode(node) && isNullOrUndefined(node.child)) {
        throw new Error(`a ${node.type} node must have a single child node defined`);
    }

    // Composites MUST have at least one child defined.
    if (isCompositeNode(node) && !node.children?.length) {
        throw new Error(`a ${node.type} node must have at least a single child node defined`);
    }
}
