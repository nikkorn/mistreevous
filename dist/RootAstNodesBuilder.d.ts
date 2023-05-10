import Action from "./nodes/leaf/Action";
import Condition from "./nodes/leaf/Condition";
import Wait from "./nodes/leaf/Wait";
import Root from "./nodes/decorator/Root";
import Repeat from "./nodes/decorator/Repeat";
import Retry from "./nodes/decorator/Retry";
import Lotto from "./nodes/composite/Lotto";
import Node from "./nodes/Node";
import Attribute from "./attributes/Attribute";
import Composite from "./nodes/composite/Composite";
import Decorator from "./nodes/decorator/Decorator";
import Leaf from "./nodes/leaf/Leaf";
export type Argument<T> = {
    value: T;
    type: string;
};
type NullArgument = Argument<null> & {
    type: "null";
};
type BooleanArgument = Argument<boolean> & {
    type: "boolean";
};
type NumberArgument = Argument<number> & {
    type: "number";
    isInteger: boolean;
};
type StringPlaceholderArgument = Argument<string> & {
    type: "string";
};
type IdentifierArgument = Argument<string> & {
    type: "identifier";
};
export type AnyArgument = NullArgument | BooleanArgument | NumberArgument | StringPlaceholderArgument | IdentifierArgument;
type Validatable = {
    children?: AstNode<Node>[];
    validate: (depth: number) => void;
};
type NodeInstanceCreator<T extends Node> = (namedRootNodeProvider: (name: string) => RootAstNode, visitedBranches: string[]) => T;
export type AstNode<T extends Node> = Validatable & {
    type: string;
    createNodeInstance: NodeInstanceCreator<T>;
};
export type LeafAstNode<T extends Leaf = Leaf> = AstNode<T> & {
    type: "action" | "condition" | "wait";
    attributes: Attribute[];
};
export type CompositeAstNode<T extends Composite = Composite> = AstNode<T> & {
    type: "lotto" | "parallel" | "selector" | "sequence";
    attributes: Attribute[];
    children: AstNode<Node>[];
};
export type DecoratorAstNode<T extends Decorator = Decorator> = AstNode<T> & {
    type: "fail" | "flip" | "repeat" | "retry" | "root" | "succeed";
    attributes: Attribute[];
    children: AstNode<Node>[];
};
export type BranchAstNode = AstNode<Node> & {
    type: "branch";
    branchName: "" | string;
};
export type LottoAstNode = CompositeAstNode<Lotto> & {
    type: "lotto";
    tickets: number[];
};
export type RootAstNode = DecoratorAstNode<Root> & {
    type: "root";
    name: null | string;
};
export type IterableAstNode = DecoratorAstNode<Repeat | Retry> & {
    type: "repeat" | "retry";
    iterations: null | number;
    maximumIterations: null | number;
};
export type ActionAstNode = LeafAstNode<Action> & {
    type: "action";
    actionName: string;
    actionArguments: AnyArgument[];
};
export type ConditionAstNode = LeafAstNode<Condition> & {
    type: "condition";
    conditionName: string;
    conditionArguments: AnyArgument[];
};
export type WaitAstNode = LeafAstNode<Wait> & {
    type: "wait";
    duration: number | null;
    durationMin: number | null;
    durationMax: number | null;
};
export type AnyAstNode = BranchAstNode | CompositeAstNode | LottoAstNode | DecoratorAstNode | RootAstNode | IterableAstNode | LeafAstNode | ActionAstNode | ConditionAstNode | WaitAstNode;
/**
 * Create an array of root AST nodes based on the given definition.
 * @param definition The definition to parse the AST nodes from.
 * @returns The base definition AST nodes.
 */
export default function buildRootASTNodes(definition: string): RootAstNode[];
export {};
