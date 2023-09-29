import Callback from "./Callback";
import { Agent } from "../../Agent";
import { AnyArgument } from "../../RootAstNodesBuilder";
/**
 * An ENTRY callback which defines an agent function to call when the associated node is updated and moves out of running state.
 */
export default class Entry extends Callback {
    /**
     * @param functionName The name of the agent function to call.
     * @param args The array of callback argument definitions.
     */
    constructor(functionName: string, args: AnyArgument[]);
    /**
     * Attempt to call the agent function that this callback refers to.
     * @param agent The agent.
     */
    callAgentFunction: (agent: Agent) => void;
}
