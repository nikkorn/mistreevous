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
    type: string;
    args: any[];
    /**
     * @param type The node attribute type.
     * @param args The array of attribute arguments.
     */
    constructor(type: string, args: any[]);
    /**
     * Gets the attribute details.
     */
    abstract getDetails(): TAttributeDetails;
}
