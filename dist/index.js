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

// src/attributes/guards/GuardUnsatisifedException.ts
var GuardUnsatisifedException = class extends Error {
  constructor(source) {
    super("A guard path condition has failed");
    this.source = source;
  }
  isSourceNode = (node) => node === this.source;
};

// src/attributes/guards/GuardPath.ts
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

// src/State.ts
var State = /* @__PURE__ */ ((State2) => {
  State2["READY"] = "mistreevous.ready";
  State2["RUNNING"] = "mistreevous.running";
  State2["SUCCEEDED"] = "mistreevous.succeeded";
  State2["FAILED"] = "mistreevous.failed";
  return State2;
})(State || {});

// src/nodes/Node.ts
var Node = class {
  constructor(type, attributes, args) {
    this.type = type;
    this.attributes = attributes;
    this.args = args;
  }
  uid = createNodeUid();
  state = "mistreevous.ready" /* READY */;
  guardPath;
  getState = () => this.state;
  setState = (value) => {
    this.state = value;
  };
  getUid = () => this.uid;
  getType = () => this.type;
  getAttributes = () => this.attributes;
  getArguments = () => this.args;
  getAttribute(type) {
    return this.getAttributes().filter((decorator) => decorator.getType().toUpperCase() === type.toUpperCase())[0] || null;
  }
  getGuardAttributes = () => this.getAttributes().filter((decorator) => decorator.isGuard());
  setGuardPath = (value) => this.guardPath = value;
  hasGuardPath = () => !!this.guardPath;
  is(value) {
    return this.state === value;
  }
  reset() {
    this.setState("mistreevous.ready" /* READY */);
  }
  abort(agent) {
    if (!this.is("mistreevous.running" /* RUNNING */)) {
      return;
    }
    this.reset();
    this.getAttribute("exit")?.callAgentFunction(agent, false, true);
  }
  update(agent, options) {
    if (this.is("mistreevous.succeeded" /* SUCCEEDED */) || this.is("mistreevous.failed" /* FAILED */)) {
      return;
    }
    try {
      this.guardPath.evaluate(agent);
      if (this.is("mistreevous.ready" /* READY */)) {
        this.getAttribute("entry")?.callAgentFunction(agent);
      }
      this.getAttribute("step")?.callAgentFunction(agent);
      this.onUpdate(agent, options);
      if (this.is("mistreevous.succeeded" /* SUCCEEDED */) || this.is("mistreevous.failed" /* FAILED */)) {
        this.getAttribute("exit")?.callAgentFunction(agent, this.is("mistreevous.succeeded" /* SUCCEEDED */), false);
      }
    } catch (error) {
      if (error instanceof GuardUnsatisifedException && error.isSourceNode(this)) {
        this.abort(agent);
        this.setState("mistreevous.failed" /* FAILED */);
      } else {
        throw error;
      }
    }
  }
};
function createNodeUid() {
  var S4 = function() {
    return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1);
  };
  return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

// src/nodes/leaf/Leaf.ts
var Leaf = class extends Node {
  isLeafNode = () => true;
};

