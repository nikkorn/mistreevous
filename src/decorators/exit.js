import Decorator from './decorator'

/**
 * An EXIT decorator which defines a blackboard function to call when the decorated node is updated and moves to a finished state or is aborted.
 * @param functionName The name of the blackboard function to call.
 */
export default function Exit(functionName) {
    Decorator.call(this, "exit");

    /**
     * Gets the function name.
     */
    this.getFunctionName = () => functionName;

    /**
     * Gets the decorator details.
     */
    this.getDetails = () => {
        return {
            type: this.getType(),
            isGuard: this.isGuard(),
            functionName: this.getFunctionName()
        };
    };

    /**
     * Attempt to call the blackboard function that this decorator refers to.
     * @param board The board.
     * @param isSuccess Whether the decorated node was left with a success state.
     * @param isAborted Whether the decorated node was aborted.
     */
    this.callBlackboardFunction = (board, isSuccess, isAborted) => {
        // Call the blackboard function if it exists.
        if (typeof board[functionName] === "function") {
            board[functionName].call(board, { succeeded: isSuccess, aborted: isAborted });
        } else {
            throw `cannot call exit decorator function '${functionName}' is not defined in the blackboard`;
        }
    };
};

Exit.prototype = Object.create(Decorator.prototype);