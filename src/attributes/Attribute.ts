/**
 * The details of a base node attribute.
 */
export type AttributeDetails = {
    /** The attribute type. */
    type: string;
};

/**
 * A base node attribute.
 */
export default abstract class Attribute<TAttributeDetails extends AttributeDetails = AttributeDetails> {
    /**
     * @param type The node attribute type.
     */
    constructor(public type: string) {}

    /**
     * Gets the attribute details.
     */
    abstract getDetails(): TAttributeDetails;
}
