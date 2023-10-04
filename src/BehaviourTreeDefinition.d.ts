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
export interface CompositeDefinition extends NodeDefinition {
    children: AnyChildNode[];
}

/**
 * A decorator node, a composite with only a single child node.
 */
export interface DecoratorDefinition extends NodeDefinition {
    child: AnyChildNode;
}

/**
 * A branch node.
 */
export interface BranchDefinition extends NodeDefinition {
    type: "branch";
    ref: string;
}

/**
 * An action node.
 */
export interface ActionDefinition extends NodeDefinition {
    type: "action";
    call: string;
    args?: AgentFunctionArgument[];
}

/**
 * A condition node.
 */
export interface ConditionDefinition extends NodeDefinition {
    type: "condition";
    call: string;
    args?: AgentFunctionArgument[];
}

/**
 * A wait node.
 */
export interface WaitDefinition extends NodeDefinition {
    type: "wait";
    duration: number | [number, number];
}

/**
 * A sequence node.
 */
export interface SequenceDefinition extends CompositeDefinition {
    type: "sequence";
}

/**
 * A selector node.
 */
export interface SelectorDefinition extends CompositeDefinition {
    type: "selector";
}

/**
 * A lotto node.
 */
export interface LottoDefinition extends CompositeDefinition {
    type: "lotto";
    weights?: number[];
}

/**
 * A parallel node.
 */
export interface ParallelDefinition extends CompositeDefinition {
    type: "parallel";
}

/**
 * A root node.
 */
export interface RootDefinition extends DecoratorDefinition {
    type: "root";
    id?: string;
}

/**
 * A repeat node.
 */
export interface RepeatDefinition extends DecoratorDefinition {
    type: "repeat";
    iterations?: number | [number, number];
}

/**
 * A retry node.
 */
export interface RetryDefinition extends DecoratorDefinition {
    type: "retry";
    attempts?: number | [number, number];
}

/**
 * A flip node.
 */
export interface FlipDefinition extends DecoratorDefinition {
    type: "flip";
}

/**
 * A succeed node.
 */
export interface SucceedDefinition extends DecoratorDefinition {
    type: "succeed";
}

/**
 * A fail node.
 */
export interface FailDefinition extends DecoratorDefinition {
    type: "fail";
}

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
