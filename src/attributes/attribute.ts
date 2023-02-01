import { AnyArgument } from "../rootAstNodesBuilder";
import Guard from "./guards/guard";

export type AttributeDetails = {
    /** The attribute type. */
    type: string;

    /** The attribute arguments. */
    args: AnyArgument[];
};

/**
 * A base node attribute.
 */
export default abstract class Attribute<TAttributeDetails extends AttributeDetails = AttributeDetails> {
    /**
     * @param type The node attribute type.
     * @param args The array of attribute argument definitions.
     */
    constructor(protected type: string, protected args: AnyArgument[]) {}

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
    abstract getDetails(): TAttributeDetails;

    /**
     * Gets whether this attribute is a guard.
     */
    abstract isGuard: () => this is Guard;
}
