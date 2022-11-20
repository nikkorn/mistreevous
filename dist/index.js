"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};

// src/index.js
var src_exports = {};
__export(src_exports, {
  BehaviourTree: () => BehaviourTree,
  State: () => State
});
module.exports = __toCommonJS(src_exports);

// src/attributes/guards/guardUnsatisifedException.ts
var GuardUnsatisifedException = class extends Error {
  constructor(source) {
    super("A guard path condition has failed");
    this.source = source;
  }
  isSourceNode = (node) => node === this.source;
};

// src/attributes/guards/guardPath.ts
var GuardPath = class {
  constructor(nodes) {
    this.nodes = nodes;
  }
  evaluate = (agent) => {
    for (const details of this.nodes) {
      for (const guard of details.guards) {
        if (!guard.isSatisfied(agent)) {
          throw new GuardUnsatisifedException(details.node);
        }
      }
    }
  };
};

// src/attributes/attribute.ts
var Attribute = class {
  constructor(type, args) {
    this.type = type;
    this.args = args;
  }
  getType = () => this.type;
  getArguments = () => this.args;
  getDetails = () => ({
    type: this.getType(),
    arguments: this.getArguments()
  });
};

// src/attributes/guards/guard.ts
var Guard = class extends Attribute {
  isGuard = () => true;
};

// src/Lookup.js
var _functionTable, _subtreeTable;
var Lookup = class {
  static getFunc(name) {
    return __privateGet(this, _functionTable)[name];
  }
  static setFunc(name, func) {
    __privateGet(this, _functionTable)[name] = func;
  }
  static getFuncInvoker(agent, name) {
    if (agent[name] && typeof agent[name] === "function") {
      return (args) => agent[name].apply(
        agent,
        args.map((arg) => arg.value)
      );
    }
    if (__privateGet(this, _functionTable)[name] && typeof __privateGet(this, _functionTable)[name] === "function") {
      return (args) => __privateGet(this, _functionTable)[name](agent, ...args.map((arg) => arg.value));
    }
    return null;
  }
  static getSubtree(name) {
    return __privateGet(this, _subtreeTable)[name];
  }
  static setSubtree(name, subtree) {
    __privateGet(this, _subtreeTable)[name] = subtree;
  }
  static remove(name) {
    delete __privateGet(this, _functionTable)[name];
    delete __privateGet(this, _subtreeTable)[name];
  }
  static empty() {
    __privateSet(this, _functionTable, {});
    __privateSet(this, _subtreeTable, {});
  }
};
_functionTable = new WeakMap();
_subtreeTable = new WeakMap();
__privateAdd(Lookup, _functionTable, {});
__privateAdd(Lookup, _subtreeTable, {});

// src/attributes/guards/while.ts
var While = class extends Guard {
  constructor(condition, args) {
    super("while", args);
    this.condition = condition;
  }
  isGuard = () => true;
  getDetails = () => {
    return {
      type: this.getType(),
      functionName: this.condition,
      arguments: this.getArguments()
    };
  };
  onReady = () => {
  };
  isSatisfied = (agent) => {
    const conditionFuncInvoker = Lookup.getFuncInvoker(agent, this.condition);
    if (conditionFuncInvoker === null) {
      throw new Error(
        `cannot evaluate node guard as the condition '${this.condition}' function is not defined on the agent and has not been registered`
      );
    }
    return !!conditionFuncInvoker(this.args);
  };
};

// src/attributes/guards/until.ts
var Until = class extends Guard {
  constructor(condition, args) {
    super("until", args);
    this.condition = condition;
  }
  isGuard = () => true;
  getDetails = () => {
    return {
      type: this.getType(),
      functionName: this.condition,
      arguments: this.getArguments()
    };
  };
  onReady = () => {
  };
  isSatisfied = (agent) => {
    const conditionFuncInvoker = Lookup.getFuncInvoker(agent, this.condition);
    if (conditionFuncInvoker === null) {
      throw new Error(
        `cannot evaluate node guard as the condition '${this.condition}' function is not defined on the agent and has not been registered`
      );
    }
    return !!!conditionFuncInvoker(this.args);
  };
};

// src/attributes/callbacks/callback.ts
var Callback = class extends Attribute {
  isGuard = () => false;
};

// src/attributes/callbacks/entry.ts
var Entry = class extends Callback {
  constructor(functionName, args) {
    super("entry", args);
    this.functionName = functionName;
  }
  getDetails = () => {
    return {
      type: this.getType(),
      functionName: this.functionName,
      arguments: this.getArguments()
    };
  };
  callAgentFunction = (agent) => {
    const callbackFuncInvoker = Lookup.getFuncInvoker(agent, this.functionName);
    if (callbackFuncInvoker === null) {
      throw new Error(
        `cannot call entry function '${this.functionName}' as is not defined on the agent and has not been registered`
      );
    }
    callbackFuncInvoker(this.args);
  };
};

// src/attributes/callbacks/exit.ts
var Exit = class extends Callback {
  constructor(functionName, args) {
    super("exit", args);
    this.functionName = functionName;
  }
  getDetails = () => {
    return {
      type: this.getType(),
      functionName: this.functionName,
      arguments: this.getArguments()
    };
  };
  callAgentFunction = (agent, isSuccess, isAborted) => {
    const callbackFuncInvoker = Lookup.getFuncInvoker(agent, this.functionName);
    if (callbackFuncInvoker === null) {
      throw new Error(
        `cannot call exit function '${this.functionName}' as is not defined on the agent and has not been registered`
      );
    }
    callbackFuncInvoker([{ value: { succeeded: isSuccess, aborted: isAborted } }].concat(this.args));
  };
};

// src/attributes/callbacks/step.ts
var Step = class extends Callback {
  constructor(functionName, args) {
    super("exit", args);
    this.functionName = functionName;
  }
  getDetails = () => {
    return {
      type: this.getType(),
      functionName: this.functionName,
      arguments: this.getArguments()
    };
  };
  callAgentFunction = (agent) => {
    const callbackFuncInvoker = Lookup.getFuncInvoker(agent, this.functionName);
    if (callbackFuncInvoker === null) {
      throw new Error(
        `cannot call step function '${this.functionName}' as is not defined on the agent and has not been registered`
      );
    }
    callbackFuncInvoker(this.args);
  };
};

