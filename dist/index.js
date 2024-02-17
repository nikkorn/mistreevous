"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// node_modules/lotto-draw/dist/Participant.js
var require_Participant = __commonJS({
  "node_modules/lotto-draw/dist/Participant.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Participant = void 0;
    var Participant = function() {
      function Participant2(participant, tickets) {
        if (tickets === void 0) {
          tickets = 1;
        }
        this._participant = participant;
        this._tickets = tickets;
      }
      Object.defineProperty(Participant2.prototype, "participant", {
        get: function() {
          return this._participant;
        },
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(Participant2.prototype, "tickets", {
        get: function() {
          return this._tickets;
        },
        set: function(value) {
          this._tickets = value;
        },
        enumerable: false,
        configurable: true
      });
      return Participant2;
    }();
    exports.Participant = Participant;
  }
});

// node_modules/lotto-draw/dist/Utilities.js
var require_Utilities = __commonJS({
  "node_modules/lotto-draw/dist/Utilities.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isNaturalNumber = exports.isNullOrUndefined = void 0;
    function isNullOrUndefined2(value) {
      return value === null || value === void 0;
    }
    exports.isNullOrUndefined = isNullOrUndefined2;
    function isNaturalNumber(value) {
      return typeof value === "number" && value >= 1 && Math.floor(value) === value;
    }
    exports.isNaturalNumber = isNaturalNumber;
  }
});

// node_modules/lotto-draw/dist/Lotto.js
var require_Lotto = __commonJS({
  "node_modules/lotto-draw/dist/Lotto.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Lotto = void 0;
    var Participant_1 = require_Participant();
    var Utilities_1 = require_Utilities();
    var Lotto2 = function() {
      function Lotto3(customRandom) {
        this._participants = [];
        this._customRandom = customRandom;
      }
      Lotto3.prototype.add = function(participant, tickets) {
        if (tickets === void 0) {
          tickets = 1;
        }
        if (!(0, Utilities_1.isNaturalNumber)(tickets)) {
          throw new Error("tickets value must be a natural number");
        }
        var existingParticipant = this._participants.find(function(part) {
          return part.participant === participant;
        });
        if (existingParticipant) {
          existingParticipant.tickets += tickets;
        } else {
          this._participants.push(new Participant_1.Participant(participant, tickets));
        }
        return this;
      };
      Lotto3.prototype.remove = function(participant, tickets) {
        var existingParticipant = this._participants.find(function(part) {
          return part.participant === participant;
        });
        if (!existingParticipant) {
          return this;
        }
        if (tickets !== void 0) {
          if (!(0, Utilities_1.isNaturalNumber)(tickets)) {
            throw new Error("tickets value must be a natural number");
          }
          existingParticipant.tickets -= tickets;
          if (existingParticipant.tickets < 1) {
            this._participants = this._participants.filter(function(part) {
              return part !== existingParticipant;
            });
          }
        } else {
          this._participants = this._participants.filter(function(part) {
            return part !== existingParticipant;
          });
        }
        return this;
      };
      Lotto3.prototype.draw = function(options) {
        if (options === void 0) {
          options = {};
        }
        if (this._participants.length === 0) {
          return null;
        }
        var redrawable = (0, Utilities_1.isNullOrUndefined)(options.redrawable) ? true : options.redrawable;
        var pickable = [];
        this._participants.forEach(function(_a) {
          var participant = _a.participant, tickets = _a.tickets;
          for (var ticketCount = 0; ticketCount < tickets; ticketCount++) {
            pickable.push(participant);
          }
        });
        var random;
        if (this._customRandom) {
          random = this._customRandom();
          if (typeof random !== "number" || random < 0 || random >= 1) {
            throw new Error("the 'random' function provided did not return a number between 0 (inclusive) and 1");
          }
        } else {
          random = Math.random();
        }
        var winner = pickable[Math.floor(random * pickable.length)];
        if (!redrawable) {
          this.remove(winner, 1);
        }
        return winner;
      };
      Lotto3.prototype.drawMultiple = function(tickets, options) {
        if (options === void 0) {
          options = {};
        }
        var uniqueResults = (0, Utilities_1.isNullOrUndefined)(options.unique) ? false : options.unique;
        if (tickets === 0) {
          return [];
        }
        if (!(0, Utilities_1.isNaturalNumber)(tickets)) {
          throw new Error("tickets value must be a natural number");
        }
        var result = [];
        while (result.length < tickets && this._participants.length > 0) {
          result.push(this.draw(options));
        }
        if (uniqueResults) {
          var unique = [];
          for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
            var participant = result_1[_i];
            if (unique.indexOf(participant) === -1) {
              unique.push(participant);
            }
          }
          result = unique;
        }
        return result;
      };
      return Lotto3;
    }();
    exports.Lotto = Lotto2;
  }
});

// node_modules/lotto-draw/dist/createLotto.js
var require_createLotto = __commonJS({
  "node_modules/lotto-draw/dist/createLotto.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createLotto = void 0;
    var Lotto_1 = require_Lotto();
    function createLotto2(participantsOrOptions) {
      if (!participantsOrOptions) {
        return new Lotto_1.Lotto();
      }
      if (Array.isArray(participantsOrOptions)) {
        var participants = participantsOrOptions;
        var lotto_1 = new Lotto_1.Lotto();
        participants.forEach(function(_a) {
          var participant = _a[0], tokens = _a[1];
          return lotto_1.add(participant, tokens);
        });
        return lotto_1;
      } else {
        var random = participantsOrOptions.random, participants = participantsOrOptions.participants;
        var lotto_2 = new Lotto_1.Lotto(random);
        if (participants) {
          participants.forEach(function(_a) {
            var participant = _a[0], tokens = _a[1];
            return lotto_2.add(participant, tokens);
          });
        }
        return lotto_2;
      }
    }
    exports.createLotto = createLotto2;
  }
});

// node_modules/lotto-draw/dist/index.js
var require_dist = __commonJS({
  "node_modules/lotto-draw/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var createLotto_1 = require_createLotto();
    exports.default = createLotto_1.createLotto;
  }
});

// src/index.ts
var src_exports = {};
__export(src_exports, {
  BehaviourTree: () => BehaviourTree,
  State: () => State,
  convertMDSLToJSON: () => convertMDSLToJSON,
  validateDefinition: () => validateDefinition
});
module.exports = __toCommonJS(src_exports);

// src/State.ts
var State = /* @__PURE__ */ ((State2) => {
  State2["READY"] = "mistreevous.ready";
  State2["RUNNING"] = "mistreevous.running";
  State2["SUCCEEDED"] = "mistreevous.succeeded";
  State2["FAILED"] = "mistreevous.failed";
  return State2;
})(State || {});

