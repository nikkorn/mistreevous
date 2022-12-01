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

    abstract isSatisfied(agent: Agent): boolean
}