// src/AttributeBuilder.js
var _factories;
var AttributeBuilder = class {
  static parseFromTokens(tokens, stringArgumentPlaceholders) {
    const attributes = [];
    const attributesFound = [];
    let attributeFactory = __privateGet(this, _factories)[(tokens[0] || "").toUpperCase()];
    while (attributeFactory) {
      if (attributesFound.indexOf(tokens[0].toUpperCase()) !== -1) {
        throw new Error(`duplicate attribute '${tokens[0].toUpperCase()}' found for node`);
      }
      attributesFound.push(tokens.shift().toUpperCase());
      const attributeArguments = getArguments(tokens, stringArgumentPlaceholders);
      if (attributeArguments.length === 0 || attributeArguments[0].type !== "identifier") {
        throw new Error("expected agent function name identifier argument for attribute");
      }
      const attributeFunctionNameArg = attributeArguments.shift();
      attributeArguments.filter((arg) => arg.type === "identifier").forEach((arg) => {
        throw new Error(
          "invalid attribute argument value '" + arg.value + "', must be string, number, boolean or null"
        );
      });
      attributes.push(attributeFactory(attributeFunctionNameArg.value, attributeArguments));
      attributeFactory = __privateGet(this, _factories)[(tokens[0] || "").toUpperCase()];
    }
    return attributes;
  }
};
_factories = new WeakMap();
__privateAdd(AttributeBuilder, _factories, {
  WHILE: (condition, attributeArguments) => new While(condition, attributeArguments),
  UNTIL: (condition, attributeArguments) => new Until(condition, attributeArguments),
  ENTRY: (functionName, attributeArguments) => new Entry(functionName, attributeArguments),
  EXIT: (functionName, attributeArguments) => new Exit(functionName, attributeArguments),
  STEP: (functionName, attributeArguments) => new Step(functionName, attributeArguments)
});

// src/State.js
var State = {
  READY: Symbol("mistreevous.ready"),
  RUNNING: Symbol("mistreevous.running"),
  SUCCEEDED: Symbol("mistreevous.succeeded"),
  FAILED: Symbol("mistreevous.failed")
};

// src/nodes/node.js
function Node(type, attributes, args) {
  const uid = createNodeUid();
  let state = State.READY;
  let guardPath;
  this.getState = () => state;
  this.setState = (value) => state = value;
  this.getUid = () => uid;
  this.getType = () => type;
  this.getArguments = () => args || [];
  this.getAttributes = () => attributes || [];
  this.getAttribute = (type2) => this.getAttributes().filter((attribute) => attribute.getType().toUpperCase() === type2.toUpperCase())[0] || null;
  this.getGuardAttributes = () => this.getAttributes().filter((attribute) => attribute.isGuard());
  this.getCallbackAttributes = () => this.getAttributes().filter((attribute) => !attribute.isGuard());
  this.setGuardPath = (value) => guardPath = value;
  this.hasGuardPath = () => !!guardPath;
  this.is = (value) => {
    return state === value;
  };
  this.reset = () => {
    this.setState(State.READY);
  };
  this.abort = (agent) => {
    if (!this.is(State.RUNNING)) {
      return;
    }
    this.reset();
    const exitCallback = this.getAttribute("exit");
    if (exitCallback) {
      exitCallback.callAgentFunction(agent, false, true);
    }
  };
  this.update = (agent, options) => {
    if (this.is(State.SUCCEEDED) || this.is(State.FAILED)) {
      return {};
    }
    if (this.is(State.READY)) {
      this.getGuardAttributes().forEach((guard) => guard.onReady());
    }
    try {
      guardPath.evaluate(agent);
      if (this.is(State.READY)) {
        const entryCallback = this.getAttribute("entry");
        if (entryCallback) {
          entryCallback.callAgentFunction(agent);
        }
      }
      const stepCallback = this.getAttribute("step");
      if (stepCallback) {
        stepCallback.callAgentFunction(agent);
      }
      this.onUpdate(agent, options);
      if (this.is(State.SUCCEEDED) || this.is(State.FAILED)) {
        const exitCallback = this.getAttribute("exit");
        if (exitCallback) {
          exitCallback.callAgentFunction(agent, this.is(State.SUCCEEDED), false);
        }
      }
    } catch (error) {
      if (error instanceof GuardUnsatisifedException && error.isSourceNode(this)) {
        this.abort(agent);
        this.setState(State.FAILED);
      } else {
        throw error;
      }
    }
  };
}
function createNodeUid() {
  var S4 = function() {
    return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1);
  };
  return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

// src/nodes/leaf/leaf.js
function Leaf(type, decorators, args) {
  Node.call(this, type, decorators, args);
  this.isLeafNode = () => true;
}
Leaf.prototype = Object.create(Node.prototype);

// src/nodes/leaf/action.js
function Action(decorators, actionName, actionArguments) {
  Leaf.call(this, "action", decorators, actionArguments);
  let isUsingUpdatePromise = false;
  let updatePromiseStateResult = null;
  this.onUpdate = function(agent, options) {
    if (isUsingUpdatePromise) {
      if (updatePromiseStateResult) {
        this.setState(updatePromiseStateResult);
      }
      return;
    }
    const actionFuncInvoker = Lookup.getFuncInvoker(agent, actionName);
    if (actionFuncInvoker === null) {
      throw new Error(
        `cannot update action node as the action '${actionName}' function is not defined on the agent and has not been registered`
      );
    }
    const updateResult = actionFuncInvoker(actionArguments);
    if (updateResult instanceof Promise) {
      updateResult.then(
        (result) => {
          if (!isUsingUpdatePromise) {
            return;
          }
          if (result !== State.SUCCEEDED && result !== State.FAILED) {
            throw new Error(
              "action node promise resolved with an invalid value, expected a State.SUCCEEDED or State.FAILED value to be returned"
            );
          }
          updatePromiseStateResult = result;
        },
        (reason) => {
          if (!isUsingUpdatePromise) {
            return;
          }
          throw new Error(reason);
        }
      );
      this.setState(State.RUNNING);
      isUsingUpdatePromise = true;
    } else {
      this._validateUpdateResult(updateResult);
      this.setState(updateResult || State.RUNNING);
    }
  };
  this.getName = () => actionName;
  this.reset = () => {
    this.setState(State.READY);
    isUsingUpdatePromise = false;
    updatePromiseStateResult = null;
  };
  this._validateUpdateResult = (result) => {
    switch (result) {
      case State.SUCCEEDED:
      case State.FAILED:
      case void 0:
        return;
      default:
        throw new Error(
          `action '${actionName}' 'onUpdate' returned an invalid response, expected an optional State.SUCCEEDED or State.FAILED value to be returned`
        );
    }
  };
}
Action.prototype = Object.create(Leaf.prototype);

