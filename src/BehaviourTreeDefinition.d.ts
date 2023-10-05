/**
 * A type defining the an argument that can be passed to an agent function.
 */
export type AgentFunctionArgument = string | number | boolean | null | undefined;

/**
 * An attribute for a node.
 */
export interface NodeAttributeDefinition {
    /**
     * The name of the agent function to invoke.
     */
    call: string;
    /**
     * An array of arguments to pass when invoking the agent function.
     */
    args?: AgentFunctionArgument[];
}

/**
 * A type defining a general node definition.
 */
export interface NodeDefinition {
    type: string;
    while?: NodeAttributeDefinition;
    until?: NodeAttributeDefinition;
    entry?: NodeAttributeDefinition;
    exit?: NodeAttributeDefinition;
    step?: NodeAttributeDefinition;
}

/**
 * A composite node that can contain any number of child nodes.
 */
export interface CompositeNodeDefinition extends NodeDefinition {
    children: AnyChildNode[];
}

/**
 * A decorator node, a composite with only a single child node.
 */
export interface DecoratorNodeDefinition extends NodeDefinition {
    child: AnyChildNode;
}

/**
 * A branch node.
 */
export interface BranchNodeDefinition extends NodeDefinition {
    type: "branch";
    ref: string;
}

/**
 * An action node.
 */
export interface ActionNodeDefinition extends NodeDefinition {
    type: "action";
    call: string;
    args?: AgentFunctionArgument[];
}

/**
 * A condition node.
 */
export interface ConditionNodeDefinition extends NodeDefinition {
    type: "condition";
    call: string;
    args?: AgentFunctionArgument[];
}

/**
 * A wait node.
 */
export interface WaitNodeDefinition extends NodeDefinition {
    type: "wait";
    duration: number | [number, number];
}

/**
 * A sequence node.
 */
export interface SequenceNodeDefinition extends CompositeNodeDefinition {
    type: "sequence";
}

/**
 * A selector node.
 */
export interface SelectorNodeDefinition extends CompositeNodeDefinition {
    type: "selector";
}

/**
 * A lotto node.
 */
export interface LottoNodeDefinition extends CompositeNodeDefinition {
    type: "lotto";
    weights?: number[];
}

/**
 * A parallel node.
 */
export interface ParallelNodeDefinition extends CompositeNodeDefinition {
    type: "parallel";
}

/**
 * A root node.
 */
export interface RootNodeDefinition extends DecoratorNodeDefinition {
    type: "root";
    id?: string;
}

/**
 * A repeat node.
 */
export interface RepeatNodeDefinition extends DecoratorNodeDefinition {
    type: "repeat";
    iterations?: number | [number, number];
}

/**
 * A retry node.
 */
export interface RetryNodeDefinition extends DecoratorNodeDefinition {
    type: "retry";
    attempts?: number | [number, number];
}

/**
 * A flip node.
 */
export interface FlipNodeDefinition extends DecoratorNodeDefinition {
    type: "flip";
}

/**
 * A succeed node.
 */
export interface SucceedNodeDefinition extends DecoratorNodeDefinition {
    type: "succeed";
}

/**
 * A fail node.
 */
export interface FailNodeDefinition extends DecoratorNodeDefinition {
    type: "fail";
}

/**
 * A type defining any node type.
 */
export type AnyNode =
    | BranchNodeDefinition
    | ActionNodeDefinition
    | ConditionNodeDefinition
    | WaitNodeDefinition
    | SequenceNodeDefinition
    | SelectorNodeDefinition
    | LottoNodeDefinition
    | ParallelNodeDefinition
    | RootNodeDefinition
    | RepeatNodeDefinition
    | RetryNodeDefinition
    | FlipNodeDefinition
    | SucceedNodeDefinition
    | FailNodeDefinition;

/**
 * A type defining any node type that can be a child of composite parent node.
 */
export type AnyChildNode = Exclude<AnyNode, RootNodeDefinition>;
