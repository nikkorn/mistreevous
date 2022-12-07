import Action from "./nodes/leaf/action";
import Condition from "./nodes/leaf/condition";
import Wait from "./nodes/leaf/wait";
import Root from "./nodes/decorator/root";
import Repeat from "./nodes/decorator/repeat";
import Retry from "./nodes/decorator/retry";
import Lotto from "./nodes/composite/lotto";
import Node from "./nodes/node";
import Attribute from "./attributes/attribute";
import Composite from "./nodes/composite/composite";
import Decorator from "./nodes/decorator/decorator";
import Leaf from "./nodes/leaf/leaf";
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
type NamedRootNodeProvider = (name: string) => RootAstNode;
type NodeInstanceCreator<T extends Node> = (namedRootNodeProvider: NamedRootNodeProvider, visitedBranches: string[]) => T;
type Validatable = {
    children?: AstNode<Node>[];
    validate: (depth: number) => void;
};
export type AstNode<T extends Node> = Validatable & {
    type: string;
    createNodeInstance: NodeInstanceCreator<T>;
};
export type InitialAstNode = AstNode<Node> & {
    createNodeInstance: NodeInstanceCreator<Node>;
};
export type BranchAstNode = AstNode<Node> & {
    type: "branch";
    branchName: "" | string;
    createNodeInstance: NodeInstanceCreator<Node>;
};
export type CompositeAstNode = AstNode<Composite> & {
    type: "lotto" | "parallel" | "selector" | "sequence";
    createNodeInstance: NodeInstanceCreator<Composite>;
    attributes: Attribute[];
    children: AstNode<Node>[];
};
export type LottoAstNode = CompositeAstNode & AstNode<Lotto> & {
    type: "lotto";
    createNodeInstance: NodeInstanceCreator<Lotto>;
    tickets: number[];
};
export type DecoratorAstNode = AstNode<Decorator> & {
    type: "fail" | "flip" | "repeat" | "retry" | "root" | "succeed";
    createNodeInstance: NodeInstanceCreator<Decorator>;
    attributes: Attribute[];
    children: AstNode<Node>[];
};
export type RootAstNode = DecoratorAstNode & AstNode<Root> & {
    type: "root";
    createNodeInstance: NodeInstanceCreator<Root>;
    name: null | string;
};
export type IterableAstNode = DecoratorAstNode & AstNode<Repeat | Retry> & {
    type: "repeat" | "retry";
    createNodeInstance: NodeInstanceCreator<Repeat | Retry>;
    iterations: null | number;
    maximumIterations: null | number;
};
export type LeafAstNode = AstNode<Leaf> & {
    type: "action" | "condition" | "wait";
    createNodeInstance: NodeInstanceCreator<Leaf>;
    attributes: Attribute[];
};
export type ActionAstNode = LeafAstNode & AstNode<Action> & {
    type: "action";
    createNodeInstance: NodeInstanceCreator<Leaf>;
    actionName: string;
    actionArguments: AnyArgument[];
};
export type ConditionAstNode = LeafAstNode & AstNode<Condition> & {
    type: "condition";
    createNodeInstance: NodeInstanceCreator<Condition>;
    conditionName: string;
    conditionArguments: AnyArgument[];
};
export type WaitAstNode = LeafAstNode & AstNode<Wait> & {
    type: "wait";
    createNodeInstance: NodeInstanceCreator<Wait>;
    duration: number | null;
    longestDuration: number | null;
};
export type AnyAstNode = InitialAstNode | BranchAstNode | CompositeAstNode | LottoAstNode | DecoratorAstNode | RootAstNode | IterableAstNode | LeafAstNode | ActionAstNode | ConditionAstNode | WaitAstNode;
/**
 * Create an array of root AST nodes based on the given definition.
 * @param definition The definition to parse the AST nodes from.
 * @returns The base definition AST nodes.
 */
export default function buildRootASTNodes(definition: string): RootAstNode[];
export {};