// src/nodes/leaf/condition.js
function Condition(decorators, conditionName, conditionArguments) {
  Leaf.call(this, "condition", decorators, conditionArguments);
  this.onUpdate = function(agent, options) {
    const conditionFuncInvoker = Lookup.getFuncInvoker(agent, conditionName);
    if (conditionFuncInvoker === null) {
      throw new Error(
        `cannot update condition node as the condition '${conditionName}' function is not defined on the agent and has not been registered`
      );
    }
    this.setState(!!conditionFuncInvoker(conditionArguments) ? State.SUCCEEDED : State.FAILED);
  };
  this.getName = () => conditionName;
}
Condition.prototype = Object.create(Leaf.prototype);

// src/nodes/leaf/wait.js
function Wait(decorators, duration, longestDuration) {
  Leaf.call(this, "wait", decorators);
  let initialUpdateTime;
  let totalDuration;
  let waitedDuration;
  this.onUpdate = function(agent, options) {
    if (this.is(State.READY)) {
      initialUpdateTime = new Date().getTime();
      waitedDuration = 0;
      totalDuration = longestDuration ? Math.floor(Math.random() * (longestDuration - duration + 1) + duration) : duration;
      this.setState(State.RUNNING);
    }
    if (typeof options.getDeltaTime === "function") {
      const deltaTime = options.getDeltaTime();
      if (typeof deltaTime !== "number" || isNaN(deltaTime)) {
        throw new Error("The delta time must be a valid number and not NaN.");
      }
      waitedDuration += deltaTime * 1e3;
    } else {
      waitedDuration = new Date().getTime() - initialUpdateTime;
    }
    if (waitedDuration >= totalDuration) {
      this.setState(State.SUCCEEDED);
    }
  };
  this.getName = () => `WAIT ${longestDuration ? duration + "ms-" + longestDuration + "ms" : duration + "ms"}`;
}
Wait.prototype = Object.create(Leaf.prototype);

// src/nodes/decorator/decorator.js
function Decorator(type, decorators, child) {
  Node.call(this, type, decorators);
  this.isLeafNode = () => false;
  this.getChildren = () => [child];
  this.reset = () => {
    this.setState(State.READY);
    child.reset();
  };
  this.abort = (agent) => {
    if (!this.is(State.RUNNING)) {
      return;
    }
    child.abort(agent);
    this.reset();
    const exitDecorator = this.getDecorator("exit");
    if (exitDecorator) {
      exitDecorator.callAgentFunction(agent, false, true);
    }
  };
}
Decorator.prototype = Object.create(Node.prototype);

// src/nodes/decorator/root.js
function Root(decorators, child) {
  Decorator.call(this, "root", decorators, child);
  this.onUpdate = function(agent, options) {
    if (child.getState() === State.READY || child.getState() === State.RUNNING) {
      child.update(agent, options);
    }
    this.setState(child.getState());
  };
  this.getName = () => "ROOT";
}
Root.prototype = Object.create(Decorator.prototype);

// src/nodes/decorator/repeat.js
function Repeat(decorators, iterations, maximumIterations, child) {
  Decorator.call(this, "repeat", decorators, child);
  let targetIterationCount = null;
  let currentIterationCount = 0;
  this.onUpdate = function(agent, options) {
    if (this.is(State.READY)) {
      child.reset();
      this._setTargetIterationCount();
    }
    if (this._canIterate()) {
      this.setState(State.RUNNING);
      if (child.getState() === State.SUCCEEDED) {
        child.reset();
      }
      child.update(agent, options);
      if (child.getState() === State.FAILED) {
        this.setState(State.FAILED);
        return;
      } else if (child.getState() === State.SUCCEEDED) {
        currentIterationCount += 1;
      }
    } else {
      this.setState(State.SUCCEEDED);
    }
  };
  this.getName = () => {
    if (iterations !== null) {
      return `REPEAT ${maximumIterations ? iterations + "x-" + maximumIterations + "x" : iterations + "x"}`;
    }
    return "REPEAT";
  };
  this.reset = () => {
    this.setState(State.READY);
    currentIterationCount = 0;
    child.reset();
  };
  this._canIterate = () => {
    if (targetIterationCount !== null) {
      return currentIterationCount < targetIterationCount;
    }
    return true;
  };
  this._setTargetIterationCount = () => {
    if (typeof iterations === "number") {
      targetIterationCount = typeof maximumIterations === "number" ? Math.floor(Math.random() * (maximumIterations - iterations + 1) + iterations) : iterations;
    } else {
      targetIterationCount = null;
    }
  };
}
Repeat.prototype = Object.create(Decorator.prototype);

