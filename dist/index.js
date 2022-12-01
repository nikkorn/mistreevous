"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
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
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/index.ts
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

// src/state.ts
var State = {
  READY: Symbol("mistreevous.ready"),
  RUNNING: Symbol("mistreevous.running"),
  SUCCEEDED: Symbol("mistreevous.succeeded"),
  FAILED: Symbol("mistreevous.failed")
};

// src/nodes/node.ts
var Node = class {
  constructor(type, decorators, args) {
    this.type = type;
    this.decorators = decorators;
    this.args = args;
  }
  uid = createNodeUid();
  state = State.READY;
  guardPath;
  getState = () => this.state;
  setState = (value) => this.state = value;
  getUid = () => this.uid;
  getType = () => this.type;
  getDecorators = () => this.decorators || [];
  getArguments = () => this.args || [];
  getDecorator(type) {
    return this.getDecorators().filter((decorator) => decorator.getType().toUpperCase() === type.toUpperCase())[0] || null;
  }
  getGuardDecorators = () => this.getDecorators().filter((decorator) => decorator.isGuard());
  setGuardPath = (value) => this.guardPath = value;
  hasGuardPath = () => !!this.guardPath;
  is = (value) => this.state === value;
  reset = () => this.setState(State.READY);
  abort = (agent) => {
    if (!this.is(State.RUNNING)) {
      return;
    }
    this.reset();
    const exitDecorator = this.getDecorator("exit");
    if (exitDecorator) {
      exitDecorator.callAgentFunction(agent, false, true);
    }
  };
  update = (agent) => {
    if (this.is(State.SUCCEEDED) || this.is(State.FAILED)) {
      return {};
    }
    try {
      this.guardPath.evaluate(agent);
      if (this.is(State.READY)) {
        const entryDecorator = this.getDecorator("entry");
        if (entryDecorator) {
          entryDecorator.callAgentFunction(agent);
        }
      }
      const stepDecorator = this.getDecorator("step");
      if (stepDecorator) {
        stepDecorator.callAgentFunction(agent);
      }
      this.onUpdate(agent);
      if (this.is(State.SUCCEEDED) || this.is(State.FAILED)) {
        const exitDecorator = this.getDecorator("exit");
        if (exitDecorator) {
          exitDecorator.callAgentFunction(agent, this.is(State.SUCCEEDED), false);
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
};
function createNodeUid() {
  var S4 = function() {
    return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1);
  };
  return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

// src/nodes/leaf/leaf.ts
var Leaf = class extends Node {
  isLeafNode = () => true;
};

// src/lookup.ts
var Lookup = class {
  static getFunc(name) {
    return this.functionTable[name];
  }
  static setFunc(name, func) {
    this.functionTable[name] = func;
  }
  static getFuncInvoker(agent, name) {
    if (agent[name] && typeof agent[name] === "function") {
      return (args) => agent[name].apply(
        agent,
        args.map((arg) => arg.value)
      );
    }
    if (this.functionTable[name] && typeof this.functionTable[name] === "function") {
      return (args) => this.functionTable[name](agent, ...args.map((arg) => arg.value));
    }
    return null;
  }
  static getSubtree(name) {
    return this.subtreeTable[name];
  }
  static setSubtree(name, subtree) {
    this.subtreeTable[name] = subtree;
  }
  static remove(name) {
    delete this.functionTable[name];
    delete this.subtreeTable[name];
  }
  static empty() {
    this.functionTable = {};
    this.subtreeTable = {};
  }
};
__publicField(Lookup, "functionTable", {});
__publicField(Lookup, "subtreeTable", {});

// src/nodes/leaf/action.ts
var Action = class extends Leaf {
  constructor(decorators, actionName, actionArguments) {
    super("action", decorators, actionArguments);
    this.actionName = actionName;
    this.actionArguments = actionArguments;
  }
  isUsingUpdatePromise = false;
  updatePromiseStateResult = null;
  onUpdate = (agent) => {
    if (this.isUsingUpdatePromise) {
      if (this.updatePromiseStateResult) {
        this.setState(this.updatePromiseStateResult);
      }
      return;
    }
    const actionFuncInvoker = Lookup.getFuncInvoker(agent, this.actionName);
    if (actionFuncInvoker === null) {
      throw new Error(
        `cannot update action node as the action '${this.actionName}' function is not defined on the agent and has not been registered`
      );
    }
    const updateResult = actionFuncInvoker(this.actionArguments);
    if (updateResult instanceof Promise) {
      updateResult.then(
        (result) => {
          if (!this.isUsingUpdatePromise) {
            return;
          }
          if (result !== State.SUCCEEDED && result !== State.FAILED) {
            throw new Error(
              "action node promise resolved with an invalid value, expected a State.SUCCEEDED or State.FAILED value to be returned"
            );
          }
          this.updatePromiseStateResult = result;
        },
        (reason) => {
          if (!this.isUsingUpdatePromise) {
            return;
          }
          throw new Error(reason);
        }
      );
      this.setState(State.RUNNING);
      this.isUsingUpdatePromise = true;
    } else {
      this.validateUpdateResult(updateResult);
      this.setState(updateResult || State.RUNNING);
    }
  };
  getName = () => this.actionName;
  reset = () => {
    this.setState(State.READY);
    this.isUsingUpdatePromise = false;
    this.updatePromiseStateResult = null;
  };
  validateUpdateResult = (result) => {
    switch (result) {
      case State.SUCCEEDED:
      case State.FAILED:
      case void 0:
        return;
      default:
        throw new Error(
          `action '${this.actionName}' 'onUpdate' returned an invalid response, expected an optional State.SUCCEEDED or State.FAILED value to be returned`
        );
    }
  };
};

// src/nodes/leaf/condition.ts
var Condition = class extends Leaf {
  constructor(decorators, conditionName, conditionArguments) {
    super("condition", decorators, conditionArguments);
    this.conditionName = conditionName;
    this.conditionArguments = conditionArguments;
  }
  onUpdate = (agent) => {
    const conditionFuncInvoker = Lookup.getFuncInvoker(agent, this.conditionName);
    if (conditionFuncInvoker === null) {
      throw new Error(
        `cannot update condition node as the condition '${this.conditionName}' function is not defined on the agent and has not been registered`
      );
    }
    this.setState(!!conditionFuncInvoker(this.conditionArguments) ? State.SUCCEEDED : State.FAILED);
  };
  getName = () => this.conditionName;
};

// src/nodes/leaf/wait.ts
var Wait = class extends Leaf {
  constructor(decorators, duration, longestDuration) {
    super("wait", decorators, []);
    this.duration = duration;
    this.longestDuration = longestDuration;
  }
  initialUpdateTime;
  waitDuration;
  onUpdate = () => {
    if (this.is(State.READY)) {
      this.initialUpdateTime = new Date().getTime();
      this.waitDuration = this.longestDuration ? Math.floor(Math.random() * (this.longestDuration - this.duration + 1) + this.duration) : this.duration;
      this.setState(State.RUNNING);
    }
    if (new Date().getTime() >= this.initialUpdateTime + this.waitDuration) {
      this.setState(State.SUCCEEDED);
    }
  };
  getName = () => `WAIT ${this.longestDuration ? this.duration + "ms-" + this.longestDuration + "ms" : this.duration + "ms"}`;
};

// src/nodes/decorator/decorator.ts
var Decorator = class extends Node {
  constructor(type, decorators, child) {
    super(type, decorators, []);
    this.child = child;
  }
  isLeafNode = () => false;
  getChildren = () => [this.child];
  reset = () => {
    this.setState(State.READY);
    this.child.reset();
  };
  abort = (agent) => {
    if (!this.is(State.RUNNING)) {
      return;
    }
    this.child.abort(agent);
    this.reset();
    const exitDecorator = this.getDecorator("exit");
    if (exitDecorator) {
      exitDecorator.callAgentFunction(agent, false, true);
    }
  };
};

// src/nodes/decorator/root.ts
var Root = class extends Decorator {
  constructor(decorators, child) {
    super("root", decorators, child);
  }
  onUpdate = (agent) => {
    if (this.child.getState() === State.READY || this.child.getState() === State.RUNNING) {
      this.child.update(agent);
    }
    this.setState(this.child.getState());
  };
  getName = () => "ROOT";
};

// src/nodes/decorator/repeat.ts
var Repeat = class extends Decorator {
  constructor(decorators, iterations, maximumIterations, child) {
    super("repeat", decorators, child);
    this.iterations = iterations;
    this.maximumIterations = maximumIterations;
  }
  targetIterationCount = null;
  currentIterationCount = 0;
  onUpdate = (agent) => {
    if (this.is(State.READY)) {
      this.child.reset();
      this.setTargetIterationCount();
    }
    if (this.canIterate()) {
      this.setState(State.RUNNING);
      if (this.child.getState() === State.SUCCEEDED) {
        this.child.reset();
      }
      this.child.update(agent);
      if (this.child.getState() === State.FAILED) {
        this.setState(State.FAILED);
        return;
      } else if (this.child.getState() === State.SUCCEEDED) {
        this.currentIterationCount += 1;
      }
    } else {
      this.setState(State.SUCCEEDED);
    }
  };
  getName = () => {
    if (this.iterations !== null) {
      return `REPEAT ${this.maximumIterations ? this.iterations + "x-" + this.maximumIterations + "x" : this.iterations + "x"}`;
    }
    return "REPEAT";
  };
  reset = () => {
    this.setState(State.READY);
    this.currentIterationCount = 0;
    this.child.reset();
  };
  canIterate = () => {
    if (this.targetIterationCount !== null) {
      return this.currentIterationCount < this.targetIterationCount;
    }
    return true;
  };
  setTargetIterationCount = () => {
    if (typeof this.iterations === "number") {
      this.targetIterationCount = typeof this.maximumIterations === "number" ? Math.floor(Math.random() * (this.maximumIterations - this.iterations + 1) + this.iterations) : this.iterations;
    } else {
      this.targetIterationCount = null;
    }
  };
};

// src/nodes/decorator/retry.ts
var Retry = class extends Decorator {
  constructor(decorators, iterations, maximumIterations, child) {
    super("retry", decorators, child);
    this.iterations = iterations;
    this.maximumIterations = maximumIterations;
  }
  targetIterationCount = null;
  currentIterationCount = 0;
  onUpdate = (agent) => {
    if (this.is(State.READY)) {
      this.child.reset();
      this.setTargetIterationCount();
    }
    if (this.canIterate()) {
      this.setState(State.RUNNING);
      if (this.child.getState() === State.FAILED) {
        this.child.reset();
      }
      this.child.update(agent);
      if (this.child.getState() === State.SUCCEEDED) {
        this.setState(State.SUCCEEDED);
        return;
      } else if (this.child.getState() === State.FAILED) {
        this.currentIterationCount += 1;
      }
    } else {
      this.setState(State.FAILED);
    }
  };
  getName = () => {
    if (this.iterations !== null) {
      return `RETRY ${this.maximumIterations ? this.iterations + "x-" + this.maximumIterations + "x" : this.iterations + "x"}`;
    }
    return "RETRY";
  };
  reset = () => {
    this.setState(State.READY);
    this.currentIterationCount = 0;
    this.child.reset();
  };
  canIterate = () => {
    if (this.targetIterationCount !== null) {
      return this.currentIterationCount < this.targetIterationCount;
    }
    return true;
  };
  setTargetIterationCount = () => {
    if (typeof this.iterations === "number") {
      this.targetIterationCount = typeof this.maximumIterations === "number" ? Math.floor(Math.random() * (this.maximumIterations - this.iterations + 1) + this.iterations) : this.iterations;
    } else {
      this.targetIterationCount = null;
    }
  };
};

// src/nodes/decorator/flip.ts
var Flip = class extends Decorator {
  constructor(decorators, child) {
    super("flip", decorators, child);
  }
  onUpdate = (agent) => {
    if (this.child.getState() === State.READY || this.child.getState() === State.RUNNING) {
      this.child.update(agent);
    }
    switch (this.child.getState()) {
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
  getName = () => "FLIP";
};

// src/nodes/decorator/succeed.ts
var Succeed = class extends Decorator {
  constructor(decorators, child) {
    super("succeed", decorators, child);
  }
  onUpdate = (agent) => {
    if (this.child.getState() === State.READY || this.child.getState() === State.RUNNING) {
      this.child.update(agent);
    }
    switch (this.child.getState()) {
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
  getName = () => "SUCCEED";
};

// src/nodes/decorator/fail.ts
var Fail = class extends Decorator {
  constructor(decorators, child) {
    super("fail", decorators, child);
  }
  onUpdate = (agent) => {
    if (this.child.getState() === State.READY || this.child.getState() === State.RUNNING) {
      this.child.update(agent);
    }
    switch (this.child.getState()) {
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
  getName = () => "FAIL";
};

// src/nodes/composite/composite.ts
var Composite = class extends Node {
  constructor(type, decorators, children) {
    super(type, decorators, []);
    this.children = children;
  }
  isLeafNode = () => false;
  getChildren = () => this.children;
  reset = () => {
    this.setState(State.READY);
    this.getChildren().forEach((child) => child.reset());
  };
  abort = (agent) => {
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
};

// src/nodes/composite/lotto.ts
var Lotto = class extends Composite {
  constructor(decorators, tickets, children) {
    super("lotto", decorators, children);
    this.tickets = tickets;
  }
  winningChild;
  onUpdate = (agent) => {
    if (this.is(State.READY)) {
      const lottoDraw = new LottoDraw();
      this.children.forEach((child, index) => lottoDraw.add(child, this.tickets[index] || 1));
      this.winningChild = lottoDraw.draw();
    }
    if (this.winningChild.getState() === State.READY || this.winningChild.getState() === State.RUNNING) {
      this.winningChild.update(agent);
    }
    this.setState(this.winningChild.getState());
  };
  getName = () => this.tickets.length ? `LOTTO [${this.tickets.join(",")}]` : "LOTTO";
};
var LottoDraw = class {
  participants = [];
  add = (participant, tickets) => {
    this.participants.push({ participant, tickets });
    return this;
  };
  draw = () => {
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
  getRandomItem = (items) => {
    if (!items.length) {
      return void 0;
    }
    return items[Math.floor(Math.random() * items.length)];
  };
};

// src/nodes/composite/selector.ts
var Selector = class extends Composite {
  constructor(decorators, children) {
    super("selector", decorators, children);
    this.children = children;
  }
  onUpdate = (agent) => {
    for (const child of this.children) {
      if (child.getState() === State.READY || child.getState() === State.RUNNING) {
        child.update(agent);
      }
      if (child.getState() === State.SUCCEEDED) {
        this.setState(State.SUCCEEDED);
        return;
      }
      if (child.getState() === State.FAILED) {
        if (this.children.indexOf(child) === this.children.length - 1) {
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
  getName = () => "SELECTOR";
};

// src/nodes/composite/sequence.ts
var Sequence = class extends Composite {
  constructor(decorators, children) {
    super("sequence", decorators, children);
    this.children = children;
  }
  onUpdate = (agent) => {
    for (const child of this.children) {
      if (child.getState() === State.READY || child.getState() === State.RUNNING) {
        child.update(agent);
      }
      if (child.getState() === State.SUCCEEDED) {
        if (this.children.indexOf(child) === this.children.length - 1) {
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
  getName = () => "SEQUENCE";
};

// src/nodes/composite/parallel.ts
var Parallel = class extends Composite {
  constructor(decorators, children) {
    super("parallel", decorators, children);
  }
  onUpdate = (agent) => {
    let succeededCount = 0;
    let hasChildFailed = false;
    for (const child of this.children) {
      if (child.getState() === State.READY || child.getState() === State.RUNNING) {
        child.update(agent);
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
      for (const child of this.children) {
        if (child.getState() === State.RUNNING) {
          child.abort(agent);
        }
      }
    } else {
      this.setState(succeededCount === this.children.length ? State.SUCCEEDED : State.RUNNING);
    }
  };
  getName = () => "PARALLEL";
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

// src/attributes/guards/while.ts
var While = class extends Guard {
  constructor(condition, args) {
    super("while", args);
    this.condition = condition;
  }
  isGuard = () => true;
  getCondition = () => this.condition;
  getDetails = () => {
    return {
      type: this.getType(),
      isGuard: this.isGuard(),
      condition: this.getCondition(),
      arguments: this.getArguments()
    };
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
  getCondition = () => this.condition;
  getDetails = () => {
    return {
      type: this.getType(),
      isGuard: this.isGuard(),
      condition: this.getCondition(),
      arguments: this.getArguments()
    };
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
  getFunctionName = () => this.functionName;
  getDetails = () => {
    return {
      type: this.getType(),
      isGuard: this.isGuard(),
      functionName: this.getFunctionName(),
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
  getFunctionName = () => this.functionName;
  getDetails = () => {
    return {
      type: this.getType(),
      isGuard: this.isGuard(),
      functionName: this.getFunctionName(),
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
  getFunctionName = () => this.functionName;
  getDetails = () => {
    return {
      type: this.getType(),
      isGuard: this.isGuard(),
      functionName: this.getFunctionName(),
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

// src/rootAstNodesBuilder.ts
var DecoratorFactories = {
  WHILE: (condition, decoratorArguments) => new While(condition, decoratorArguments),
  UNTIL: (condition, decoratorArguments) => new Until(condition, decoratorArguments),
  ENTRY: (functionName, decoratorArguments) => new Entry(functionName, decoratorArguments),
  EXIT: (functionName, decoratorArguments) => new Exit(functionName, decoratorArguments),
  STEP: (functionName, decoratorArguments) => new Step(functionName, decoratorArguments)
};
var ASTNodeFactories = {
  ROOT: () => ({
    type: "root",
    decorators: [],
    name: null,
    children: [],
    validate(depth) {
      if (depth > 1) {
        throw new Error("a root node cannot be the child of another node");
      }
      if (this.children.length !== 1) {
        throw new Error("a root node must have a single child");
      }
    },
    createNodeInstance(namedRootNodeProvider, visitedBranches) {
      return new Root(
        this.decorators,
        this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
      );
    }
  }),
  BRANCH: () => ({
    type: "branch",
    branchName: "",
    validate() {
    },
    createNodeInstance(namedRootNodeProvider, visitedBranches) {
      const targetRootNode = namedRootNodeProvider(this.branchName);
      if (visitedBranches.indexOf(this.branchName) !== -1) {
        throw new Error(
          `circular dependency found in branch node references for branch '${this.branchName}'`
        );
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
    decorators: [],
    children: [],
    validate() {
      if (this.children.length < 1) {
        throw new Error("a selector node must have at least a single child");
      }
    },
    createNodeInstance(namedRootNodeProvider, visitedBranches) {
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
    validate() {
      if (this.children.length < 1) {
        throw new Error("a sequence node must have at least a single child");
      }
    },
    createNodeInstance(namedRootNodeProvider, visitedBranches) {
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
    validate() {
      if (this.children.length < 1) {
        throw new Error("a parallel node must have at least a single child");
      }
    },
    createNodeInstance(namedRootNodeProvider, visitedBranches) {
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
    validate() {
      if (this.children.length < 1) {
        throw new Error("a lotto node must have at least a single child");
      }
    },
    createNodeInstance(namedRootNodeProvider, visitedBranches) {
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
    validate() {
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
    createNodeInstance(namedRootNodeProvider, visitedBranches) {
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
    validate() {
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
    createNodeInstance(namedRootNodeProvider, visitedBranches) {
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
    validate() {
      if (this.children.length !== 1) {
        throw new Error("a flip node must have a single child");
      }
    },
    createNodeInstance(namedRootNodeProvider, visitedBranches) {
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
    validate() {
      if (this.children.length !== 1) {
        throw new Error("a succeed node must have a single child");
      }
    },
    createNodeInstance(namedRootNodeProvider, visitedBranches) {
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
    validate() {
      if (this.children.length !== 1) {
        throw new Error("a fail node must have a single child");
      }
    },
    createNodeInstance(namedRootNodeProvider, visitedBranches) {
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
    validate() {
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
    createNodeInstance() {
      return new Wait(this.decorators, this.duration, this.longestDuration);
    }
  }),
  ACTION: () => ({
    type: "action",
    decorators: [],
    actionName: "",
    actionArguments: [],
    validate() {
    },
    createNodeInstance() {
      return new Action(this.decorators, this.actionName, this.actionArguments);
    }
  }),
  CONDITION: () => ({
    type: "condition",
    decorators: [],
    conditionName: "",
    conditionArguments: [],
    validate() {
    },
    createNodeInstance() {
      return new Condition(this.decorators, this.conditionName, this.conditionArguments);
    }
  })
};
function buildRootASTNodes(definition) {
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
          const rootArguments = getArguments(tokens, placeholders);
          if (rootArguments.length === 1 && rootArguments[0].type === "identifier") {
            node.name = rootArguments[0].value;
          } else {
            throw new Error("expected single root name argument");
          }
        }
        node.decorators = getDecorators(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      case "BRANCH":
        node = ASTNodeFactories.BRANCH();
        stack[stack.length - 1].push(node);
        if (tokens[0] !== "[") {
          throw new Error("expected single branch name argument");
        }
        const branchArguments = getArguments(tokens, placeholders);
        if (branchArguments.length === 1 && branchArguments[0].type === "identifier") {
          node.branchName = branchArguments[0].value;
        } else {
          throw new Error("expected single branch name argument");
        }
        break;
      case "SELECTOR":
        node = ASTNodeFactories.SELECTOR();
        stack[stack.length - 1].push(node);
        node.decorators = getDecorators(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      case "SEQUENCE":
        node = ASTNodeFactories.SEQUENCE();
        stack[stack.length - 1].push(node);
        node.decorators = getDecorators(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      case "PARALLEL":
        node = ASTNodeFactories.PARALLEL();
        stack[stack.length - 1].push(node);
        node.decorators = getDecorators(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      case "LOTTO":
        node = ASTNodeFactories.LOTTO();
        stack[stack.length - 1].push(node);
        if (tokens[0] === "[") {
          node.tickets = getArguments(
            tokens,
            placeholders,
            (arg) => arg.type === "number" && !!arg.isInteger,
            "lotto node ticket counts must be integer values"
          ).map((argument) => argument.value);
        }
        node.decorators = getDecorators(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      case "CONDITION":
        node = ASTNodeFactories.CONDITION();
        stack[stack.length - 1].push(node);
        if (tokens[0] !== "[") {
          throw new Error("expected condition name identifier argument");
        }
        const conditionArguments = getArguments(tokens, placeholders);
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
        node.decorators = getDecorators(tokens, placeholders);
        break;
      case "FLIP":
        node = ASTNodeFactories.FLIP();
        stack[stack.length - 1].push(node);
        node.decorators = getDecorators(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      case "SUCCEED":
        node = ASTNodeFactories.SUCCEED();
        stack[stack.length - 1].push(node);
        node.decorators = getDecorators(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      case "FAIL":
        node = ASTNodeFactories.FAIL();
        stack[stack.length - 1].push(node);
        node.decorators = getDecorators(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      case "WAIT":
        node = ASTNodeFactories.WAIT();
        stack[stack.length - 1].push(node);
        const durations = getArguments(
          tokens,
          placeholders,
          (arg) => arg.type === "number" && !!arg.isInteger,
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
        node.decorators = getDecorators(tokens, placeholders);
        break;
      case "REPEAT":
        node = ASTNodeFactories.REPEAT();
        stack[stack.length - 1].push(node);
        if (tokens[0] === "[") {
          const iterationArguments = getArguments(
            tokens,
            placeholders,
            (arg) => arg.type === "number" && !!arg.isInteger,
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
        node.decorators = getDecorators(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      case "RETRY":
        node = ASTNodeFactories.RETRY();
        stack[stack.length - 1].push(node);
        if (tokens[0] === "[") {
          const iterationArguments = getArguments(
            tokens,
            placeholders,
            (arg) => arg.type === "number" && !!arg.isInteger,
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
        node.decorators = getDecorators(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      case "ACTION":
        node = ASTNodeFactories.ACTION();
        stack[stack.length - 1].push(node);
        if (tokens[0] !== "[") {
          throw new Error("expected action name identifier argument");
        }
        const actionArguments = getArguments(tokens, placeholders);
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
        node.decorators = getDecorators(tokens, placeholders);
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
      validate() {
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
      throw new Error("unexpected token found. Expected " + expectationString + " but got '" + popped + "'");
    }
  }
  return popped;
}
function getArguments(tokens, stringArgumentPlaceholders, argumentValidator, validationFailedMessage) {
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
      toString() {
        return this.value;
      }
    };
  }
  if (token === "true" || token === "false") {
    return {
      value: token === "true",
      type: "boolean",
      toString() {
        return this.value;
      }
    };
  }
  if (!isNaN(token)) {
    return {
      value: parseFloat(token),
      isInteger: parseFloat(token) === parseInt(token, 10),
      type: "number",
      toString() {
        return this.value;
      }
    };
  }
  if (token.match(/^@@\d+@@$/g)) {
    return {
      value: stringArgumentPlaceholders[token].replace('\\"', '"'),
      type: "string",
      toString() {
        return '"' + this.value + '"';
      }
    };
  }
  return {
    value: token,
    type: "identifier",
    toString() {
      return this.value;
    }
  };
}
function getDecorators(tokens, stringArgumentPlaceholders) {
  const decorators = [];
  const decoratorsFound = [];
  let decoratorFactory = DecoratorFactories[(tokens[0] || "").toUpperCase()];
  while (decoratorFactory) {
    if (decoratorsFound.indexOf(tokens[0].toUpperCase()) !== -1) {
      throw new Error(`duplicate decorator '${tokens[0].toUpperCase()}' found for node`);
    }
    decoratorsFound.push(tokens.shift().toUpperCase());
    const decoratorArguments = getArguments(tokens, stringArgumentPlaceholders);
    if (decoratorArguments.length === 0 || decoratorArguments[0].type !== "identifier") {
      throw new Error("expected agent function name identifier argument for decorator");
    }
    const decoratorFunctionName = decoratorArguments.shift();
    decoratorArguments.filter((arg) => arg.type === "identifier").forEach((arg) => {
      throw new Error(
        "invalid decorator argument value '" + arg.value + "', must be string, number, boolean or null"
      );
    });
    decorators.push(decoratorFactory(decoratorFunctionName, decoratorArguments));
    decoratorFactory = DecoratorFactories[(tokens[0] || "").toUpperCase()];
  }
  return decorators;
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

// src/behaviourTree.ts
var BehaviourTree = class {
  constructor(definition, agent) {
    this.agent = agent;
    if (typeof definition !== "string") {
      throw new Error("the tree definition must be a string");
    }
    if (typeof agent !== "object" || agent === null) {
      throw new Error("the agent must be defined and not null");
    }
    this.rootNode = BehaviourTree.createRootNode(definition);
  }
  rootNode;
  isRunning() {
    return this.rootNode.getState() === State.RUNNING;
  }
  getState() {
    return this.rootNode.getState();
  }
  step() {
    if (this.rootNode.getState() === State.SUCCEEDED || this.rootNode.getState() === State.FAILED) {
      this.rootNode.reset();
    }
    try {
      this.rootNode.update(this.agent);
    } catch (exception) {
      throw new Error(`error stepping tree: ${exception.message}`);
    }
  }
  reset() {
    this.rootNode.reset();
  }
  getFlattenedNodeDetails() {
    const flattenedTreeNodes = [];
    const processNode = (node, parentUid) => {
      const getDecoratorDetails = (decorators) => decorators.length > 0 ? decorators.map((decorator) => decorator.getDetails()) : null;
      flattenedTreeNodes.push({
        id: node.getUid(),
        type: node.getType(),
        caption: node.getName(),
        state: node.getState(),
        decorators: getDecoratorDetails(node.getDecorators()),
        arguments: node.getArguments(),
        parentId: parentUid
      });
      if (!node.isLeafNode()) {
        node.getChildren().forEach((child) => processNode(child, node.getUid()));
      }
    };
    processNode(this.rootNode, null);
    return flattenedTreeNodes;
  }
  static register(name, value) {
    if (typeof value === "function") {
      Lookup.setFunc(name, value);
    } else if (typeof value === "string") {
      let rootASTNodes;
      try {
        rootASTNodes = buildRootASTNodes(value);
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
  static createRootNode(definition) {
    try {
      const rootASTNodes = buildRootASTNodes(definition);
      const mainRootNodeKey = Symbol("__root__");
      const rootNodeMap = {};
      for (const rootASTNode of rootASTNodes) {
        rootNodeMap[rootASTNode.name === null ? mainRootNodeKey : rootASTNode.name] = rootASTNode;
      }
      const namedRootNodeProvider = function(name) {
        return rootNodeMap[name] ? rootNodeMap[name] : Lookup.getSubtree(name);
      };
      const rootNode = rootNodeMap[mainRootNodeKey].createNodeInstance(namedRootNodeProvider, []);
      BehaviourTree.applyLeafNodeGuardPaths(rootNode);
      return rootNode;
    } catch (exception) {
      throw new Error(`error parsing tree: ${exception.message}
${exception.stack}`);
    }
  }
  static applyLeafNodeGuardPaths(rootNode) {
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
          path.slice(0, depth + 1).map((node) => ({ node, guards: node.getGuardDecorators() })).filter((details) => details.guards.length > 0)
        );
        currentNode.setGuardPath(guardPath);
      }
    });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BehaviourTree,
  State
});
//# sourceMappingURL=index.js.map
