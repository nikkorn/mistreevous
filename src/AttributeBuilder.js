import While from "./attributes/guards/while";
import Until from "./attributes/guards/until";
import Entry from "./attributes/callbacks/entry";
import Exit from "./attributes/callbacks/exit";
import Step from "./attributes/callbacks/step";

/**
 * The builder of node attributes.
 */
export default class AttributeBuilder {
    /**
     * The node attribute factories.
     */
    static #factories = {
        WHILE: (condition, attributeArguments) => new While(condition, attributeArguments),
        UNTIL: (condition, attributeArguments) => new Until(condition, attributeArguments),
        ENTRY: (functionName, attributeArguments) => new Entry(functionName, attributeArguments),
        EXIT: (functionName, attributeArguments) => new Exit(functionName, attributeArguments),
        STEP: (functionName, attributeArguments) => new Step(functionName, attributeArguments)
    };

    /**
     * Pull any attributes off of the token stack.
     * @param tokens The array of remaining tokens.
     * @param stringArgumentPlaceholders The mapping of string literal node argument placeholders to original values.
     * @returns An array of attributes defined by any directly following tokens.
     */
    static parseFromTokens(tokens, stringArgumentPlaceholders) {
        // Create an array to hold any attributes found.
        const attributes = [];

        // Keep track of names of attributes that we have found on the token stack, as we cannot have duplicates.
        const attributesFound = [];

        // Try to get the attribute factory for the next token.
        let attributeFactory = this.#factories[(tokens[0] || "").toUpperCase()];

        // Pull attribute tokens off of the tokens stack until we have no more.
        while (attributeFactory) {
            // Check to make sure that we have not already created a attribute of this type for this node.
            if (attributesFound.indexOf(tokens[0].toUpperCase()) !== -1) {
                throw new Error(`duplicate attribute '${tokens[0].toUpperCase()}' found for node`);
            }

            // Add the current attribute type to our array of found attributes.
            attributesFound.push(tokens.shift().toUpperCase());

            // Grab any attribute arguments.
            const attributeArguments = getArguments(tokens, stringArgumentPlaceholders);

            // The first attribute argument has to be an identifer, this will reference an agent function.
            if (attributeArguments.length === 0 || attributeArguments[0].type !== "identifier") {
                throw new Error("expected agent function name identifier argument for attribute");
            }

            // Grab the first attribute which is an identifier that will reference an agent function.
            const attributeFunctionNameArg = attributeArguments.shift();

            // Any remaining attribute arguments must have a type of string, number, boolean or null.
            attributeArguments
                .filter((arg) => arg.type === "identifier")
                .forEach((arg) => {
                    throw new Error(
                        "invalid attribute argument value '" + arg.value + "', must be string, number, boolean or null"
                    );
                });

            // Create the attribute and add it to the array of attribute found.
            attributes.push(attributeFactory(attributeFunctionNameArg.value, attributeArguments));

            // Try to get the next attribute name token, as there could be multiple.
            attributeFactory = this.#factories[(tokens[0] || "").toUpperCase()];
        }

        return attributes;
    }
}
