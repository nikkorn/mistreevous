/**
 * The object holding any registered functions keyed on function name.
 */
let funcTable = {};

/**
 * The object holding any registered sub-trees keyed on tree name.
 */
let subtreeTable = {};

export default {
    getFunc(name) {
        return funcTable[name];
    },
    setFunc(name, func) {
        funcTable[name] = func;
    },
    getFuncInvoker(board, name) {
        // Check whether the board contains the specified function.
        if (board[name] && typeof board[name] === "function") {
            return (args) =>
                board[name].apply(
                    board,
                    args.map((arg) => arg.value)
                );
        }

        // The board does not contain the specified function but it may have been registered at some point.
        if (funcTable[name] && typeof funcTable[name] === "function") {
            return (args) => funcTable[name](board, ...args.map((arg) => arg.value));
        }

        // We have no function to invoke.
        return null;
    },
    getSubtree(name) {
        return subtreeTable[name];
    },
    setSubtree(name, subtree) {
        subtreeTable[name] = subtree;
    },
    remove(name) {
        delete funcTable[name];
        delete subtreeTable[name];
    },
    empty() {
        funcTable = {};
        subtreeTable = {};
    }
};
