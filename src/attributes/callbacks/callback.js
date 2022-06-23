import Attribute from "../attribute";

/**
 * A base node callback attribute.
 * @param type The node callback attribute type.
 * @param args The array of attribute argument definitions.
 */
export default function Callback(type, args) {
    Attribute.call(this, type, args);

    /**
     * Gets whether this attribute is a guard.
     */
    this.isGuard = () => false;
}

Callback.prototype = Object.create(Attribute.prototype);
