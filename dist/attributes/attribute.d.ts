import Guard from "./guards/guard";
/**
 * A base node attribute.
 */
export default abstract class Attribute {
    protected type: string;
    protected args: any[];
    /**
     * @param type The node attribute type.
     * @param args The array of attribute argument definitions.
     */
    constructor(type: string, args: any[]);
    /**
     * Gets the type of the attribute.
     */
    getType: () => string;
    /**
     * Gets the array of attribute argument definitions.
     */
    getArguments: () => any[];
    /**
     * Gets the attribute details.
     */
    getDetails: () => {
        type: string;
        arguments: any[];
    };
    /**
     * Gets whether this attribute is a guard.
     */
    abstract isGuard: () => this is Guard;
}
