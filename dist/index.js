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

// src/attributes/guards/guardUnsatisifedException.js
function GuardUnsatisifedException(source) {
  this.message = "A guard path condition has failed";
  this.isSourceNode = (node) => node === source;
}
GuardUnsatisifedException.prototype = new Error();

// src/attributes/guards/guardPath.js
function GuardPath(nodes) {
  this.evaluate = (agent) => {
    for (const details of nodes) {
      for (const guard of details.guards) {
        if (!guard.isSatisfied(agent)) {
          throw new GuardUnsatisifedException(details.node);
        }
      }
    }
  };
}

// src/state.js
var State = {
  READY: Symbol("mistreevous.ready"),
  RUNNING: Symbol("mistreevous.running"),
  SUCCEEDED: Symbol("mistreevous.succeeded"),
  FAILED: Symbol("mistreevous.failed")
};

// src/nodes/node.js
function Node(type, decorators, args) {
  const uid = createNodeUid();
  let state = State.READY;
  let guardPath;
  this.getState = () => state;
  this.setState = (value) => state = value;
  this.getUid = () => uid;
  this.getType = () => type;
  this.getDecorators = () => decorators || [];
  this.getArguments = () => args || [];
  this.getDecorator = (type2) => this.getDecorators().filter((decorator) => decorator.getType().toUpperCase() === type2.toUpperCase())[0] || null;
  this.getGuardDecorators = () => this.getDecorators().filter((decorator) => decorator.isGuard());
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
    const exitDecorator = this.getDecorator("exit");
    if (exitDecorator) {
      exitDecorator.callAgentFunction(agent, false, true);
    }
  };
  this.update = (agent) => {
    if (this.is(State.SUCCEEDED) || this.is(State.FAILED)) {
      return {};
    }
    try {
      guardPath.evaluate(agent);
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

// src/nodes/leaf/action.js
function Action(decorators, actionName, actionArguments) {
  Leaf.call(this, "action", decorators, actionArguments);
  let isUsingUpdatePromise = false;
  let updatePromiseStateResult = null;
  this.onUpdate = function(agent) {
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
  this.onUpdate = function(agent) {
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
  let waitDuration;
  this.onUpdate = function(agent) {
    if (this.is(State.READY)) {
      initialUpdateTime = new Date().getTime();
      waitDuration = longestDuration ? Math.floor(Math.random() * (longestDuration - duration + 1) + duration) : duration;
      this.setState(State.RUNNING);
    }
    if (new Date().getTime() >= initialUpdateTime + waitDuration) {
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
  this.onUpdate = function(agent) {
    if (child.getState() === State.READY || child.getState() === State.RUNNING) {
      child.update(agent);
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
  this.onUpdate = function(agent) {
    if (this.is(State.READY)) {
      child.reset();
      this._setTargetIterationCount();
    }
    if (this._canIterate()) {
      this.setState(State.RUNNING);
      if (child.getState() === State.SUCCEEDED) {
        child.reset();
      }
      child.update(agent);
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
  this.onUpdate = function(agent) {
    if (this.is(State.READY)) {
      child.reset();
      this._setTargetIterationCount();
    }
    if (this._canIterate()) {
      this.setState(State.RUNNING);
      if (child.getState() === State.FAILED) {
        child.reset();
      }
      child.update(agent);
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
  this.onUpdate = function(agent) {
    if (child.getState() === State.READY || child.getState() === State.RUNNING) {
      child.update(agent);
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
  this.onUpdate = function(agent) {
    if (child.getState() === State.READY || child.getState() === State.RUNNING) {
      child.update(agent);
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
  this.onUpdate = function(agent) {
    if (child.getState() === State.READY || child.getState() === State.RUNNING) {
      child.update(agent);
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
  this.onUpdate = function(agent) {
    if (this.is(State.READY)) {
      const lottoDraw = new LottoDraw();
      children.forEach((child, index) => lottoDraw.add(child, tickets[index] || 1));
      winningChild = lottoDraw.draw();
    }
    if (winningChild.getState() === State.READY || winningChild.getState() === State.RUNNING) {
      winningChild.update(agent);
    }
    this.setState(winningChild.getState());
  };
  this.getName = () => tickets.length ? `LOTTO [${tickets.join(",")}]` : "LOTTO";
}
Lotto.prototype = Object.create(Composite.prototype);

// src/nodes/composite/selector.js
function Selector(decorators, children) {
  Composite.call(this, "selector", decorators, children);
  this.onUpdate = function(agent) {
    for (const child of children) {
      if (child.getState() === State.READY || child.getState() === State.RUNNING) {
        child.update(agent);
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
  this.onUpdate = function(agent) {
    for (const child of children) {
      if (child.getState() === State.READY || child.getState() === State.RUNNING) {
        child.update(agent);
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
  this.onUpdate = function(agent) {
    let succeededCount = 0;
    let hasChildFailed = false;
    for (const child of children) {
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

// src/attributes/attribute.js
function Attribute(type, args) {
  this.getType = () => type;
  this.getArguments = () => args;
  this.getDetails = () => ({
    type: this.getType(),
    arguments: this.getArguments()
  });
}

// src/attributes/guards/guard.js
function Guard(type, args) {
  Attribute.call(this, type, args);
  this.isGuard = () => true;
}
Guard.prototype = Object.create(Attribute.prototype);

// src/attributes/guards/while.js
function While(condition, args) {
  Guard.call(this, "while", args);
  this.isGuard = () => true;
  this.getCondition = () => condition;
  this.getDetails = () => {
    return {
      type: this.getType(),
      isGuard: this.isGuard(),
      condition: this.getCondition(),
      arguments: this.getArguments()
    };
  };
  this.isSatisfied = (agent) => {
    const conditionFuncInvoker = Lookup.getFuncInvoker(agent, condition);
    if (conditionFuncInvoker === null) {
      throw new Error(
        `cannot evaluate node guard as the condition '${condition}' function is not defined on the agent and has not been registered`
      );
    }
    return !!conditionFuncInvoker(args);
  };
}
While.prototype = Object.create(Guard.prototype);

// src/attributes/guards/until.js
function Until(condition, args) {
  Guard.call(this, "until", args);
  this.isGuard = () => true;
  this.getCondition = () => condition;
  this.getDetails = () => {
    return {
      type: this.getType(),
      isGuard: this.isGuard(),
      condition: this.getCondition(),
      arguments: this.getArguments()
    };
  };
  this.isSatisfied = (agent) => {
    const conditionFuncInvoker = Lookup.getFuncInvoker(agent, condition);
    if (conditionFuncInvoker === null) {
      throw new Error(
        `cannot evaluate node guard as the condition '${condition}' function is not defined on the agent and has not been registered`
      );
    }
    return !!!conditionFuncInvoker(args);
  };
}
Until.prototype = Object.create(Guard.prototype);

// src/attributes/callbacks/callback.js
function Callback(type, args) {
  Attribute.call(this, type, args);
  this.isGuard = () => false;
}
Callback.prototype = Object.create(Attribute.prototype);

// src/attributes/callbacks/entry.js
function Entry(functionName, args) {
  Callback.call(this, "entry", args);
  this.getFunctionName = () => functionName;
  this.getDetails = () => {
    return {
      type: this.getType(),
      isGuard: this.isGuard(),
      functionName: this.getFunctionName(),
      arguments: this.getArguments()
    };
  };
  this.callAgentFunction = (agent) => {
    const callbackFuncInvoker = Lookup.getFuncInvoker(agent, functionName);
    if (callbackFuncInvoker === null) {
      throw new Error(
        `cannot call entry function '${functionName}' as is not defined on the agent and has not been registered`
      );
    }
    callbackFuncInvoker(args);
  };
}
Entry.prototype = Object.create(Callback.prototype);

// src/attributes/callbacks/exit.js
function Exit(functionName, args) {
  Callback.call(this, "exit", args);
  this.getFunctionName = () => functionName;
  this.getDetails = () => {
    return {
      type: this.getType(),
      isGuard: this.isGuard(),
      functionName: this.getFunctionName(),
      arguments: this.getArguments()
    };
  };
  this.callAgentFunction = (agent, isSuccess, isAborted) => {
    const callbackFuncInvoker = Lookup.getFuncInvoker(agent, functionName);
    if (callbackFuncInvoker === null) {
      throw new Error(
        `cannot call exit function '${functionName}' as is not defined on the agent and has not been registered`
      );
    }
    callbackFuncInvoker([{ value: { succeeded: isSuccess, aborted: isAborted } }].concat(args));
  };
}
Exit.prototype = Object.create(Callback.prototype);

// src/attributes/callbacks/step.js
function Step(functionName, args) {
  Callback.call(this, "step", args);
  this.getFunctionName = () => functionName;
  this.getDetails = () => {
    return {
      type: this.getType(),
      isGuard: this.isGuard(),
      functionName: this.getFunctionName(),
      arguments: this.getArguments()
    };
  };
  this.callAgentFunction = (agent) => {
    const callbackFuncInvoker = Lookup.getFuncInvoker(agent, functionName);
    if (callbackFuncInvoker === null) {
      throw new Error(
        `cannot call step function '${functionName}' as is not defined on the agent and has not been registered`
      );
    }
    callbackFuncInvoker(args);
  };
}
Step.prototype = Object.create(Callback.prototype);

// src/rootASTNodesBuilder.js
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
        this.decorators,
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
    decorators: [],
    children: [],
    validate: function(depth) {
      if (this.children.length < 1) {
        throw new Error("a selector node must have at least a single child");
      }
    },
    createNodeInstance: function(namedRootNodeProvider, visitedBranches) {
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
    validate: function(depth) {
      if (this.children.length < 1) {
        throw new Error("a sequence node must have at least a single child");
      }
    },
    createNodeInstance: function(namedRootNodeProvider, visitedBranches) {
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
    validate: function(depth) {
      if (this.children.length < 1) {
        throw new Error("a parallel node must have at least a single child");
      }
    },
    createNodeInstance: function(namedRootNodeProvider, visitedBranches) {
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
    validate: function(depth) {
      if (this.children.length < 1) {
        throw new Error("a lotto node must have at least a single child");
      }
    },
    createNodeInstance: function(namedRootNodeProvider, visitedBranches) {
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
    validate: function(depth) {
      if (this.children.length !== 1) {
        throw new Error("a flip node must have a single child");
      }
    },
    createNodeInstance: function(namedRootNodeProvider, visitedBranches) {
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
    validate: function(depth) {
      if (this.children.length !== 1) {
        throw new Error("a succeed node must have a single child");
      }
    },
    createNodeInstance: function(namedRootNodeProvider, visitedBranches) {
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
    validate: function(depth) {
      if (this.children.length !== 1) {
        throw new Error("a fail node must have a single child");
      }
    },
    createNodeInstance: function(namedRootNodeProvider, visitedBranches) {
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
      return new Wait(this.decorators, this.duration, this.longestDuration);
    }
  }),
  ACTION: () => ({
    type: "action",
    decorators: [],
    actionName: "",
    actionArguments: [],
    validate: function(depth) {
    },
    createNodeInstance: function(namedRootNodeProvider, visitedBranches) {
      return new Action(this.decorators, this.actionName, this.actionArguments);
    }
  }),
  CONDITION: () => ({
    type: "condition",
    decorators: [],
    conditionName: "",
    conditionArguments: [],
    validate: function(depth) {
    },
    createNodeInstance: function(namedRootNodeProvider, visitedBranches) {
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
            (arg) => arg.type === "number" && arg.isInteger,
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
        node.decorators = getDecorators(tokens, placeholders);
        break;
      case "REPEAT":
        node = ASTNodeFactories.REPEAT();
        stack[stack.length - 1].push(node);
        if (tokens[0] === "[") {
          const iterationArguments = getArguments(
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

// src/BehaviourTree.js
var _agent, _rootNode, _createRootNode, createRootNode_fn, _applyLeafNodeGuardPaths, applyLeafNodeGuardPaths_fn;
var _BehaviourTree = class {
  constructor(definition, agent) {
    __privateAdd(this, _agent, void 0);
    __privateAdd(this, _rootNode, void 0);
    var _a;
    __privateSet(this, _agent, agent);
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
      __privateGet(this, _rootNode).update(__privateGet(this, _agent));
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
    processNode(__privateGet(this, _rootNode), null);
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
};
var BehaviourTree = _BehaviourTree;
_agent = new WeakMap();
_rootNode = new WeakMap();
_createRootNode = new WeakSet();
createRootNode_fn = function(definition) {
  var _a;
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
        path.slice(0, depth + 1).map((node) => ({ node, guards: node.getGuardDecorators() })).filter((details) => details.guards.length > 0)
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
