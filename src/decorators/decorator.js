/**
 * A base node decorator.
 * @param type The node decorator type.
 * @param args The array of decorator argument definitions.
 */
export default function Decorator(type, args) {
    /**
     * Gets the type of the node.
     */
    this.getType = () => type;

    /**
     * Gets the array of decorator argument definitions.
     */
    this.getArguments = () => args;
  
    /**
     * Gets whether the decorator is a guard.
     */
    this.isGuard = () => false;

    /**
     * Gets the decorator details.
     */
    this.getDetails = () => ({ 
        type: this.getType(),
        arguments: this.getArguments()
    });
};