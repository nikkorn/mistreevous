/**
 * A base node decorator.
 * @param type The node decorator type.
 */
export default function Decorator(type) {
  
    /**
     * Gets the type of the node.
     */
    this.getType = () => type;
  
    /**
     * Gets whether the decorator is a guard.
     */
    this.isGuard = () => false;
};