// src/BehaviourTreeDefinitionUtilities.ts
function isRootNode(node) {
  return node.type === "root";
}
function isBranchNode(node) {
  return node.type === "branch";
}
function isLeafNode(node) {
  return ["branch", "action", "condition", "wait"].includes(node.type);
}
function isDecoratorNode(node) {
  return ["root", "repeat", "retry", "flip", "succeed", "fail"].includes(node.type);
}
function isCompositeNode(node) {
  return ["sequence", "selector", "lotto", "parallel"].includes(node.type);
}
function flattenDefinition(nodeDefinition) {
  const nodes = [];
  const processNode = (currentNodeDefinition) => {
    nodes.push(currentNodeDefinition);
    if (isCompositeNode(currentNodeDefinition)) {
      currentNodeDefinition.children.forEach(processNode);
    } else if (isDecoratorNode(currentNodeDefinition)) {
      processNode(currentNodeDefinition.child);
    }
  };
  processNode(nodeDefinition);
  return nodes;
}
function isInteger(value) {
  return typeof value === "number" && Math.floor(value) === value;
}
function isNullOrUndefined(value) {
  return typeof value === "undefined" || value === null;
}

// src/mdsl/MDSLUtilities.ts
function popAndCheck(tokens, expected) {
  const popped = tokens.shift();
  if (popped === void 0) {
    throw new Error("unexpected end of definition");
  }
  if (expected != void 0) {
    const expectedValues = typeof expected === "string" ? [expected] : expected;
    var tokenMatchesExpectation = expectedValues.some((item) => popped.toUpperCase() === item.toUpperCase());
    if (!tokenMatchesExpectation) {
      const expectationString = expectedValues.map((item) => "'" + item + "'").join(" or ");
      throw new Error("unexpected token found. Expected " + expectationString + " but got '" + popped + "'");
    }
  }
  return popped;
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

// src/mdsl/MDSLNodeArgumentParser.ts
function parseArgumentTokens(tokens, stringArgumentPlaceholders) {
  const argumentList = [];
  if (!["[", "("].includes(tokens[0])) {
    return argumentList;
  }
  const closingToken = popAndCheck(tokens, ["[", "("]) === "[" ? "]" : ")";
  const argumentListTokens = [];
  while (tokens.length && tokens[0] !== closingToken) {
    argumentListTokens.push(tokens.shift());
  }
  argumentListTokens.forEach((token, index) => {
    const shouldBeArgumentToken = !(index & 1);
    if (shouldBeArgumentToken) {
      const argumentDefinition = getArgumentDefinition(token, stringArgumentPlaceholders);
      argumentList.push(argumentDefinition);
    } else {
      if (token !== ",") {
        throw new Error(`invalid argument list, expected ',' or ']' but got '${token}'`);
      }
    }
  });
  popAndCheck(tokens, closingToken);
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

// src/mdsl/MDSLNodeAttributeParser.ts
function parseAttributeTokens(tokens, stringArgumentPlaceholders) {
  const nodeAttributeNames = ["while", "until", "entry", "exit", "step"];
  const attributes = {};
  let nextAttributeName = tokens[0]?.toLowerCase();
  while (nodeAttributeNames.includes(nextAttributeName)) {
    if (attributes[nextAttributeName]) {
      throw new Error(`duplicate attribute '${tokens[0].toUpperCase()}' found for node`);
    }
    tokens.shift();
    const [attributeCallIdentifier, ...attributeArguments] = parseArgumentTokens(
      tokens,
      stringArgumentPlaceholders
    );
    if (attributeCallIdentifier?.type !== "identifier") {
      throw new Error("expected agent function name identifier argument for attribute");
    }
    attributeArguments.filter((arg) => arg.type === "identifier").forEach((arg) => {
      throw new Error(
        `invalid attribute argument value '${arg.value}', must be string, number, boolean or null`
      );
    });
    attributes[nextAttributeName] = {
      call: attributeCallIdentifier.value,
      args: attributeArguments.map(({ value }) => value)
    };
    nextAttributeName = tokens[0]?.toLowerCase();
  }
  return attributes;
}

// src/mdsl/MDSLDefinitionParser.ts
function convertMDSLToJSON(definition) {
  const { placeholders, processedDefinition } = substituteStringLiterals(definition);
  const tokens = parseTokensFromDefinition(processedDefinition);
  return convertTokensToJSONDefinition(tokens, placeholders);
}
function convertTokensToJSONDefinition(tokens, stringLiteralPlaceholders) {
  if (tokens.length < 3) {
    throw new Error("invalid token count");
  }
  if (tokens.filter((token) => token === "{").length !== tokens.filter((token) => token === "}").length) {
    throw new Error("scope character mismatch");
  }
  const treeStacks = [];
  const rootNodes = [];
  const pushNode = (node) => {
    if (isRootNode(node)) {
      if (treeStacks[treeStacks.length - 1]?.length) {
        throw new Error("a root node cannot be the child of another node");
      }
      rootNodes.push(node);
      treeStacks.push([node]);
      return;
    }
    if (!treeStacks.length || !treeStacks[treeStacks.length - 1].length) {
      throw new Error("expected root node at base of definition");
    }
    const topTreeStack = treeStacks[treeStacks.length - 1];
    const topTreeStackTopNode = topTreeStack[topTreeStack.length - 1];
    if (isCompositeNode(topTreeStackTopNode)) {
      topTreeStackTopNode.children = topTreeStackTopNode.children || [];
      topTreeStackTopNode.children.push(node);
    } else if (isDecoratorNode(topTreeStackTopNode)) {
      if (topTreeStackTopNode.child) {
        throw new Error("a decorator node must only have a single child node");
      }
      topTreeStackTopNode.child = node;
    }
    if (!isLeafNode(node)) {
      topTreeStack.push(node);
    }
  };
  const popNode = () => {
    let poppedNode = null;
    const topTreeStack = treeStacks[treeStacks.length - 1];
    if (topTreeStack.length) {
      poppedNode = topTreeStack.pop();
    }
    if (!topTreeStack.length) {
      treeStacks.pop();
    }
    return poppedNode;
  };
  while (tokens.length) {
    const token = tokens.shift();
    switch (token.toUpperCase()) {
      case "ROOT": {
        pushNode(createRootNode(tokens, stringLiteralPlaceholders));
        break;
      }
      case "SUCCEED": {
        pushNode(createSucceedNode(tokens, stringLiteralPlaceholders));
        break;
      }
      case "FAIL": {
        pushNode(createFailNode(tokens, stringLiteralPlaceholders));
        break;
      }
      case "FLIP": {
        pushNode(createFlipNode(tokens, stringLiteralPlaceholders));
        break;
      }
      case "REPEAT": {
        pushNode(createRepeatNode(tokens, stringLiteralPlaceholders));
        break;
      }
      case "RETRY": {
        pushNode(createRetryNode(tokens, stringLiteralPlaceholders));
        break;
      }
      case "SEQUENCE": {
        pushNode(createSequenceNode(tokens, stringLiteralPlaceholders));
        break;
      }
      case "SELECTOR": {
        pushNode(createSelectorNode(tokens, stringLiteralPlaceholders));
        break;
      }
      case "PARALLEL": {
        pushNode(createParallelNode(tokens, stringLiteralPlaceholders));
        break;
      }
      case "LOTTO": {
        pushNode(createLottoNode(tokens, stringLiteralPlaceholders));
        break;
      }
      case "ACTION": {
        pushNode(createActionNode(tokens, stringLiteralPlaceholders));
        break;
      }
      case "CONDITION": {
        pushNode(createConditionNode(tokens, stringLiteralPlaceholders));
        break;
      }
      case "WAIT": {
        pushNode(createWaitNode(tokens, stringLiteralPlaceholders));
        break;
      }
      case "BRANCH": {
        pushNode(createBranchNode(tokens, stringLiteralPlaceholders));
        break;
      }
      case "}": {
        const poppedNode = popNode();
        if (poppedNode) {
          validatePoppedNode(poppedNode);
        }
        break;
      }
      default: {
        throw new Error(`unexpected token: ${token}`);
      }
    }
  }
  return rootNodes;
}
function createRootNode(tokens, stringLiteralPlaceholders) {
  let node = {
    type: "root",
    id: void 0
  };
  const nodeArguments = parseArgumentTokens(tokens, stringLiteralPlaceholders);
  if (nodeArguments.length) {
    if (nodeArguments.length === 1 && nodeArguments[0].type === "identifier") {
      node.id = nodeArguments[0].value;
    } else {
      throw new Error("expected single root name argument");
    }
  }
  node = { ...node, ...parseAttributeTokens(tokens, stringLiteralPlaceholders) };
  popAndCheck(tokens, "{");
  return node;
}
function createSucceedNode(tokens, stringLiteralPlaceholders) {
  const node = {
    type: "succeed",
    ...parseAttributeTokens(tokens, stringLiteralPlaceholders)
  };
  popAndCheck(tokens, "{");
  return node;
}
function createFailNode(tokens, stringLiteralPlaceholders) {
  const node = {
    type: "fail",
    ...parseAttributeTokens(tokens, stringLiteralPlaceholders)
  };
  popAndCheck(tokens, "{");
  return node;
}
function createFlipNode(tokens, stringLiteralPlaceholders) {
  const node = {
    type: "flip",
    ...parseAttributeTokens(tokens, stringLiteralPlaceholders)
  };
  popAndCheck(tokens, "{");
  return node;
}
function createRepeatNode(tokens, stringLiteralPlaceholders) {
  let node = { type: "repeat" };
  const nodeArguments = parseArgumentTokens(tokens, stringLiteralPlaceholders);
  if (nodeArguments.length) {
    nodeArguments.filter((arg) => arg.type !== "number" || !arg.isInteger).forEach(() => {
      throw new Error(`repeat node iteration counts must be integer values`);
    });
    if (nodeArguments.length === 1) {
      node.iterations = nodeArguments[0].value;
      if (node.iterations < 0) {
        throw new Error("a repeat node must have a positive number of iterations if defined");
      }
    } else if (nodeArguments.length === 2) {
      node.iterations = [nodeArguments[0].value, nodeArguments[1].value];
      if (node.iterations[0] < 0 || node.iterations[1] < 0) {
        throw new Error("a repeat node must have a positive minimum and maximum iteration count if defined");
      }
      if (node.iterations[0] > node.iterations[1]) {
        throw new Error(
          "a repeat node must not have a minimum iteration count that exceeds the maximum iteration count"
        );
      }
    } else {
      throw new Error("invalid number of repeat node iteration count arguments defined");
    }
  }
  node = { ...node, ...parseAttributeTokens(tokens, stringLiteralPlaceholders) };
  popAndCheck(tokens, "{");
  return node;
}
function createRetryNode(tokens, stringLiteralPlaceholders) {
  let node = { type: "retry" };
  const nodeArguments = parseArgumentTokens(tokens, stringLiteralPlaceholders);
  if (nodeArguments.length) {
    nodeArguments.filter((arg) => arg.type !== "number" || !arg.isInteger).forEach(() => {
      throw new Error(`retry node attempt counts must be integer values`);
    });
    if (nodeArguments.length === 1) {
      node.attempts = nodeArguments[0].value;
      if (node.attempts < 0) {
        throw new Error("a retry node must have a positive number of attempts if defined");
      }
    } else if (nodeArguments.length === 2) {
      node.attempts = [nodeArguments[0].value, nodeArguments[1].value];
      if (node.attempts[0] < 0 || node.attempts[1] < 0) {
        throw new Error("a retry node must have a positive minimum and maximum attempt count if defined");
      }
      if (node.attempts[0] > node.attempts[1]) {
        throw new Error(
          "a retry node must not have a minimum attempt count that exceeds the maximum attempt count"
        );
      }
    } else {
      throw new Error("invalid number of retry node attempt count arguments defined");
    }
  }
  node = { ...node, ...parseAttributeTokens(tokens, stringLiteralPlaceholders) };
  popAndCheck(tokens, "{");
  return node;
}
function createSequenceNode(tokens, stringLiteralPlaceholders) {
  const node = {
    type: "sequence",
    ...parseAttributeTokens(tokens, stringLiteralPlaceholders)
  };
  popAndCheck(tokens, "{");
  return node;
}
function createSelectorNode(tokens, stringLiteralPlaceholders) {
  const node = {
    type: "selector",
    ...parseAttributeTokens(tokens, stringLiteralPlaceholders)
  };
  popAndCheck(tokens, "{");
  return node;
}
function createParallelNode(tokens, stringLiteralPlaceholders) {
  const node = {
    type: "parallel",
    ...parseAttributeTokens(tokens, stringLiteralPlaceholders)
  };
  popAndCheck(tokens, "{");
  return node;
}
function createLottoNode(tokens, stringLiteralPlaceholders) {
  const nodeArguments = parseArgumentTokens(tokens, stringLiteralPlaceholders);
  nodeArguments.filter((arg) => arg.type !== "number" || !arg.isInteger || arg.value < 0).forEach(() => {
    throw new Error(`lotto node weight arguments must be positive integer values`);
  });
  const node = {
    type: "lotto",
    weights: nodeArguments.length ? nodeArguments.map(({ value }) => value) : void 0,
    ...parseAttributeTokens(tokens, stringLiteralPlaceholders)
  };
  popAndCheck(tokens, "{");
  return node;
}
function createActionNode(tokens, stringLiteralPlaceholders) {
  const [actionNameIdentifier, ...agentFunctionArgs] = parseArgumentTokens(tokens, stringLiteralPlaceholders);
  if (actionNameIdentifier?.type !== "identifier") {
    throw new Error("expected action name identifier argument");
  }
  agentFunctionArgs.filter((arg) => arg.type === "identifier").forEach((arg) => {
    throw new Error(
      `invalid action node argument value '${arg.value}', must be string, number, boolean or null`
    );
  });
  return {
    type: "action",
    call: actionNameIdentifier.value,
    args: agentFunctionArgs.map(({ value }) => value),
    ...parseAttributeTokens(tokens, stringLiteralPlaceholders)
  };
}
function createConditionNode(tokens, stringLiteralPlaceholders) {
  const [conditionNameIdentifier, ...agentFunctionArgs] = parseArgumentTokens(tokens, stringLiteralPlaceholders);
  if (conditionNameIdentifier?.type !== "identifier") {
    throw new Error("expected condition name identifier argument");
  }
  agentFunctionArgs.filter((arg) => arg.type === "identifier").forEach((arg) => {
    throw new Error(
      `invalid condition node argument value '${arg.value}', must be string, number, boolean or null`
    );
  });
  return {
    type: "condition",
    call: conditionNameIdentifier.value,
    args: agentFunctionArgs.map(({ value }) => value),
    ...parseAttributeTokens(tokens, stringLiteralPlaceholders)
  };
}
function createWaitNode(tokens, stringLiteralPlaceholders) {
  let node = { type: "wait" };
  const nodeArguments = parseArgumentTokens(tokens, stringLiteralPlaceholders);
  if (nodeArguments.length) {
    nodeArguments.filter((arg) => arg.type !== "number" || !arg.isInteger).forEach(() => {
      throw new Error(`wait node durations must be integer values`);
    });
    if (nodeArguments.length === 1) {
      node.duration = nodeArguments[0].value;
      if (node.duration < 0) {
        throw new Error("a wait node must have a positive duration");
      }
    } else if (nodeArguments.length === 2) {
      node.duration = [nodeArguments[0].value, nodeArguments[1].value];
      if (node.duration[0] < 0 || node.duration[1] < 0) {
        throw new Error("a wait node must have a positive minimum and maximum duration");
      }
      if (node.duration[0] > node.duration[1]) {
        throw new Error("a wait node must not have a minimum duration that exceeds the maximum duration");
      }
    } else if (nodeArguments.length > 2) {
      throw new Error("invalid number of wait node duration arguments defined");
    }
  }
  return { ...node, ...parseAttributeTokens(tokens, stringLiteralPlaceholders) };
}
function createBranchNode(tokens, stringLiteralPlaceholders) {
  const nodeArguments = parseArgumentTokens(tokens, stringLiteralPlaceholders);
  if (nodeArguments.length !== 1 || nodeArguments[0].type !== "identifier") {
    throw new Error("expected single branch name argument");
  }
  return { type: "branch", ref: nodeArguments[0].value };
}
function validatePoppedNode(definition) {
  if (isDecoratorNode(definition) && isNullOrUndefined(definition.child)) {
    throw new Error(`a ${definition.type} node must have a single child node defined`);
  }
  if (isCompositeNode(definition) && !definition.children?.length) {
    throw new Error(`a ${definition.type} node must have at least a single child node defined`);
  }
  if (definition.type === "lotto") {
    if (typeof definition.weights !== "undefined") {
      if (definition.weights.length !== definition.children.length) {
        throw new Error(
          "expected a number of weight arguments matching the number of child nodes for lotto node"
        );
      }
    }
  }
}

// src/BehaviourTreeDefinitionValidator.ts
function validateDefinition(definition) {
  if (definition === null || typeof definition === "undefined") {
    return createValidationFailureResult("definition is null or undefined");
  }
  if (typeof definition === "string") {
    return validateMDSLDefinition(definition);
  } else if (typeof definition === "object") {
    return validateJSONDefinition(definition);
  } else {
    return createValidationFailureResult(`unexpected definition type of '${typeof definition}'`);
  }
}
function validateMDSLDefinition(definition) {
  let rootNodeDefinitions;
  try {
    rootNodeDefinitions = convertMDSLToJSON(definition);
  } catch (exception) {
    return createValidationFailureResult(exception.message);
  }
  const mainRootNodeDefinitions = rootNodeDefinitions.filter(({ id }) => typeof id === "undefined");
  const subRootNodeDefinitions = rootNodeDefinitions.filter(({ id }) => typeof id === "string" && id.length > 0);
  if (mainRootNodeDefinitions.length !== 1) {
    return createValidationFailureResult(
      "expected single unnamed root node at base of definition to act as main root"
    );
  }
  const subRootNodeIdenitifers = [];
  for (const { id } of subRootNodeDefinitions) {
    if (subRootNodeIdenitifers.includes(id)) {
      return createValidationFailureResult(`multiple root nodes found with duplicate name '${id}'`);
    }
    subRootNodeIdenitifers.push(id);
  }
  try {
    validateBranchSubtreeLinks(rootNodeDefinitions, false);
  } catch (exception) {
    return createValidationFailureResult(exception.message);
  }
  return {
    succeeded: true,
    json: rootNodeDefinitions
  };
}
function validateJSONDefinition(definition) {
  const rootNodeDefinitions = Array.isArray(definition) ? definition : [definition];
  try {
    rootNodeDefinitions.forEach((rootNodeDefinition) => validateNode(rootNodeDefinition, 0));
  } catch (error) {
    if (error instanceof Error) {
      return createValidationFailureResult(error.message);
    }
    return createValidationFailureResult(`unexpected error: ${error}`);
  }
  const mainRootNodeDefinitions = rootNodeDefinitions.filter(({ id }) => typeof id === "undefined");
  const subRootNodeDefinitions = rootNodeDefinitions.filter(({ id }) => typeof id === "string" && id.length > 0);
  if (mainRootNodeDefinitions.length !== 1) {
    return createValidationFailureResult(
      "expected single root node without 'id' property defined to act as main root"
    );
  }
  const subRootNodeIdenitifers = [];
  for (const { id } of subRootNodeDefinitions) {
    if (subRootNodeIdenitifers.includes(id)) {
      return createValidationFailureResult(
        `multiple root nodes found with duplicate 'id' property value of '${id}'`
      );
    }
    subRootNodeIdenitifers.push(id);
  }
  try {
    validateBranchSubtreeLinks(rootNodeDefinitions, false);
  } catch (exception) {
    return createValidationFailureResult(exception.message);
  }
  return {
    succeeded: true,
    json: rootNodeDefinitions
  };
}
function validateBranchSubtreeLinks(rootNodeDefinitions, includesGlobalSubtrees) {
  const rootNodeMappings = rootNodeDefinitions.map(
    (rootNodeDefinition) => ({
      id: rootNodeDefinition.id,
      refs: flattenDefinition(rootNodeDefinition).filter(isBranchNode).map(({ ref }) => ref)
    })
  );
  const followRefs = (mapping, path = []) => {
    if (path.includes(mapping.id)) {
      const badPath = [...path, mapping.id];
      const badPathFormatted = badPath.filter((element) => !!element).join(" => ");
      throw new Error(`circular dependency found in branch node references: ${badPathFormatted}`);
    }
    for (const ref of mapping.refs) {
      const subMapping = rootNodeMappings.find(({ id }) => id === ref);
      if (subMapping) {
        followRefs(subMapping, [...path, mapping.id]);
      } else if (includesGlobalSubtrees) {
        throw new Error(
          mapping.id ? `subtree '${mapping.id}' has branch node that references root node '${ref}' which has not been defined` : `primary tree has branch node that references root node '${ref}' which has not been defined`
        );
      }
    }
  };
  followRefs(rootNodeMappings.find((mapping) => typeof mapping.id === "undefined"));
}
function validateNode(definition, depth) {
  if (typeof definition !== "object" || typeof definition.type !== "string" || definition.type.length === 0) {
    throw new Error(
      `node definition is not an object or 'type' property is not a non-empty string at depth '${depth}'`
    );
  }
  switch (definition.type) {
    case "action":
      validateActionNode(definition, depth);
      break;
    case "condition":
      validateConditionNode(definition, depth);
      break;
    case "wait":
      validateWaitNode(definition, depth);
      break;
    case "branch":
      validateBranchNode(definition, depth);
      break;
    case "root":
      validateRootNode(definition, depth);
      break;
    case "succeed":
      validateSucceedNode(definition, depth);
      break;
    case "fail":
      validateFailNode(definition, depth);
      break;
    case "flip":
      validateFlipNode(definition, depth);
      break;
    case "repeat":
      validateRepeatNode(definition, depth);
      break;
    case "retry":
      validateRetryNode(definition, depth);
      break;
    case "sequence":
      validateSequenceNode(definition, depth);
      break;
    case "selector":
      validateSelectorNode(definition, depth);
      break;
    case "parallel":
      validateParallelNode(definition, depth);
      break;
    case "lotto":
      validateLottoNode(definition, depth);
      break;
    default:
      throw new Error(`unexpected node type of '${definition.type}' at depth '${depth}'`);
  }
}
function validateNodeAttributes(definition, depth) {
  ["while", "until", "entry", "exit", "step"].forEach((attributeName) => {
    const attributeDefinition = definition[attributeName];
    if (typeof attributeDefinition === "undefined") {
      return;
    }
    if (typeof attributeDefinition !== "object") {
      throw new Error(
        `expected attribute '${attributeName}' to be an object for '${definition.type}' node at depth '${depth}'`
      );
    }
    if (typeof attributeDefinition.call !== "string" || attributeDefinition.call.length === 0) {
      throw new Error(
        `expected 'call' property for attribute '${attributeName}' to be a non-empty string for '${definition.type}' node at depth '${depth}'`
      );
    }
    if (typeof attributeDefinition.args !== "undefined" && !Array.isArray(attributeDefinition.args)) {
      throw new Error(
        `expected 'args' property for attribute '${attributeName}' to be an array for '${definition.type}' node at depth '${depth}'`
      );
    }
  });
}
function validateRootNode(definition, depth) {
  if (definition.type !== "root") {
    throw new Error("expected node type of 'root' for root node");
  }
  if (depth > 0) {
    throw new Error("a root node cannot be the child of another node");
  }
  if (typeof definition.id !== "undefined" && (typeof definition.id !== "string" || definition.id.length === 0)) {
    throw new Error("expected non-empty string for 'id' property if defined for root node");
  }
  if (typeof definition.child === "undefined") {
    throw new Error("expected property 'child' to be defined for root node");
  }
  validateNodeAttributes(definition, depth);
  validateNode(definition.child, depth + 1);
}
function validateSucceedNode(definition, depth) {
  if (definition.type !== "succeed") {
    throw new Error(`expected node type of 'succeed' for succeed node at depth '${depth}'`);
  }
  if (typeof definition.child === "undefined") {
    throw new Error(`expected property 'child' to be defined for succeed node at depth '${depth}'`);
  }
  validateNodeAttributes(definition, depth);
  validateNode(definition.child, depth + 1);
}
function validateFailNode(definition, depth) {
  if (definition.type !== "fail") {
    throw new Error(`expected node type of 'fail' for fail node at depth '${depth}'`);
  }
  if (typeof definition.child === "undefined") {
    throw new Error(`expected property 'child' to be defined for fail node at depth '${depth}'`);
  }
  validateNodeAttributes(definition, depth);
  validateNode(definition.child, depth + 1);
}
function validateFlipNode(definition, depth) {
  if (definition.type !== "flip") {
    throw new Error(`expected node type of 'flip' for flip node at depth '${depth}'`);
  }
  if (typeof definition.child === "undefined") {
    throw new Error(`expected property 'child' to be defined for flip node at depth '${depth}'`);
  }
  validateNodeAttributes(definition, depth);
  validateNode(definition.child, depth + 1);
}
function validateRepeatNode(definition, depth) {
  if (definition.type !== "repeat") {
    throw new Error(`expected node type of 'repeat' for repeat node at depth '${depth}'`);
  }
  if (typeof definition.child === "undefined") {
    throw new Error(`expected property 'child' to be defined for repeat node at depth '${depth}'`);
  }
  if (typeof definition.iterations !== "undefined") {
    if (Array.isArray(definition.iterations)) {
      const containsNonInteger = !!definition.iterations.filter((value) => !isInteger(value)).length;
      if (definition.iterations.length !== 2 || containsNonInteger) {
        throw new Error(
          `expected array containing two integer values for 'iterations' property if defined for repeat node at depth '${depth}'`
        );
      }
      if (definition.iterations[0] < 0 || definition.iterations[1] < 0) {
        throw new Error(
          `expected positive minimum and maximum iterations count for 'iterations' property if defined for repeat node at depth '${depth}'`
        );
      }
      if (definition.iterations[0] > definition.iterations[1]) {
        throw new Error(
          `expected minimum iterations count that does not exceed the maximum iterations count for 'iterations' property if defined for repeat node at depth '${depth}'`
        );
      }
    } else if (isInteger(definition.iterations)) {
      if (definition.iterations < 0) {
        throw new Error(
          `expected positive iterations count for 'iterations' property if defined for repeat node at depth '${depth}'`
        );
      }
    } else {
      throw new Error(
        `expected integer value or array containing two integer values for 'iterations' property if defined for repeat node at depth '${depth}'`
      );
    }
  }
  validateNodeAttributes(definition, depth);
  validateNode(definition.child, depth + 1);
}
function validateRetryNode(definition, depth) {
  if (definition.type !== "retry") {
    throw new Error(`expected node type of 'retry' for retry node at depth '${depth}'`);
  }
  if (typeof definition.child === "undefined") {
    throw new Error(`expected property 'child' to be defined for retry node at depth '${depth}'`);
  }
  if (typeof definition.attempts !== "undefined") {
    if (Array.isArray(definition.attempts)) {
      const containsNonInteger = !!definition.attempts.filter((value) => !isInteger(value)).length;
      if (definition.attempts.length !== 2 || containsNonInteger) {
        throw new Error(
          `expected array containing two integer values for 'attempts' property if defined for retry node at depth '${depth}'`
        );
      }
      if (definition.attempts[0] < 0 || definition.attempts[1] < 0) {
        throw new Error(
          `expected positive minimum and maximum attempts count for 'attempts' property if defined for retry node at depth '${depth}'`
        );
      }
      if (definition.attempts[0] > definition.attempts[1]) {
        throw new Error(
          `expected minimum attempts count that does not exceed the maximum attempts count for 'attempts' property if defined for retry node at depth '${depth}'`
        );
      }
    } else if (isInteger(definition.attempts)) {
      if (definition.attempts < 0) {
        throw new Error(
          `expected positive attempts count for 'attempts' property if defined for retry node at depth '${depth}'`
        );
      }
    } else {
      throw new Error(
        `expected integer value or array containing two integer values for 'attempts' property if defined for retry node at depth '${depth}'`
      );
    }
  }
  validateNodeAttributes(definition, depth);
  validateNode(definition.child, depth + 1);
}
function validateBranchNode(definition, depth) {
  if (definition.type !== "branch") {
    throw new Error(`expected node type of 'branch' for branch node at depth '${depth}'`);
  }
  if (typeof definition.ref !== "string" || definition.ref.length === 0) {
    throw new Error(`expected non-empty string for 'ref' property for branch node at depth '${depth}'`);
  }
  ["while", "until"].forEach((attributeName) => {
    if (typeof definition[attributeName] !== "undefined") {
      throw new Error(
        `guards should not be defined for branch nodes but guard '${attributeName}' was defined for branch node at depth '${depth}'`
      );
    }
  });
  ["entry", "exit", "step"].forEach((attributeName) => {
    if (typeof definition[attributeName] !== "undefined") {
      throw new Error(
        `callbacks should not be defined for branch nodes but callback '${attributeName}' was defined for branch node at depth '${depth}'`
      );
    }
  });
}
function validateActionNode(definition, depth) {
  if (definition.type !== "action") {
    throw new Error(`expected node type of 'action' for action node at depth '${depth}'`);
  }
  if (typeof definition.call !== "string" || definition.call.length === 0) {
    throw new Error(`expected non-empty string for 'call' property of action node at depth '${depth}'`);
  }
  if (typeof definition.args !== "undefined" && !Array.isArray(definition.args)) {
    throw new Error(`expected array for 'args' property if defined for action node at depth '${depth}'`);
  }
  validateNodeAttributes(definition, depth);
}
function validateConditionNode(definition, depth) {
  if (definition.type !== "condition") {
    throw new Error(`expected node type of 'condition' for condition node at depth '${depth}'`);
  }
  if (typeof definition.call !== "string" || definition.call.length === 0) {
    throw new Error(`expected non-empty string for 'call' property of condition node at depth '${depth}'`);
  }
  if (typeof definition.args !== "undefined" && !Array.isArray(definition.args)) {
    throw new Error(`expected array for 'args' property if defined for condition node at depth '${depth}'`);
  }
  validateNodeAttributes(definition, depth);
}
function validateWaitNode(definition, depth) {
  if (definition.type !== "wait") {
    throw new Error(`expected node type of 'wait' for wait node at depth '${depth}'`);
  }
  if (typeof definition.duration !== "undefined") {
    if (Array.isArray(definition.duration)) {
      const containsNonInteger = !!definition.duration.filter((value) => !isInteger(value)).length;
      if (definition.duration.length !== 2 || containsNonInteger) {
        throw new Error(
          `expected array containing two integer values for 'duration' property if defined for wait node at depth '${depth}'`
        );
      }
      if (definition.duration[0] < 0 || definition.duration[1] < 0) {
        throw new Error(
          `expected positive minimum and maximum duration for 'duration' property if defined for wait node at depth '${depth}'`
        );
      }
      if (definition.duration[0] > definition.duration[1]) {
        throw new Error(
          `expected minimum duration value that does not exceed the maximum duration value for 'duration' property if defined for wait node at depth '${depth}'`
        );
      }
    } else if (isInteger(definition.duration)) {
      if (definition.duration < 0) {
        throw new Error(
          `expected positive duration value for 'duration' property if defined for wait node at depth '${depth}'`
        );
      }
    } else {
      throw new Error(
        `expected integer value or array containing two integer values for 'duration' property if defined for wait node at depth '${depth}'`
      );
    }
  }
  validateNodeAttributes(definition, depth);
}
function validateSequenceNode(definition, depth) {
  if (definition.type !== "sequence") {
    throw new Error(`expected node type of 'sequence' for sequence node at depth '${depth}'`);
  }
  if (!Array.isArray(definition.children) || definition.children.length === 0) {
    throw new Error(`expected non-empty 'children' array to be defined for sequence node at depth '${depth}'`);
  }
  validateNodeAttributes(definition, depth);
  definition.children.forEach((child) => validateNode(child, depth + 1));
}
function validateSelectorNode(definition, depth) {
  if (definition.type !== "selector") {
    throw new Error(`expected node type of 'selector' for selector node at depth '${depth}'`);
  }
  if (!Array.isArray(definition.children) || definition.children.length === 0) {
    throw new Error(`expected non-empty 'children' array to be defined for selector node at depth '${depth}'`);
  }
  validateNodeAttributes(definition, depth);
  definition.children.forEach((child) => validateNode(child, depth + 1));
}
function validateParallelNode(definition, depth) {
  if (definition.type !== "parallel") {
    throw new Error(`expected node type of 'parallel' for parallel node at depth '${depth}'`);
  }
  if (!Array.isArray(definition.children) || definition.children.length === 0) {
    throw new Error(`expected non-empty 'children' array to be defined for parallel node at depth '${depth}'`);
  }
  validateNodeAttributes(definition, depth);
  definition.children.forEach((child) => validateNode(child, depth + 1));
}
function validateLottoNode(definition, depth) {
  if (definition.type !== "lotto") {
    throw new Error(`expected node type of 'lotto' for lotto node at depth '${depth}'`);
  }
  if (!Array.isArray(definition.children) || definition.children.length === 0) {
    throw new Error(`expected non-empty 'children' array to be defined for lotto node at depth '${depth}'`);
  }
  if (typeof definition.weights !== "undefined") {
    if (!Array.isArray(definition.weights) || definition.weights.length !== definition.children.length || definition.weights.filter((value) => !isInteger(value)).length || definition.weights.filter((value) => value < 0).length) {
      throw new Error(
        `expected an array of positive integer weight values with a length matching the number of child nodes for 'weights' property if defined for lotto node at depth '${depth}'`
      );
    }
  }
  validateNodeAttributes(definition, depth);
  definition.children.forEach((child) => validateNode(child, depth + 1));
}
function createValidationFailureResult(errorMessage) {
  return { succeeded: false, errorMessage };
}

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
      return (args) => foundOnAgent.apply(agent, args);
    }
    if (this.functionTable[name] && typeof this.functionTable[name] === "function") {
      return (args) => this.functionTable[name](agent, ...args.map((arg) => arg.value));
    }
    return null;
  }
  static getSubtrees() {
    return this.subtreeTable;
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
    return this.getAttributes().filter((decorator) => decorator.type.toUpperCase() === type.toUpperCase())[0] || null;
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

// src/nodes/composite/Lotto.ts
var import_lotto_draw = __toESM(require_dist());
var Lotto = class extends Composite {
  constructor(attributes, weights, children) {
    super("lotto", attributes, children);
    this.weights = weights;
  }
  selectedChild;
  onUpdate(agent, options) {
    if (this.is("mistreevous.ready" /* READY */)) {
      const lottoDraw = (0, import_lotto_draw.default)({
        random: options.random,
        participants: this.children.map((child, index) => [child, this.weights?.[index] || 1])
      });
      this.selectedChild = lottoDraw.draw() || void 0;
    }
    if (!this.selectedChild) {
      throw new Error("failed to update lotto node as it has no active child");
    }
    if (this.selectedChild.getState() === "mistreevous.ready" /* READY */ || this.selectedChild.getState() === "mistreevous.running" /* RUNNING */) {
      this.selectedChild.update(agent, options);
    }
    this.setState(this.selectedChild.getState());
  }
  getName = () => this.weights ? `LOTTO [${this.weights.join(",")}]` : "LOTTO";
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

// src/nodes/decorator/Repeat.ts
var Repeat = class extends Decorator {
  constructor(attributes, iterations, iterationsMin, iterationsMax, child) {
    super("repeat", attributes, child);
    this.iterations = iterations;
    this.iterationsMin = iterationsMin;
    this.iterationsMax = iterationsMax;
  }
  targetIterationCount = null;
  currentIterationCount = 0;
  onUpdate(agent, options) {
    if (this.is("mistreevous.ready" /* READY */)) {
      this.child.reset();
      this.currentIterationCount = 0;
      this.setTargetIterationCount(options);
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
      return `REPEAT ${this.iterations}x`;
    } else if (this.iterationsMin !== null && this.iterationsMax !== null) {
      return `REPEAT ${this.iterationsMin}x-${this.iterationsMax}x`;
    } else {
      return "REPEAT";
    }
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
  setTargetIterationCount = (options) => {
    if (this.iterations !== null) {
      this.targetIterationCount = this.iterations;
    } else if (this.iterationsMin !== null && this.iterationsMax !== null) {
      const random = typeof options.random === "function" ? options.random : Math.random;
      this.targetIterationCount = Math.floor(
        random() * (this.iterationsMax - this.iterationsMin + 1) + this.iterationsMin
      );
    } else {
      this.targetIterationCount = null;
    }
  };
};

// src/nodes/decorator/Retry.ts
var Retry = class extends Decorator {
  constructor(attributes, attempts, attemptsMin, attemptsMax, child) {
    super("retry", attributes, child);
    this.attempts = attempts;
    this.attemptsMin = attemptsMin;
    this.attemptsMax = attemptsMax;
  }
  targetAttemptCount = null;
  currentAttemptCount = 0;
  onUpdate(agent, options) {
    if (this.is("mistreevous.ready" /* READY */)) {
      this.child.reset();
      this.currentAttemptCount = 0;
      this.setTargetAttemptCount(options);
    }
    if (this.canAttempt()) {
      this.setState("mistreevous.running" /* RUNNING */);
      if (this.child.getState() === "mistreevous.failed" /* FAILED */) {
        this.child.reset();
      }
      this.child.update(agent, options);
      if (this.child.getState() === "mistreevous.succeeded" /* SUCCEEDED */) {
        this.setState("mistreevous.succeeded" /* SUCCEEDED */);
        return;
      } else if (this.child.getState() === "mistreevous.failed" /* FAILED */) {
        this.currentAttemptCount += 1;
      }
    } else {
      this.setState("mistreevous.failed" /* FAILED */);
    }
  }
  getName = () => {
    if (this.attempts !== null) {
      return `RETRY ${this.attempts}x`;
    } else if (this.attemptsMin !== null && this.attemptsMax !== null) {
      return `RETRY ${this.attemptsMin}x-${this.attemptsMax}x`;
    } else {
      return "RETRY";
    }
  };
  reset = () => {
    this.setState("mistreevous.ready" /* READY */);
    this.currentAttemptCount = 0;
    this.child.reset();
  };
  canAttempt = () => {
    if (this.targetAttemptCount !== null) {
      return this.currentAttemptCount < this.targetAttemptCount;
    }
    return true;
  };
  setTargetAttemptCount = (options) => {
    if (this.attempts !== null) {
      this.targetAttemptCount = this.attempts;
    } else if (this.attemptsMin !== null && this.attemptsMax !== null) {
      const random = typeof options.random === "function" ? options.random : Math.random;
      this.targetAttemptCount = Math.floor(
        random() * (this.attemptsMax - this.attemptsMin + 1) + this.attemptsMin
      );
    } else {
      this.targetAttemptCount = null;
    }
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

// src/nodes/leaf/Leaf.ts
var Leaf = class extends Node {
  isLeafNode = () => true;
};

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
  constructor(attributes, duration, durationMin, durationMax) {
    super("wait", attributes, []);
    this.duration = duration;
    this.durationMin = durationMin;
    this.durationMax = durationMax;
  }
  initialUpdateTime = 0;
  totalDuration = null;
  waitedDuration = 0;
  onUpdate(agent, options) {
    if (this.is("mistreevous.ready" /* READY */)) {
      this.initialUpdateTime = new Date().getTime();
      this.waitedDuration = 0;
      if (this.duration !== null) {
        this.totalDuration = this.duration;
      } else if (this.durationMin !== null && this.durationMax !== null) {
        const random = typeof options.random === "function" ? options.random : Math.random;
        this.totalDuration = Math.floor(
          random() * (this.durationMax - this.durationMin + 1) + this.durationMin
        );
      } else {
        this.totalDuration = null;
      }
      this.setState("mistreevous.running" /* RUNNING */);
    }
    if (this.totalDuration === null) {
      return;
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
  getName = () => {
    if (this.duration !== null) {
      return `WAIT ${this.duration}ms`;
    } else if (this.durationMin !== null && this.durationMax !== null) {
      return `WAIT ${this.durationMin}ms-${this.durationMax}ms`;
    } else {
      return "WAIT";
    }
  };
};

// src/attributes/Attribute.ts
var Attribute = class {
  constructor(type, args) {
    this.type = type;
    this.args = args;
  }
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
      type: this.type,
      args: this.args,
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
      type: this.type,
      args: this.args,
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

// src/BehaviourTreeBuilder.ts
var MAIN_ROOT_NODE_KEY = Symbol("__root__");
function buildRootNode(definition) {
  const rootNodeDefinitionMap = createRootNodeDefinitionMap(definition);
  validateBranchSubtreeLinks(definition, true);
  const rootNode = nodeFactory(rootNodeDefinitionMap[MAIN_ROOT_NODE_KEY], rootNodeDefinitionMap);
  applyLeafNodeGuardPaths(rootNode);
  return rootNode;
}
function nodeFactory(definition, rootNodeDefinitionMap) {
  const attributes = nodeAttributesFactory(definition);
  switch (definition.type) {
    case "root":
      return new Root(attributes, nodeFactory(definition.child, rootNodeDefinitionMap));
    case "repeat":
      let iterations = null;
      let iterationsMin = null;
      let iterationsMax = null;
      if (Array.isArray(definition.iterations)) {
        iterationsMin = definition.iterations[0];
        iterationsMax = definition.iterations[1];
      } else if (isInteger(definition.iterations)) {
        iterations = definition.iterations;
      }
      return new Repeat(
        attributes,
        iterations,
        iterationsMin,
        iterationsMax,
        nodeFactory(definition.child, rootNodeDefinitionMap)
      );
    case "retry":
      let attempts = null;
      let attemptsMin = null;
      let attemptsMax = null;
      if (Array.isArray(definition.attempts)) {
        attemptsMin = definition.attempts[0];
        attemptsMax = definition.attempts[1];
      } else if (isInteger(definition.attempts)) {
        attempts = definition.attempts;
      }
      return new Retry(
        attributes,
        attempts,
        attemptsMin,
        attemptsMax,
        nodeFactory(definition.child, rootNodeDefinitionMap)
      );
    case "flip":
      return new Flip(attributes, nodeFactory(definition.child, rootNodeDefinitionMap));
    case "succeed":
      return new Succeed(attributes, nodeFactory(definition.child, rootNodeDefinitionMap));
    case "fail":
      return new Fail(attributes, nodeFactory(definition.child, rootNodeDefinitionMap));
    case "sequence":
      return new Sequence(
        attributes,
        definition.children.map((child) => nodeFactory(child, rootNodeDefinitionMap))
      );
    case "selector":
      return new Selector(
        attributes,
        definition.children.map((child) => nodeFactory(child, rootNodeDefinitionMap))
      );
    case "parallel":
      return new Parallel(
        attributes,
        definition.children.map((child) => nodeFactory(child, rootNodeDefinitionMap))
      );
    case "lotto":
      return new Lotto(
        attributes,
        definition.weights,
        definition.children.map((child) => nodeFactory(child, rootNodeDefinitionMap))
      );
    case "branch":
      return nodeFactory(rootNodeDefinitionMap[definition.ref].child, rootNodeDefinitionMap);
    case "action":
      return new Action(attributes, definition.call, definition.args || []);
    case "condition":
      return new Condition(attributes, definition.call, definition.args || []);
    case "wait":
      let duration = null;
      let durationMin = null;
      let durationMax = null;
      if (Array.isArray(definition.duration)) {
        durationMin = definition.duration[0];
        durationMax = definition.duration[1];
      } else if (isInteger(definition.duration)) {
        duration = definition.duration;
      }
      return new Wait(attributes, duration, durationMin, durationMax);
  }
}
function nodeAttributesFactory(definition) {
  const attributes = [];
  if (definition.while) {
    attributes.push(new While(definition.while.call, definition.while.args ?? []));
  }
  if (definition.until) {
    attributes.push(new Until(definition.until.call, definition.until.args ?? []));
  }
  if (definition.entry) {
    attributes.push(new Entry(definition.entry.call, definition.entry.args ?? []));
  }
  if (definition.step) {
    attributes.push(new Step(definition.step.call, definition.step.args ?? []));
  }
  if (definition.exit) {
    attributes.push(new Exit(definition.exit.call, definition.exit.args ?? []));
  }
  return attributes;
}
function createRootNodeDefinitionMap(definition) {
  const rootNodeMap = {};
  for (const [name, rootNodeDefinition] of Object.entries(Lookup.getSubtrees())) {
    rootNodeMap[name] = { ...rootNodeDefinition, id: name };
  }
  for (const rootNodeDefinition of definition) {
    rootNodeMap[rootNodeDefinition.id ?? MAIN_ROOT_NODE_KEY] = rootNodeDefinition;
  }
  return rootNodeMap;
}
function applyLeafNodeGuardPaths(root) {
  const nodePaths = [];
  const findLeafNodes = (path, node) => {
    path = path.concat(node);
    if (node.isLeafNode()) {
      nodePaths.push(path);
    } else {
      node.getChildren().forEach((child) => findLeafNodes(path, child));
    }
  };
  findLeafNodes([], root);
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

// src/BehaviourTree.ts
var BehaviourTree = class {
  constructor(definition, agent, options = {}) {
    this.agent = agent;
    this.options = options;
    if (isNullOrUndefined(definition)) {
      throw new Error("tree definition not defined");
    }
    if (typeof agent !== "object" || agent === null) {
      throw new Error("the agent must be an object and not null");
    }
    const { succeeded, errorMessage, json } = validateDefinition(definition);
    if (!succeeded) {
      throw new Error(`invalid definition: ${errorMessage}`);
    }
    if (!json) {
      throw new Error(
        "expected json definition to be returned as part of successful definition validation response"
      );
    }
    try {
      this.rootNode = buildRootNode(json);
    } catch (exception) {
      throw new Error(`error building tree: ${exception.message}`);
    }
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
      return;
    }
    if (typeof value === "string") {
      let rootNodeDefinitions;
      try {
        rootNodeDefinitions = convertMDSLToJSON(value);
      } catch (exception) {
        throw new Error(`error registering definition, invalid MDSL: ${exception.message}`);
      }
      if (rootNodeDefinitions.length != 1 || rootNodeDefinitions[0].id !== null) {
        throw new Error("error registering definition: expected a single unnamed root node");
      }
      try {
        const { succeeded, errorMessage } = validateJSONDefinition(rootNodeDefinitions[0]);
        if (!succeeded) {
          throw new Error(errorMessage);
        }
      } catch (exception) {
        throw new Error(`error registering definition: ${exception.message}`);
      }
      Lookup.setSubtree(name, rootNodeDefinitions[0]);
    } else if (typeof value === "object" && !Array.isArray(value)) {
      try {
        const { succeeded, errorMessage } = validateJSONDefinition(value);
        if (!succeeded) {
          throw new Error(errorMessage);
        }
      } catch (exception) {
        throw new Error(`error registering definition: ${exception.message}`);
      }
      Lookup.setSubtree(name, value);
    } else {
      throw new Error("unexpected value, expected string mdsl definition, root node json definition or function");
    }
  }
  static unregister(name) {
    Lookup.remove(name);
  }
  static unregisterAll() {
    Lookup.empty();
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BehaviourTree,
  State,
  convertMDSLToJSON,
  validateDefinition
});
//# sourceMappingURL=index.js.map
