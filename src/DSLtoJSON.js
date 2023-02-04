//root {
//    action [SomeAction]
//}

let definition = {
    type: "root",
    children: [
        {
            type: "action",
            call: "SomeAction"
        }
    ]
}


//root {
//    branch [SomeOtherTree]
//}
//
//root [SomeOtherTree] {
//    action [Dance]
//}

definition = [
    {
        type: "root",
        children: [
            {
                type: "branch",
                ref: "SomeOtherTree"
            }
        ]
    },
    {
        type: "root",
        id: "SomeOtherTree",
        children: [
            {
                type: "action",
                call: "SomeAction"
            }
        ]
    }
]

//root {
//    action [Say, "hello world", 5, true]
//}

definition = {
    type: "root",
    children: [
        {
            type: "action",
            call: "SomeAction",
            args: ["hello world", 5, true]
        }
    ]
}

//root {
//    condition [SomeCondition]
//}

definition = {
    type: "root",
    children: [
        {
            type: "condition",
            call: "SomeCondition"
        }
    ]
}

//root {
//    condition [HasItem, "gold", 500]
//}

definition = {
    type: "root",
    children: [
        {
            type: "condition",
            call: "HasItem",
            args: ["gold", 500]
        }
    ]
}

//root {
//    wait [2000]
//}

definition = {
    type: "root",
    children: [
        {
            type: "wait",
            duration: 2000
        }
    ]
}

//root {
//    wait [2000, 5000]
//}

definition = {
    type: "root",
    children: [
        {
            type: "wait",
            duration: [2000, 5000]
        }
    ]
}

//root {
//    sequence {
//        action [Walk]
//    }
//}

definition = {
    type: "root",
    children: [
        {
            type: "sequence",
            children: [
                {
                    type: "action",
                    call: "Walk"
                }
            ]
        }
    ]
}

//root {
//    selector {
//        action [Walk]
//    }
//}

definition = {
    type: "root",
    children: [
        {
            type: "selector",
            children: [
                {
                    type: "action",
                    call: "Walk"
                }
            ]
        }
    ]
}

//root {
//    lotto {
//        action [GoLeft]
//        action [GoRight]
//    }
//}

definition = {
    type: "root",
    children: [
        {
            type: "lotto",
            children: [
                {
                    type: "action",
                    call: "GoLeft"
                },
                {
                    type: "action",
                    call: "GoRight"
                }
            ]
        }
    ]
}

//root {
//    lotto [9, 1] {
//        action [CommonAction]
//        action [RareAction]
//    }
//}

definition = {
    type: "root",
    children: [
        {
            type: "lotto",
            weights: [9, 1],
            children: [
                {
                    type: "action",
                    call: "CommonAction"
                },
                {
                    type: "action",
                    call: "RareAction"
                }
            ]
        }
    ]
}

//root {
//    repeat {
//        sequence {
//            wait [1000]
//        }
//    }
//}

definition = {
    type: "root",
    children: [
        {
            type: "repeat",
            child: {
                type: "sequence",
                children: [
                    {
                        type: "wait",
                        duration: 1000
                    }
                ]
            }
        }
    ]
}

//root {
//    selector {
//        action [SomeAction] while(IsKeyDown, "Enter")
//    }
//}

//root {
//    selector {
//        action [Walk]
//    }
//}

definition = {
    type: "root",
    children: [
        {
            type: "selector",
            children: [
                {
                    type: "action",
                    call: "SomeAction",
                    while: {
                        call: "IsKeyDown",
                        args: ["Enter"]
                    }
                }
            ]
        }
    ]
}