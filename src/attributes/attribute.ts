import Guard from "./guards/guard";

/**
 * A base node attribute.
 */
export default abstract class Attribute {
    /**
     * @param type The node attribute type.
     * @param args The array of attribute argument definitions.
     */
    constructor(protected type: string, protected args: any[]) {}

    /**
     * Gets the type of the attribute.
     */
    getType = () => this.type;

    /**
     * Gets the array of attribute argument definitions.
     */
    getArguments = () => this.args;

    /**
     * Gets the attribute details.
     */
    getDetails = () => ({
        type: this.getType(),
        arguments: this.getArguments()
    });

    /**
     * Gets whether this attribute is a guard.
     */
    abstract isGuard: () => this is Guard;
}
