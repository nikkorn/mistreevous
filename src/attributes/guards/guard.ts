import { Agent } from "../../agent";
import Attribute from "../attribute";

/**
 * A base node guard attribute.
 */
export default abstract class Guard extends Attribute {
    /**
     * Gets whether this attribute is a guard.
     */
    isGuard = () => true;

    /**
     * Gets whether the guard is satisfied.
     * @param agent The agent.
     * @returns Whether the guard is satisfied.
     */
    abstract isSatisfied(agent: Agent): boolean
}
