import Attribute from "../attribute";

/**
 * A base node guard attribute.
 * @param type The node guard attribute type.
 * @param args The array of attribute argument definitions.
 */
export default abstract class Guard extends Attribute {
    /**
     * Gets whether this attribute is a guard.
     */
    isGuard = () => true;

    abstract isSatisfied(agent: any): boolean
}
