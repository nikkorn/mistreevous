import { popAndCheck } from "./DSLUtilities";

/**
 * A type defining the arguments that can be passed to an agent function.
 */
export type AgentFunctionArguments = (string | number | boolean | null | undefined)[];

/**
 * A guard attribute for a node.
 */
export type GuardAttributeDefinition = {
    call: string;
    args?: AgentFunctionArguments;
};

/**
 * A callback attribute for a node.
 */
export type CallbackAttributeDefinition = {
    call: string;
    args?: AgentFunctionArguments;
};

/**
 * A type defining a general node definition.
 */
export type NodeDefinition = {
    type: string;
    while?: GuardAttributeDefinition;
    until?: GuardAttributeDefinition;
    entry?: CallbackAttributeDefinition;
    exit?: CallbackAttributeDefinition;
    step?: CallbackAttributeDefinition;
};

/**
 * A composite node that can contain any number of child nodes.
 */
export type CompositeDefinition = NodeDefinition & {
    children: AnyChildNode[];
};

/**
 * A decorator node, a composite with only a single child node.
 */
export type DecoratorDefinition = NodeDefinition & {
    child: AnyChildNode;
};

/**
 * A branch node.
 */
export type BranchDefinition = NodeDefinition & {
    type: "branch";
    ref: string;
};

/**
 * An action node.
 */
export type ActionDefinition = NodeDefinition & {
    type: "action";
    call: string;
    args?: AgentFunctionArguments;
};

/**
 * A condition node.
 */
export type ConditionDefinition = NodeDefinition & {
    type: "condition";
    call: string;
    args?: AgentFunctionArguments;
};

/**
 * A wait node.
 */
export type WaitDefinition = NodeDefinition & {
    type: "wait";
    duration: number | [number, number];
};

/**
 * A sequence node.
 */
export type SequenceDefinition = CompositeDefinition & {
    type: "sequence";
};

/**
 * A selector node.
 */
export type SelectorDefinition = CompositeDefinition & {
    type: "selector";
};

/**
 * A lotto node.
 */
export type LottoDefinition = CompositeDefinition & {
    type: "lotto";
    weights?: number[];
};

/**
 * A parallel node.
 */
export type ParallelDefinition = CompositeDefinition & {
    type: "parallel";
};

/**
 * A root node.
 */
export type RootDefinition = DecoratorDefinition & {
    type: "root";
    id?: string;
};

/**
 * A repeat node.
 */
export type RepeatDefinition = DecoratorDefinition & {
    type: "repeat";
    iterations?: number | [number, number];
};

/**
 * A retry node.
 */
export type RetryDefinition = DecoratorDefinition & {
    type: "retry";
    attempts?: number | [number, number];
};

/**
 * A flip node.
 */
export type FlipDefinition = DecoratorDefinition & {
    type: "flip";
};

/**
 * A succeed node.
 */
export type SucceedDefinition = DecoratorDefinition & {
    type: "succeed";
};

/**
 * A fail node.
 */
export type FailDefinition = DecoratorDefinition & {
    type: "fail";
};

/**
 * A type defining any node type.
 */
export type AnyNode =
    | BranchDefinition
    | ActionDefinition
    | ConditionDefinition
    | WaitDefinition
    | SequenceDefinition
    | SelectorDefinition
    | LottoDefinition
    | ParallelDefinition
    | RootDefinition
    | RepeatDefinition
    | RetryDefinition
    | FlipDefinition
    | SucceedDefinition
    | FailDefinition;

/**
 * A type defining any node type that can be a child of composite parent node.
 */
export type AnyChildNode = Exclude<AnyNode, RootDefinition>;

/**
 * A type defining an object that holds a reference to substitued string literals parsed from the definition.
 */
type StringLiteralPlaceholders = { [key: string]: string };

function isLeafNode(node: NodeDefinition): node is NodeDefinition {
    return ["branch", "action", "condition", "wait"].includes(node.type);
}

function isDecoratorNode(node: NodeDefinition): node is DecoratorDefinition {
    return ["root", "repeat", "retry", "flip", "succeed", "fail"].includes(node.type);
}

function isCompositeNode(node: NodeDefinition): node is CompositeDefinition {
    return ["sequence", "selector", "lotto", "parallel"].includes(node.type);
}

/**
 * Parse the tree definition string into a JSON definition.
 * @param definition The tree definition string.
 * @returns The root node JSON definitions.
 */
export function parseToJSON(definition: string): RootDefinition[] {
    // Swap out any node/attribute argument string literals with a placeholder and get a mapping of placeholders to original values as well as the processed definition.
    const { placeholders, processedDefinition } = substituteStringLiterals(definition);

    // Parse our definition definition string into an array of raw tokens.
    const tokens = parseTokensFromDefinition(definition);

    return convertTokensToJSONDefinition(tokens, placeholders, processedDefinition);
}

/**
 * Converts the specified tree definition tokens into a JSON definition.
 * @param tokens The tree definition tokens.
 * @param placeholders The substituted string literal placeholders.
 * @returns The root node JSON definitions.
 */
export function convertTokensToJSONDefinition(
    tokens: string[],
    placeholders: StringLiteralPlaceholders,
    processedDefinition: string
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
            // If the bottom node already has a chld node set then throw an error as a decorator should only have a single child.
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
                pushRootNode(createRootNode(tokens));
                break;
            }

            case "SEQUENCE": {
                pushNode(createSequenceNode(tokens));
                break;
            }

            case "ACTION": {
                pushNode(createActionNode(tokens));
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

function createRootNode(tokens: string[]): RootDefinition {
    // Create the root node definition.
    const node = { type: "root" } as RootDefinition;

    // TODO Grab 'id' if defined as a node argument.
    // TODO Grab attributes.

    // This is a decorator node, so we expect an opening '{'.
    popAndCheck(tokens, "{");

    return node;
}

function createSequenceNode(tokens: string[]): SequenceDefinition {
    const node = { type: "sequence" } as SequenceDefinition;

    // TODO Grab attributes.

    // This is a composite node, so we expect an opening '{'.
    popAndCheck(tokens, "{");

    return node;
}

function createActionNode(tokens: string[]): ActionDefinition {
    const node = { type: "action" } as ActionDefinition;

    // TODO Grab attributes.

    return node;
}

/**
 * Swaps out any node/attribute argument string literals with placeholders.
 * @param definition The definition.
 * @returns An object containing a mapping of placeholders to original string values as well as the processed definition string.
 */
function substituteStringLiterals(definition: string): {
    placeholders: StringLiteralPlaceholders;
    processedDefinition: string;
} {
    // Create an object to hold the mapping of placeholders to original string values.
    const placeholders: StringLiteralPlaceholders = {};

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