// src/Lookup.ts
var Lookup = class {
  static getFunc(name) {
    return this.functionTable[name];
  }
  static setFunc(name, func) {
    this.functionTable[name] = func;
  }
  static getFuncInvoker(agent, name) {
    const foundOnAgent = agent[name];
    if (foundOnAgent && typeof foundOnAgent === "function") {
      return (args) => foundOnAgent.apply(
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

// src/nodes/leaf/Action.ts
var Action = class extends Leaf {
  constructor(attributes, actionName, actionArguments) {
    super("action", attributes, actionArguments);
    this.actionName = actionName;
    this.actionArguments = actionArguments;
  }
  isUsingUpdatePromise = false;
  updatePromiseStateResult = null;
  onUpdate(agent, options) {
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
          if (result !== "mistreevous.succeeded" /* SUCCEEDED */ && result !== "mistreevous.failed" /* FAILED */) {
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
      this.setState("mistreevous.running" /* RUNNING */);
      this.isUsingUpdatePromise = true;
    } else {
      this.validateUpdateResult(updateResult);
      this.setState(updateResult || "mistreevous.running" /* RUNNING */);
    }
  }
  getName = () => this.actionName;
  reset = () => {
    this.setState("mistreevous.ready" /* READY */);
    this.isUsingUpdatePromise = false;
    this.updatePromiseStateResult = null;
  };
  validateUpdateResult = (result) => {
    switch (result) {
      case "mistreevous.succeeded" /* SUCCEEDED */:
      case "mistreevous.failed" /* FAILED */:
      case void 0:
        return;
      default:
        throw new Error(
          `action '${this.actionName}' 'onUpdate' returned an invalid response, expected an optional State.SUCCEEDED or State.FAILED value to be returned`
        );
    }
  };
};

// src/nodes/leaf/Condition.ts
var Condition = class extends Leaf {
  constructor(attributes, conditionName, conditionArguments) {
    super("condition", attributes, conditionArguments);
    this.conditionName = conditionName;
    this.conditionArguments = conditionArguments;
  }
  onUpdate(agent, options) {
    const conditionFuncInvoker = Lookup.getFuncInvoker(agent, this.conditionName);
    if (conditionFuncInvoker === null) {
      throw new Error(
        `cannot update condition node as the condition '${this.conditionName}' function is not defined on the agent and has not been registered`
      );
    }
    this.setState(!!conditionFuncInvoker(this.conditionArguments) ? "mistreevous.succeeded" /* SUCCEEDED */ : "mistreevous.failed" /* FAILED */);
  }
  getName = () => this.conditionName;
};

// src/nodes/leaf/Wait.ts
var Wait = class extends Leaf {
  constructor(attributes, duration, longestDuration) {
    super("wait", attributes, []);
    this.duration = duration;
    this.longestDuration = longestDuration;
  }
  initialUpdateTime = 0;
  totalDuration = 0;
  waitedDuration = 0;
  onUpdate(agent, options) {
    if (this.is("mistreevous.ready" /* READY */)) {
      this.initialUpdateTime = new Date().getTime();
      this.waitedDuration = 0;
      this.totalDuration = this.longestDuration ? Math.floor(Math.random() * (this.longestDuration - this.duration + 1) + this.duration) : this.duration;
      this.setState("mistreevous.running" /* RUNNING */);
    }
    if (typeof options.getDeltaTime === "function") {
      const deltaTime = options.getDeltaTime();
      if (typeof deltaTime !== "number" || isNaN(deltaTime)) {
        throw new Error("The delta time must be a valid number and not NaN.");
      }
      this.waitedDuration += deltaTime * 1e3;
    } else {
      this.waitedDuration = new Date().getTime() - this.initialUpdateTime;
    }
    if (this.waitedDuration >= this.totalDuration) {
      this.setState("mistreevous.succeeded" /* SUCCEEDED */);
    }
  }
  getName = () => `WAIT ${this.longestDuration ? this.duration + "ms-" + this.longestDuration + "ms" : this.duration + "ms"}`;
};

// src/nodes/decorator/Decorator.ts
var Decorator = class extends Node {
  constructor(type, attributes, child) {
    super(type, attributes, []);
    this.child = child;
  }
  isLeafNode = () => false;
  getChildren = () => [this.child];
  reset = () => {
    this.setState("mistreevous.ready" /* READY */);
    this.child.reset();
  };
  abort = (agent) => {
    if (!this.is("mistreevous.running" /* RUNNING */)) {
      return;
    }
    this.child.abort(agent);
    this.reset();
    this.getAttribute("exit")?.callAgentFunction(agent, false, true);
  };
};

// src/nodes/decorator/Root.ts
var Root = class extends Decorator {
  constructor(attributes, child) {
    super("root", attributes, child);
  }
  onUpdate(agent, options) {
    if (this.child.getState() === "mistreevous.ready" /* READY */ || this.child.getState() === "mistreevous.running" /* RUNNING */) {
      this.child.update(agent, options);
    }
    this.setState(this.child.getState());
  }
  getName = () => "ROOT";
};

// src/nodes/decorator/Repeat.ts
var Repeat = class extends Decorator {
  constructor(attributes, iterations, maximumIterations, child) {
    super("repeat", attributes, child);
    this.iterations = iterations;
    this.maximumIterations = maximumIterations;
  }
  targetIterationCount = null;
  currentIterationCount = 0;
  onUpdate(agent, options) {
    if (this.is("mistreevous.ready" /* READY */)) {
      this.child.reset();
      this.setTargetIterationCount();
    }
    if (this.canIterate()) {
      this.setState("mistreevous.running" /* RUNNING */);
      if (this.child.getState() === "mistreevous.succeeded" /* SUCCEEDED */) {
        this.child.reset();
      }
      this.child.update(agent, options);
      if (this.child.getState() === "mistreevous.failed" /* FAILED */) {
        this.setState("mistreevous.failed" /* FAILED */);
        return;
      } else if (this.child.getState() === "mistreevous.succeeded" /* SUCCEEDED */) {
        this.currentIterationCount += 1;
      }
    } else {
      this.setState("mistreevous.succeeded" /* SUCCEEDED */);
    }
  }
  getName = () => {
    if (this.iterations !== null) {
      return `REPEAT ${this.maximumIterations ? this.iterations + "x-" + this.maximumIterations + "x" : this.iterations + "x"}`;
    }
    return "REPEAT";
  };
  reset = () => {
    this.setState("mistreevous.ready" /* READY */);
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

// src/nodes/decorator/Retry.ts
var Retry = class extends Decorator {
  constructor(attributes, iterations, maximumIterations, child) {
    super("retry", attributes, child);
    this.iterations = iterations;
    this.maximumIterations = maximumIterations;
  }
  targetIterationCount = null;
  currentIterationCount = 0;
  onUpdate(agent, options) {
    if (this.is("mistreevous.ready" /* READY */)) {
      this.child.reset();
      this.setTargetIterationCount();
    }
    if (this.canIterate()) {
      this.setState("mistreevous.running" /* RUNNING */);
      if (this.child.getState() === "mistreevous.failed" /* FAILED */) {
        this.child.reset();
      }
      this.child.update(agent, options);
      if (this.child.getState() === "mistreevous.succeeded" /* SUCCEEDED */) {
        this.setState("mistreevous.succeeded" /* SUCCEEDED */);
        return;
      } else if (this.child.getState() === "mistreevous.failed" /* FAILED */) {
        this.currentIterationCount += 1;
      }
    } else {
      this.setState("mistreevous.failed" /* FAILED */);
    }
  }
  getName = () => {
    if (this.iterations !== null) {
      return `RETRY ${this.maximumIterations ? this.iterations + "x-" + this.maximumIterations + "x" : this.iterations + "x"}`;
    }
    return "RETRY";
  };
  reset = () => {
    this.setState("mistreevous.ready" /* READY */);
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

// src/nodes/decorator/Flip.ts
var Flip = class extends Decorator {
  constructor(attributes, child) {
    super("flip", attributes, child);
  }
  onUpdate(agent, options) {
    if (this.child.getState() === "mistreevous.ready" /* READY */ || this.child.getState() === "mistreevous.running" /* RUNNING */) {
      this.child.update(agent, options);
    }
    switch (this.child.getState()) {
      case "mistreevous.running" /* RUNNING */:
        this.setState("mistreevous.running" /* RUNNING */);
        break;
      case "mistreevous.succeeded" /* SUCCEEDED */:
        this.setState("mistreevous.failed" /* FAILED */);
        break;
      case "mistreevous.failed" /* FAILED */:
        this.setState("mistreevous.succeeded" /* SUCCEEDED */);
        break;
      default:
        this.setState("mistreevous.ready" /* READY */);
    }
  }
  getName = () => "FLIP";
};

// src/nodes/decorator/Succeed.ts
var Succeed = class extends Decorator {
  constructor(attributes, child) {
    super("succeed", attributes, child);
  }
  onUpdate(agent, options) {
    if (this.child.getState() === "mistreevous.ready" /* READY */ || this.child.getState() === "mistreevous.running" /* RUNNING */) {
      this.child.update(agent, options);
    }
    switch (this.child.getState()) {
      case "mistreevous.running" /* RUNNING */:
        this.setState("mistreevous.running" /* RUNNING */);
        break;
      case "mistreevous.succeeded" /* SUCCEEDED */:
      case "mistreevous.failed" /* FAILED */:
        this.setState("mistreevous.succeeded" /* SUCCEEDED */);
        break;
      default:
        this.setState("mistreevous.ready" /* READY */);
    }
  }
  getName = () => "SUCCEED";
};

// src/nodes/decorator/Fail.ts
var Fail = class extends Decorator {
  constructor(attributes, child) {
    super("fail", attributes, child);
  }
  onUpdate(agent, options) {
    if (this.child.getState() === "mistreevous.ready" /* READY */ || this.child.getState() === "mistreevous.running" /* RUNNING */) {
      this.child.update(agent, options);
    }
    switch (this.child.getState()) {
      case "mistreevous.running" /* RUNNING */:
        this.setState("mistreevous.running" /* RUNNING */);
        break;
      case "mistreevous.succeeded" /* SUCCEEDED */:
      case "mistreevous.failed" /* FAILED */:
        this.setState("mistreevous.failed" /* FAILED */);
        break;
      default:
        this.setState("mistreevous.ready" /* READY */);
    }
  }
  getName = () => "FAIL";
};

// src/nodes/composite/Composite.ts
var Composite = class extends Node {
  constructor(type, attributes, children) {
    super(type, attributes, []);
    this.children = children;
  }
  isLeafNode = () => false;
  getChildren = () => this.children;
  reset = () => {
    this.setState("mistreevous.ready" /* READY */);
    this.getChildren().forEach((child) => child.reset());
  };
  abort = (agent) => {
    if (!this.is("mistreevous.running" /* RUNNING */)) {
      return;
    }
    this.getChildren().forEach((child) => child.abort(agent));
    this.reset();
    this.getAttribute("exit")?.callAgentFunction(agent, false, true);
  };
};

// src/nodes/composite/Lotto.ts
var Lotto = class extends Composite {
  constructor(attributes, tickets, children) {
    super("lotto", attributes, children);
    this.tickets = tickets;
  }
  winningChild;
  onUpdate(agent, options) {
    if (this.is("mistreevous.ready" /* READY */)) {
      const lottoDraw = new LottoDraw();
      this.children.forEach((child, index) => lottoDraw.add(child, this.tickets[index] || 1));
      this.winningChild = lottoDraw.draw();
    }
    if (this.winningChild.getState() === "mistreevous.ready" /* READY */ || this.winningChild.getState() === "mistreevous.running" /* RUNNING */) {
      this.winningChild.update(agent, options);
    }
    this.setState(this.winningChild.getState());
  }
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

// src/nodes/composite/Selector.ts
var Selector = class extends Composite {
  constructor(attributes, children) {
    super("selector", attributes, children);
    this.children = children;
  }
  onUpdate(agent, options) {
    for (const child of this.children) {
      if (child.getState() === "mistreevous.ready" /* READY */ || child.getState() === "mistreevous.running" /* RUNNING */) {
        child.update(agent, options);
      }
      if (child.getState() === "mistreevous.succeeded" /* SUCCEEDED */) {
        this.setState("mistreevous.succeeded" /* SUCCEEDED */);
        return;
      }
      if (child.getState() === "mistreevous.failed" /* FAILED */) {
        if (this.children.indexOf(child) === this.children.length - 1) {
          this.setState("mistreevous.failed" /* FAILED */);
          return;
        } else {
          continue;
        }
      }
      if (child.getState() === "mistreevous.running" /* RUNNING */) {
        this.setState("mistreevous.running" /* RUNNING */);
        return;
      }
      throw new Error("child node was not in an expected state.");
    }
  }
  getName = () => "SELECTOR";
};

// src/nodes/composite/Sequence.ts
var Sequence = class extends Composite {
  constructor(attributes, children) {
    super("sequence", attributes, children);
    this.children = children;
  }
  onUpdate(agent, options) {
    for (const child of this.children) {
      if (child.getState() === "mistreevous.ready" /* READY */ || child.getState() === "mistreevous.running" /* RUNNING */) {
        child.update(agent, options);
      }
      if (child.getState() === "mistreevous.succeeded" /* SUCCEEDED */) {
        if (this.children.indexOf(child) === this.children.length - 1) {
          this.setState("mistreevous.succeeded" /* SUCCEEDED */);
          return;
        } else {
          continue;
        }
      }
      if (child.getState() === "mistreevous.failed" /* FAILED */) {
        this.setState("mistreevous.failed" /* FAILED */);
        return;
      }
      if (child.getState() === "mistreevous.running" /* RUNNING */) {
        this.setState("mistreevous.running" /* RUNNING */);
        return;
      }
      throw new Error("child node was not in an expected state.");
    }
  }
  getName = () => "SEQUENCE";
};

// src/nodes/composite/Parallel.ts
var Parallel = class extends Composite {
  constructor(attributes, children) {
    super("parallel", attributes, children);
  }
  onUpdate(agent, options) {
    let succeededCount = 0;
    let hasChildFailed = false;
    for (const child of this.children) {
      if (child.getState() === "mistreevous.ready" /* READY */ || child.getState() === "mistreevous.running" /* RUNNING */) {
        child.update(agent, options);
      }
      if (child.getState() === "mistreevous.succeeded" /* SUCCEEDED */) {
        succeededCount++;
        continue;
      }
      if (child.getState() === "mistreevous.failed" /* FAILED */) {
        hasChildFailed = true;
        break;
      }
      if (child.getState() !== "mistreevous.running" /* RUNNING */) {
        throw new Error("child node was not in an expected state.");
      }
    }
    if (hasChildFailed) {
      this.setState("mistreevous.failed" /* FAILED */);
      for (const child of this.children) {
        if (child.getState() === "mistreevous.running" /* RUNNING */) {
          child.abort(agent);
        }
      }
    } else {
      this.setState(succeededCount === this.children.length ? "mistreevous.succeeded" /* SUCCEEDED */ : "mistreevous.running" /* RUNNING */);
    }
  }
  getName = () => "PARALLEL";
};

// src/attributes/Attribute.ts
var Attribute = class {
  constructor(type, args) {
    this.type = type;
    this.args = args;
  }
  getType = () => this.type;
  getArguments = () => this.args;
};

// src/attributes/guards/Guard.ts
var Guard = class extends Attribute {
  constructor(type, args, condition) {
    super(type, args);
    this.condition = condition;
  }
  getCondition = () => this.condition;
  isGuard = () => true;
  getDetails() {
    return {
      type: this.getType(),
      args: this.getArguments(),
      condition: this.getCondition()
    };
  }
};

// src/attributes/guards/While.ts
var While = class extends Guard {
  constructor(condition, args) {
    super("while", args, condition);
  }
  isSatisfied = (agent) => {
    const conditionFuncInvoker = Lookup.getFuncInvoker(agent, this.getCondition());
    if (conditionFuncInvoker === null) {
      throw new Error(
        `cannot evaluate node guard as the condition '${this.getCondition()}' function is not defined on the agent and has not been registered`
      );
    }
    return !!conditionFuncInvoker(this.args);
  };
};

// src/attributes/guards/Until.ts
var Until = class extends Guard {
  constructor(condition, args) {
    super("until", args, condition);
  }
  isSatisfied = (agent) => {
    const conditionFuncInvoker = Lookup.getFuncInvoker(agent, this.getCondition());
    if (conditionFuncInvoker === null) {
      throw new Error(
        `cannot evaluate node guard as the condition '${this.getCondition()}' function is not defined on the agent and has not been registered`
      );
    }
    return !!!conditionFuncInvoker(this.args);
  };
};

// src/attributes/callbacks/Callback.ts
var Callback = class extends Attribute {
  constructor(type, args, functionName) {
    super(type, args);
    this.functionName = functionName;
  }
  getFunctionName = () => this.functionName;
  isGuard = () => false;
  getDetails() {
    return {
      type: this.getType(),
      args: this.getArguments(),
      functionName: this.getFunctionName()
    };
  }
};

// src/attributes/callbacks/Entry.ts
var Entry = class extends Callback {
  constructor(functionName, args) {
    super("entry", args, functionName);
  }
  callAgentFunction = (agent) => {
    const callbackFuncInvoker = Lookup.getFuncInvoker(agent, this.getFunctionName());
    if (callbackFuncInvoker === null) {
      throw new Error(
        `cannot call entry function '${this.getFunctionName()}' as is not defined on the agent and has not been registered`
      );
    }
    callbackFuncInvoker(this.args);
  };
};

// src/attributes/callbacks/Exit.ts
var Exit = class extends Callback {
  constructor(functionName, args) {
    super("exit", args, functionName);
  }
  callAgentFunction = (agent, isSuccess, isAborted) => {
    const callbackFuncInvoker = Lookup.getFuncInvoker(agent, this.getFunctionName());
    if (callbackFuncInvoker === null) {
      throw new Error(
        `cannot call exit function '${this.getFunctionName()}' as is not defined on the agent and has not been registered`
      );
    }
    callbackFuncInvoker([{ value: { succeeded: isSuccess, aborted: isAborted } }, ...this.args]);
  };
};

// src/attributes/callbacks/Step.ts
var Step = class extends Callback {
  constructor(functionName, args) {
    super("step", args, functionName);
  }
  callAgentFunction = (agent) => {
    const callbackFuncInvoker = Lookup.getFuncInvoker(agent, this.getFunctionName());
    if (callbackFuncInvoker === null) {
      throw new Error(
        `cannot call step function '${this.getFunctionName()}' as is not defined on the agent and has not been registered`
      );
    }
    callbackFuncInvoker(this.args);
  };
};

// src/RootAstNodesBuilder.ts
var AttributeFactories = {
  WHILE: (condition, attributeArguments) => new While(condition, attributeArguments),
  UNTIL: (condition, attributeArguments) => new Until(condition, attributeArguments),
  ENTRY: (functionName, attributeArguments) => new Entry(functionName, attributeArguments),
  EXIT: (functionName, attributeArguments) => new Exit(functionName, attributeArguments),
  STEP: (functionName, attributeArguments) => new Step(functionName, attributeArguments)
};
var ASTNodeFactories = {
  ROOT: () => ({
    type: "root",
    attributes: [],
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
        this.attributes,
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
    validate() {
      if (this.children.length < 1) {
        throw new Error("a selector node must have at least a single child");
      }
    },
    createNodeInstance(namedRootNodeProvider, visitedBranches) {
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
    validate() {
      if (this.children.length < 1) {
        throw new Error("a sequence node must have at least a single child");
      }
    },
    createNodeInstance(namedRootNodeProvider, visitedBranches) {
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
    validate() {
      if (this.children.length < 1) {
        throw new Error("a parallel node must have at least a single child");
      }
    },
    createNodeInstance(namedRootNodeProvider, visitedBranches) {
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
    validate() {
      if (this.children.length < 1) {
        throw new Error("a lotto node must have at least a single child");
      }
    },
    createNodeInstance(namedRootNodeProvider, visitedBranches) {
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
    validate() {
      if (this.children.length !== 1) {
        throw new Error("a flip node must have a single child");
      }
    },
    createNodeInstance(namedRootNodeProvider, visitedBranches) {
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
    validate() {
      if (this.children.length !== 1) {
        throw new Error("a succeed node must have a single child");
      }
    },
    createNodeInstance(namedRootNodeProvider, visitedBranches) {
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
    validate() {
      if (this.children.length !== 1) {
        throw new Error("a fail node must have a single child");
      }
    },
    createNodeInstance(namedRootNodeProvider, visitedBranches) {
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
      return new Wait(this.attributes, this.duration, this.longestDuration);
    }
  }),
  ACTION: () => ({
    type: "action",
    attributes: [],
    actionName: "",
    actionArguments: [],
    validate() {
    },
    createNodeInstance() {
      return new Action(this.attributes, this.actionName, this.actionArguments);
    }
  }),
  CONDITION: () => ({
    type: "condition",
    attributes: [],
    conditionName: "",
    conditionArguments: [],
    validate() {
    },
    createNodeInstance() {
      return new Condition(this.attributes, this.conditionName, this.conditionArguments);
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
  const rootScope = stack[0];
  while (tokens.length) {
    const token = tokens.shift();
    const currentScope = stack[stack.length - 1];
    switch (token.toUpperCase()) {
      case "ROOT": {
        const node = ASTNodeFactories.ROOT();
        rootScope.push(node);
        if (tokens[0] === "[") {
          const rootArguments = getArguments(tokens, placeholders);
          if (rootArguments.length === 1 && rootArguments[0].type === "identifier") {
            node.name = rootArguments[0].value;
          } else {
            throw new Error("expected single root name argument");
          }
        }
        node.attributes = getAttributes(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      }
      case "BRANCH": {
        const node = ASTNodeFactories.BRANCH();
        currentScope.push(node);
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
      }
      case "SELECTOR": {
        const node = ASTNodeFactories.SELECTOR();
        currentScope.push(node);
        node.attributes = getAttributes(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      }
      case "SEQUENCE": {
        const node = ASTNodeFactories.SEQUENCE();
        currentScope.push(node);
        node.attributes = getAttributes(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      }
      case "PARALLEL": {
        const node = ASTNodeFactories.PARALLEL();
        currentScope.push(node);
        node.attributes = getAttributes(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      }
      case "LOTTO": {
        const node = ASTNodeFactories.LOTTO();
        currentScope.push(node);
        if (tokens[0] === "[") {
          node.tickets = getArguments(
            tokens,
            placeholders,
            (arg) => arg.type === "number" && !!arg.isInteger,
            "lotto node ticket counts must be integer values"
          ).map((argument) => argument.value);
        }
        node.attributes = getAttributes(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      }
      case "CONDITION": {
        const node = ASTNodeFactories.CONDITION();
        currentScope.push(node);
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
        node.attributes = getAttributes(tokens, placeholders);
        break;
      }
      case "FLIP": {
        const node = ASTNodeFactories.FLIP();
        currentScope.push(node);
        node.attributes = getAttributes(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      }
      case "SUCCEED": {
        const node = ASTNodeFactories.SUCCEED();
        currentScope.push(node);
        node.attributes = getAttributes(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      }
      case "FAIL": {
        const node = ASTNodeFactories.FAIL();
        currentScope.push(node);
        node.attributes = getAttributes(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      }
      case "WAIT": {
        const node = ASTNodeFactories.WAIT();
        currentScope.push(node);
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
        node.attributes = getAttributes(tokens, placeholders);
        break;
      }
      case "REPEAT": {
        const node = ASTNodeFactories.REPEAT();
        currentScope.push(node);
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
        node.attributes = getAttributes(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      }
      case "RETRY": {
        const node = ASTNodeFactories.RETRY();
        currentScope.push(node);
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
        node.attributes = getAttributes(tokens, placeholders);
        popAndCheck(tokens, "{");
        stack.push(node.children);
        break;
      }
      case "ACTION": {
        const node = ASTNodeFactories.ACTION();
        currentScope.push(node);
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
        node.attributes = getAttributes(tokens, placeholders);
        break;
      }
      case "}": {
        stack.pop();
        break;
      }
      default: {
        throw new Error("unexpected token: " + token);
      }
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
        if (this.children.filter((definitionLevelNode) => definitionLevelNode.name === null).length !== 1) {
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
      type: "null"
    };
  }
  if (token === "true" || token === "false") {
    return {
      value: token === "true",
      type: "boolean"
    };
  }
  if (!isNaN(token)) {
    return {
      value: parseFloat(token),
      isInteger: parseFloat(token) === parseInt(token, 10),
      type: "number"
    };
  }
  if (token.match(/^@@\d+@@$/g)) {
    return {
      value: stringArgumentPlaceholders[token].replace('\\"', '"'),
      type: "string"
    };
  }
  return {
    value: token,
    type: "identifier"
  };
}
function getAttributes(tokens, stringArgumentPlaceholders) {
  const attributes = [];
  const attributesFound = [];
  let attributeFactory = AttributeFactories[(tokens[0] || "").toUpperCase()];
  while (attributeFactory) {
    if (attributesFound.indexOf(tokens[0].toUpperCase()) !== -1) {
      throw new Error(`duplicate attribute '${tokens[0].toUpperCase()}' found for node`);
    }
    attributesFound.push(tokens.shift().toUpperCase());
    const attributeArguments = getArguments(tokens, stringArgumentPlaceholders);
    if (attributeArguments.length === 0 || attributeArguments[0].type !== "identifier") {
      throw new Error("expected agent function name identifier argument for attribute");
    }
    const attributeFunctionName = attributeArguments.shift();
    attributeArguments.filter((arg) => arg.type === "identifier").forEach((arg) => {
      throw new Error(
        "invalid attribute argument value '" + arg.value + "', must be string, number, boolean or null"
      );
    });
    attributes.push(attributeFactory(attributeFunctionName.value, attributeArguments));
    attributeFactory = AttributeFactories[(tokens[0] || "").toUpperCase()];
  }
  return attributes;
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

// src/BehaviourTree.ts
var BehaviourTree = class {
  constructor(definition, agent, options = {}) {
    this.agent = agent;
    this.options = options;
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
    return this.rootNode.getState() === "mistreevous.running" /* RUNNING */;
  }
  getState() {
    return this.rootNode.getState();
  }
  step() {
    if (this.rootNode.getState() === "mistreevous.succeeded" /* SUCCEEDED */ || this.rootNode.getState() === "mistreevous.failed" /* FAILED */) {
      this.rootNode.reset();
    }
    try {
      this.rootNode.update(this.agent, this.options);
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
      const guards = node.getAttributes().filter((attribute) => attribute.isGuard()).map((attribute) => attribute.getDetails());
      const callbacks = node.getAttributes().filter((attribute) => !attribute.isGuard()).map((attribute) => attribute.getDetails());
      flattenedTreeNodes.push({
        id: node.getUid(),
        type: node.getType(),
        caption: node.getName(),
        state: node.getState(),
        guards,
        callbacks,
        args: node.getArguments(),
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
      const rootNode = rootNodeMap[mainRootNodeKey].createNodeInstance(
        (name) => rootNodeMap[name] ? rootNodeMap[name] : Lookup.getSubtree(name),
        []
      );
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
          path.slice(0, depth + 1).map((node) => ({ node, guards: node.getGuardAttributes() })).filter((details) => details.guards.length > 0)
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
