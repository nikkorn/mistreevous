const mistreevous = require("../dist/index");
const chai = require("chai");

var assert = chai.assert;

describe("The validateDefinition function takes a tree definition as an argument and", () => {
    // Helper function to carry out the validation and verify the expected result.
    const verifyResult = (definition, success, errorMessage) => {
        // Do the actual validation.
        const result = mistreevous.validateDefinition(definition);

        // Verify the result matches the expected succeeded state and error message.
        assert.deepEqual(result, success ? { succeeded: true } : { succeeded: false, errorMessage });
    };

    describe("where the type of that definition is", () => {
        describe("MDSL", () => {
            // TODO Add better validation to mdsl parsing to better match the json validation.
        });

        describe("JSON", () => {
            describe("returns a validation failure when", () => {
                it("the definition doesn't contain a main root node (has no root node identifier defined)", () => {
                    const definition = {
                        id: "not-main-root",
                        type: "root",
                        child: {
                            type: "action",
                            call: "noop"
                        }
                    };

                    // The definition can be either an array (of root node definitions) or an object (the single primary root node definition), verify both.
                    verifyResult(
                        definition,
                        false,
                        "expected single root node without 'id' property defined to act as main root"
                    );
                    verifyResult(
                        [definition],
                        false,
                        "expected single root node without 'id' property defined to act as main root"
                    );
                });

                it("there are duplicate root node identifiers", () => {
                    verifyResult(
                        [
                            {
                                type: "root",
                                child: {
                                    type: "action",
                                    call: "noop"
                                }
                            },
                            {
                                id: "sub-root-node",
                                type: "root",
                                child: {
                                    type: "action",
                                    call: "noop"
                                }
                            },
                            {
                                id: "sub-root-node",
                                type: "root",
                                child: {
                                    type: "action",
                                    call: "noop"
                                }
                            }
                        ],
                        false,
                        "multiple root nodes found with duplicate 'id' property value of 'sub-root-node'"
                    );
                });

                it("there are circular dependencies found in any branch node references", () => {
                    verifyResult(
                        [
                            {
                                type: "root",
                                child: {
                                    type: "branch",
                                    ref: "RN_A"
                                }
                            },
                            {
                                id: "RN_A",
                                type: "root",
                                child: {
                                    type: "branch",
                                    ref: "RN_B"
                                }
                            },
                            {
                                id: "RN_B",
                                type: "root",
                                child: {
                                    type: "branch",
                                    ref: "RN_C"
                                }
                            },
                            {
                                id: "RN_C",
                                type: "root",
                                child: {
                                    type: "branch",
                                    ref: "RN_A"
                                }
                            }
                        ],
                        false,
                        "circular dependency found in branch node references: RN_A => RN_B => RN_C => RN_A"
                    );
                });
            });
        });
    });

    describe("returns a validation failure when the definition is", () => {
        it("null", () => verifyResult(null, false, "definition is null or undefined"));

        it("undefined", () => verifyResult(undefined, false, "definition is null or undefined"));

        it("an unexpected type", () => {
            verifyResult(true, false, "unexpected definition type of 'boolean'");
            verifyResult(false, false, "unexpected definition type of 'boolean'");
            verifyResult(42, false, "unexpected definition type of 'number'");
        });
    });
});
