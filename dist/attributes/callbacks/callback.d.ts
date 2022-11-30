import Attribute from "../attribute";
/**
 * A base node callback attribute.
 * @param type The node callback attribute type.
 * @param args The array of attribute argument definitions.
 */
export default abstract class Callback extends Attribute {
    /**
     * Gets whether this attribute is a guard.
     */
    isGuard: () => boolean;
    abstract callAgentFunction: (agent: any, isSuccess: boolean, isAborted: boolean) => void;
}
