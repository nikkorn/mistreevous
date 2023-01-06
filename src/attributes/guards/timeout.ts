import { Agent } from "../../agent";
import { AnyArgument } from "../../rootAstNodesBuilder";
import Guard from "./guard";

/**
 * A TIMEOUT guard which is satisfied as long as the given condition remains false.
 */
export default class Timeout extends Guard {
    /**
     * @param duration The duration of the timeout.
     * @param args The array of decorator argument definitions.
     */
    constructor(private duration: number, args: AnyArgument[]) {
        super("timeout", args);
    }

    /**
     * Gets whether the guard is satisfied.
     * @param agent The agent.
     * @returns Whether the guard is satisfied.
     */
    isSatisfied = (agent: Agent) => {
        throw new Error("TODO");
    };
}
