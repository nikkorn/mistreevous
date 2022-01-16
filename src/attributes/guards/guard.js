import Attribute from '../attribute';

/**
 * A base node guard attribute.
 * @param type The node guard attribute type.
 * @param args The array of attribute argument definitions.
 */
export default function Guard(type, args) {
    Attribute.call(this, type, args);

    /**
     * Gets whether this attribute is a guard.
     */
     this.isGuard = () => true;
};

Guard.prototype = Object.create(Attribute.prototype);