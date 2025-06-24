/**
 * This file contains definitions for types representing node arguments parsed from MDSL.
 * These definition do not, and are not supposed to, match any argument typings for user-defined JSON tree definitions.
 */

/**
 * A type representing a node function argument parsed from MDSL.
 */
export type Argument<T> = {
    /**
     * The argument value.
     */
    value: T;
};

/**
 * A type representing a node function argument with a value of null parsed from MDSL.
 */
export type NullArgument = Argument<null> & {
    /**
     * The argument type.
     */
    type: "null";
};

/**
 * A type representing a node function argument with a value of boolean parsed from MDSL.
 */
export type BooleanArgument = Argument<boolean> & {
    /**
     * The argument type.
     */
    type: "boolean";
};

/**
 * A type representing a node function argument with a value of number parsed from MDSL.
 */
export type NumberArgument = Argument<number> & {
    /**
     * The argument type.
     */
    type: "number";
    /**
     * A flag defining whether the number argument value is a valid integer.
     */
    isInteger: boolean;
};

/**
 * A type representing a node function argument with a value of string which is a placeholder reference for a string literal argument parsed from MDSL.
 */
export type StringPlaceholderArgument = Argument<string> & {
    /**
     * The argument type.
     */
    type: "string";
};

/**
 * A type representing a node function argument with a value of an identifier parsed from MDSL.
 */
export type IdentifierArgument = Argument<string> & {
    /**
     * The argument type.
     */
    type: "identifier";
};

/**
 * A type representing a node function argument with a value of an agent property reference parsed from MDSL.
 */
export type AgentPropertyReferenceArgument = Argument<string> & {
    /**
     * The argument type.
     */
    type: "property_reference";
};

/**
 * A type representing a reference to any node function argument parsed from MDSL.
 */
export type AnyArgument =
    | NullArgument
    | BooleanArgument
    | NumberArgument
    | StringPlaceholderArgument
    | IdentifierArgument
    | AgentPropertyReferenceArgument;

/**
 * Gets the JSON value of the specified argument object.
 * @param arg The argument object.
 * @returns The JSON value of the specified argument object.
 */
export function getArgumentJsonValue(arg: AnyArgument): any {
    // If the argument is an agent property reference then the value format will be `{ $: "some_property_name" }`.
    if (arg.type === "property_reference") {
        return { $: arg.value };
    }

    // We can just return the value as-is.
    return arg.value;
}
