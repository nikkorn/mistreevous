import { Agent } from "../../agent";
import Attribute from "../attribute";
/**
 * A base node callback attribute.
 */
export default abstract class Callback extends Attribute {
    /**
     * Gets whether this attribute is a guard.
     */
    isGuard: () => boolean;
    abstract callAgentFunction: (agent: Agent, isSuccess: boolean, isAborted: boolean) => void;
}
