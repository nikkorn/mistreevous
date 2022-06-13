import Callback from "./callback";
import Lookup from "../../lookup";

/**
 * An EXIT callback which defines a blackboard function to call when the associated node is updated and moves to a finished state or is aborted.
 * @param functionName The name of the blackboard function to call.
 * @param args The array of callback argument definitions.
 */
export default function Exit(functionName, args) {
    Callback.call(this, "exit", args);

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
     * @param isSuccess Whether the decorated node was left with a success state.
     * @param isAborted Whether the decorated node was aborted.
     */
    this.callBlackboardFunction = (board, isSuccess, isAborted) => {
        // Attempt to get the invoker for the callback function.
        const callbackFuncInvoker = Lookup.getFuncInvoker(board, functionName);

        // The callback function should be defined.
        if (callbackFuncInvoker === null) {
            throw new Error(`cannot call exit function '${functionName}' as is not defined in the blackboard and has not been registered`);
        }

        // Call the callback function.
        callbackFuncInvoker([{ value: { succeeded: isSuccess, aborted: isAborted } }].concat(args));
    };
};

Exit.prototype = Object.create(Callback.prototype);