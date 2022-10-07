/**
 * A singleton used to store and lookup registered functions and subtrees.
 */
export default class Lookup {
    /**
     * The object holding any registered functions keyed on function name.
     */
    static #functionTable = {};
    /**
     * The object holding any registered sub-trees keyed on tree name.
     */
    static #subtreeTable = {};

    /**
     * Gets the function with the specified name.
     * @param {string} name The name of the function.
     * @returns The function with the specified name.
     */
    static getFunc(name) {
        return this.#functionTable[name];
    }

    /**
     * Sets the function with the specified name for later lookup.
     * @param {string} name The name of the function.
     * @param {function} func The function.
     */
    static setFunc(name, func) {
        this.#functionTable[name] = func;
    }

    /**
     * Gets the function invoker for the specified agent and function name.
     * If a function with the specified name exists on the agent object then it will
     * be returned, otherwise we will then check the registered functions for a match.
     * @param {object} agent The agent instance that this behaviour tree is modelling behaviour for.
     * @param {string} name The function name.
     * @returns The function invoker for the specified agent and function name.
     */
    static getFuncInvoker(agent, name) {
        // Check whether the agent contains the specified function.
        if (agent[name] && typeof agent[name] === "function") {
            return (args) =>
                agent[name].apply(
                    agent,
                    args.map((arg) => arg.value)
                );
        }

        // The agent does not contain the specified function but it may have been registered at some point.
        if (this.#functionTable[name] && typeof this.#functionTable[name] === "function") {
            return (args) => this.#functionTable[name](agent, ...args.map((arg) => arg.value));
        }

        // We have no function to invoke.
        return null;
    }

    /**
     * Gets the subtree with the specified name.
     * @param {string} name The name of the subtree.
     * @returns The subtree with the specified name.
     */
    static getSubtree(name) {
        return this.#subtreeTable[name];
    }

    /**
     * Sets the subtree with the specified name for later lookup.
     * @param {string} name The name of the subtree.
     * @param {object} subtree The subtree.
     */
    static setSubtree(name, subtree) {
        this.#subtreeTable[name] = subtree;
    }

    /**
     * Removes the registered function or subtree with the specified name.
     * @param {string} name The name of the registered function or subtree.
     */
    static remove(name) {
        delete this.#functionTable[name];
        delete this.#subtreeTable[name];
    }

    /**
     * Remove all registered functions and subtrees.
     */
    static empty() {
        this.#functionTable = {};
        this.#subtreeTable = {};
    }
}
