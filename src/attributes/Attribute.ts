import Guard from "./guards/Guard";

export type AttributeDetails = {
    /** The attribute type. */
    type: string;

    /** The attribute arguments. */
    args: any[];
};

/**
 * A base node attribute.
 */
export default abstract class Attribute<TAttributeDetails extends AttributeDetails = AttributeDetails> {
    /**
     * @param type The node attribute type.
     * @param args The array of attribute arguments.
     */
    constructor(public type: string, public args: any[]) {}

    /**
     * Gets the attribute details.
     */
    abstract getDetails(): TAttributeDetails;
}