// src/nodes/decorator/retry.js
function Retry(decorators, iterations, maximumIterations, child) {
  Decorator.call(this, "retry", decorators, child);
  let targetIterationCount = null;
  let currentIterationCount = 0;
  this.onUpdate = function(agent, options) {
    if (this.is(State.READY)) {
      child.reset();
      this._setTargetIterationCount();
    }
    if (this._canIterate()) {
      this.setState(State.RUNNING);
      if (child.getState() === State.FAILED) {
        child.reset();
      }
      child.update(agent, options);
      if (child.getState() === State.SUCCEEDED) {
        this.setState(State.SUCCEEDED);
        return;
      } else if (child.getState() === State.FAILED) {
        currentIterationCount += 1;
      }
    } else {
      this.setState(State.FAILED);
    }
  };
  this.getName = () => {
    if (iterations !== null) {
      return `RETRY ${maximumIterations ? iterations + "x-" + maximumIterations + "x" : iterations + "x"}`;
    }
    return "RETRY";
  };
  this.reset = () => {
    this.setState(State.READY);
    currentIterationCount = 0;
    child.reset();
  };
  this._canIterate = () => {
    if (targetIterationCount !== null) {
      return currentIterationCount < targetIterationCount;
    }
    return true;
  };
  this._setTargetIterationCount = () => {
    if (typeof iterations === "number") {
      targetIterationCount = typeof maximumIterations === "number" ? Math.floor(Math.random() * (maximumIterations - iterations + 1) + iterations) : iterations;
    } else {
      targetIterationCount = null;
    }
  };
}
Retry.prototype = Object.create(Decorator.prototype);

