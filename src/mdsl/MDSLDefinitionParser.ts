import {
    RootNodeDefinition,
    AnyChildNode,
    AnyNode,
    SequenceNodeDefinition,
    ActionNodeDefinition
} from "../BehaviourTreeDefinition";
import { parseArgumentTokens } from "./MDSLNodeArgumentParser";
import { parseAttributeTokens } from "./MDSLNodeAttributeParser";
import {
    StringLiteralPlaceholders,
    isCompositeNode,
    isDecoratorNode,
    isLeafNode,
    isRootNode,
    parseTokensFromDefinition,
    popAndCheck,
    substituteStringLiterals
} from "./MDSLUtilities";

/**
 * Parse the MDSL tree definition string into an equivalent JSON definition.
 * @param definition The tree definition string as MDSL.
 * @returns The root node JSON definitions.
 */
export function parseMDSLToJSON(definition: string): RootNodeDefinition[] {
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
    const treeStacks: [Partial<RootNodeDefinition>, ...Partial<AnyChildNode>[]][] = [];

    // Create an array of all root node definitions that we create.
    const rootNodes: Partial<RootNodeDefinition>[] = [];

    // A helper function used to push node definitions onto the tree stack.
    const pushNode = (node: AnyNode) => {
        // If the node is a root node then we need to create a new tree stack array with the root node at the root.
        if (isRootNode(node)) {
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
        const topTreeStackTopNode = topTreeStack[topTreeStack.length - 1] as AnyNode;

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

    // A helper function used to pop node definitions off of the stack.
    const popNode = () => {
        // Get the current tree stack that we are populating.
        const topTreeStack = treeStacks[treeStacks.length - 1];

        // Pop the top-most node in the current tree stack if there is one.
        if (topTreeStack.length) {
            topTreeStack.pop();
        }

        // We don't want any empty tree stacks in our stack of tree stacks.
        if (!topTreeStack.length) {
            treeStacks.pop();
        }
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

            case "SEQUENCE": {
                pushNode(createSequenceNode(tokens, stringLiteralPlaceholders));
                break;
            }

            case "ACTION": {
                pushNode(createActionNode(tokens, stringLiteralPlaceholders));
                break;
            }

            case "}": {
                // The '}' character closes the current scope and means that we have to pop a node off of the current stack.
                popNode();
                break;
            }

            default: {
                throw new Error("unexpected token: " + token);
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
    } as ActionNodeDefinition;
}
