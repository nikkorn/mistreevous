import GuardUnsatisfiedException from './guards/guardUnsatisfiedException'

/**
 * Represents a scoped node guard.
 * @param guard The node guard. 
 * @param node The guarded node.
 * @param parent The parent scope.
 */
export default function GuardScope(guard, node, parent = null) {

    /**
     * Gets the guard for this scope.
     */
    this.getGuard = () => guard;

    /**
     * Gets the guarded node for this scope.
     */
    this.getNode = () => node;

    /**
     * Gets the parent for this scope, or null if there is no parent.
     */
    this.getParent = () => parent;

    /**
     * Evaluate guard conditions for all guards scopes in a tree path, moving outwards from the root.
     * @param board The blackboard, required for guard evaluation.
     * @throws GuardUnsatisfiedException Thrown when any node guard condition in the current tree path fails.
     */
    this.evaluate = (board) => {
        // Create an array to hold every guard scope within this scope heirarchy.
        const guardScopes = [];

        // Move up the scope heirarchy to find every relevant guard.
        const currentScope = this;
        while (currentScope !== null) {
            guardScopes.unshift(currentScope);

            currentScope = currentScope.getParent();
        }

        // We need to evaluate guard conditions for nodes up the tree, moving outwards from the root.
        for (const guardScope of guardScopes) {
            // There may not be a guard defined for this scope.
            if (!guardScope.getGuard()) {
                continue;
            }

            // Check whether the guard condition passes.
            if (!guardScope.getGuard().isSatisfied(board)) {
                // We need to throw a GuardUnsatisfiedException which will eventually be handled by the node that is decorated with the unsatisfied guard. 
                throw new GuardUnsatisfiedException(guardScope.getNode());
            }
        }
    };

    /**
     * Gets a new guard scope hanging off of this one.
     * @param guard The guard.
     * @param node The guarded node.
     * @returns A new guard scope.
     */
    this.createScope = (guard, node) => {
        return new GuardScope(guard, node, this);
    };
};