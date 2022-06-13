import Callback from "./callback";
import Lookup from "../../lookup";

/**
 * An ENTRY callback which defines a blackboard function to call when the associated node is updated and moves out of running state.
 * @param functionName The name of the blackboard function to call.
 * @param args The array of callback argument definitions.
 */
export default function Entry(functionName, args) {
    Callback.call(this, "entry", args);

    /**
     * Gets the function name.
     */
    this.getFunctionName = () => functionName;

    /**
     * Gets the callback details.
     */
    this.getDetails = () => {
        return {
            type: this.getType(),
            isGuard: this.isGuard(),
            functionName: this.getFunctionName(),
            arguments: this.getArguments()
        };
    };

    /**
     * Attempt to call the blackboard function that this callback refers to.
     * @param board The board.
     */
    this.callBlackboardFunction = (board) => {
        // Attempt to get the invoker for the callback function.
        const callbackFuncInvoker = Lookup.getFuncInvoker(board, functionName);

        // The callback function should be defined.
        if (callbackFuncInvoker === null) {
            throw new Error(`cannot call entry function '${functionName}' as is not defined in the blackboard and has not been registered`);
        }

        // Call the callback function.
        callbackFuncInvoker(args);
    };
};

Entry.prototype = Object.create(Callback.prototype);