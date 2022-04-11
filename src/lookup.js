const funcTable = {};
const subtreeTable = {};

export default {
    getFunc(name) {
        return funcTable[name];
    },
    setFunc(name, func) {
        funcTable[name] = func;
    },
    getSubtree(name) {
        return subtreeTable[name];
    },
    setSubtree(name, subtree) {
        subtreeTable[name] = subtree;
    },
    remove(name) {
        delete funcTable[name];
    },
}