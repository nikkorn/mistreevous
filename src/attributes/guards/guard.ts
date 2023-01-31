import { Agent } from "../../agent";
import { AnyArgument } from "../../rootAstNodesBuilder";
import Attribute from "../attribute";

/**
 * A base node guard attribute.
 */
export default abstract class Guard extends Attribute {
    /**
     * @param type The node attribute type.
     * @param args The array of decorator argument definitions.
     * @param condition The name of the condition function that determines whether the guard is satisfied.
     */
    constructor(type: string, args: AnyArgument[], private condition: string) {
        super(type, args);
    }

    /**
     * Gets the name of the condition function that determines whether the guard is satisfied.
     */
    getCondition = () => this.condition;

    /**
     * Gets whether this attribute is a guard.
     */
    isGuard = () => true;

    /**
     * Gets the attribute details.
     */
    getDetails = () => {
        return {
            type: this.getType(),
            args: this.getArguments(),
            condition: this.getCondition()
        };
    };

    /**
     * Gets whether the guard is satisfied.
     * @param agent The agent.
     * @returns Whether the guard is satisfied.
     */
    abstract isSatisfied(agent: Agent): boolean;
}
