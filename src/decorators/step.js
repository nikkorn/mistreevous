import Decorator from './decorator'

/**
 * A STEP decorator which defines a blackboard function to call when the decorated node is updated.
 * @param functionName The name of the blackboard function to call.
 * @param args The array of decorator argument definitions.
 */
export default function Step(functionName, args) {
    Decorator.call(this, "step", args);

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
            functionName: this.getFunctionName(),
            arguments: this.getArguments()
        };
    };

    /**
     * Attempt to call the blackboard function that this decorator refers to.
     * @param board The board.
     */
    this.callBlackboardFunction = (board) => {
        // Call the blackboard function if it exists.
        if (typeof board[functionName] === "function") {
            board[functionName].apply(board, args.map(arg => arg.value));
        } else {
            throw new Error(`cannot call entry decorator function '${functionName}' is not defined in the blackboard`);
        }
    };
};

Step.prototype = Object.create(Decorator.prototype);