import { NodeAttributeDefinition } from "../BehaviourTreeDefinition";
import { parseArgumentTokens } from "./MDSLNodeArgumentParser";
import { StringLiteralPlaceholders } from "./MDSLUtilities";

/**
 * A type defining the attribute definitions of a node.
 */
type NodeAttributes = {
    while?: NodeAttributeDefinition;
    until?: NodeAttributeDefinition;
    entry?: NodeAttributeDefinition;
    exit?: NodeAttributeDefinition;
    step?: NodeAttributeDefinition;
};

/**
 * Parse any node attribute definitions from the specified tokens array.
 * @param tokens The array of remaining tokens.
 * @param stringArgumentPlaceholders The mapping of string literal node argument placeholders to original values.
 * @returns An object of attribute definitions defined by any directly following tokens.
 */
export function parseAttributeTokens(
    tokens: string[],
    stringArgumentPlaceholders: StringLiteralPlaceholders
): NodeAttributes {
    const nodeAttributeNames: (keyof NodeAttributes)[] = ["while", "until", "entry", "exit", "step"];

    // Create an object to hold any attributes found.
    const attributes: NodeAttributes = {};

    // Try to get the name of the attribute for the next token.
    let nextAttributeName = tokens[0]?.toLowerCase() as keyof NodeAttributes;

    // Pull attribute tokens as well as their arguments off of the tokens stack until we have no more.
    while (nodeAttributeNames.includes(nextAttributeName)) {
        // Check to make sure that we have not already created an attribute definition of this type.
        if (attributes[nextAttributeName]) {
            throw new Error(`duplicate attribute '${tokens[0].toUpperCase()}' found for node`);
        }

        // Remove the attribute name token from the array of tokens.
        tokens.shift();

        // Grab the attribute arguments, assuming the first to be an identifier.
        const [attributeCallIdentifier, ...attributeArguments] = parseArgumentTokens(
            tokens,
            stringArgumentPlaceholders
        );

        // The first attribute argument has to be an identifer, this will reference an agent function.
        if (attributeCallIdentifier?.type !== "identifier") {
            throw new Error("expected agent function name identifier argument for attribute");
        }

        // Any attribute arguments (other than the expected call identifier) must have a type of string, number, boolean or null.
        attributeArguments
            .filter((arg) => arg.type === "identifier")
            .forEach((arg) => {
                throw new Error(
                    "invalid attribute argument value '" + arg.value + "', must be string, number, boolean or null"
                );
            });

        // Create the attribute definition and add it to the object of attribute definitions found.
        attributes[nextAttributeName] = {
            call: attributeCallIdentifier.value,
            args: attributeArguments.map(({ value }) => value)
        };

        // Try to get the next attribute name token, as there could be multiple.
        nextAttributeName = tokens[0]?.toLowerCase() as keyof NodeAttributes;
    }

    return attributes;
}
