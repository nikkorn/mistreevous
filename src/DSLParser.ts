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
}

/**
 * A callback attribute for a node.
 */
export type CallbackAttributeDefinition = {
    call: string;
    args?: AgentFunctionArguments;
}

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
}

/**
 * A composite node that can contain any number of child nodes.
 */
export type CompositeDefinition = NodeDefinition & {
    children: AnyChildNode[];
}

/**
 * A decorator node, a composite with only a single child node.
 */
export type DecoratorDefinition = NodeDefinition & {
    child: AnyChildNode;
}

/**
 * A branch node.
 */
export type BranchDefinition = NodeDefinition & {
    type: "branch";
    ref: string;
}

/**
 * An action node.
 */
export type ActionDefinition = NodeDefinition & {
    type: "action";
    call: string;
    args?: AgentFunctionArguments;
}

/**
 * A condition node.
 */
export type ConditionDefinition = NodeDefinition & {
    type: "condition";
    call: string;
    args?: AgentFunctionArguments;
}

/**
 * A wait node.
 */
export type WaitDefinition = NodeDefinition & {
    type: "wait";
    duration: number | [number, number];
}

/**
 * A sequence node.
 */
export type SequenceDefinition = CompositeDefinition & {
    type: "sequence";
}

/**
 * A selector node.
 */
export type SelectorDefinition = CompositeDefinition & {
    type: "selector";
}

/**
 * A lotto node.
 */
export type LottoDefinition = CompositeDefinition & {
    type: "lotto";
    weights?: number[]
}

/**
 * A parallel node.
 */
export type ParallelDefinition = CompositeDefinition & {
    type: "parallel";
}

/**
 * A root node.
 */
export type RootDefinition = DecoratorDefinition & {
    type: "root";
    id?: string;
}

/**
 * A repeat node.
 */
export type RepeatDefinition = DecoratorDefinition & {
    type: "repeat";
    iterations?: number | [number, number];
}

/**
 * A retry node.
 */
export type RetryDefinition = DecoratorDefinition & {
    type: "retry";
    attempts?: number | [number, number];
}

/**
 * A flip node.
 */
export type FlipDefinition = DecoratorDefinition & {
    type: "flip";
}

/**
 * A succeed node.
 */
export type SucceedDefinition = DecoratorDefinition & {
    type: "succeed";
}

/**
 * A fail node.
 */
export type FailDefinition = DecoratorDefinition & {
    type: "fail";
}

/**
 * A type defining any node type.
 */
export type AnyNode = BranchDefinition | ActionDefinition | ConditionDefinition | WaitDefinition | SequenceDefinition |
    SelectorDefinition | LottoDefinition | ParallelDefinition | RootDefinition | RepeatDefinition | RetryDefinition | FlipDefinition | SucceedDefinition | FailDefinition;

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
export function parse(definition: string): RootDefinition[] {
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
export function convertTokensToJSONDefinition(tokens: string[], placeholders: StringLiteralPlaceholders, processedDefinition: string): RootDefinition[] {
    // There must be at least 3 tokens for the tree definition to be valid. 'ROOT', '{' and '}'.
    if (tokens.length < 3) {
        throw new Error("invalid token count");
    }

    // We should have a matching number of '{' and '}' tokens. If not, then there are scopes that have not been properly closed.
    if (tokens.filter((token) => token === "{").length !== tokens.filter((token) => token === "}").length) {
        throw new Error("scope character mismatch");
    }

    // Create a stack of node children arrays, starting with a definition scope.
    const rootStacks: [Partial<RootDefinition>, ...Partial<AnyChildNode>[]][] = [];

    // ONLY COMPOSITE DEFINITIONS GET PUSHED ONTO A ROOT STACK.
    // When coming across a new node in the definition it must be:
    // - Set as the child of the top-most node in the root stack OR
    // - Added to the array of children of the top-most node in the root stack OR
    
    const pushNode = (node: AnyChildNode) => {
        // Get the current root stack that we are populating.
        const currentRootStack = rootStacks[rootStacks.length - 1];

        // TODO Handle cases where we may not have a current root stack.
        // This may happen if a root node is not the initially defined one?

        // Get the top node in the current root stack.
        const topNode = currentRootStack[currentRootStack.length - 1] as AnyNode;

        // TODO Handle cases where we may not have a top-most node.
        // Also a potential issue with a badly defined tree.

        // If the top-most node in the current root stack is a composite or decorator
        // node then the current node should be added as a child of the top-most node.
        if (isCompositeNode(topNode)) {
            topNode.children.push(node);
        } else if (isDecoratorNode(topNode)) {
            topNode.child = node;
        }

        // If the node we are adding is also a composite or decorator node, then we should push it 
        // onto the current root stack, as subsequent nodes will be added as its child/children.
        if (!isLeafNode(node)) {
            currentRootStack.push(node);
        }
    };

    const popNode = () => {
        // Get the current root stack that we are populating.
        const currentRootStack = rootStacks[rootStacks.length - 1];

        // Pop the top-most node in the current root stack if there is one.
        if (currentRootStack.length) {
            currentRootStack.pop();
        }

        // We dont want any root stacks in our definition stack. 
        if (!currentRootStack.length) {
            rootStacks.pop();
        }
    };

    // We should keep processing the raw tokens until we run out of them.
    while (tokens.length) {
        // Grab the next token.
        const token = tokens.shift();

        // How we create the next node depends on the current raw token value.
        switch (token!.toUpperCase()) {
            case "ROOT": {
                const node = {
                    type: "root"
                } as RootDefinition;

                // TODO Grab 'id' if defined as a node argument.
                // TODO Grab attributes.

                // A root node will always be the base of a new root stack.
                rootStacks.push([node]);
                break;
            }

            case "SEQUENCE": {
                const node = {
                    type: "sequence",
                    children: []
                } as SequenceDefinition;

                // TODO Grab attributes.

                pushNode(node);
                break;
            }

            case "}": {
                // The '}' character closes the current scope.
                popNode();
                break;
            }

            default: {
                throw new Error("unexpected token: " + token);
            }
        }
    }

    // TODO
    return [];
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

/**
 * Pop the next raw token off of the stack and throw an error if it wasn't the expected one.
 * @param tokens The array of remaining tokens.
 * @param expected An optional string or array or items, one of which must match the next popped token.
 * @returns The popped token.
 */
function popAndCheck(tokens: string[], expected?: string | string[]): string {
    // Get and remove the next token.
    const popped = tokens.shift();

    // We were expecting another token.
    if (popped === undefined) {
        throw new Error("unexpected end of definition");
    }

    // Do we have an expected token/tokens array?
    if (expected != undefined) {
        // Get an array of expected values, if the popped token matches any then we are all good.
        const expectedValues = (typeof expected === "string") ? [expected] : expected;

        // Check whether the popped token matches at least one of our expected items.
        var tokenMatchesExpectation = expectedValues.some((item) => popped.toUpperCase() === item.toUpperCase());

        // Throw an error if the popped token didn't match any of our expected items.
        if (!tokenMatchesExpectation) {
            const expectationString = expectedValues.map((item) => "'" + item + "'").join(" or ");
            throw new Error("unexpected token found. Expected " + expectationString + " but got '" + popped + "'");
        }
    }

    // Return the popped token.
    return popped;
}