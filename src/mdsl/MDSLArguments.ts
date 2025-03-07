/**
 * A type representing a node function argument.
 */
export type Argument<T> = {
    /**
     * The argument value.
     */
    value: T;
    /**
     * The argument type, used for validation.
     */
    type: string;
};

export type NullArgument = Argument<null> & {
    type: "null";
};

export type BooleanArgument = Argument<boolean> & {
    type: "boolean";
};

export type NumberArgument = Argument<number> & {
    type: "number";
    /**
     * A flag defining whether the number argument value is a valid integer.
     */
    isInteger: boolean;
};

export type StringPlaceholderArgument = Argument<string> & {
    type: "string";
};

export type IdentifierArgument = Argument<string> & {
    type: "identifier";
};

/**
 * A type representing a reference to any node function argument.
 */
export type AnyArgument =
    | NullArgument
    | BooleanArgument
    | NumberArgument
    | StringPlaceholderArgument
    | IdentifierArgument;

/**
 * Gets the JSON value of the specified argument object.
 * @param arg The argument object.
 * @returns The JSON value of the specified argument object.
 */
export function getArgumentJsonValue(arg: AnyArgument): any {
    return arg.type === "identifier" ? `{{${arg.value}}}` : arg.value;
}
