export type NodeArgument = string | number | boolean | null | {
    $: string;
};
/**
 * An attribute for a node.
 */
export interface NodeAttributeDefinition {
    /**
     * The name of the agent function or globally registered function to invoke.
     */
    call: string;
    /**
     * An array of arguments to pass when invoking the agent function.
     */
    args?: NodeArgument[];
}
/**
 * An guard attribute for a node.
 */
export interface NodeGuardDefinition extends NodeAttributeDefinition {
    /**
     * The flag defining whether the attributed node would move to the SUCCEEDED state when aborted by this guard, otherwise FAILED.
     */
    succeedOnAbort?: boolean;
}
/**
 * A type defining a general node definition.
 */
export interface NodeDefinition {
    /**
     * The node type.
     */
    type: string;
    /**
     * The 'while' node attribute definition.
     */
    while?: NodeGuardDefinition;
    /**
     * The 'until' node attribute definition.
     */
    until?: NodeGuardDefinition;
    /**
     * The 'entry' node attribute definition.
     */
    entry?: NodeAttributeDefinition;
    /**
     * The 'exit' node attribute definition.
     */
    exit?: NodeAttributeDefinition;
    /**
     * The 'step' node attribute definition.
     */
    step?: NodeAttributeDefinition;
}
/**
 * A composite node that can contain any number of child nodes.
 */
export interface CompositeNodeDefinition extends NodeDefinition {
    /**
     * The child nodes of this composite node.
     */
    children: AnyChildNodeDefinition[];
}
/**
 * A decorator node, a composite with only a single child node.
 */
export interface DecoratorNodeDefinition extends NodeDefinition {
    /**
     * The child node of this decorator node.
     */
    child: AnyChildNodeDefinition;
}
/**
 * A branch node.
 */
export interface BranchNodeDefinition extends NodeDefinition {
    /**
     * The node type.
     */
    type: "branch";
    /**
     * The reference matching a root node identifier.
     */
    ref: string;
}
/**
 * An action node.
 */
export interface ActionNodeDefinition extends NodeDefinition {
    /**
     * The node type.
     */
    type: "action";
    /**
     * The name of the agent function or globally registered function to invoke.
     */
    call: string;
    /**
     * An array of arguments to pass when invoking the action function.
     */
    args?: NodeArgument[];
}
/**
 * A condition node.
 */
export interface ConditionNodeDefinition extends NodeDefinition {
    /**
     * The node type.
     */
    type: "condition";
    /**
     * The name of the agent function or globally registered function to invoke.
     */
    call: string;
    /**
     * An array of arguments to pass when invoking the condition function.
     */
    args?: NodeArgument[];
}
/**
 * A wait node.
 */
export interface WaitNodeDefinition extends NodeDefinition {
    /**
     * The node type.
     */
    type: "wait";
    /**
     * The duration to wait in milliseconds if defined as a single integer, or the lower and upper duration bounds if defined as an array containing two integer values.
     */
    duration?: number | [number, number];
}
/**
 * A sequence node.
 */
export interface SequenceNodeDefinition extends CompositeNodeDefinition {
    /**
     * The node type.
     */
    type: "sequence";
}
/**
 * A selector node.
 */
export interface SelectorNodeDefinition extends CompositeNodeDefinition {
    /**
     * The node type.
     */
    type: "selector";
}
/**
 * A lotto node.
 */
export interface LottoNodeDefinition extends CompositeNodeDefinition {
    /**
     * The node type.
     */
    type: "lotto";
    /**
     * The selection weights for child nodes that correspond to the child node position.
     */
    weights?: number[];
}
/**
 * A parallel node.
 */
export interface ParallelNodeDefinition extends CompositeNodeDefinition {
    /**
     * The node type.
     */
    type: "parallel";
}
/**
 * A race node.
 */
export interface RaceNodeDefinition extends CompositeNodeDefinition {
    /**
     * The node type.
     */
    type: "race";
}
/**
 * An all node.
 */
export interface AllNodeDefinition extends CompositeNodeDefinition {
    /**
     * The node type.
     */
    type: "all";
}
/**
 * A root node.
 */
export interface RootNodeDefinition extends DecoratorNodeDefinition {
    /**
     * The node type.
     */
    type: "root";
    /**
     * The unique root node identifier.
     */
    id?: string;
}
/**
 * A repeat node.
 */
export interface RepeatNodeDefinition extends DecoratorNodeDefinition {
    /**
     * The node type.
     */
    type: "repeat";
    /**
     * The number of iterations to make if defined as a single number, or the lower and upper iteration bounds if defined as an array containing two integer values.
     */
    iterations?: number | [number, number];
}
/**
 * A retry node.
 */
export interface RetryNodeDefinition extends DecoratorNodeDefinition {
    /**
     * The node type.
     */
    type: "retry";
    /**
     * The number of attempts to make if defined as a single number, or the lower and upper attempt bounds if defined as an array containing two integer values.
     */
    attempts?: number | [number, number];
}
/**
 * A flip node.
 */
export interface FlipNodeDefinition extends DecoratorNodeDefinition {
    /**
     * The node type.
     */
    type: "flip";
}
/**
 * A succeed node.
 */
export interface SucceedNodeDefinition extends DecoratorNodeDefinition {
    /**
     * The node type.
     */
    type: "succeed";
}
/**
 * A fail node.
 */
export interface FailNodeDefinition extends DecoratorNodeDefinition {
    /**
     * The node type.
     */
    type: "fail";
}
/**
 * A type defining any node definition.
 */
export type AnyNodeDefinition = BranchNodeDefinition | ActionNodeDefinition | ConditionNodeDefinition | WaitNodeDefinition | SequenceNodeDefinition | SelectorNodeDefinition | LottoNodeDefinition | ParallelNodeDefinition | RaceNodeDefinition | AllNodeDefinition | RootNodeDefinition | RepeatNodeDefinition | RetryNodeDefinition | FlipNodeDefinition | SucceedNodeDefinition | FailNodeDefinition;
/**
 * A type defining any node type that can be a child of composite parent node.
 */
export type AnyChildNodeDefinition = Exclude<AnyNodeDefinition, RootNodeDefinition>;
