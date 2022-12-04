import { AnyArgument } from "../rootAstNodesBuilder";
import Guard from "./guards/guard";
export type AttributeDetails = {
    type: string;
    arguments: AnyArgument[];
};
/**
 * A base node attribute.
 */
export default abstract class Attribute {
    protected type: string;
    protected args: AnyArgument[];
    /**
     * @param type The node attribute type.
     * @param args The array of attribute argument definitions.
     */
    constructor(type: string, args: AnyArgument[]);
    /**
     * Gets the type of the attribute.
     */
    getType: () => string;
    /**
     * Gets the array of attribute argument definitions.
     */
    getArguments: () => AnyArgument[];
    /**
     * Gets the attribute details.
     */
    getDetails: () => AttributeDetails;
    /**
     * Gets whether this attribute is a guard.
     */
    abstract isGuard: () => this is Guard;
}
