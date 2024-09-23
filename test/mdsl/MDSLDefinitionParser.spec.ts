import { assert } from "chai";

import { RootNodeDefinition } from "../../src/BehaviourTreeDefinition";
import { convertMDSLToJSON } from "../../src/mdsl/MDSLDefinitionParser";

describe("The MDSLDefinitionParser class has a convertMDSLToJSON function which takes a string MDSL definition and", () => {
    describe("errors when", () => {
        it("there is an invalid token count", () => {
            const mdslDefinition = "root {";

            assert.throws(() => convertMDSLToJSON(mdslDefinition), Error, "invalid token count");
        });

        it("there is a scope character mismatch", () => {
            const mdslDefinition = "root { flip { action [noop] }";

            assert.throws(() => convertMDSLToJSON(mdslDefinition), Error, "scope character mismatch");
        });

        it("a root node is not defined as the base of the definition", () => {
            const mdslDefinition = "flip { action [noop] }";

            assert.throws(() => convertMDSLToJSON(mdslDefinition), Error, "expected root node at base of definition");
        });

        it("a root node is the child of another node", () => {
            const mdslDefinition = "root { flip { root { action [noop] } } }";

            assert.throws(
                () => convertMDSLToJSON(mdslDefinition),
                Error,
                "a root node cannot be the child of another node"
            );
        });

        it("a decorator node has multiple child nodes", () => {
            const mdslDefinition = "root { flip { action [noop] action [noop] } }";

            assert.throws(
                () => convertMDSLToJSON(mdslDefinition),
                Error,
                "a decorator node must only have a single child node"
            );
        });
    });

    it("returns the corresponding JSON definition", () => {
        const mdslDefinition = `
            root {
                selector while(IsHungry) {
                    sequence {
                        condition [HasDollars, 15]
                        action [OrderFood, "Pizza"] entry(PlayMusic, "pizza-song")
                    }
                    sequence {
                        condition [HasIngredient, "Steak"]
                        condition [HasIngredient, "Lobster"]
                        action [CookFood, "Surf 'n' Turf"]
                    }
                    sequence {
                        condition [HasIngredient, "Egg"]
                        branch [CookEggs]
                    }
                    sequence {
                        condition [HasIngredient, "Oats"]
                        action [CookFood, "Gruel"]
                    }
                    action [Starve] entry(OnStarveEntry) exit(OnStarveExit)
                }
            }

            root [CookEggs] {
                lotto [100, 100, 5] {
                    action [CookFood, "Omelette"]
                    action [CookFood, "Scrambled Eggs"]
                    action [CookFood, "Fried Egg Surprise!"]
                }
            }
        `;

        const expectedOutputDefintion: RootNodeDefinition[] = [
            {
                type: "root",
                child: {
                    type: "selector",
                    while: {
                        call: "IsHungry",
                        args: []
                    },
                    children: [
                        {
                            type: "sequence",
                            children: [
                                {
                                    type: "condition",
                                    call: "HasDollars",
                                    args: [15]
                                },
                                {
                                    type: "action",
                                    call: "OrderFood",
                                    args: ["Pizza"],
                                    entry: {
                                        call: "PlayMusic",
                                        args: ["pizza-song"]
                                    }
                                }
                            ]
                        },
                        {
                            type: "sequence",
                            children: [
                                {
                                    type: "condition",
                                    call: "HasIngredient",
                                    args: ["Steak"]
                                },
                                {
                                    type: "condition",
                                    call: "HasIngredient",
                                    args: ["Lobster"]
                                },
                                {
                                    type: "action",
                                    call: "CookFood",
                                    args: ["Surf 'n' Turf"]
                                }
                            ]
                        },
                        {
                            type: "sequence",
                            children: [
                                {
                                    type: "condition",
                                    call: "HasIngredient",
                                    args: ["Egg"]
                                },
                                {
                                    type: "branch",
                                    ref: "CookEggs"
                                }
                            ]
                        },
                        {
                            type: "sequence",
                            children: [
                                {
                                    type: "condition",
                                    call: "HasIngredient",
                                    args: ["Oats"]
                                },
                                {
                                    type: "action",
                                    call: "CookFood",
                                    args: ["Gruel"]
                                }
                            ]
                        },
                        {
                            type: "action",
                            call: "Starve",
                            args: [],
                            entry: {
                                call: "OnStarveEntry",
                                args: []
                            },
                            exit: {
                                call: "OnStarveExit",
                                args: []
                            }
                        }
                    ]
                }
            },
            {
                type: "root",
                id: "CookEggs",
                child: {
                    type: "lotto",
                    weights: [100, 100, 5],
                    children: [
                        {
                            type: "action",
                            call: "CookFood",
                            args: ["Omelette"]
                        },
                        {
                            type: "action",
                            call: "CookFood",
                            args: ["Scrambled Eggs"]
                        },
                        {
                            type: "action",
                            call: "CookFood",
                            args: ["Fried Egg Surprise!"]
                        }
                    ]
                }
            }
        ];

        assert.deepEqual(convertMDSLToJSON(mdslDefinition), expectedOutputDefintion);
    });

    it("handles single and multi line comments", () => {
        const mdslDefinition = `
            /* This is the root */
            root {
                /* Run this selector while we are hungry */
                selector while(IsHungry) {
                    /* Order pizza if we can afford it */
                    sequence {
                        /* $15 sounds reasonable for a pizza */
                        condition [HasDollars, 15]
                        action [OrderFood, "Pizza"] entry(PlayMusic, "pizza-song")
                    }
                    /* We can't afford pizza, but can we make "Surf 'n' Turf"? */
                    sequence {
                        condition [HasIngredient, "Steak"]
                        condition [HasIngredient, "Lobster"]
                        action [CookFood, "Surf 'n' Turf" /* I'm pretty sure this is how it is spelled */]
                    }
                    /* We couldn't make "Surf 'n' Turf" :( Can we make some eggs? */
                    sequence {
                        condition [HasIngredient, "Egg"]
                        branch [CookEggs]
                    }
                    /* 
                        We are running out of options. 
                        We would settle for some gruel at this point! 
                    */
                    sequence {
                        condition [HasIngredient, "Oats"]
                        action [CookFood, "Gruel"]
                    }
                    /*Oh no we starved!*/
                    action [Starve] entry(OnStarveEntry) /* Do a thing before we start starving */ exit(OnStarveExit) /* Do a thing after we finish starving */
                }
            }
        `;

        const expectedOutputDefintion: RootNodeDefinition[] = [
            {
                type: "root",
                child: {
                    type: "selector",
                    while: {
                        call: "IsHungry",
                        args: []
                    },
                    children: [
                        {
                            type: "sequence",
                            children: [
                                {
                                    type: "condition",
                                    call: "HasDollars",
                                    args: [15]
                                },
                                {
                                    type: "action",
                                    call: "OrderFood",
                                    args: ["Pizza"],
                                    entry: {
                                        call: "PlayMusic",
                                        args: ["pizza-song"]
                                    }
                                }
                            ]
                        },
                        {
                            type: "sequence",
                            children: [
                                {
                                    type: "condition",
                                    call: "HasIngredient",
                                    args: ["Steak"]
                                },
                                {
                                    type: "condition",
                                    call: "HasIngredient",
                                    args: ["Lobster"]
                                },
                                {
                                    type: "action",
                                    call: "CookFood",
                                    args: ["Surf 'n' Turf"]
                                }
                            ]
                        },
                        {
                            type: "sequence",
                            children: [
                                {
                                    type: "condition",
                                    call: "HasIngredient",
                                    args: ["Egg"]
                                },
                                {
                                    type: "branch",
                                    ref: "CookEggs"
                                }
                            ]
                        },
                        {
                            type: "sequence",
                            children: [
                                {
                                    type: "condition",
                                    call: "HasIngredient",
                                    args: ["Oats"]
                                },
                                {
                                    type: "action",
                                    call: "CookFood",
                                    args: ["Gruel"]
                                }
                            ]
                        },
                        {
                            type: "action",
                            call: "Starve",
                            args: [],
                            entry: {
                                call: "OnStarveEntry",
                                args: []
                            },
                            exit: {
                                call: "OnStarveExit",
                                args: []
                            }
                        }
                    ]
                }
            }
        ];

        assert.deepEqual(convertMDSLToJSON(mdslDefinition), expectedOutputDefintion);
    });
});
