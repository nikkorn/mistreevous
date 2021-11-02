import Callback from './callback'

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
        // Call the blackboard function if it exists.
        if (typeof board[functionName] === "function") {
            board[functionName].apply(board, args.map(arg => arg.value));
        } else {
            throw new Error(`cannot call entry callback function '${functionName}' is not defined in the blackboard`);
        }
    };
};

Entry.prototype = Object.create(Callback.prototype);