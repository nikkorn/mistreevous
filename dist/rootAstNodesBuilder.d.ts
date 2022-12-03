import Root from "./nodes/decorator/root";
import Node from "./nodes/node";
export type Argument<T> = {
    value: T;
    type: string;
    toString(this: Argument<T>): T;
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
type NamedRootNodeProvider = (name: string) => AstNode<Root>;
type NodeInstanceCreator<T extends Node> = (namedRootNodeProvider: NamedRootNodeProvider, visitedBranches: any) => T;
type Validatable = {
    validate: (this: any, depth: number) => void;
    children?: AstNode<Node>[];
};
export type AstNode<T extends Node> = {
    type: string;
    attributes: any[];
    createNodeInstance: NodeInstanceCreator<T>;
    name?: null | string;
    branchName?: "" | string;
    tickets?: any[];
    iterations?: number | null;
    maximumIterations?: number | null;
    duration?: number | null;
    longestDuration?: number | null;
    actionName?: string;
    actionArguments?: any[];
    conditionName?: string;
    conditionArguments?: any[];
} & Validatable;
/**
 * Create an array of root AST nodes based on the given definition.
 * @param definition The definition to parse the AST nodes from.
 * @returns The base definition AST nodes.
 */
export default function buildRootASTNodes(definition: string): AstNode<Root>[];
export {};
