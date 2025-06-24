import { ActionResult, Agent, GlobalFunction } from "./Agent";
import { RootNodeDefinition } from "./BehaviourTreeDefinition";

export type InvokerFunction = (args: any[]) => ActionResult | boolean;

/**
 * A singleton used to store and lookup registered functions and subtrees.
 */
export default class Lookup {
    /**
     * The object holding any registered functions keyed on function name.
     */
    private static registeredFunctions: { [key: string]: GlobalFunction } = {};
    /**
     * The object holding any registered subtree root node definitions keyed on tree name.
     */
    private static registeredSubtrees: { [key: string]: RootNodeDefinition } = {};

    /**
     * Gets the function with the specified name.
     * @param name The name of the function.
     * @returns The function with the specified name.
     */
    public static getFunc(name: string): GlobalFunction {
        return this.registeredFunctions[name];
    }

    /**
     * Sets the function with the specified name for later lookup.
     * @param name The name of the function.
     * @param func The function.
     */
    public static setFunc(name: string, func: GlobalFunction): void {
        this.registeredFunctions[name] = func;
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
        // A function to process any arguments that will be passed to an agent or registered function.
        const processFunctionArguments = (args: any[]) =>
            args.map((arg) => {
                // This argument may be an agent property reference. If it is we should substitute it for the value of the agent property it references.
                // An agent property reference will be an object with a single "$" property with a string value representing the agent property name.
                if (
                    typeof arg === "object" &&
                    arg !== null &&
                    Object.keys(arg).length === 1 &&
                    Object.prototype.hasOwnProperty.call(arg, "$")
                ) {
                    // Get the agent property name from the object representing the agent property reference.
                    const agentPropertyName = arg["$"];

                    // The agent property name must be a valid string.
                    if (typeof agentPropertyName !== "string" || agentPropertyName.length === 0) {
                        throw new Error("Agent property reference must be a string?");
                    }

                    return agent[agentPropertyName];
                }

                // The argument can be passed to the function as-is.
                return arg;
            });

        // Check whether the agent contains the specified function.
        const agentFunction = agent[name];
        if (agentFunction && typeof agentFunction === "function") {
            return (args: any[]) => agentFunction.apply(agent, processFunctionArguments(args));
        }

        // The agent does not contain the specified function but it may have been registered at some point.
        if (this.registeredFunctions[name] && typeof this.registeredFunctions[name] === "function") {
            const registeredFunction = this.registeredFunctions[name];
            return (args: any[]) => registeredFunction(agent, ...processFunctionArguments(args));
        }

        // We have no function to invoke.
        return null;
    }

    /**
     * Gets all registered subtree root node definitions.
     */
    static getSubtrees(): { [key: string]: RootNodeDefinition } {
        return this.registeredSubtrees;
    }

    /**
     * Sets the subtree with the specified name for later lookup.
     * @param name The name of the subtree.
     * @param subtree The subtree.
     */
    static setSubtree(name: string, subtree: RootNodeDefinition) {
        this.registeredSubtrees[name] = subtree;
    }

    /**
     * Removes the registered function or subtree with the specified name.
     * @param name The name of the registered function or subtree.
     */
    static remove(name: string) {
        delete this.registeredFunctions[name];
        delete this.registeredSubtrees[name];
    }

    /**
     * Remove all registered functions and subtrees.
     */
    static empty() {
        this.registeredFunctions = {};
        this.registeredSubtrees = {};
    }
}