// src/nodes/decorator/flip.js
function Flip(decorators, child) {
  Decorator.call(this, "flip", decorators, child);
  this.onUpdate = function(agent, options) {
    if (child.getState() === State.READY || child.getState() === State.RUNNING) {
      child.update(agent, options);
    }
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
  this.getName = () => "FLIP";
}
Flip.prototype = Object.create(Decorator.prototype);

// src/nodes/decorator/succeed.js
function Succeed(decorators, child) {
  Decorator.call(this, "succeed", decorators, child);
  this.onUpdate = function(agent, options) {
    if (child.getState() === State.READY || child.getState() === State.RUNNING) {
      child.update(agent, options);
    }
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
  this.getName = () => "SUCCEED";
}
Succeed.prototype = Object.create(Decorator.prototype);

// src/nodes/decorator/fail.js
function Fail(decorators, child) {
  Decorator.call(this, "fail", decorators, child);
  this.onUpdate = function(agent, options) {
    if (child.getState() === State.READY || child.getState() === State.RUNNING) {
      child.update(agent, options);
    }
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
  this.getName = () => "FAIL";
}
Fail.prototype = Object.create(Decorator.prototype);

// src/nodes/composite/composite.js
function Composite(type, decorators, children) {
  Node.call(this, type, decorators);
  this.isLeafNode = () => false;
  this.getChildren = () => children;
  this.reset = () => {
    this.setState(State.READY);
    this.getChildren().forEach((child) => child.reset());
  };
  this.abort = (agent) => {
    if (!this.is(State.RUNNING)) {
      return;
    }
    this.getChildren().forEach((child) => child.abort(agent));
    this.reset();
    const exitDecorator = this.getDecorator("exit");
    if (exitDecorator) {
      exitDecorator.callAgentFunction(agent, false, true);
    }
  };
}
Composite.prototype = Object.create(Node.prototype);

// src/nodes/composite/lotto.js
function Lotto(decorators, tickets, children) {
  Composite.call(this, "lotto", decorators, children);
  let winningChild;
  function LottoDraw() {
    this.participants = [];
    this.add = function(participant, tickets2) {
      this.participants.push({ participant, tickets: tickets2 });
      return this;
    };
    this.draw = function() {
      if (!this.participants.length) {
        throw new Error("cannot draw a lotto winner when there are no participants");
      }
      const pickable = [];
      this.participants.forEach(({ participant, tickets: tickets2 }) => {
        for (let ticketCount = 0; ticketCount < tickets2; ticketCount++) {
          pickable.push(participant);
        }
      });
      return this.getRandomItem(pickable);
    };
    this.getRandomItem = function(items) {
      if (!items.length) {
        return void 0;
      }
      return items[Math.floor(Math.random() * items.length)];
    };
  }
  this.onUpdate = function(agent, options) {
    if (this.is(State.READY)) {
      const lottoDraw = new LottoDraw();
      children.forEach((child, index) => lottoDraw.add(child, tickets[index] || 1));
      winningChild = lottoDraw.draw();
    }
    if (winningChild.getState() === State.READY || winningChild.getState() === State.RUNNING) {
      winningChild.update(agent, options);
    }
    this.setState(winningChild.getState());
  };
  this.getName = () => tickets.length ? `LOTTO [${tickets.join(",")}]` : "LOTTO";
}
Lotto.prototype = Object.create(Composite.prototype);

// src/nodes/composite/selector.js
function Selector(decorators, children) {
  Composite.call(this, "selector", decorators, children);
  this.onUpdate = function(agent, options) {
    for (const child of children) {
      if (child.getState() === State.READY || child.getState() === State.RUNNING) {
        child.update(agent, options);
      }
      if (child.getState() === State.SUCCEEDED) {
        this.setState(State.SUCCEEDED);
        return;
      }
      if (child.getState() === State.FAILED) {
        if (children.indexOf(child) === children.length - 1) {
          this.setState(State.FAILED);
          return;
        } else {
          continue;
        }
      }
      if (child.getState() === State.RUNNING) {
        this.setState(State.RUNNING);
        return;
      }
      throw new Error("child node was not in an expected state.");
    }
  };
  this.getName = () => "SELECTOR";
}
Selector.prototype = Object.create(Composite.prototype);

// src/nodes/composite/sequence.js
function Sequence(decorators, children) {
  Composite.call(this, "sequence", decorators, children);
  this.onUpdate = function(agent, options) {
    for (const child of children) {
      if (child.getState() === State.READY || child.getState() === State.RUNNING) {
        child.update(agent, options);
      }
      if (child.getState() === State.SUCCEEDED) {
        if (children.indexOf(child) === children.length - 1) {
          this.setState(State.SUCCEEDED);
          return;
        } else {
          continue;
        }
      }
      if (child.getState() === State.FAILED) {
        this.setState(State.FAILED);
        return;
      }
      if (child.getState() === State.RUNNING) {
        this.setState(State.RUNNING);
        return;
      }
      throw new Error("child node was not in an expected state.");
    }
  };
  this.getName = () => "SEQUENCE";
}
Sequence.prototype = Object.create(Composite.prototype);

// src/nodes/composite/parallel.js
function Parallel(decorators, children) {
  Composite.call(this, "parallel", decorators, children);
  this.onUpdate = function(agent, options) {
    let succeededCount = 0;
    let hasChildFailed = false;
    for (const child of children) {
      if (child.getState() === State.READY || child.getState() === State.RUNNING) {
        child.update(agent, options);
      }
      if (child.getState() === State.SUCCEEDED) {
        succeededCount++;
        continue;
      }
      if (child.getState() === State.FAILED) {
        hasChildFailed = true;
        break;
      }
      if (child.getState() !== State.RUNNING) {
        throw new Error("child node was not in an expected state.");
      }
    }
    if (hasChildFailed) {
      this.setState(State.FAILED);
      for (const child of children) {
        if (child.getState() === State.RUNNING) {
          child.abort(agent);
        }
      }
    } else {
      this.setState(succeededCount === children.length ? State.SUCCEEDED : State.RUNNING);
    }
  };
  this.getName = () => "PARALLEL";
}
Parallel.prototype = Object.create(Composite.prototype);

// src/NodeBuilder.js
var ASTNodeFactories = {
  ROOT: () => ({
    type: "root",
    attributes: [],
    name: null,
    children: [],
    validate: function(depth) {
      if (depth > 1) {
        throw new Error("a root node cannot be the child of another node");
      }
      if (this.children.length !== 1) {
        throw new Error("a root node must have a single child");
      }
    },
    createNodeInstance: function(namedRootNodeProvider, visitedBranches) {
      return new Root(
        this.attributes,
        this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
      );
    }
  }),
  BRANCH: () => ({
    type: "branch",
    branchName: "",
    validate: function(depth) {
    },
    createNodeInstance: function(namedRootNodeProvider, visitedBranches) {
      const targetRootNode = namedRootNodeProvider(this.branchName);
      if (visitedBranches.indexOf(this.branchName) !== -1) {
        throw new Error(`circular dependency found in branch node references for branch '${this.branchName}'`);
      }
      if (targetRootNode) {
        return targetRootNode.createNodeInstance(namedRootNodeProvider, visitedBranches.concat(this.branchName)).getChildren()[0];
      } else {
        throw new Error(`branch references root node '${this.branchName}' which has not been defined`);
      }
    }
  }),
  SELECTOR: () => ({
    type: "selector",
    attributes: [],
    children: [],
    validate: function(depth) {
      if (this.children.length < 1) {
        throw new Error("a selector node must have at least a single child");
      }
    },
    createNodeInstance: function(namedRootNodeProvider, visitedBranches) {
      return new Selector(
        this.attributes,
        this.children.map((child) => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice()))
      );
    }
  }),
  SEQUENCE: () => ({
    type: "sequence",
    attributes: [],
    children: [],
    validate: function(depth) {
      if (this.children.length < 1) {
        throw new Error("a sequence node must have at least a single child");
      }
    },
    createNodeInstance: function(namedRootNodeProvider, visitedBranches) {
      return new Sequence(
        this.attributes,
        this.children.map((child) => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice()))
      );
    }
  }),
  PARALLEL: () => ({
    type: "parallel",
    attributes: [],
    children: [],
    validate: function(depth) {
      if (this.children.length < 1) {
        throw new Error("a parallel node must have at least a single child");
      }
    },
    createNodeInstance: function(namedRootNodeProvider, visitedBranches) {
      return new Parallel(
        this.attributes,
        this.children.map((child) => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice()))
      );
    }
  }),
  LOTTO: () => ({
    type: "lotto",
    attributes: [],
    children: [],
    tickets: [],
    validate: function(depth) {
      if (this.children.length < 1) {
        throw new Error("a lotto node must have at least a single child");
      }
    },
    createNodeInstance: function(namedRootNodeProvider, visitedBranches) {
      return new Lotto(
        this.attributes,
        this.tickets,
        this.children.map((child) => child.createNodeInstance(namedRootNodeProvider, visitedBranches.slice()))
      );
    }
  }),
  REPEAT: () => ({
    type: "repeat",
    attributes: [],
    iterations: null,
    maximumIterations: null,
    children: [],
    validate: function(depth) {
      if (this.children.length !== 1) {
        throw new Error("a repeat node must have a single child");
      }
      if (this.iterations !== null && this.iterations < 0) {
        throw new Error("a repeat node must have a positive number of iterations if defined");
      }
      if (this.maximumIterations !== null) {
        if (this.maximumIterations < 0) {
          throw new Error("a repeat node must have a positive maximum iterations count if defined");
        }
        if (this.iterations > this.maximumIterations) {
          throw new Error(
            "a repeat node must not have an iteration count that exceeds the maximum iteration count"
          );
        }
      }
    },
    createNodeInstance: function(namedRootNodeProvider, visitedBranches) {
      return new Repeat(
        this.attributes,
        this.iterations,
        this.maximumIterations,
        this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
      );
    }
  }),
  RETRY: () => ({
    type: "retry",
    attributes: [],
    iterations: null,
    maximumIterations: null,
    children: [],
    validate: function(depth) {
      if (this.children.length !== 1) {
        throw new Error("a retry node must have a single child");
      }
      if (this.iterations !== null && this.iterations < 0) {
        throw new Error("a retry node must have a positive number of iterations if defined");
      }
      if (this.maximumIterations !== null) {
        if (this.maximumIterations < 0) {
          throw new Error("a retry node must have a positive maximum iterations count if defined");
        }
        if (this.iterations > this.maximumIterations) {
          throw new Error(
            "a retry node must not have an iteration count that exceeds the maximum iteration count"
          );
        }
      }
    },
    createNodeInstance: function(namedRootNodeProvider, visitedBranches) {
      return new Retry(
        this.attributes,
        this.iterations,
        this.maximumIterations,
        this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
      );
    }
  }),
  FLIP: () => ({
    type: "flip",
    attributes: [],
    children: [],
    validate: function(depth) {
      if (this.children.length !== 1) {
        throw new Error("a flip node must have a single child");
      }
    },
    createNodeInstance: function(namedRootNodeProvider, visitedBranches) {
      return new Flip(
        this.attributes,
        this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
      );
    }
  }),
  SUCCEED: () => ({
    type: "succeed",
    attributes: [],
    children: [],
    validate: function(depth) {
      if (this.children.length !== 1) {
        throw new Error("a succeed node must have a single child");
      }
    },
    createNodeInstance: function(namedRootNodeProvider, visitedBranches) {
      return new Succeed(
        this.attributes,
        this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
      );
    }
  }),
  FAIL: () => ({
    type: "fail",
    attributes: [],
    children: [],
    validate: function(depth) {
      if (this.children.length !== 1) {
        throw new Error("a fail node must have a single child");
      }
    },
    createNodeInstance: function(namedRootNodeProvider, visitedBranches) {
      return new Fail(
        this.attributes,
        this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
      );
    }
  }),
  WAIT: () => ({
    type: "wait",
    attributes: [],
    duration: null,
    longestDuration: null,
    validate: function(depth) {
      if (this.duration < 0) {
        throw new Error("a wait node must have a positive duration");
      }
      if (this.longestDuration) {
        if (this.longestDuration < 0) {
          throw new Error("a wait node must have a positive longest duration if one is defined");
        }
        if (this.duration > this.longestDuration) {
          throw new Error("a wait node must not have a shortest duration that exceeds the longest duration");
        }
      }
    },
    createNodeInstance: function(namedRootNodeProvider, visitedBranches) {
      return new Wait(this.attributes, this.duration, this.longestDuration);
    }
  }),
  ACTION: () => ({
    type: "action",
    attributes: [],
    actionName: "",
    actionArguments: [],
    validate: function(depth) {
    },
    createNodeInstance: function(namedRootNodeProvider, visitedBranches) {
      return new Action(this.attributes, this.actionName, this.actionArguments);
    }
  }),
  CONDITION: () => ({
    type: "condition",
    attributes: [],
    conditionName: "",
    conditionArguments: [],
    validate: function(depth) {
    },
    createNodeInstance: function(namedRootNodeProvider, visitedBranches) {
      return new Condition(this.attributes, this.conditionName, this.conditionArguments);
    }
  })
};
function parseRootNodes(definition) {
  const { placeholders, processedDefinition } = substituteStringLiterals(definition);
  const tokens = parseTokensFromDefinition(processedDefinition);
  if (tokens.length < 3) {
    throw new Error("invalid token count");
  }
  if (tokens.filter((token) => token === "{").length !== tokens.filter((token) => token === "}").length) {
    throw new Error("scope character mismatch");
  }
  const stack = [[]];
  while (tokens.length) {
    const token = tokens.shift();
    let node;
    switch (token.toUpperCase()) {
      case "ROOT":
        node = ASTNodeFactories.ROOT();
        stack[stack.length - 1].push(node);
        if (tokens[0] === "[") {
          const rootArguments = getArguments2(tokens, placeholders);
          if (rootArguments.length === 1 && rootArguments[0].type === "identifier") {
            node.name = rootArguments[0].value;
          } else {
            throw new Error("expected single root name argument");
          }
        }
        node.attributes = AttributeBuilder.parseFromTokens(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      case "BRANCH":
        node = ASTNodeFactories.BRANCH();
        stack[stack.length - 1].push(node);
        if (tokens[0] !== "[") {
          throw new Error("expected single branch name argument");
        }
        const branchArguments = getArguments2(tokens, placeholders);
        if (branchArguments.length === 1 && branchArguments[0].type === "identifier") {
          node.branchName = branchArguments[0].value;
        } else {
          throw new Error("expected single branch name argument");
        }
        break;
      case "SELECTOR":
        node = ASTNodeFactories.SELECTOR();
        stack[stack.length - 1].push(node);
        node.attributes = AttributeBuilder.parseFromTokens(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      case "SEQUENCE":
        node = ASTNodeFactories.SEQUENCE();
        stack[stack.length - 1].push(node);
        node.attributes = AttributeBuilder.parseFromTokens(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      case "PARALLEL":
        node = ASTNodeFactories.PARALLEL();
        stack[stack.length - 1].push(node);
        node.attributes = AttributeBuilder.parseFromTokens(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      case "LOTTO":
        node = ASTNodeFactories.LOTTO();
        stack[stack.length - 1].push(node);
        if (tokens[0] === "[") {
          node.tickets = getArguments2(
            tokens,
            placeholders,
            (arg) => arg.type === "number" && arg.isInteger,
            "lotto node ticket counts must be integer values"
          ).map((argument) => argument.value);
        }
        node.attributes = AttributeBuilder.parseFromTokens(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      case "CONDITION":
        node = ASTNodeFactories.CONDITION();
        stack[stack.length - 1].push(node);
        if (tokens[0] !== "[") {
          throw new Error("expected condition name identifier argument");
        }
        const conditionArguments = getArguments2(tokens, placeholders);
        if (conditionArguments.length && conditionArguments[0].type === "identifier") {
          node.conditionName = conditionArguments.shift().value;
        } else {
          throw new Error("expected condition name identifier argument");
        }
        conditionArguments.filter((arg) => arg.type === "identifier").forEach((arg) => {
          throw new Error(
            "invalid condition node argument value '" + arg.value + "', must be string, number, boolean or null"
          );
        });
        node.conditionArguments = conditionArguments;
        node.attributes = AttributeBuilder.parseFromTokens(tokens, placeholders);
        break;
      case "FLIP":
        node = ASTNodeFactories.FLIP();
        stack[stack.length - 1].push(node);
        node.attributes = AttributeBuilder.parseFromTokens(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      case "SUCCEED":
        node = ASTNodeFactories.SUCCEED();
        stack[stack.length - 1].push(node);
        node.attributes = AttributeBuilder.parseFromTokens(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      case "FAIL":
        node = ASTNodeFactories.FAIL();
        stack[stack.length - 1].push(node);
        node.attributes = AttributeBuilder.parseFromTokens(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      case "WAIT":
        node = ASTNodeFactories.WAIT();
        stack[stack.length - 1].push(node);
        const durations = getArguments2(
          tokens,
          placeholders,
          (arg) => arg.type === "number" && arg.isInteger,
          "wait node durations must be integer values"
        ).map((argument) => argument.value);
        if (durations.length === 1) {
          node.duration = durations[0];
        } else if (durations.length === 2) {
          node.duration = durations[0];
          node.longestDuration = durations[1];
        } else {
          throw new Error("invalid number of wait node duration arguments defined");
        }
        node.attributes = AttributeBuilder.parseFromTokens(tokens, placeholders);
        break;
      case "REPEAT":
        node = ASTNodeFactories.REPEAT();
        stack[stack.length - 1].push(node);
        if (tokens[0] === "[") {
          const iterationArguments = getArguments2(
            tokens,
            placeholders,
            (arg) => arg.type === "number" && arg.isInteger,
            "repeat node iteration counts must be integer values"
          ).map((argument) => argument.value);
          if (iterationArguments.length === 1) {
            node.iterations = iterationArguments[0];
          } else if (iterationArguments.length === 2) {
            node.iterations = iterationArguments[0];
            node.maximumIterations = iterationArguments[1];
          } else {
            throw new Error("invalid number of repeat node iteration count arguments defined");
          }
        }
        node.attributes = AttributeBuilder.parseFromTokens(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      case "RETRY":
        node = ASTNodeFactories.RETRY();
        stack[stack.length - 1].push(node);
        if (tokens[0] === "[") {
          const iterationArguments = getArguments2(
            tokens,
            placeholders,
            (arg) => arg.type === "number" && arg.isInteger,
            "retry node iteration counts must be integer values"
          ).map((argument) => argument.value);
          if (iterationArguments.length === 1) {
            node.iterations = iterationArguments[0];
          } else if (iterationArguments.length === 2) {
            node.iterations = iterationArguments[0];
            node.maximumIterations = iterationArguments[1];
          } else {
            throw new Error("invalid number of retry node iteration count arguments defined");
          }
        }
        node.attributes = AttributeBuilder.parseFromTokens(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      case "ACTION":
        node = ASTNodeFactories.ACTION();
        stack[stack.length - 1].push(node);
        if (tokens[0] !== "[") {
          throw new Error("expected action name identifier argument");
        }
        const actionArguments = getArguments2(tokens, placeholders);
        if (actionArguments.length && actionArguments[0].type === "identifier") {
          node.actionName = actionArguments.shift().value;
        } else {
          throw new Error("expected action name identifier argument");
        }
        actionArguments.filter((arg) => arg.type === "identifier").forEach((arg) => {
          throw new Error(
            "invalid action node argument value '" + arg.value + "', must be string, number, boolean or null"
          );
        });
        node.actionArguments = actionArguments;
        node.attributes = AttributeBuilder.parseFromTokens(tokens, placeholders);
        break;
      case "}":
        stack.pop();
        break;
      default:
        throw new Error("unexpected token: " + token);
    }
  }
  const validateASTNode = (node, depth) => {
    node.validate(depth);
    (node.children || []).forEach((child) => validateASTNode(child, depth + 1));
  };
  validateASTNode(
    {
      children: stack[0],
      validate: function(depth) {
        if (this.children.length === 0) {
          throw new Error("expected root node to have been defined");
        }
        for (const definitionLevelNode of this.children) {
          if (definitionLevelNode.type !== "root") {
            throw new Error("expected root node at base of definition");
          }
        }
        if (this.children.filter(function(definitionLevelNode) {
          return definitionLevelNode.name === null;
        }).length !== 1) {
          throw new Error("expected single unnamed root node at base of definition to act as main root");
        }
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
  return stack[0];
}
function popAndCheck(tokens, expected) {
  const popped = tokens.shift();
  if (popped === void 0) {
    throw new Error("unexpected end of definition");
  }
  if (expected !== void 0) {
    var tokenMatchesExpectation = [].concat(expected).some((item) => popped.toUpperCase() === item.toUpperCase());
    if (!tokenMatchesExpectation) {
      const expectationString = [].concat(expected).map((item) => "'" + item + "'").join(" or ");
      throw new Error("unexpected token found. Expected " + expected + " but got '" + popped + "'");
    }
  }
  return popped;
}
function getArguments2(tokens, stringArgumentPlaceholders, argumentValidator, validationFailedMessage) {
  const closer = popAndCheck(tokens, ["[", "("]) === "[" ? "]" : ")";
  const argumentListTokens = [];
  const argumentList = [];
  while (tokens.length && tokens[0] !== closer) {
    argumentListTokens.push(tokens.shift());
  }
  argumentListTokens.forEach((token, index) => {
    const shouldBeArgumentToken = !(index & 1);
    if (shouldBeArgumentToken) {
      const argumentDefinition = getArgumentDefinition(token, stringArgumentPlaceholders);
      if (argumentValidator && !argumentValidator(argumentDefinition)) {
        throw new Error(validationFailedMessage);
      }
      argumentList.push(argumentDefinition);
    } else {
      if (token !== ",") {
        throw new Error(`invalid argument list, expected ',' or ']' but got '${token}'`);
      }
    }
  });
  popAndCheck(tokens, closer);
  return argumentList;
}
function getArgumentDefinition(token, stringArgumentPlaceholders) {
  if (token === "null") {
    return {
      value: null,
      type: "null",
      toString: function() {
        return this.value;
      }
    };
  }
  if (token === "true" || token === "false") {
    return {
      value: token === "true",
      type: "boolean",
      toString: function() {
        return this.value;
      }
    };
  }
  if (!isNaN(token)) {
    return {
      value: parseFloat(token, 10),
      isInteger: parseFloat(token, 10) === parseInt(token, 10),
      type: "number",
      toString: function() {
        return this.value;
      }
    };
  }
  if (token.match(/^@@\d+@@$/g)) {
    return {
      value: stringArgumentPlaceholders[token].replace('\\"', '"'),
      type: "string",
      toString: function() {
        return '"' + this.value + '"';
      }
    };
  }
  return {
    value: token,
    type: "identifier",
    toString: function() {
      return this.value;
    }
  };
}
function substituteStringLiterals(definition) {
  const placeholders = {};
  const processedDefinition = definition.replace(/\"(\\.|[^"\\])*\"/g, (match) => {
    var strippedMatch = match.substring(1, match.length - 1);
    var placeholder = Object.keys(placeholders).find((key) => placeholders[key] === strippedMatch);
    if (!placeholder) {
      placeholder = `@@${Object.keys(placeholders).length}@@`;
      placeholders[placeholder] = strippedMatch;
    }
    return placeholder;
  });
  return { placeholders, processedDefinition };
}
function parseTokensFromDefinition(definition) {
  definition = definition.replace(/\(/g, " ( ");
  definition = definition.replace(/\)/g, " ) ");
  definition = definition.replace(/\{/g, " { ");
  definition = definition.replace(/\}/g, " } ");
  definition = definition.replace(/\]/g, " ] ");
  definition = definition.replace(/\[/g, " [ ");
  definition = definition.replace(/\,/g, " , ");
  return definition.replace(/\s+/g, " ").trim().split(" ");
}

// src/BehaviourTree.js
var _agent, _rootNode, _options, _createRootNode, createRootNode_fn, _applyLeafNodeGuardPaths, applyLeafNodeGuardPaths_fn;
var _BehaviourTree = class {
  constructor(definition, agent, options = {}) {
    __privateAdd(this, _agent, void 0);
    __privateAdd(this, _rootNode, void 0);
    __privateAdd(this, _options, void 0);
    var _a;
    __privateSet(this, _agent, agent);
    __privateSet(this, _options, options);
    if (typeof definition !== "string") {
      throw new Error("the tree definition must be a string");
    }
    if (typeof agent !== "object" || agent === null) {
      throw new Error("the agent must be defined and not null");
    }
    __privateSet(this, _rootNode, __privateMethod(_a = _BehaviourTree, _createRootNode, createRootNode_fn).call(_a, definition));
  }
  get rootNode() {
    return __privateGet(this, _rootNode);
  }
  isRunning() {
    return __privateGet(this, _rootNode).getState() === State.RUNNING;
  }
  getState() {
    return __privateGet(this, _rootNode).getState();
  }
  step() {
    if (__privateGet(this, _rootNode).getState() === State.SUCCEEDED || __privateGet(this, _rootNode).getState() === State.FAILED) {
      __privateGet(this, _rootNode).reset();
    }
    try {
      __privateGet(this, _rootNode).update(__privateGet(this, _agent), __privateGet(this, _options));
    } catch (exception) {
      throw new Error(`error stepping tree: ${exception.message}`);
    }
  }
  reset() {
    __privateGet(this, _rootNode).reset();
  }
  getFlattenedNodeDetails() {
    const flattenedTreeNodes = [];
    const processNode = (node, parentUid) => {
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
      if (!node.isLeafNode()) {
        node.getChildren().forEach((child) => processNode(child, node.getUid()));
      }
    };
    processNode(__privateGet(this, _rootNode), null);
    return flattenedTreeNodes;
  }
  static register(name, value) {
    if (typeof value === "function") {
      Lookup.setFunc(name, value);
    } else if (typeof value === "string") {
      let rootASTNodes;
      try {
        rootASTNodes = parseRootNodes(value);
      } catch (exception) {
        throw new Error(`error registering definition: ${exception.message}`);
      }
      if (rootASTNodes.length != 1 || rootASTNodes[0].name !== null) {
        throw new Error("error registering definition: expected a single unnamed root node");
      }
      Lookup.setSubtree(name, rootASTNodes[0]);
    } else {
      throw new Error("unexpected value, expected string definition or function");
    }
  }
  static unregister(name) {
    Lookup.remove(name);
  }
  static unregisterAll() {
    Lookup.empty();
  }
};
var BehaviourTree = _BehaviourTree;
_agent = new WeakMap();
_rootNode = new WeakMap();
_options = new WeakMap();
_createRootNode = new WeakSet();
createRootNode_fn = function(definition) {
  var _a;
  try {
    const rootNodes = parseRootNodes(definition);
    const mainRootNodeKey = Symbol("__root__");
    const rootNodeMap = {};
    for (const rootNode2 of rootNodes) {
      rootNodeMap[rootNode2.name === null ? mainRootNodeKey : rootNode2.name] = rootNode2;
    }
    const namedRootNodeProvider = function(name) {
      return rootNodeMap[name] ? rootNodeMap[name] : Lookup.getSubtree(name);
    };
    const rootNode = rootNodeMap[mainRootNodeKey].createNodeInstance(namedRootNodeProvider, []);
    __privateMethod(_a = _BehaviourTree, _applyLeafNodeGuardPaths, applyLeafNodeGuardPaths_fn).call(_a, rootNode);
    return rootNode;
  } catch (exception) {
    throw new Error(`error parsing tree: ${exception.message}`);
  }
};
_applyLeafNodeGuardPaths = new WeakSet();
applyLeafNodeGuardPaths_fn = function(rootNode) {
  const nodePaths = [];
  const findLeafNodes = (path, node) => {
    path = path.concat(node);
    if (node.isLeafNode()) {
      nodePaths.push(path);
    } else {
      node.getChildren().forEach((child) => findLeafNodes(path, child));
    }
  };
  findLeafNodes([], rootNode);
  nodePaths.forEach((path) => {
    for (let depth = 0; depth < path.length; depth++) {
      const currentNode = path[depth];
      if (currentNode.hasGuardPath()) {
        continue;
      }
      const guardPath = new GuardPath(
        path.slice(0, depth + 1).map((node) => ({
          node,
          guards: node.getAttributes().filter((attribute) => attribute.isGuard())
        })).filter((details) => details.guards.length > 0)
      );
      currentNode.setGuardPath(guardPath);
    }
  });
};
__privateAdd(BehaviourTree, _createRootNode);
__privateAdd(BehaviourTree, _applyLeafNodeGuardPaths);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BehaviourTree,
  State
});
//# sourceMappingURL=index.js.map
