/**
 * A base node attribute.
 * @param type The node attribute type.
 * @param args The array of attribute argument definitions.
 */
export default function Attribute(type, args) {
    /**
     * Gets the type of the attribute.
     */
    this.getType = () => type;

    /**
     * Gets the array of attribute argument definitions.
     */
    this.getArguments = () => args;

    /**
     * Gets the attribute details.
     */
    this.getDetails = () => ({
        type: this.getType(),
        arguments: this.getArguments()
    });
}
