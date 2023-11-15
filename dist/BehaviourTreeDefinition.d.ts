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
    args?: any[];
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
    while?: NodeAttributeDefinition;
    /**
     * The 'until' node attribute definition.
     */
    until?: NodeAttributeDefinition;
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
    children: AnyChildNode[];
}
/**
 * A decorator node, a composite with only a single child node.
 */
export interface DecoratorNodeDefinition extends NodeDefinition {
    /**
     * The child node of this decorator node.
     */
    child: AnyChildNode;
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
     * The name of the agent function to invoke.
     */
    call: string;
    /**
     * An array of arguments to pass when invoking the agent function.
     */
    args?: any[];
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
     * The name of the agent function to invoke.
     */
    call: string;
    /**
     * An array of arguments to pass when invoking the agent function.
     */
    args?: any[];
}
/**
 * A wait node.
 */
export interface WaitNodeDefinition extends NodeDefinition {
    /**
     * The node type.
     */
    type: "wait";
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
 * A type defining any node type.
 */
export type AnyNode = BranchNodeDefinition | ActionNodeDefinition | ConditionNodeDefinition | WaitNodeDefinition | SequenceNodeDefinition | SelectorNodeDefinition | LottoNodeDefinition | ParallelNodeDefinition | RootNodeDefinition | RepeatNodeDefinition | RetryNodeDefinition | FlipNodeDefinition | SucceedNodeDefinition | FailNodeDefinition;
/**
 * A type defining any node type that can be a child of composite parent node.
 */
export type AnyChildNode = Exclude<AnyNode, RootNodeDefinition>;
