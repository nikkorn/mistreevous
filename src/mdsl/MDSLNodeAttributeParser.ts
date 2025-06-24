import { NodeAttributeDefinition, NodeGuardDefinition } from "../BehaviourTreeDefinition";
import { getArgumentJsonValue } from "./MDSLArguments";
import { parseArgumentTokens } from "./MDSLNodeArgumentParser";
import { popAndCheck, StringLiteralPlaceholders } from "./MDSLUtilities";

/**
 * A type defining the attribute definitions of a node.
 */
type NodeAttributes = {
    while?: NodeGuardDefinition;
    until?: NodeGuardDefinition;
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

        // The first attribute argument has to be an agent function reference.
        if (attributeCallIdentifier?.type !== "identifier") {
            throw new Error("expected agent function or registered function name identifier argument for attribute");
        }

        // Any attribute arguments (other than the expected function reference token) must have a type of string, number, boolean, null or agent property reference.
        attributeArguments
            .filter((arg) => arg.type === "identifier")
            .forEach((arg) => {
                throw new Error(
                    `invalid attribute argument value '${arg.value}', must be string, number, boolean, null or agent property reference`
                );
            });

        // Are we dealing with a guard attribute or a normal attribute?
        if (nextAttributeName === "while" || nextAttributeName === "until") {
            // By default, an aborted running node will move to the FAILED state.
            let succeedOnAbort = false;

            // The resolved abort state could also be defined. Check for the token 'then' followed by 'succeed' or 'fail'.
            if (tokens[0]?.toLowerCase() === "then") {
                // Remove the "then" token from the array of tokens.
                tokens.shift();

                // The next token should be either the 'succeed' or 'fail' resolved status.
                const resolvedStatusToken = popAndCheck(tokens, ["succeed", "fail"]);

                succeedOnAbort = resolvedStatusToken.toLowerCase() === "succeed";
            }

            // Create the guard definition and add it to the object of attribute definitions found.
            attributes[nextAttributeName] = {
                call: attributeCallIdentifier.value,
                args: attributeArguments.map(getArgumentJsonValue),
                succeedOnAbort
            };
        } else {
            // Create the attribute definition and add it to the object of attribute definitions found.
            attributes[nextAttributeName] = {
                call: attributeCallIdentifier.value,
                args: attributeArguments.map(getArgumentJsonValue)
            };
        }

        // Try to get the next attribute name token, as there could be multiple.
        nextAttributeName = tokens[0]?.toLowerCase() as keyof NodeAttributes;
    }

    return attributes;
}
