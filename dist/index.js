(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.mistreevous = {}));
})(this, (function (exports) { 'use strict';

    /**
     * An exception thrown when evaluating node guard path conditions and a conditions fails.
     * @param source The node at which a guard condition failed.
     */
    function GuardUnsatisifedException(source) {
        /**
         * The exception message.
         */
        this.message = "A guard path condition has failed";

        /**
         * Gets whether the specified node is the node at which a guard condition failed.
         * @param node The node to check against the source node.
         * @returns Whether the specified node is the node at which a guard condition failed.
         */
        this.isSourceNode = (node) => node === source;
    }

    GuardUnsatisifedException.prototype = new Error();

    /**
     * Represents a path of node guards along a root-to-leaf tree path.
     * @param nodes An array of objects defining a node instance -> guard link, ordered by node depth.
     */
    function GuardPath(nodes) {
        /**
         * Evaluate guard conditions for all guards in the tree path, moving outwards from the root.
         * @param agent The agent, required for guard evaluation.
         * @returns An evaluation results object.
         */
        this.evaluate = (agent) => {
            // We need to evaluate guard conditions for nodes up the tree, moving outwards from the root.
            for (const details of nodes) {
                // There can be multiple guards per node.
                for (const guard of details.guards) {
                    // Check whether the guard condition passes, and throw an exception if not.
                    if (!guard.isSatisfied(agent)) {
                        throw new GuardUnsatisifedException(details.node);
                    }
                }
            }
        };
    }

    /**
     * Enumeration of node states.
     */
    const State = {
        READY: Symbol("mistreevous.ready"),
        RUNNING: Symbol("mistreevous.running"),
        SUCCEEDED: Symbol("mistreevous.succeeded"),
        FAILED: Symbol("mistreevous.failed")
    };

    /**
     * A base node.
     * @param type The node type.
     * @param attributes The node guard/callback attributes.
     * @param args The node argument definitions.
     */
    function Node(type, attributes, args) {
        /**
         * The node uid.
         */
        const uid = createNodeUid();
        /**
         * The node state.
         */
        let state = State.READY;
        /**
         * The guard path to evaluate as part of a node update.
         */
        let guardPath;

        /**
         * Gets/Sets the state of the node.
         */
        this.getState = () => state;
        this.setState = (value) => (state = value);

        /**
         * Gets the unique id of the node.
         */
        this.getUid = () => uid;

        /**
         * Gets the type of the node.
         */
        this.getType = () => type;

        /**
         * Gets the node arguments.
         */
        this.getArguments = () => args || [];

        /**
         * Gets the node guard/callback attributes.
         */
        this.getAttributes = () => attributes || [];

        /**
         * Gets the node guard/callback attribute with the specified type, or null if it does not exist.
         */
        this.getAttribute = (type) =>
            this.getAttributes().filter((attribute) => attribute.getType().toUpperCase() === type.toUpperCase())[0] || null;

        /**
         * Gets the node guard attributes.
         */
        this.getGuardAttributes = () => this.getAttributes().filter((attribute) => attribute.isGuard());

        /**
         * Gets the node callback attributes.
         */
        this.getCallbackAttributes = () => this.getAttributes().filter((attribute) => !attribute.isGuard());

        /**
         * Sets the guard path to evaluate as part of a node update.
         */
        this.setGuardPath = (value) => (guardPath = value);

        /**
         * Gets whether a guard path is assigned to this node.
         */
        this.hasGuardPath = () => !!guardPath;

        /**
         * Gets whether this node is in the specified state.
         * @param value The value to compare to the node state.
         */
        this.is = (value) => {
            return state === value;
        };

        /**
         * Reset the state of the node.
         */
        this.reset = () => {
            // Reset the state of this node.
            this.setState(State.READY);
        };

        /**
         * Abort the running of this node.
         * @param agent The agent.
         */
        this.abort = (agent) => {
            // There is nothing to do if this node is not in the running state.
            if (!this.is(State.RUNNING)) {
                return;
            }

            // Reset the state of this node.
            this.reset();

            // Try to get the exit callback attribute for this node.
            const exitCallback = this.getAttribute("exit");

            // Call the exit callback attribute function if it exists.
            if (exitCallback) {
                exitCallback.callAgentFunction(agent, false, true);
            }
        };

        /**
         * Update the node.
         * @param agent The agent.
         * @param options The behaviour tree options object.
         * @returns The result of the update.
         */
        this.update = (agent, options) => {
            // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
            if (this.is(State.SUCCEEDED) || this.is(State.FAILED)) {
                // We have not changed state.
                return {};
            }

            // If this node is in a 'READY' state then we may want to carry out some initialisation for any node guard attributes.
            if (this.is(State.READY)) {
                this.getGuardAttributes().forEach((guard) => guard.onReady());
            }

            try {
                // Evaluate all of the guard path conditions for the current tree path.
                guardPath.evaluate(agent);

                // If this node is in the READY state then call the entry callback for this node if it exists.
                if (this.is(State.READY)) {
                    // Try to get the entry callback attribute for this node.
                    const entryCallback = this.getAttribute("entry");

                    // Call the entry callback attribute function if it exists.
                    if (entryCallback) {
                        entryCallback.callAgentFunction(agent);
                    }
                }

                // Try to get the step callback attribute for this node.
                const stepCallback = this.getAttribute("step");

                // Call the step callback attribute function if it exists.
                if (stepCallback) {
                    stepCallback.callAgentFunction(agent);
                }

                // Do the actual update.
                this.onUpdate(agent, options);

                // If this node is now in a 'SUCCEEDED' or 'FAILED' state then call the EXIT callback for this node if it exists.
                if (this.is(State.SUCCEEDED) || this.is(State.FAILED)) {
                    // Try to get the exit callback attribute for this node.
                    const exitCallback = this.getAttribute("exit");

                    // Call the exit callback attribute function if it exists.
                    if (exitCallback) {
                        exitCallback.callAgentFunction(agent, this.is(State.SUCCEEDED), false);
                    }
                }
            } catch (error) {
                // If the error is a GuardUnsatisfiedException then we need to determine if this node is the source.
                if (error instanceof GuardUnsatisifedException && error.isSourceNode(this)) {
                    // Abort the current node.
                    this.abort(agent);

                    // Any node that is the source of an abort will be a failed node.
                    this.setState(State.FAILED);
                } else {
                    throw error;
                }
            }
        };
    }

    /**
     * Create a randomly generated node uid.
     * @returns A randomly generated node uid.
     */
    function createNodeUid() {
        var S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
    }

    /**
     * A leaf node.
     * @param type The node type.
     * @param decorators The node decorators.
     * @param args The node argument definitions.
     */
    function Leaf(type, decorators, args) {
        Node.call(this, type, decorators, args);

        /**
         * Gets whether this node is a leaf node.
         */
        this.isLeafNode = () => true;
    }

    Leaf.prototype = Object.create(Node.prototype);

    /**
     * A singleton used to store and lookup registered functions and subtrees.
     */
    class Lookup {
        /**
         * The object holding any registered functions keyed on function name.
         */
        static #functionTable = {};
        /**
         * The object holding any registered sub-trees keyed on tree name.
         */
        static #subtreeTable = {};

        /**
         * Gets the function with the specified name.
         * @param {string} name The name of the function.
         * @returns The function with the specified name.
         */
        static getFunc(name) {
            return this.#functionTable[name];
        }

        /**
         * Sets the function with the specified name for later lookup.
         * @param {string} name The name of the function.
         * @param {function} func The function.
         */
        static setFunc(name, func) {
            this.#functionTable[name] = func;
        }

        /**
         * Gets the function invoker for the specified agent and function name.
         * If a function with the specified name exists on the agent object then it will
         * be returned, otherwise we will then check the registered functions for a match.
         * @param {object} agent The agent instance that this behaviour tree is modelling behaviour for.
         * @param {string} name The function name.
         * @returns The function invoker for the specified agent and function name.
         */
        static getFuncInvoker(agent, name) {
            // Check whether the agent contains the specified function.
            if (agent[name] && typeof agent[name] === "function") {
                return (args) =>
                    agent[name].apply(
                        agent,
                        args.map((arg) => arg.value)
                    );
            }

            // The agent does not contain the specified function but it may have been registered at some point.
            if (this.#functionTable[name] && typeof this.#functionTable[name] === "function") {
                return (args) => this.#functionTable[name](agent, ...args.map((arg) => arg.value));
            }

            // We have no function to invoke.
            return null;
        }

        /**
         * Gets the subtree with the specified name.
         * @param {string} name The name of the subtree.
         * @returns The subtree with the specified name.
         */
        static getSubtree(name) {
            return this.#subtreeTable[name];
        }

        /**
         * Sets the subtree with the specified name for later lookup.
         * @param {string} name The name of the subtree.
         * @param {object} subtree The subtree.
         */
        static setSubtree(name, subtree) {
            this.#subtreeTable[name] = subtree;
        }

        /**
         * Removes the registered function or subtree with the specified name.
         * @param {string} name The name of the registered function or subtree.
         */
        static remove(name) {
            delete this.#functionTable[name];
            delete this.#subtreeTable[name];
        }

        /**
         * Remove all registered functions and subtrees.
         */
        static empty() {
            this.#functionTable = {};
            this.#subtreeTable = {};
        }
    }

    /**
     * An Action leaf node.
     * This represents an immediate or ongoing state of behaviour.
     * @param decorators The node decorators.
     * @param actionName The action name.
     * @param actionArguments The array of action argument definitions.
     */
    function Action(decorators, actionName, actionArguments) {
        Leaf.call(this, "action", decorators, actionArguments);

        /**
         * Whether there is a pending update promise.
         */
        let isUsingUpdatePromise = false;

        /**
         * The finished state result of an update promise.
         */
        let updatePromiseStateResult = null;

        /**
         * Update the node.
         * @param agent The agent.
         * @param options The behaviour tree options object.
         * @returns The result of the update.
         */
        this.onUpdate = function (agent, options) {
            // If the result of this action depends on an update promise then there is nothing to do until
            // it resolves, unless there has been a value set as a result of the update promise resolving.
            if (isUsingUpdatePromise) {
                // Check whether the update promise has resolved with a state value.
                if (updatePromiseStateResult) {
                    // Set the state of this node to match the state returned by the promise.
                    this.setState(updatePromiseStateResult);
                }

                return;
            }

            // Attempt to get the invoker for the action function.
            const actionFuncInvoker = Lookup.getFuncInvoker(agent, actionName);

            // The action function should be defined.
            if (actionFuncInvoker === null) {
                throw new Error(
                    `cannot update action node as the action '${actionName}' function is not defined on the agent and has not been registered`
                );
            }

            // Call the action function, the result of which may be:
            // - The finished state of this action node.
            // - A promise to return a finished node state.
            // - Undefined if the node should remain in the running state.
            const updateResult = actionFuncInvoker(actionArguments);

            if (updateResult instanceof Promise) {
                updateResult.then(
                    (result) => {
                        // If 'isUpdatePromisePending' is null then the promise was cleared as it was resolving, probably via an abort of reset.
                        if (!isUsingUpdatePromise) {
                            return;
                        }

                        // Check to make sure the result is a valid finished state.
                        if (result !== State.SUCCEEDED && result !== State.FAILED) {
                            throw new Error(
                                "action node promise resolved with an invalid value, expected a State.SUCCEEDED or State.FAILED value to be returned"
                            );
                        }

                        // Set pending update promise state result to be processed on next update.
                        updatePromiseStateResult = result;
                    },
                    (reason) => {
                        // If 'isUpdatePromisePending' is null then the promise was cleared as it was resolving, probably via an abort of reset.
                        if (!isUsingUpdatePromise) {
                            return;
                        }

                        // Just throw whatever was returned as the rejection argument.
                        throw new Error(reason);
                    }
                );

                // This node will be in the 'RUNNING' state until the update promise resolves.
                this.setState(State.RUNNING);

                // We are now waiting for the promise returned by the use to resolve before we know what state this node is in.
                isUsingUpdatePromise = true;
            } else {
                // Validate the returned value.
                this._validateUpdateResult(updateResult);

                // Set the state of this node, this may be undefined, which just means that the node is still in the 'RUNNING' state.
                this.setState(updateResult || State.RUNNING);
            }
        };

        /**
         * Gets the name of the node.
         */
        this.getName = () => actionName;

        /**
         * Reset the state of the node.
         */
        this.reset = () => {
            // Reset the state of this node.
            this.setState(State.READY);

            // There is no longer an update promise that we care about.
            isUsingUpdatePromise = false;
            updatePromiseStateResult = null;
        };

        /**
         * Validate the result of an update function call.
         * @param result The result of an update function call.
         */
        this._validateUpdateResult = (result) => {
            switch (result) {
                case State.SUCCEEDED:
                case State.FAILED:
                case undefined:
                    return;
                default:
                    throw new Error(
                        `action '${actionName}' 'onUpdate' returned an invalid response, expected an optional State.SUCCEEDED or State.FAILED value to be returned`
                    );
            }
        };
    }

    Action.prototype = Object.create(Leaf.prototype);

    /**
     * A Condition leaf node.
     * This will succeed or fail immediately based on an agent predicate, without moving to the 'RUNNING' state.
     * @param decorators The node decorators.
     * @param conditionName The name of the condition function.
     * @param conditionArguments The array of condition argument definitions.
     */
    function Condition(decorators, conditionName, conditionArguments) {
        Leaf.call(this, "condition", decorators, conditionArguments);

        /**
         * Update the node.
         * @param agent The agent.
         * @param options The behaviour tree options object.
         * @returns The result of the update.
         */
        this.onUpdate = function (agent, options) {
            // Attempt to get the invoker for the condition function.
            const conditionFuncInvoker = Lookup.getFuncInvoker(agent, conditionName);

            // The condition function should be defined.
            if (conditionFuncInvoker === null) {
                throw new Error(
                    `cannot update condition node as the condition '${conditionName}' function is not defined on the agent and has not been registered`
                );
            }

            // Call the condition function to determine the state of this node.
            this.setState(!!conditionFuncInvoker(conditionArguments) ? State.SUCCEEDED : State.FAILED);
        };

        /**
         * Gets the name of the node.
         */
        this.getName = () => conditionName;
    }

    Condition.prototype = Object.create(Leaf.prototype);

    /**
     * A WAIT node.
     * The state of this node will change to SUCCEEDED after a duration of time.
     * @param decorators The node decorators.
     * @param duration The duration that this node will wait to succeed in milliseconds, or the earliest if longestDuration is defined.
     * @param longestDuration The longest possible duration in milliseconds that this node will wait to succeed.
     */
    function Wait(decorators, duration, longestDuration) {
        Leaf.call(this, "wait", decorators);

        /**
         * The time in milliseconds at which this node was first updated.
         */
        let initialUpdateTime;

        /**
         * The total duration in milliseconds that this node will be waiting for.
         */
        let totalDuration;

        /**
         * The duration in milliseconds that this node has been waiting for.
         */
        let waitedDuration;

        /**
         * Update the node.
         * @param agent The agent.
         * @param options The behaviour tree options object.
         * @returns The result of the update.
         */
        this.onUpdate = function (agent, options) {
            // If this node is in the READY state then we need to set the initial update time.
            if (this.is(State.READY)) {
                // Set the initial update time.
                initialUpdateTime = new Date().getTime();

                // Set the initial waited duration.
                waitedDuration = 0;

                // If a longestDuration value was defined then we will be randomly picking a duration between the
                // shortest and longest duration. If it was not defined, then we will be just using the duration.
                totalDuration = longestDuration
                    ? Math.floor(Math.random() * (longestDuration - duration + 1) + duration)
                    : duration;

                // The node is now running until we finish waiting.
                this.setState(State.RUNNING);
            }

            // If we have a 'getDeltaTime' function defined as part of our options then we will use it to figure out how long we have waited for.
            if (typeof options.getDeltaTime === "function") {
                // Get the delta time.
                const deltaTime = options.getDeltaTime();

                // Our delta time must be a valid number and cannot be NaN.
                if (typeof deltaTime !== "number" || isNaN(deltaTime)) {
                    throw new Error("The delta time must be a valid number and not NaN.");
                }

                // Update the amount of time that this node has been waiting for based on the delta time.
                waitedDuration += deltaTime * 1000;
            } else {
                // We are not using a delta time, so we will just work out hom much time has passed since the first update.
                waitedDuration = new Date().getTime() - initialUpdateTime;
            }

            // Have we waited long enough?
            if (waitedDuration >= totalDuration) {
                // We have finished waiting!
                this.setState(State.SUCCEEDED);
            }
        };

        /**
         * Gets the name of the node.
         */
        this.getName = () => `WAIT ${longestDuration ? duration + "ms-" + longestDuration + "ms" : duration + "ms"}`;
    }

    Wait.prototype = Object.create(Leaf.prototype);

    /**
     * A decorator node that wraps a single child node.
     * @param type The node type.
     * @param decorators The node decorators.
     * @param child The child node.
     */
    function Decorator(type, decorators, child) {
        Node.call(this, type, decorators);

        /**
         * Gets whether this node is a leaf node.
         */
        this.isLeafNode = () => false;

        /**
         * Gets the children of this node.
         */
        this.getChildren = () => [child];

        /**
         * Reset the state of the node.
         */
        this.reset = () => {
            // Reset the state of this node.
            this.setState(State.READY);

            // Reset the state of the child node.
            child.reset();
        };

        /**
         * Abort the running of this node.
         * @param agent The agent.
         */
        this.abort = (agent) => {
            // There is nothing to do if this node is not in the running state.
            if (!this.is(State.RUNNING)) {
                return;
            }

            // Abort the child node.
            child.abort(agent);

            // Reset the state of this node.
            this.reset();

            // Try to get the exit decorator for this node.
            const exitDecorator = this.getDecorator("exit");

            // Call the exit decorator function if it exists.
            if (exitDecorator) {
                exitDecorator.callAgentFunction(agent, false, true);
            }
        };
    }

    Decorator.prototype = Object.create(Node.prototype);

    /**
     * A Root node.
     * The root node will have a single child.
     * @param decorators The node decorators.
     * @param child The child node.
     */
    function Root(decorators, child) {
        Decorator.call(this, "root", decorators, child);

        /**
         * Update the node and get whether the node state has changed.
         * @param agent The agent.
         * @param options The behaviour tree options object.
         * @returns Whether the state of this node has changed as part of the update.
         */
        this.onUpdate = function (agent, options) {
            // If the child has never been updated or is running then we will need to update it now.
            if (child.getState() === State.READY || child.getState() === State.RUNNING) {
                // Update the child of this node.
                child.update(agent, options);
            }

            // The state of the root node is the state of its child.
            this.setState(child.getState());
        };

        /**
         * Gets the name of the node.
         */
        this.getName = () => "ROOT";
    }

    Root.prototype = Object.create(Decorator.prototype);

    /**
     * A REPEAT node.
     * The node has a single child which can have:
     * -- A number of iterations for which to repeat the child node.
     * -- An infinite repeat loop if neither an iteration count or a condition function is defined.
     * The REPEAT node will stop and have a 'FAILED' state if its child is ever in a 'FAILED' state after an update.
     * The REPEAT node will attempt to move on to the next iteration if its child is ever in a 'SUCCEEDED' state.
     * @param decorators The node decorators.
     * @param iterations The number of iterations to repeat the child node, or the minimum number of iterations if maximumIterations is defined.
     * @param maximumIterations The maximum number of iterations to repeat the child node.
     * @param child The child node.
     */
    function Repeat(decorators, iterations, maximumIterations, child) {
        Decorator.call(this, "repeat", decorators, child);

        /**
         * The number of target iterations to make.
         */
        let targetIterationCount = null;

        /**
         * The current iteration count.
         */
        let currentIterationCount = 0;

        /**
         * Update the node.
         * @param agent The agent.
         * @param options The behaviour tree options object.
         * @returns The result of the update.
         */
        this.onUpdate = function (agent, options) {
            // If this node is in the READY state then we need to reset the child and the target iteration count.
            if (this.is(State.READY)) {
                // Reset the child node.
                child.reset();

                // Set the target iteration count.
                this._setTargetIterationCount();
            }

            // Do a check to see if we can iterate. If we can then this node will move into the 'RUNNING' state.
            // If we cannot iterate then we have hit our target iteration count, which means that the node has succeeded.
            if (this._canIterate()) {
                // This node is in the running state and can do its initial iteration.
                this.setState(State.RUNNING);

                // We may have already completed an iteration, meaning that the child node will be in the SUCCEEDED state.
                // If this is the case then we will have to reset the child node now.
                if (child.getState() === State.SUCCEEDED) {
                    child.reset();
                }

                // Update the child of this node.
                child.update(agent, options);

                // If the child moved into the FAILED state when we updated it then there is nothing left to do and this node has also failed.
                // If it has moved into the SUCCEEDED state then we have completed the current iteration.
                if (child.getState() === State.FAILED) {
                    // The child has failed, meaning that this node has failed.
                    this.setState(State.FAILED);

                    return;
                } else if (child.getState() === State.SUCCEEDED) {
                    // We have completed an iteration.
                    currentIterationCount += 1;
                }
            } else {
                // This node is in the 'SUCCEEDED' state as we cannot iterate any more.
                this.setState(State.SUCCEEDED);
            }
        };

        /**
         * Gets the name of the node.
         */
        this.getName = () => {
            if (iterations !== null) {
                return `REPEAT ${maximumIterations ? iterations + "x-" + maximumIterations + "x" : iterations + "x"}`;
            }

            // Return the default repeat node name.
            return "REPEAT";
        };

        /**
         * Reset the state of the node.
         */
        this.reset = () => {
            // Reset the state of this node.
            this.setState(State.READY);

            // Reset the current iteration count.
            currentIterationCount = 0;

            // Reset the child node.
            child.reset();
        };

        /**
         * Gets whether an iteration can be made.
         * @returns Whether an iteration can be made.
         */
        this._canIterate = () => {
            if (targetIterationCount !== null) {
                // We can iterate as long as we have not reached our target iteration count.
                return currentIterationCount < targetIterationCount;
            }

            // If neither an iteration count or a condition function were defined then we can iterate indefinitely.
            return true;
        };

        /**
         * Sets the target iteration count.
         */
        this._setTargetIterationCount = () => {
            // Are we dealing with a finite number of iterations?
            if (typeof iterations === "number") {
                // If we have maximumIterations defined then we will want a random iteration count bounded by iterations and maximumIterations.
                targetIterationCount =
                    typeof maximumIterations === "number"
                        ? Math.floor(Math.random() * (maximumIterations - iterations + 1) + iterations)
                        : iterations;
            } else {
                targetIterationCount = null;
            }
        };
    }

    Repeat.prototype = Object.create(Decorator.prototype);

    /**
     * A RETRY node.
     * The node has a single child which can have:
     * -- A number of iterations for which to repeat the child node.
     * -- An infinite repeat loop if neither an iteration count or a condition function is defined.
     * The RETRY node will stop and have a 'SUCCEEDED' state if its child is ever in a 'SUCCEEDED' state after an update.
     * The RETRY node will attempt to move on to the next iteration if its child is ever in a 'FAILED' state.
     * @param decorators The node decorators.
     * @param iterations The number of iterations to repeat the child node, or the minimum number of iterations if maximumIterations is defined.
     * @param maximumIterations The maximum number of iterations to repeat the child node.
     * @param child The child node.
     */
    function Retry(decorators, iterations, maximumIterations, child) {
        Decorator.call(this, "retry", decorators, child);

        /**
         * The number of target iterations to make.
         */
        let targetIterationCount = null;

        /**
         * The current iteration count.
         */
        let currentIterationCount = 0;

        /**
         * Update the node.
         * @param agent The agent.
         * @param options The behaviour tree options object.
         * @returns The result of the update.
         */
        this.onUpdate = function (agent, options) {
            // If this node is in the READY state then we need to reset the child and the target iteration count.
            if (this.is(State.READY)) {
                // Reset the child node.
                child.reset();

                // Set the target iteration count.
                this._setTargetIterationCount();
            }

            // Do a check to see if we can iterate. If we can then this node will move into the 'RUNNING' state.
            // If we cannot iterate then we have hit our target iteration count, which means that the node has succeeded.
            if (this._canIterate()) {
                // This node is in the running state and can do its initial iteration.
                this.setState(State.RUNNING);

                // We may have already completed an iteration, meaning that the child node will be in the FAILED state.
                // If this is the case then we will have to reset the child node now.
                if (child.getState() === State.FAILED) {
                    child.reset();
                }

                // Update the child of this node.
                child.update(agent, options);

                // If the child moved into the SUCCEEDED state when we updated it then there is nothing left to do and this node has also succeeded.
                // If it has moved into the FAILED state then we have completed the current iteration.
                if (child.getState() === State.SUCCEEDED) {
                    // The child has succeeded, meaning that this node has succeeded.
                    this.setState(State.SUCCEEDED);

                    return;
                } else if (child.getState() === State.FAILED) {
                    // We have completed an iteration.
                    currentIterationCount += 1;
                }
            } else {
                // This node is in the 'FAILED' state as we cannot iterate any more.
                this.setState(State.FAILED);
            }
        };

        /**
         * Gets the name of the node.
         */
        this.getName = () => {
            if (iterations !== null) {
                return `RETRY ${maximumIterations ? iterations + "x-" + maximumIterations + "x" : iterations + "x"}`;
            }

            // Return the default retry node name.
            return "RETRY";
        };

        /**
         * Reset the state of the node.
         */
        this.reset = () => {
            // Reset the state of this node.
            this.setState(State.READY);

            // Reset the current iteration count.
            currentIterationCount = 0;

            // Reset the child node.
            child.reset();
        };

        /**
         * Gets whether an iteration can be made.
         * @returns Whether an iteration can be made.
         */
        this._canIterate = () => {
            if (targetIterationCount !== null) {
                // We can iterate as long as we have not reached our target iteration count.
                return currentIterationCount < targetIterationCount;
            }

            // If neither an iteration count or a condition function were defined then we can iterate indefinitely.
            return true;
        };

        /**
         * Sets the target iteration count.
         */
        this._setTargetIterationCount = () => {
            // Are we dealing with a finite number of iterations?
            if (typeof iterations === "number") {
                // If we have maximumIterations defined then we will want a random iteration count bounded by iterations and maximumIterations.
                targetIterationCount =
                    typeof maximumIterations === "number"
                        ? Math.floor(Math.random() * (maximumIterations - iterations + 1) + iterations)
                        : iterations;
            } else {
                targetIterationCount = null;
            }
        };
    }

    Retry.prototype = Object.create(Decorator.prototype);

    /**
     * A Flip node.
     * This node wraps a single child and will flip the state of the child state.
     * @param decorators The node decorators.
     * @param child The child node.
     */
    function Flip(decorators, child) {
        Decorator.call(this, "flip", decorators, child);

        /**
         * Update the node.
         * @param agent The agent.
         * @param options The behaviour tree options object.
         * @returns The result of the update.
         */
        this.onUpdate = function (agent, options) {
            // If the child has never been updated or is running then we will need to update it now.
            if (child.getState() === State.READY || child.getState() === State.RUNNING) {
                child.update(agent, options);
            }

            // The state of this node will depend in the state of its child.
            switch (child.getState()) {
                case State.RUNNING:
                    this.setState(State.RUNNING);
                    break;

                case State.SUCCEEDED:
                    this.setState(State.FAILED);
                    break;

                case State.FAILED:
                    this.setState(State.SUCCEEDED);
                    break;

                default:
                    this.setState(State.READY);
            }
        };

        /**
         * Gets the name of the node.
         */
        this.getName = () => "FLIP";
    }

    Flip.prototype = Object.create(Decorator.prototype);

    /**
     * A Succeed node.
     * This node wraps a single child and will always move to the 'SUCCEEDED' state when the child moves to a 'SUCCEEDED' or 'FAILED' state.
     * @param decorators The node decorators.
     * @param child The child node.
     */
    function Succeed(decorators, child) {
        Decorator.call(this, "succeed", decorators, child);

        /**
         * Update the node.
         * @param agent The agent.
         * @param options The behaviour tree options object.
         * @returns The result of the update.
         */
        this.onUpdate = function (agent, options) {
            // If the child has never been updated or is running then we will need to update it now.
            if (child.getState() === State.READY || child.getState() === State.RUNNING) {
                child.update(agent, options);
            }

            // The state of this node will depend in the state of its child.
            switch (child.getState()) {
                case State.RUNNING:
                    this.setState(State.RUNNING);
                    break;

                case State.SUCCEEDED:
                case State.FAILED:
                    this.setState(State.SUCCEEDED);
                    break;

                default:
                    this.setState(State.READY);
            }
        };

        /**
         * Gets the name of the node.
         */
        this.getName = () => "SUCCEED";
    }

    Succeed.prototype = Object.create(Decorator.prototype);

    /**
     * A Fail node.
     * This node wraps a single child and will always move to the 'FAILED' state when the child moves to a 'SUCCEEDED' or 'FAILED' state.
     * @param decorators The node decorators.
     * @param child The child node.
     */
    function Fail(decorators, child) {
        Decorator.call(this, "fail", decorators, child);

        /**
         * Update the node.
         * @param agent The agent.
         * @param options The behaviour tree options object.
         * @returns The result of the update.
         */
        this.onUpdate = function (agent, options) {
            // If the child has never been updated or is running then we will need to update it now.
            if (child.getState() === State.READY || child.getState() === State.RUNNING) {
                child.update(agent, options);
            }

            // The state of this node will depend in the state of its child.
            switch (child.getState()) {
                case State.RUNNING:
                    this.setState(State.RUNNING);
                    break;

                case State.SUCCEEDED:
                case State.FAILED:
                    this.setState(State.FAILED);
                    break;

                default:
                    this.setState(State.READY);
            }
        };

        /**
         * Gets the name of the node.
         */
        this.getName = () => "FAIL";
    }

    Fail.prototype = Object.create(Decorator.prototype);

    /**
     * A composite node that wraps child nodes.
     * @param type The node type.
     * @param decorators The node decorators.
     * @param children The child nodes.
     */
    function Composite(type, decorators, children) {
        Node.call(this, type, decorators);

        /**
         * Gets whether this node is a leaf node.
         */
        this.isLeafNode = () => false;

        /**
         * Gets the children of this node.
         */
        this.getChildren = () => children;

        /**
         * Reset the state of the node.
         */
        this.reset = () => {
            // Reset the state of this node.
            this.setState(State.READY);

            // Reset the state of any child nodes.
            this.getChildren().forEach((child) => child.reset());
        };

        /**
         * Abort the running of this node.
         * @param agent The agent.
         */
        this.abort = (agent) => {
            // There is nothing to do if this node is not in the running state.
            if (!this.is(State.RUNNING)) {
                return;
            }

            // Abort any child nodes.
            this.getChildren().forEach((child) => child.abort(agent));

            // Reset the state of this node.
            this.reset();

            // Try to get the exit decorator for this node.
            const exitDecorator = this.getDecorator("exit");

            // Call the exit decorator function if it exists.
            if (exitDecorator) {
                exitDecorator.callAgentFunction(agent, false, true);
            }
        };
    }

    Composite.prototype = Object.create(Node.prototype);

    /**
     * A LOTTO node.
     * A winning child is picked on the initial update of this node, based on ticket weighting.
     * The state of this node will match the state of the winning child.
     * @param decorators The node decorators.
     * @param tickets The child node tickets
     * @param children The child nodes.
     */
    function Lotto(decorators, tickets, children) {
        Composite.call(this, "lotto", decorators, children);

        /**
         * The winning child node.
         */
        let winningChild;

        /**
         * Represents a lotto draw.
         */
        function LottoDraw() {
            /**
             * The participants
             */
            this.participants = [];

            /**
             * Add a participant.
             * @param participant The participant.
             * @param tickets The number of tickets held by the participant.
             */
            this.add = function (participant, tickets) {
                this.participants.push({ participant, tickets });
                return this;
            };

            /**
             * Draw a winning participant.
             * @returns A winning participant.
             */
            this.draw = function () {
                // We cannot do anything if there are no participants.
                if (!this.participants.length) {
                    throw new Error("cannot draw a lotto winner when there are no participants");
                }

                const pickable = [];

                this.participants.forEach(({ participant, tickets }) => {
                    for (let ticketCount = 0; ticketCount < tickets; ticketCount++) {
                        pickable.push(participant);
                    }
                });

                return this.getRandomItem(pickable);
            };

            /**
             * Get a random item form an array.
             * @param items Th array of items.
             * @returns The randomly picked item.
             */
            this.getRandomItem = function (items) {
                // We cant pick a random item from an empty array.
                if (!items.length) {
                    return undefined;
                }

                // Return a random item.
                return items[Math.floor(Math.random() * items.length)];
            };
        }

        /**
         * Update the node and get whether the node state has changed.
         * @param agent The agent.
         * @param options The behaviour tree options object.
         * @returns Whether the state of this node has changed as part of the update.
         */
        this.onUpdate = function (agent, options) {
            // If this node is in the READY state then we need to pick a winning child node.
            if (this.is(State.READY)) {
                // Create a lotto draw.
                const lottoDraw = new LottoDraw();

                // Add each child of this node to a lotto draw, with each child's corresponding ticket weighting, or a single ticket if not defined.
                children.forEach((child, index) => lottoDraw.add(child, tickets[index] || 1));

                // Randomly pick a child based on ticket weighting.
                winningChild = lottoDraw.draw();
            }

            // If the winning child has never been updated or is running then we will need to update it now.
            if (winningChild.getState() === State.READY || winningChild.getState() === State.RUNNING) {
                winningChild.update(agent, options);
            }

            // The state of the lotto node is the state of its winning child.
            this.setState(winningChild.getState());
        };

        /**
         * Gets the name of the node.
         */
        this.getName = () => (tickets.length ? `LOTTO [${tickets.join(",")}]` : "LOTTO");
    }

    Lotto.prototype = Object.create(Composite.prototype);

    /**
     * A SELECTOR node.
     * The child nodes are executed in sequence until one succeeds or all fail.
     * @param decorators The node decorators.
     * @param children The child nodes.
     */
    function Selector(decorators, children) {
        Composite.call(this, "selector", decorators, children);

        /**
         * Update the node and get whether the node state has changed.
         * @param agent The agent.
         * @param options The behaviour tree options object.
         * @returns Whether the state of this node has changed as part of the update.
         */
        this.onUpdate = function (agent, options) {
            // Iterate over all of the children of this node.
            for (const child of children) {
                // If the child has never been updated or is running then we will need to update it now.
                if (child.getState() === State.READY || child.getState() === State.RUNNING) {
                    // Update the child of this node.
                    child.update(agent, options);
                }

                // If the current child has a state of 'SUCCEEDED' then this node is also a 'SUCCEEDED' node.
                if (child.getState() === State.SUCCEEDED) {
                    // This node is a 'SUCCEEDED' node.
                    this.setState(State.SUCCEEDED);

                    // There is no need to check the rest of the selector nodes.
                    return;
                }

                // If the current child has a state of 'FAILED' then we should move on to the next child.
                if (child.getState() === State.FAILED) {
                    // Find out if the current child is the last one in the selector.
                    // If it is then this sequence node has also failed.
                    if (children.indexOf(child) === children.length - 1) {
                        // This node is a 'FAILED' node.
                        this.setState(State.FAILED);

                        // There is no need to check the rest of the selector as we have completed it.
                        return;
                    } else {
                        // The child node failed, try the next one.
                        continue;
                    }
                }

                // The node should be in the 'RUNNING' state.
                if (child.getState() === State.RUNNING) {
                    // This node is a 'RUNNING' node.
                    this.setState(State.RUNNING);

                    // There is no need to check the rest of the selector as the current child is still running.
                    return;
                }

                // The child node was not in an expected state.
                throw new Error("child node was not in an expected state.");
            }
        };

        /**
         * Gets the name of the node.
         */
        this.getName = () => "SELECTOR";
    }

    Selector.prototype = Object.create(Composite.prototype);

    /**
     * A SEQUENCE node.
     * The child nodes are executed in sequence until one fails or all succeed.
     * @param decorators The node decorators.
     * @param children The child nodes.
     */
    function Sequence(decorators, children) {
        Composite.call(this, "sequence", decorators, children);

        /**
         * Update the node and get whether the node state has changed.
         * @param agent The agent.
         * @param options The behaviour tree options object.
         * @returns Whether the state of this node has changed as part of the update.
         */
        this.onUpdate = function (agent, options) {
            // Iterate over all of the children of this node.
            for (const child of children) {
                // If the child has never been updated or is running then we will need to update it now.
                if (child.getState() === State.READY || child.getState() === State.RUNNING) {
                    // Update the child of this node.
                    child.update(agent, options);
                }

                // If the current child has a state of 'SUCCEEDED' then we should move on to the next child.
                if (child.getState() === State.SUCCEEDED) {
                    // Find out if the current child is the last one in the sequence.
                    // If it is then this sequence node has also succeeded.
                    if (children.indexOf(child) === children.length - 1) {
                        // This node is a 'SUCCEEDED' node.
                        this.setState(State.SUCCEEDED);

                        // There is no need to check the rest of the sequence as we have completed it.
                        return;
                    } else {
                        // The child node succeeded, but we have not finished the sequence yet.
                        continue;
                    }
                }

                // If the current child has a state of 'FAILED' then this node is also a 'FAILED' node.
                if (child.getState() === State.FAILED) {
                    // This node is a 'FAILED' node.
                    this.setState(State.FAILED);

                    // There is no need to check the rest of the sequence.
                    return;
                }

                // The node should be in the 'RUNNING' state.
                if (child.getState() === State.RUNNING) {
                    // This node is a 'RUNNING' node.
                    this.setState(State.RUNNING);

                    // There is no need to check the rest of the sequence as the current child is still running.
                    return;
                }

                // The child node was not in an expected state.
                throw new Error("child node was not in an expected state.");
            }
        };

        /**
         * Gets the name of the node.
         */
        this.getName = () => "SEQUENCE";
    }

    Sequence.prototype = Object.create(Composite.prototype);

    /**
     * A PARALLEL node.
     * The child nodes are executed concurrently until one fails or all succeed.
     * @param decorators The node decorators.
     * @param children The child nodes.
     */
    function Parallel(decorators, children) {
        Composite.call(this, "parallel", decorators, children);

        /**
         * Update the node and get whether the node state has changed.
         * @param agent The agent.
         * @param options The behaviour tree options object.
         * @returns Whether the state of this node has changed as part of the update.
         */
        this.onUpdate = function (agent, options) {
            // Keep a count of the number of succeeded child nodes.
            let succeededCount = 0;

            let hasChildFailed = false;

            // Iterate over all of the children of this node.
            for (const child of children) {
                // If the child has never been updated or is running then we will need to update it now.
                if (child.getState() === State.READY || child.getState() === State.RUNNING) {
                    // Update the child of this node.
                    child.update(agent, options);
                }

                // If the current child has a state of 'SUCCEEDED' then we should move on to the next child.
                if (child.getState() === State.SUCCEEDED) {
                    // The child node has succeeded, keep track of this to determine if all children have.
                    succeededCount++;

                    // The child node succeeded, but we have not finished checking every child node yet.
                    continue;
                }

                // If the current child has a state of 'FAILED' then this node is also a 'FAILED' node.
                if (child.getState() === State.FAILED) {
                    hasChildFailed = true;

                    // There is no need to check the rest of the children.
                    break;
                }

                // The node should be in the 'RUNNING' state.
                if (child.getState() !== State.RUNNING) {
                    // The child node was not in an expected state.
                    throw new Error("child node was not in an expected state.");
                }
            }

            if (hasChildFailed) {
                // This node is a 'FAILED' node.
                this.setState(State.FAILED);

                // Abort every running child.
                for (const child of children) {
                    if (child.getState() === State.RUNNING) {
                        child.abort(agent);
                    }
                }
            } else {
                // If all children have succeeded then this node has also succeeded, otherwise it is still running.
                this.setState(succeededCount === children.length ? State.SUCCEEDED : State.RUNNING);
            }
        };

        /**
         * Gets the name of the node.
         */
        this.getName = () => "PARALLEL";
    }

    Parallel.prototype = Object.create(Composite.prototype);

    /**
     * A base node attribute.
     * @param type The node attribute type.
     * @param args The array of attribute argument definitions.
     */
    function Attribute(type, args) {
        /**
         * Gets the type of the attribute.
         */
        this.getType = () => type;

        /**
         * Gets the array of attribute argument definitions.
         */
        this.getArguments = () => args;

        /**
         * Gets the attribute details.
         */
        this.getDetails = () => ({
            type: this.getType(),
            arguments: this.getArguments()
        });
    }

    /**
     * A base node guard attribute.
     * @param type The node guard attribute type.
     * @param args The array of attribute argument definitions.
     */
    function Guard(type, args) {
        Attribute.call(this, type, args);

        /**
         * Gets whether this attribute is a guard.
         */
        this.isGuard = () => true;
    }

    Guard.prototype = Object.create(Attribute.prototype);

    /**
     * A WHILE guard which is satisfied as long as the given condition remains true.
     * @param condition The name of the condition function that determines whether the guard is satisfied.
     * @param args The array of attribute argument definitions.
     */
    function While(condition, args) {
        Guard.call(this, "while", args);

        /**
         * Gets whether the attribute is a guard.
         */
        this.isGuard = () => true;

        /**
         * Gets the condition of the guard.
         */
        this.getCondition = () => condition;

        /**
         * Gets the attribute details.
         */
        this.getDetails = () => {
            return {
                type: this.getType(),
                isGuard: this.isGuard(),
                condition: this.getCondition(),
                arguments: this.getArguments()
            };
        };

        this.onReady = () => {};

        /**
         * Gets whether the guard is satisfied.
         * @param agent The agent.
         * @returns Whether the guard is satisfied.
         */
        this.isSatisfied = (agent) => {
            // Attempt to get the invoker for the condition function.
            const conditionFuncInvoker = Lookup.getFuncInvoker(agent, condition);

            // The condition function should be defined.
            if (conditionFuncInvoker === null) {
                throw new Error(
                    `cannot evaluate node guard as the condition '${condition}' function is not defined on the agent and has not been registered`
                );
            }

            // Call the condition function to determine whether this guard is satisfied.
            return !!conditionFuncInvoker(args);
        };
    }

    While.prototype = Object.create(Guard.prototype);

    /**
     * An UNTIL guard which is satisfied as long as the given condition remains false.
     * @param condition The name of the condition function that determines whether the guard is satisfied.
     * @param args The array of attribute argument definitions.
     */
    function Until(condition, args) {
        Guard.call(this, "until", args);

        /**
         * Gets whether the attribute is a guard.
         */
        this.isGuard = () => true;

        /**
         * Gets the condition of the guard.
         */
        this.getCondition = () => condition;

        /**
         * Gets the attribute details.
         */
        this.getDetails = () => {
            return {
                type: this.getType(),
                isGuard: this.isGuard(),
                condition: this.getCondition(),
                arguments: this.getArguments()
            };
        };

        this.onReady = () => {};

        /**
         * Gets whether the guard is satisfied.
         * @param agent The agent.
         * @returns Whether the guard is satisfied.
         */
        this.isSatisfied = (agent) => {
            // Attempt to get the invoker for the condition function.
            const conditionFuncInvoker = Lookup.getFuncInvoker(agent, condition);

            // The condition function should be defined.
            if (conditionFuncInvoker === null) {
                throw new Error(
                    `cannot evaluate node guard as the condition '${condition}' function is not defined on the agent and has not been registered`
                );
            }

            // Call the condition function to determine whether this guard is satisfied.
            return !!!conditionFuncInvoker(args);
        };
    }

    Until.prototype = Object.create(Guard.prototype);

    /**
     * A base node callback attribute.
     * @param type The node callback attribute type.
     * @param args The array of attribute argument definitions.
     */
    function Callback(type, args) {
        Attribute.call(this, type, args);

        /**
         * Gets whether this attribute is a guard.
         */
        this.isGuard = () => false;
    }

    Callback.prototype = Object.create(Attribute.prototype);

    /**
     * An ENTRY callback which defines an agent function to call when the associated node is updated and moves out of running state.
     * @param functionName The name of the agent function to call.
     * @param args The array of callback argument definitions.
     */
    function Entry(functionName, args) {
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
         * Attempt to call the agent function that this callback refers to.
         * @param agent The agent.
         */
        this.callAgentFunction = (agent) => {
            // Attempt to get the invoker for the callback function.
            const callbackFuncInvoker = Lookup.getFuncInvoker(agent, functionName);

            // The callback function should be defined.
            if (callbackFuncInvoker === null) {
                throw new Error(
                    `cannot call entry function '${functionName}' as is not defined on the agent and has not been registered`
                );
            }

            // Call the callback function.
            callbackFuncInvoker(args);
        };
    }

    Entry.prototype = Object.create(Callback.prototype);

    /**
     * An EXIT callback which defines an agent function to call when the associated node is updated and moves to a finished state or is aborted.
     * @param functionName The name of the agent function to call.
     * @param args The array of callback argument definitions.
     */
    function Exit(functionName, args) {
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
         * Attempt to call the agent function that this callback refers to.
         * @param agent The agent.
         * @param isSuccess Whether the decorated node was left with a success state.
         * @param isAborted Whether the decorated node was aborted.
         */
        this.callAgentFunction = (agent, isSuccess, isAborted) => {
            // Attempt to get the invoker for the callback function.
            const callbackFuncInvoker = Lookup.getFuncInvoker(agent, functionName);

            // The callback function should be defined.
            if (callbackFuncInvoker === null) {
                throw new Error(
                    `cannot call exit function '${functionName}' as is not defined on the agent and has not been registered`
                );
            }

            // Call the callback function.
            callbackFuncInvoker([{ value: { succeeded: isSuccess, aborted: isAborted } }].concat(args));
        };
    }

    Exit.prototype = Object.create(Callback.prototype);

    /**
     * A STEP callback which defines an agent function to call when the associated node is updated.
     * @param functionName The name of the agent function to call.
     * @param args The array of callback argument definitions.
     */
    function Step(functionName, args) {
        Callback.call(this, "step", args);

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
         * Attempt to call the agent function that this callback refers to.
         * @param agent The agent.
         */
        this.callAgentFunction = (agent) => {
            // Attempt to get the invoker for the callback function.
            const callbackFuncInvoker = Lookup.getFuncInvoker(agent, functionName);

            // The callback function should be defined.
            if (callbackFuncInvoker === null) {
                throw new Error(
                    `cannot call step function '${functionName}' as is not defined on the agent and has not been registered`
                );
            }

            // Call the callback function.
            callbackFuncInvoker(args);
        };
    }

    Step.prototype = Object.create(Callback.prototype);

    /**
     * The node decorator factories.
     */
    const DecoratorFactories = {
        WHILE: (condition, decoratorArguments) => new While(condition, decoratorArguments),
        UNTIL: (condition, decoratorArguments) => new Until(condition, decoratorArguments),
        ENTRY: (functionName, decoratorArguments) => new Entry(functionName, decoratorArguments),
        EXIT: (functionName, decoratorArguments) => new Exit(functionName, decoratorArguments),
        STEP: (functionName, decoratorArguments) => new Step(functionName, decoratorArguments)
    };

    /**
     * The AST node factories.
     */
    const ASTNodeFactories = {
        ROOT: () => ({
            type: "root",
            decorators: [],
            name: null,
            children: [],
            validate: function (depth) {
                // A root node cannot be the child of another node.
                if (depth > 1) {
                    throw new Error("a root node cannot be the child of another node");
                }

                // A root node must have a single child node.
                if (this.children.length !== 1) {
                    throw new Error("a root node must have a single child");
                }
            },
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
                return new Root(
                    this.decorators,
                    this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
                );
            }
        }),
        BRANCH: () => ({
            type: "branch",
            branchName: "",
            validate: function (depth) {},
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
                // Try to find the root node with a matching branch name.
                const targetRootNode = namedRootNodeProvider(this.branchName);

                // If we have already visited this branch then we have a circular dependency.
                if (visitedBranches.indexOf(this.branchName) !== -1) {
                    throw new Error(`circular dependency found in branch node references for branch '${this.branchName}'`);
                }

                // If we have a target root node, then the node instance we want will be the first and only child of the referenced root node.
                if (targetRootNode) {
                    return targetRootNode
                        .createNodeInstance(namedRootNodeProvider, visitedBranches.concat(this.branchName))
                        .getChildren()[0];
                } else {
                    throw new Error(`branch references root node '${this.branchName}' which has not been defined`);
                }
            }
        }),
        SELECTOR: () => ({
            type: "selector",
            decorators: [],
            children: [],
            validate: function (depth) {
                // A selector node must have at least a single node.
                if (this.children.length < 1) {
                    throw new Error("a selector node must have at least a single child");
                }
            },
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
                return new Selector(
                    this.decorators,
                    this.children.map((child) => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice()))
                );
            }
        }),
        SEQUENCE: () => ({
            type: "sequence",
            decorators: [],
            children: [],
            validate: function (depth) {
                // A sequence node must have at least a single node.
                if (this.children.length < 1) {
                    throw new Error("a sequence node must have at least a single child");
                }
            },
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
                return new Sequence(
                    this.decorators,
                    this.children.map((child) => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice()))
                );
            }
        }),
        PARALLEL: () => ({
            type: "parallel",
            decorators: [],
            children: [],
            validate: function (depth) {
                // A parallel node must have at least a single node.
                if (this.children.length < 1) {
                    throw new Error("a parallel node must have at least a single child");
                }
            },
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
                return new Parallel(
                    this.decorators,
                    this.children.map((child) => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice()))
                );
            }
        }),
        LOTTO: () => ({
            type: "lotto",
            decorators: [],
            children: [],
            tickets: [],
            validate: function (depth) {
                // A lotto node must have at least a single node.
                if (this.children.length < 1) {
                    throw new Error("a lotto node must have at least a single child");
                }
            },
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
                return new Lotto(
                    this.decorators,
                    this.tickets,
                    this.children.map((child) => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice()))
                );
            }
        }),
        REPEAT: () => ({
            type: "repeat",
            decorators: [],
            iterations: null,
            maximumIterations: null,
            children: [],
            validate: function (depth) {
                // A repeat node must have a single node.
                if (this.children.length !== 1) {
                    throw new Error("a repeat node must have a single child");
                }

                // A repeat node must have a positive number of iterations if defined.
                if (this.iterations !== null && this.iterations < 0) {
                    throw new Error("a repeat node must have a positive number of iterations if defined");
                }

                // There is validation to carry out if a longest duration was defined.
                if (this.maximumIterations !== null) {
                    // A repeat node must have a positive maximum iterations count if defined.
                    if (this.maximumIterations < 0) {
                        throw new Error("a repeat node must have a positive maximum iterations count if defined");
                    }

                    // A repeat node must not have an iteration count that exceeds the maximum iteration count.
                    if (this.iterations > this.maximumIterations) {
                        throw new Error(
                            "a repeat node must not have an iteration count that exceeds the maximum iteration count"
                        );
                    }
                }
            },
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
                return new Repeat(
                    this.decorators,
                    this.iterations,
                    this.maximumIterations,
                    this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
                );
            }
        }),
        RETRY: () => ({
            type: "retry",
            decorators: [],
            iterations: null,
            maximumIterations: null,
            children: [],
            validate: function (depth) {
                // A retry node must have a single node.
                if (this.children.length !== 1) {
                    throw new Error("a retry node must have a single child");
                }

                // A retry node must have a positive number of iterations if defined.
                if (this.iterations !== null && this.iterations < 0) {
                    throw new Error("a retry node must have a positive number of iterations if defined");
                }

                // There is validation to carry out if a longest duration was defined.
                if (this.maximumIterations !== null) {
                    // A retry node must have a positive maximum iterations count if defined.
                    if (this.maximumIterations < 0) {
                        throw new Error("a retry node must have a positive maximum iterations count if defined");
                    }

                    // A retry node must not have an iteration count that exceeds the maximum iteration count.
                    if (this.iterations > this.maximumIterations) {
                        throw new Error(
                            "a retry node must not have an iteration count that exceeds the maximum iteration count"
                        );
                    }
                }
            },
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
                return new Retry(
                    this.decorators,
                    this.iterations,
                    this.maximumIterations,
                    this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
                );
            }
        }),
        FLIP: () => ({
            type: "flip",
            decorators: [],
            children: [],
            validate: function (depth) {
                // A flip node must have a single node.
                if (this.children.length !== 1) {
                    throw new Error("a flip node must have a single child");
                }
            },
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
                return new Flip(
                    this.decorators,
                    this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
                );
            }
        }),
        SUCCEED: () => ({
            type: "succeed",
            decorators: [],
            children: [],
            validate: function (depth) {
                // A succeed node must have a single node.
                if (this.children.length !== 1) {
                    throw new Error("a succeed node must have a single child");
                }
            },
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
                return new Succeed(
                    this.decorators,
                    this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
                );
            }
        }),
        FAIL: () => ({
            type: "fail",
            decorators: [],
            children: [],
            validate: function (depth) {
                // A fail node must have a single node.
                if (this.children.length !== 1) {
                    throw new Error("a fail node must have a single child");
                }
            },
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
                return new Fail(
                    this.decorators,
                    this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
                );
            }
        }),
        WAIT: () => ({
            type: "wait",
            decorators: [],
            duration: null,
            longestDuration: null,
            validate: function (depth) {
                // A wait node must have a positive duration.
                if (this.duration < 0) {
                    throw new Error("a wait node must have a positive duration");
                }

                // There is validation to carry out if a longest duration was defined.
                if (this.longestDuration) {
                    // A wait node must have a positive longest duration.
                    if (this.longestDuration < 0) {
                        throw new Error("a wait node must have a positive longest duration if one is defined");
                    }

                    // A wait node must not have a duration that exceeds the longest duration.
                    if (this.duration > this.longestDuration) {
                        throw new Error("a wait node must not have a shortest duration that exceeds the longest duration");
                    }
                }
            },
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
                return new Wait(this.decorators, this.duration, this.longestDuration);
            }
        }),
        ACTION: () => ({
            type: "action",
            decorators: [],
            actionName: "",
            actionArguments: [],
            validate: function (depth) {},
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
                return new Action(this.decorators, this.actionName, this.actionArguments);
            }
        }),
        CONDITION: () => ({
            type: "condition",
            decorators: [],
            conditionName: "",
            conditionArguments: [],
            validate: function (depth) {},
            createNodeInstance: function (namedRootNodeProvider, visitedBranches) {
                return new Condition(this.decorators, this.conditionName, this.conditionArguments);
            }
        })
    };

    /**
     * Create an array of root AST nodes based on the given definition.
     * @param definition The definition to parse the AST nodes from.
     * @returns The base definition AST nodes.
     */
    function buildRootASTNodes(definition) {
        // Swap out any node/decorator argument string literals with a placeholder and get a mapping of placeholders to original values as well as the processed definition.
        const { placeholders, processedDefinition } = substituteStringLiterals(definition);

        // Convert the processed definition (with substituted string literals) into an array of raw tokens.
        const tokens = parseTokensFromDefinition(processedDefinition);

        // There must be at least 3 tokens for the tree definition to be valid. 'ROOT', '{' and '}'.
        if (tokens.length < 3) {
            throw new Error("invalid token count");
        }

        // We should have a matching number of '{' and '}' tokens. If not, then there are scopes that have not been properly closed.
        if (tokens.filter((token) => token === "{").length !== tokens.filter((token) => token === "}").length) {
            throw new Error("scope character mismatch");
        }

        // Create a stack of node children arrays, starting with a definition scope.
        const stack = [[]];

        // We should keep processing the raw tokens until we run out of them.
        while (tokens.length) {
            // Grab the next token.
            const token = tokens.shift();

            let node;

            // How we create the next AST token depends on the current raw token value.
            switch (token.toUpperCase()) {
                case "ROOT":
                    // Create a ROOT AST node.
                    node = ASTNodeFactories.ROOT();

                    // Push the ROOT node into the current scope.
                    stack[stack.length - 1].push(node);

                    // We may have a root node name defined as an argument.
                    if (tokens[0] === "[") {
                        const rootArguments = getArguments(tokens, placeholders);

                        // We should have only a single argument that is not an empty string for a root node, which is the root name identifier.
                        if (rootArguments.length === 1 && rootArguments[0].type === "identifier") {
                            // The root name will be the first and only node argument.
                            node.name = rootArguments[0].value;
                        } else {
                            throw new Error("expected single root name argument");
                        }
                    }

                    // Try to pick any decorators off of the token stack.
                    node.decorators = getDecorators(tokens, placeholders);

                    popAndCheck(tokens, "{");

                    // The new scope is that of the new ROOT nodes children.
                    stack.push(node.children);
                    break;

                case "BRANCH":
                    // Create a BRANCH AST node.
                    node = ASTNodeFactories.BRANCH();

                    // Push the BRANCH node into the current scope.
                    stack[stack.length - 1].push(node);

                    // We must have arguments defined, as we require a branch name argument.
                    if (tokens[0] !== "[") {
                        throw new Error("expected single branch name argument");
                    }

                    // The branch name will be defined as a node argument.
                    const branchArguments = getArguments(tokens, placeholders);

                    // We should have only a single identifer argument for a branch node, which is the branch name.
                    if (branchArguments.length === 1 && branchArguments[0].type === "identifier") {
                        // The branch name will be the first and only node argument.
                        node.branchName = branchArguments[0].value;
                    } else {
                        throw new Error("expected single branch name argument");
                    }
                    break;

                case "SELECTOR":
                    // Create a SELECTOR AST node.
                    node = ASTNodeFactories.SELECTOR();

                    // Push the SELECTOR node into the current scope.
                    stack[stack.length - 1].push(node);

                    // Try to pick any decorators off of the token stack.
                    node.decorators = getDecorators(tokens, placeholders);

                    popAndCheck(tokens, "{");

                    // The new scope is that of the new SELECTOR nodes children.
                    stack.push(node.children);
                    break;

                case "SEQUENCE":
                    // Create a SEQUENCE AST node.
                    node = ASTNodeFactories.SEQUENCE();

                    // Push the SEQUENCE node into the current scope.
                    stack[stack.length - 1].push(node);

                    // Try to pick any decorators off of the token stack.
                    node.decorators = getDecorators(tokens, placeholders);

                    popAndCheck(tokens, "{");

                    // The new scope is that of the new SEQUENCE nodes children.
                    stack.push(node.children);
                    break;

                case "PARALLEL":
                    // Create a PARALLEL AST node.
                    node = ASTNodeFactories.PARALLEL();

                    // Push the PARALLEL node into the current scope.
                    stack[stack.length - 1].push(node);

                    // Try to pick any decorators off of the token stack.
                    node.decorators = getDecorators(tokens, placeholders);

                    popAndCheck(tokens, "{");

                    // The new scope is that of the new PARALLEL nodes children.
                    stack.push(node.children);
                    break;

                case "LOTTO":
                    // Create a LOTTO AST node.
                    node = ASTNodeFactories.LOTTO();

                    // Push the LOTTO node into the current scope.
                    stack[stack.length - 1].push(node);

                    // If the next token is a '[' character then some ticket counts have been defined as arguments.
                    if (tokens[0] === "[") {
                        // Get the ticket count arguments, each argument must be a number.
                        node.tickets = getArguments(
                            tokens,
                            placeholders,
                            (arg) => arg.type === "number" && arg.isInteger,
                            "lotto node ticket counts must be integer values"
                        ).map((argument) => argument.value);
                    }

                    // Try to pick any decorators off of the token stack.
                    node.decorators = getDecorators(tokens, placeholders);

                    popAndCheck(tokens, "{");

                    // The new scope is that of the new LOTTO nodes children.
                    stack.push(node.children);
                    break;

                case "CONDITION":
                    // Create a CONDITION AST node.
                    node = ASTNodeFactories.CONDITION();

                    // Push the CONDITION node into the current scope.
                    stack[stack.length - 1].push(node);

                    // We must have arguments defined, as we require a condition function name argument.
                    if (tokens[0] !== "[") {
                        throw new Error("expected condition name identifier argument");
                    }

                    // Grab the condition node arguments.
                    const conditionArguments = getArguments(tokens, placeholders);

                    // We should have at least a single identifier argument for a condition node, which is the condition function name.
                    if (conditionArguments.length && conditionArguments[0].type === "identifier") {
                        // The condition function name will be the first node argument.
                        node.conditionName = conditionArguments.shift().value;
                    } else {
                        throw new Error("expected condition name identifier argument");
                    }

                    // Only the first argument should have been an identifier, all following arguments must be string, number, boolean or null.
                    conditionArguments
                        .filter((arg) => arg.type === "identifier")
                        .forEach((arg) => {
                            throw new Error(
                                "invalid condition node argument value '" +
                                    arg.value +
                                    "', must be string, number, boolean or null"
                            );
                        });

                    // Any node arguments that follow the condition name identifier will be treated as condition function arguments.
                    node.conditionArguments = conditionArguments;

                    // Try to pick any decorators off of the token stack.
                    node.decorators = getDecorators(tokens, placeholders);
                    break;

                case "FLIP":
                    // Create a FLIP AST node.
                    node = ASTNodeFactories.FLIP();

                    // Push the Flip node into the current scope.
                    stack[stack.length - 1].push(node);

                    // Try to pick any decorators off of the token stack.
                    node.decorators = getDecorators(tokens, placeholders);

                    popAndCheck(tokens, "{");

                    // The new scope is that of the new FLIP nodes children.
                    stack.push(node.children);
                    break;

                case "SUCCEED":
                    // Create a SUCCEED AST node.
                    node = ASTNodeFactories.SUCCEED();

                    // Push the Succeed node into the current scope.
                    stack[stack.length - 1].push(node);

                    // Try to pick any decorators off of the token stack.
                    node.decorators = getDecorators(tokens, placeholders);

                    popAndCheck(tokens, "{");

                    // The new scope is that of the new Succeed nodes children.
                    stack.push(node.children);
                    break;

                case "FAIL":
                    // Create a FAIL AST node.
                    node = ASTNodeFactories.FAIL();

                    // Push the Fail node into the current scope.
                    stack[stack.length - 1].push(node);

                    // Try to pick any decorators off of the token stack.
                    node.decorators = getDecorators(tokens, placeholders);

                    popAndCheck(tokens, "{");

                    // The new scope is that of the new Fail nodes children.
                    stack.push(node.children);
                    break;

                case "WAIT":
                    // Create a WAIT AST node.
                    node = ASTNodeFactories.WAIT();

                    // Push the WAIT node into the current scope.
                    stack[stack.length - 1].push(node);

                    // Get the duration and potential longest duration of the wait.
                    const durations = getArguments(
                        tokens,
                        placeholders,
                        (arg) => arg.type === "number" && arg.isInteger,
                        "wait node durations must be integer values"
                    ).map((argument) => argument.value);

                    // We should have got one or two durations.
                    if (durations.length === 1) {
                        // A static duration was defined.
                        node.duration = durations[0];
                    } else if (durations.length === 2) {
                        // A shortest and longest duration was defined.
                        node.duration = durations[0];
                        node.longestDuration = durations[1];
                    } else {
                        // An incorrect number of durations was defined.
                        throw new Error("invalid number of wait node duration arguments defined");
                    }

                    // Try to pick any decorators off of the token stack.
                    node.decorators = getDecorators(tokens, placeholders);
                    break;

                case "REPEAT":
                    // Create a REPEAT AST node.
                    node = ASTNodeFactories.REPEAT();

                    // Push the REPEAT node into the current scope.
                    stack[stack.length - 1].push(node);

                    // Check for iteration counts ([])
                    if (tokens[0] === "[") {
                        // An iteration count has been defined. Get the iteration and potential maximum iteration of the wait.
                        const iterationArguments = getArguments(
                            tokens,
                            placeholders,
                            (arg) => arg.type === "number" && arg.isInteger,
                            "repeat node iteration counts must be integer values"
                        ).map((argument) => argument.value);

                        // We should have got one or two iteration counts.
                        if (iterationArguments.length === 1) {
                            // A static iteration count was defined.
                            node.iterations = iterationArguments[0];
                        } else if (iterationArguments.length === 2) {
                            // A minimum and maximum iteration count was defined.
                            node.iterations = iterationArguments[0];
                            node.maximumIterations = iterationArguments[1];
                        } else {
                            // An incorrect number of iteration counts was defined.
                            throw new Error("invalid number of repeat node iteration count arguments defined");
                        }
                    }

                    // Try to pick any decorators off of the token stack.
                    node.decorators = getDecorators(tokens, placeholders);

                    popAndCheck(tokens, "{");

                    // The new scope is that of the new REPEAT nodes children.
                    stack.push(node.children);
                    break;

                case "RETRY":
                    // Create a RETRY AST node.
                    node = ASTNodeFactories.RETRY();

                    // Push the RETRY node into the current scope.
                    stack[stack.length - 1].push(node);

                    // Check for iteration counts ([])
                    if (tokens[0] === "[") {
                        // An iteration count has been defined. Get the iteration and potential maximum iteration of the wait.
                        const iterationArguments = getArguments(
                            tokens,
                            placeholders,
                            (arg) => arg.type === "number" && arg.isInteger,
                            "retry node iteration counts must be integer values"
                        ).map((argument) => argument.value);

                        // We should have got one or two iteration counts.
                        if (iterationArguments.length === 1) {
                            // A static iteration count was defined.
                            node.iterations = iterationArguments[0];
                        } else if (iterationArguments.length === 2) {
                            // A minimum and maximum iteration count was defined.
                            node.iterations = iterationArguments[0];
                            node.maximumIterations = iterationArguments[1];
                        } else {
                            // An incorrect number of iteration counts was defined.
                            throw new Error("invalid number of retry node iteration count arguments defined");
                        }
                    }

                    // Try to pick any decorators off of the token stack.
                    node.decorators = getDecorators(tokens, placeholders);

                    popAndCheck(tokens, "{");

                    // The new scope is that of the new RETRY nodes children.
                    stack.push(node.children);
                    break;

                case "ACTION":
                    // Create a ACTION AST node.
                    node = ASTNodeFactories.ACTION();

                    // Push the ACTION node into the current scope.
                    stack[stack.length - 1].push(node);

                    // We must have arguments defined, as we require an action name argument.
                    if (tokens[0] !== "[") {
                        throw new Error("expected action name identifier argument");
                    }

                    // The action name will be defined as a node argument.
                    const actionArguments = getArguments(tokens, placeholders);

                    // We should have at least one identifer argument for an action node, which is the action name.
                    if (actionArguments.length && actionArguments[0].type === "identifier") {
                        // The action name will be the first and only node argument.
                        node.actionName = actionArguments.shift().value;
                    } else {
                        throw new Error("expected action name identifier argument");
                    }

                    // Only the first argument should have been an identifier, all following arguments must be string, number, boolean or null.
                    actionArguments
                        .filter((arg) => arg.type === "identifier")
                        .forEach((arg) => {
                            throw new Error(
                                "invalid action node argument value '" +
                                    arg.value +
                                    "', must be string, number, boolean or null"
                            );
                        });

                    // Any node arguments that follow the action name identifier will be treated as action function arguments.
                    node.actionArguments = actionArguments;

                    // Try to pick any decorators off of the token stack.
                    node.decorators = getDecorators(tokens, placeholders);
                    break;

                case "}":
                    // The '}' character closes the current scope.
                    stack.pop();
                    break;

                default:
                    throw new Error("unexpected token: " + token);
            }
        }

        // A function to recursively validate each of the nodes in the AST.
        const validateASTNode = (node, depth) => {
            // Validate the node.
            node.validate(depth);

            // Validate each child of the node.
            (node.children || []).forEach((child) => validateASTNode(child, depth + 1));
        };

        // Start node validation from the definition root.
        validateASTNode(
            {
                children: stack[0],
                validate: function (depth) {
                    // We must have at least one node defined as the definition scope, which should be a root node.
                    if (this.children.length === 0) {
                        throw new Error("expected root node to have been defined");
                    }

                    // Each node at the base of the definition scope MUST be a root node.
                    for (const definitionLevelNode of this.children) {
                        if (definitionLevelNode.type !== "root") {
                            throw new Error("expected root node at base of definition");
                        }
                    }

                    // Exactly one root node must not have a name defined. This will be the main root, others will have to be referenced via branch nodes.
                    if (
                        this.children.filter(function (definitionLevelNode) {
                            return definitionLevelNode.name === null;
                        }).length !== 1
                    ) {
                        throw new Error("expected single unnamed root node at base of definition to act as main root");
                    }

                    // No two named root nodes can have matching names.
                    const rootNodeNames = [];
                    for (const definitionLevelNode of this.children) {
                        if (rootNodeNames.indexOf(definitionLevelNode.name) !== -1) {
                            throw new Error(`multiple root nodes found with duplicate name '${definitionLevelNode.name}'`);
                        } else {
                            rootNodeNames.push(definitionLevelNode.name);
                        }
                    }
                }
            },
            0
        );

        // Return the root AST nodes.
        return stack[0];
    }

    /**
     * Pop the next raw token off of the stack and throw an error if it wasn't the expected one.
     * @param tokens The array of remaining tokens.
     * @param expected An optional string or array or items, one of which must match the next popped token.
     * @returns The popped token.
     */
    function popAndCheck(tokens, expected) {
        // Get and remove the next token.
        const popped = tokens.shift();

        // We were expecting another token.
        if (popped === undefined) {
            throw new Error("unexpected end of definition");
        }

        // Do we have an expected token/tokens array?
        if (expected !== undefined) {
            // Check whether the popped token matches at least one of our expected items.
            var tokenMatchesExpectation = [].concat(expected).some((item) => popped.toUpperCase() === item.toUpperCase());

            // Throw an error if the popped token didn't match any of our expected items.
            if (!tokenMatchesExpectation) {
                throw new Error("unexpected token found. Expected " + expected + " but got '" + popped + "'");
            }
        }

        // Return the popped token.
        return popped;
    }

    /**
     * Pull an argument definition list off of the token stack.
     * @param tokens The array of remaining tokens.
     * @param stringArgumentPlaceholders The mapping of string literal node argument placeholders to original values.
     * @param argumentValidator The argument validator function.
     * @param validationFailedMessage  The exception message to throw if argument validation fails.
     * @returns The argument definition list.
     */
    function getArguments(tokens, stringArgumentPlaceholders, argumentValidator, validationFailedMessage) {
        // Any lists of arguments will always be wrapped in '[]' for node arguments or '()' for decorator arguments.
        // We are looking for a '[' or '(' opener that wraps the argument tokens and the relevant closer.
        const closer = popAndCheck(tokens, ["[", "("]) === "[" ? "]" : ")";

        const argumentListTokens = [];
        const argumentList = [];

        // Grab all tokens between the '[' and ']' or '(' and ')'.
        while (tokens.length && tokens[0] !== closer) {
            // The next token is part of our arguments list.
            argumentListTokens.push(tokens.shift());
        }

        // Validate the order of the argument tokens. Each token must either be a ',' or a single argument that satisfies the validator.
        argumentListTokens.forEach((token, index) => {
            // Get whether this token should be an actual argument.
            const shouldBeArgumentToken = !(index & 1);

            // If the current token should be an actual argument then validate it,otherwise it should be a ',' token.
            if (shouldBeArgumentToken) {
                // Get the argument definition.
                const argumentDefinition = getArgumentDefinition(token, stringArgumentPlaceholders);

                // Try to validate the argument.
                if (argumentValidator && !argumentValidator(argumentDefinition)) {
                    throw new Error(validationFailedMessage);
                }

                // This is a valid argument!
                argumentList.push(argumentDefinition);
            } else {
                // The current token should be a ',' token.
                if (token !== ",") {
                    throw new Error(`invalid argument list, expected ',' or ']' but got '${token}'`);
                }
            }
        });

        // The arguments list should terminate with a ']' or ')' token, depending on the opener.
        popAndCheck(tokens, closer);

        // Return the argument list.
        return argumentList;
    }

    /**
     * Gets an argument value definition.
     * @param token The argument token.
     * @param stringArgumentPlaceholders The mapping of string literal node argument placeholders to original values.
     * @returns An argument value definition.
     */
    function getArgumentDefinition(token, stringArgumentPlaceholders) {
        // Check whether the token represents a null value.
        if (token === "null") {
            return {
                value: null,
                type: "null",
                toString: function () {
                    return this.value;
                }
            };
        }

        // Check whether the token represents a boolean value.
        if (token === "true" || token === "false") {
            return {
                value: token === "true",
                type: "boolean",
                toString: function () {
                    return this.value;
                }
            };
        }

        // Check whether the token represents a number value.
        if (!isNaN(token)) {
            return {
                value: parseFloat(token, 10),
                isInteger: parseFloat(token, 10) === parseInt(token, 10),
                type: "number",
                toString: function () {
                    return this.value;
                }
            };
        }

        // Check whether the token is a placeholder (e.g. @@0@@) representing a string literal.
        if (token.match(/^@@\d+@@$/g)) {
            return {
                value: stringArgumentPlaceholders[token].replace('\\"', '"'),
                type: "string",
                toString: function () {
                    return '"' + this.value + '"';
                }
            };
        }

        // The only remaining option is that the argument value is an identifier.
        return {
            value: token,
            type: "identifier",
            toString: function () {
                return this.value;
            }
        };
    }

    /**
     * Pull any decorators off of the token stack.
     * @param tokens The array of remaining tokens.
     * @param stringArgumentPlaceholders The mapping of string literal node argument placeholders to original values.
     * @returns An array od decorators defined by any directly following tokens.
     */
    function getDecorators(tokens, stringArgumentPlaceholders) {
        // Create an array to hold any decorators found.
        const decorators = [];

        // Keep track of names of decorators that we have found on the token stack, as we cannot have duplicates.
        const decoratorsFound = [];

        // Try to get the decorator factory for the next token.
        let decoratorFactory = DecoratorFactories[(tokens[0] || "").toUpperCase()];

        // Pull decorator tokens off of the tokens stack until we have no more.
        while (decoratorFactory) {
            // Check to make sure that we have not already created a decorator of this type for this node.
            if (decoratorsFound.indexOf(tokens[0].toUpperCase()) !== -1) {
                throw new Error(`duplicate decorator '${tokens[0].toUpperCase()}' found for node`);
            }

            // Add the current decorator type to our array of found decorators.
            decoratorsFound.push(tokens.shift().toUpperCase());

            // Grab any decorator arguments.
            const decoratorArguments = getArguments(tokens, stringArgumentPlaceholders);

            // The first decorator argument has to be an identifer, this will reference an agent function.
            if (decoratorArguments.length === 0 || decoratorArguments[0].type !== "identifier") {
                throw new Error("expected agent function name identifier argument for decorator");
            }

            // Grab the first decorator which is an identifier that will reference an agent function.
            const decoratorFunctionName = decoratorArguments.shift();

            // Any remaining decorator arguments must have a type of string, number, boolean or null.
            decoratorArguments
                .filter((arg) => arg.type === "identifier")
                .forEach((arg) => {
                    throw new Error(
                        "invalid decorator argument value '" + arg.value + "', must be string, number, boolean or null"
                    );
                });

            // Create the decorator and add it to the array of decorators found.
            decorators.push(decoratorFactory(decoratorFunctionName, decoratorArguments));

            // Try to get the next decorator name token, as there could be multiple.
            decoratorFactory = DecoratorFactories[(tokens[0] || "").toUpperCase()];
        }

        return decorators;
    }

    /**
     * Swaps out any node/decorator argument string literals with placeholders.
     * @param definition The definition.
     * @returns An object containing a mapping of placeholders to original string values as well as the processed definition string.
     */
    function substituteStringLiterals(definition) {
        // Create an object to hold the mapping of placeholders to original string values.
        const placeholders = {};

        // Replace any string literals wrapped with double quotes in our definition with placeholders to be processed later.
        const processedDefinition = definition.replace(/\"(\\.|[^"\\])*\"/g, (match) => {
            var strippedMatch = match.substring(1, match.length - 1);
            var placeholder = Object.keys(placeholders).find((key) => placeholders[key] === strippedMatch);

            // If we have no existing string literal match then create a new placeholder.
            if (!placeholder) {
                placeholder = `@@${Object.keys(placeholders).length}@@`;
                placeholders[placeholder] = strippedMatch;
            }

            return placeholder;
        });

        return { placeholders, processedDefinition };
    }

    /**
     * Parse the tree definition into an array of raw tokens.
     * @param definition The definition.
     * @returns An array of tokens parsed from the definition.
     */
    function parseTokensFromDefinition(definition) {
        // Add some space around various important characters so that they can be plucked out easier as individual tokens.
        definition = definition.replace(/\(/g, " ( ");
        definition = definition.replace(/\)/g, " ) ");
        definition = definition.replace(/\{/g, " { ");
        definition = definition.replace(/\}/g, " } ");
        definition = definition.replace(/\]/g, " ] ");
        definition = definition.replace(/\[/g, " [ ");
        definition = definition.replace(/\,/g, " , ");

        // Split the definition into raw token form and return it.
        return definition.replace(/\s+/g, " ").trim().split(" ");
    }

    /**
     * The behaviour tree.
     */
    class BehaviourTree {
        /**
         * The agent instance that this behaviour tree is modelling behaviour for.
         */
        #agent;
        /**
         * The main root tree node.
         */
        #rootNode;
        /**
         * The behaviour tree options object.
         */
        #options;

        /**
         * Constructor for the BehaviourTree class.
         * @param definition The behaviour tree definition.
         * @param agent The agent instance that this behaviour tree is modelling behaviour for.
         * @param options The behaviour tree options object.
         */
        constructor(definition, agent, options = {}) {
            this.#agent = agent;
            this.#options = options;

            // The tree definition must be defined and a valid string.
            if (typeof definition !== "string") {
                throw new Error("the tree definition must be a string");
            }

            // The agent must be defined and not null.
            if (typeof agent !== "object" || agent === null) {
                throw new Error("the agent must be defined and not null");
            }

            // Parse the behaviour tree definition, create the populated tree of behaviour tree nodes, and get the root.
            this.#rootNode = BehaviourTree.#createRootNode(definition);
        }

        /**
         * Gets the main root tree node.
         * @returns The main root tree node.
         */
        get rootNode() {
            return this.#rootNode;
        }

        /**
         * Gets whether the tree is in the running state.
         * @returns Whether the tree is in the running state.
         */
        isRunning() {
            return this.#rootNode.getState() === State.RUNNING;
        }

        /**
         * Gets the current tree state of SUCCEEDED, FAILED, READY or RUNNING.
         * @returns The current tree state.
         */
        getState() {
            return this.#rootNode.getState();
        }

        /**
         * Step the tree.
         * This carries out a node update that traverses the tree from the root node outwards to any child nodes, skipping those that are already in a resolved state of SUCCEEDED or FAILED.
         * Calling this method when the tree is already in a resolved state of SUCCEEDED or FAILED will cause it to be reset before tree traversal begins.
         */
        step() {
            // If the root node has already been stepped to completion then we need to reset it.
            if (this.#rootNode.getState() === State.SUCCEEDED || this.#rootNode.getState() === State.FAILED) {
                this.#rootNode.reset();
            }

            try {
                this.#rootNode.update(this.#agent, this.#options);
            } catch (exception) {
                throw new Error(`error stepping tree: ${exception.message}`);
            }
        }

        /**
         * Resets the tree from the root node outwards to each nested node, giving each a state of READY.
         */
        reset() {
            this.#rootNode.reset();
        }

        /**
         * Gets the tree as a flattened array of tree node details.
         * @returns The tree as a flattened array of tree node details.
         */
        getFlattenedNodeDetails() {
            // Create an empty flattened array of tree nodes.
            const flattenedTreeNodes = [];

            /**
             * Helper function to process a node instance and push details into the flattened tree nodes array.
             * @param node The current node.
             * @param parentUid The UID of the node parent, or null if the node is the main root node.
             */
            const processNode = (node, parentUid) => {
                // Push the current node into the flattened nodes array.
                flattenedTreeNodes.push({
                    id: node.getUid(),
                    type: node.getType(),
                    caption: node.getName(),
                    state: node.getState(),
                    callbacks: node.getCallbackAttributes().map((callback) => callback.getDetails()),
                    guards: node.getGuardAttributes().map((guard) => guard.getDetails()),
                    arguments: node.getArguments(),
                    parentId: parentUid
                });

                // Process each of the nodes children if it is not a leaf node.
                if (!node.isLeafNode()) {
                    node.getChildren().forEach((child) => processNode(child, node.getUid()));
                }
            };

            // Convert the nested node structure into a flattened array of node details.
            processNode(this.#rootNode, null);

            return flattenedTreeNodes;
        }

        /**
         * Registers the action/condition/guard/callback function or subtree with the given name.
         * @param name The name of the function or subtree to register.
         * @param value The function or subtree definition to register.
         */
        static register(name, value) {
            if (typeof value === "function") {
                // We are going to register a action/condition/guard/callback function.
                Lookup.setFunc(name, value);
            } else if (typeof value === "string") {
                // We are going to register a subtree.
                let rootASTNodes;

                try {
                    // Try to create the behaviour tree AST based on the definition provided, this could fail if the definition is invalid.
                    rootASTNodes = buildRootASTNodes(value);
                } catch (exception) {
                    // There was an issue in trying to parse and build the tree definition.
                    throw new Error(`error registering definition: ${exception.message}`);
                }

                // This function should only ever be called with a definition containing a single unnamed root node.
                if (rootASTNodes.length != 1 || rootASTNodes[0].name !== null) {
                    throw new Error("error registering definition: expected a single unnamed root node");
                }

                Lookup.setSubtree(name, rootASTNodes[0]);
            } else {
                throw new Error("unexpected value, expected string definition or function");
            }
        }

        /**
         * Unregisters the action/condition/guard/callback function or subtree with the given name.
         * @param name The name of the action/condition/guard/callback function or subtree to unregister.
         */
        static unregister(name) {
            Lookup.remove(name);
        }

        /**
         * Unregister all registered action/condition/guard/callback functions and subtrees.
         */
        static unregisterAll() {
            Lookup.empty();
        }

        /**
         * Parses a behaviour tree definition and creates a tree of behaviour tree nodes.
         * @param {string} definition The behaviour tree definition.
         * @returns The root behaviour tree node.
         */
        static #createRootNode(definition) {
            try {
                // Try to create the behaviour tree AST based on the definition provided, this could fail if the definition is invalid.
                const rootASTNodes = buildRootASTNodes(definition);

                // Create a symbol to use as the main root key in our root node mapping.
                const mainRootNodeKey = Symbol("__root__");

                // Create a mapping of root node names to root AST tokens. The main root node will have a key of Symbol("__root__").
                const rootNodeMap = {};
                for (const rootASTNode of rootASTNodes) {
                    rootNodeMap[rootASTNode.name === null ? mainRootNodeKey : rootASTNode.name] = rootASTNode;
                }

                // Create a provider for named root nodes that are part of our definition or have been registered. Prioritising the former.
                const namedRootNodeProvider = function (name) {
                    return rootNodeMap[name] ? rootNodeMap[name] : Lookup.getSubtree(name);
                };

                // Convert the AST to our actual tree and get the root node.
                const rootNode = rootNodeMap[mainRootNodeKey].createNodeInstance(namedRootNodeProvider, []);

                // Set a guard path on every leaf of the tree to evaluate as part of its update.
                BehaviourTree.#applyLeafNodeGuardPaths(rootNode);

                // Return the root node.
                return rootNode;
            } catch (exception) {
                // There was an issue in trying to parse and build the tree definition.
                throw new Error(`error parsing tree: ${exception.message}`);
            }
        }

        /**
         * Applies a guard path to every leaf of the tree to evaluate as part of each update.
         * @param {*} rootNode The main root tree node.
         */
        static #applyLeafNodeGuardPaths(rootNode) {
            const nodePaths = [];

            const findLeafNodes = (path, node) => {
                // Add the current node to the path.
                path = path.concat(node);

                // Check whether the current node is a leaf node.
                if (node.isLeafNode()) {
                    nodePaths.push(path);
                } else {
                    node.getChildren().forEach((child) => findLeafNodes(path, child));
                }
            };

            // Find all leaf node paths, starting from the root.
            findLeafNodes([], rootNode);

            nodePaths.forEach((path) => {
                // Each node in the current path will have to be assigned a guard path, working from the root outwards.
                for (let depth = 0; depth < path.length; depth++) {
                    // Get the node in the path at the current depth.
                    const currentNode = path[depth];

                    // The node may already have been assigned a guard path, if so just skip it.
                    if (currentNode.hasGuardPath()) {
                        continue;
                    }

                    // Create the guard path for the current node.
                    const guardPath = new GuardPath(
                        path
                            .slice(0, depth + 1)
                            .map((node) => ({
                                node,
                                guards: node.getAttributes().filter((attribute) => attribute.isGuard())
                            }))
                            .filter((details) => details.guards.length > 0)
                    );

                    // Assign the guard path to the current node.
                    currentNode.setGuardPath(guardPath);
                }
            });
        }
    }

    exports.BehaviourTree = BehaviourTree;
    exports.State = State;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
