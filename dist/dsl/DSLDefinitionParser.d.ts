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
export type AnyNode = BranchDefinition | ActionDefinition | ConditionDefinition | WaitDefinition | SequenceDefinition | SelectorDefinition | LottoDefinition | ParallelDefinition | RootDefinition | RepeatDefinition | RetryDefinition | FlipDefinition | SucceedDefinition | FailDefinition;
/**
 * A type defining any node type that can be a child of composite parent node.
 */
export type AnyChildNode = Exclude<AnyNode, RootDefinition>;
/**
 * A type defining an object that holds a reference to substitued string literals parsed from the definition.
 */
type StringLiteralPlaceholders = {
    [key: string]: string;
};
/**
 * Parse the tree definition string into a JSON definition.
 * @param definition The tree definition string.
 * @returns The root node JSON definitions.
 */
export declare function parseToJSON(definition: string): RootDefinition[];
/**
 * Converts the specified tree definition tokens into a JSON definition.
 * @param tokens The tree definition tokens.
 * @param placeholders The substituted string literal placeholders.
 * @returns The root node JSON definitions.
 */
export declare function convertTokensToJSONDefinition(tokens: string[], placeholders: StringLiteralPlaceholders, processedDefinition: string): RootDefinition[];
export {};
