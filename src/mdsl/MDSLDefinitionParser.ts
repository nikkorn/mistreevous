import {
    RootDefinition,
    AnyChildNode,
    AnyNode,
    SequenceDefinition,
    ActionDefinition
} from "../BehaviourTreeDefinition";
import { parseArgumentTokens } from "./MDSLNodeArgumentParser";
import { parseAttributeTokens } from "./MDSLNodeAttributeParser";
import {
    StringLiteralPlaceholders,
    isCompositeNode,
    isDecoratorNode,
    isLeafNode,
    parseTokensFromDefinition,
    popAndCheck,
    substituteStringLiterals
} from "./MDSLUtilities";

/**
 * Parse the MDSL tree definition string into an equivalent JSON definition.
 * @param definition The tree definition string as MDSL.
 * @returns The root node JSON definitions.
 */
export function parseMDSLToJSON(definition: string): RootDefinition[] {
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
): RootDefinition[] {
    // There must be at least 3 tokens for the tree definition to be valid. 'ROOT', '{' and '}'.
    if (tokens.length < 3) {
        throw new Error("invalid token count");
    }

    // We should have a matching number of '{' and '}' tokens. If not, then there are scopes that have not been properly closed.
    if (tokens.filter((token) => token === "{").length !== tokens.filter((token) => token === "}").length) {
        throw new Error("scope character mismatch");
    }

    // Create a stack of tree stack arrays where root nodes will always be at the root.
    const treeStacks: [Partial<RootDefinition>, ...Partial<AnyChildNode>[]][] = [];

    // Create an array of all root node definitions that we create.
    const rootNodes: Partial<RootDefinition>[] = [];

    // A helper function used to push root node definitions onto the stack.
    const pushRootNode = (rootNode: RootDefinition) => {
        // Add the root node definition to our array of all parsed root node definitions.
        rootNodes.push(rootNode);

        // Add the root node definition to the root of a new tree stack.
        treeStacks.push([rootNode]);
    };

    // A helper function used to push non-root node definitions onto the stack.
    const pushNode = (node: AnyChildNode) => {
        // Get the current tree stack that we are populating.
        const currentTreeStack = treeStacks[treeStacks.length - 1];

        // TODO Handle cases where we may not have a current root stack.
        // This may happen if a root node is not the initially defined one?

        // Get the bottom-most node in the current tree stack.
        const bottomNode = currentTreeStack[currentTreeStack.length - 1] as AnyNode;

        // TODO Handle cases where we may not have a bottom-most node.
        // Also a potential issue with a badly defined tree.

        // If the bottom-most node in the current root stack is a composite or decorator
        // node then the current node should be added as a child of the bottom-most node.
        if (isCompositeNode(bottomNode)) {
            bottomNode.children = bottomNode.children || [];
            bottomNode.children.push(node);
        } else if (isDecoratorNode(bottomNode)) {
            // If the bottom node already has a child node set then throw an error as a decorator should only have a single child.
            if (bottomNode.child) {
                throw new Error("a decorator node must only have a single child node");
            }

            bottomNode.child = node;
        }

        // If the node we are adding is also a composite or decorator node, then we should push it
        // onto the current tree stack, as subsequent nodes will be added as its child/children.
        if (!isLeafNode(node)) {
            currentTreeStack.push(node);
        }
    };

    // A helper function used to pop node definitions off of the stack.
    const popNode = () => {
        // Get the current tree stack that we are populating.
        const currentTreeStack = treeStacks[treeStacks.length - 1];

        // Pop the top-most node in the current tree stack if there is one.
        if (currentTreeStack.length) {
            currentTreeStack.pop();
        }

        // We don't want any empty tree stacks in our stack of tree stacks.
        if (!currentTreeStack.length) {
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
                // A root node will always be the base of a new root stack.
                pushRootNode(createRootNode(tokens, stringLiteralPlaceholders));
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

    return rootNodes as RootDefinition[];
}

function createRootNode(tokens: string[], stringLiteralPlaceholders: StringLiteralPlaceholders): RootDefinition {
    // Create the root node definition.
    let node = {
        type: "root",
        id: undefined
    } as RootDefinition;

    // Parse any node arguments, we should only have one if any with will be an identifier argument for the root identifier.
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

function createSequenceNode(
    tokens: string[],
    stringLiteralPlaceholders: StringLiteralPlaceholders
): SequenceDefinition {
    const node = {
        type: "sequence",
        ...parseAttributeTokens(tokens, stringLiteralPlaceholders)
    } as SequenceDefinition;

    // This is a composite node, so we expect an opening '{'.
    popAndCheck(tokens, "{");

    return node;
}

function createActionNode(tokens: string[], stringLiteralPlaceholders: StringLiteralPlaceholders): ActionDefinition {
    const node = { type: "action" } as ActionDefinition;

    // TODO Grab attributes.

    return node;
}
