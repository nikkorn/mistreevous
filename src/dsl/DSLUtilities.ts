/**
 * Pop the next raw token from the specified array of tokens and throw an error if it wasn't the expected one.
 * @param tokens The array of tokens.
 * @param expected An optional string or array or items, one of which must match the next popped token.
 * @returns The popped token.
 */
export function popAndCheck(tokens: string[], expected?: string | string[]): string {
    // Get and remove the next token.
    const popped = tokens.shift();

    // We were expecting another token but there aren't any.
    if (popped === undefined) {
        throw new Error("unexpected end of definition");
    }

    // Do we have an expected token/tokens array?
    if (expected != undefined) {
        // Get an array of expected values, if the popped token matches any then we are all good.
        const expectedValues = (typeof expected === "string") ? [expected] : expected;

        // Check whether the popped token matches at least one of our expected items.
        var tokenMatchesExpectation = expectedValues.some((item) => popped.toUpperCase() === item.toUpperCase());

        // Throw an error if the popped token didn't match any of our expected items.
        if (!tokenMatchesExpectation) {
            const expectationString = expectedValues.map((item) => "'" + item + "'").join(" or ");
            throw new Error("unexpected token found. Expected " + expectationString + " but got '" + popped + "'");
        }
    }

    // Return the popped token.
    return popped;
}