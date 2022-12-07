import { ActionResult, Agent, ExitFunctionArg, FunctionArg, GlobalFunction } from "./agent";
import { AnyArgument, RootAstNode } from "./rootAstNodesBuilder";

// Exit callbacks receive their own special type of argument.
// There's probably stricter ways to represent this but it feels overly complex right now.
type ExitResultArg = { value: ExitFunctionArg };
export type AnyExitArgument = AnyArgument | ExitResultArg;

export type InvokerFunction = (args: AnyExitArgument[]) => ActionResult;

/**
 * A singleton used to store and lookup registered functions and subtrees.
 */
export default class Lookup {
    /**
     * The object holding any registered functions keyed on function name.
     */
    private static functionTable: { [key: string]: GlobalFunction } = {};
    /**
     * The object holding any registered sub-trees keyed on tree name.
     */
    private static subtreeTable: { [key: string]: RootAstNode } = {};

    /**
     * Gets the function with the specified name.
     * @param name The name of the function.
     * @returns The function with the specified name.
     */
    public static getFunc(name: string): GlobalFunction {
        return this.functionTable[name];
    }

    /**
     * Sets the function with the specified name for later lookup.
     * @param name The name of the function.
     * @param func The function.
     */
    public static setFunc(name: string, func: GlobalFunction): void {
        this.functionTable[name] = func;
    }

    /**
     * Gets the function invoker for the specified agent and function name.
     * If a function with the specified name exists on the agent object then it will
     * be returned, otherwise we will then check the registered functions for a match.
     * @param agent The agent instance that this behaviour tree is modelling behaviour for.
     * @param name The function name.
     * @returns The function invoker for the specified agent and function name.
     */
    static getFuncInvoker(agent: Agent, name: string): InvokerFunction | null {
        // Check whether the agent contains the specified function.
        const foundOnAgent = agent[name];
        if (foundOnAgent && typeof foundOnAgent === "function") {
            return (args: AnyExitArgument[]): boolean | ActionResult =>
                foundOnAgent.apply(
                    agent,
                    args.map((arg) => arg.value)
                );
        }

        // The agent does not contain the specified function but it may have been registered at some point.
        if (this.functionTable[name] && typeof this.functionTable[name] === "function") {
            return (args: AnyExitArgument[]) => this.functionTable[name](agent, ...args.map((arg) => arg.value));
        }

        // We have no function to invoke.
        return null;
    }

    /**
     * Gets the subtree with the specified name.
     * @param name The name of the subtree.
     * @returns The subtree with the specified name.
     */
    static getSubtree(name: string): RootAstNode {
        return this.subtreeTable[name];
    }

    /**
     * Sets the subtree with the specified name for later lookup.
     * @param name The name of the subtree.
     * @param subtree The subtree.
     */
    static setSubtree(name: string, subtree: RootAstNode) {
        this.subtreeTable[name] = subtree;
    }

    /**
     * Removes the registered function or subtree with the specified name.
     * @param name The name of the registered function or subtree.
     */
    static remove(name: string) {
        delete this.functionTable[name];
        delete this.subtreeTable[name];
    }

    /**
     * Remove all registered functions and subtrees.
     */
    static empty() {
        this.functionTable = {};
        this.subtreeTable = {};
    }
}
