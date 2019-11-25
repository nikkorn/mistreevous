import Decorator from './decorator'

/**
 * A STEP decorator which defines a blackboard function to call when the decorated node is updated.
 * @param functionName The name of the blackboard function to call.
 */
export default function Step(functionName) {
    Decorator.call(this, "step");

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
     */
    this.callBlackboardFunction = (board) => {
        // Call the blackboard function if it exists.
        if (typeof board[functionName] === "function") {
            board[functionName].call(board);
        } else {
            throw `cannot call entry decorator function '${functionName}' is not defined in the blackboard`;
        }
    };
};

Step.prototype = Object.create(Decorator.prototype);