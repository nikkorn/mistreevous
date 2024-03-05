import { assert } from "chai";

import { validateDefinition } from "../src/index";

describe("The validateDefinition function takes a tree definition as an argument and", () => {
    // Helper function to carry out the validation and verify the expected result.
    const verifyResult = (definition: any, success: boolean, errorMessage: string) => {
        // Do the actual validation.
        const result = validateDefinition(definition);

        // Verify the result matches the expected succeeded state and error message.
        assert.deepEqual(result, success ? { succeeded: true } : { succeeded: false, errorMessage });
    };

    describe("returns a validation failure when", () => {
        describe("the definition doesn't contain a main root node (has no root node identifier defined)", () => {
            it("(MDSL)", () => {
                verifyResult(
                    "root [not-main-root] { action [noop] }",
                    false,
                    "expected single unnamed root node at base of definition to act as main root"
                );
            });

            it("(JSON)", () => {
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
        });

        describe("the root node in the definition is not actually a root node", () => {
            it("(MDSL)", () => {
                verifyResult("action [noop]", false, "expected root node at base of definition");
            });

            it("(JSON)", () => {
                const definition = {
                    type: "action",
                    call: "noop"
                };

                // The definition can be either an array (of root node definitions) or an object (the single primary root node definition), verify both.
                verifyResult(
                    definition,
                    false,
                    "expected root node at base of definition but got node of type 'action'"
                );
                verifyResult(
                    [definition],
                    false,
                    "expected root node at base of definition but got node of type 'action'"
                );
            });
        });

        describe("there are duplicate root node identifiers", () => {
            it("(MDSL)", () => {
                verifyResult(
                    "root { action [noop] } root [sub-root-node] { action [noop] } root [sub-root-node] { action [noop] }",
                    false,
                    "multiple root nodes found with duplicate name 'sub-root-node'"
                );
            });

            it("(JSON)", () => {
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
        });

        describe("there are circular dependencies found in any branch node references", () => {
            it("(MDSL)", () => {
                verifyResult(
                    "root { branch [RN_A] } root [RN_A] { branch [RN_B] } root [RN_B] { branch [RN_C] } root [RN_C] { branch [RN_A] }",
                    false,
                    "circular dependency found in branch node references: RN_A => RN_B => RN_C => RN_A"
                );
            });

            it("(JSON)", () => {
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
