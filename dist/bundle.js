"use strict";
var mistreevous = (() => {
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
      function isNullOrUndefined(value) {
        return value === null || value === void 0;
      }
      exports.isNullOrUndefined = isNullOrUndefined;
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
      const topTreeStack = treeStacks[treeStacks.length - 1];
      if (topTreeStack.length) {
        topTreeStack.pop();
      }
      if (!topTreeStack.length) {
        treeStacks.pop();
      }
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
          popNode();
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
      } else if (nodeArguments.length === 2) {
        node.iterations = [nodeArguments[0].value, nodeArguments[1].value];
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
      } else if (nodeArguments.length === 2) {
        node.attempts = [nodeArguments[0].value, nodeArguments[1].value];
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
    nodeArguments.filter((arg) => arg.type !== "number" || !arg.isInteger).forEach(() => {
      throw new Error(`lotto node weight arguments must be integer values`);
    });
    const node = {
      type: "lotto",
      weights: nodeArguments.map(({ value }) => value),
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
        throw new Error(`wait node duration arguments must be integer values`);
      });
      if (nodeArguments.length === 1) {
        node.duration = nodeArguments[0].value;
      } else if (nodeArguments.length === 2) {
        node.duration = [nodeArguments[0].value, nodeArguments[1].value];
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

  // src/BehaviourTreeDefinitionValidator.ts
  function validateDefinition(definition) {
    const createFailureResult = (errorMessage) => ({ succeeded: false, errorMessage });
    if (definition === null || typeof definition === "undefined") {
      return createFailureResult("definition is null or undefined");
    }
    let rootNodeDefinitions;
    if (typeof definition === "string") {
      try {
        rootNodeDefinitions = convertMDSLToJSON(definition);
      } catch (error) {
        return createFailureResult(`invalid mdsl: ${definition}`);
      }
    } else if (typeof definition === "object") {
      if (Array.isArray(definition)) {
        const invalidDefinitionElements = definition.filter((element) => {
          return typeof element !== "object" || Array.isArray(element) || element === null;
        });
        if (invalidDefinitionElements.length) {
          return createFailureResult(
            "invalid elements in definition array, each must be an root node definition object"
          );
        }
        rootNodeDefinitions = definition;
      } else {
        rootNodeDefinitions = [definition];
      }
    } else {
      return createFailureResult(`unexpected definition type of '${typeof definition}'`);
    }
    try {
      rootNodeDefinitions.forEach((rootNodeDefinition) => validateNode(rootNodeDefinition, 0));
    } catch (error) {
      if (error instanceof Error) {
        return createFailureResult(error.message);
      }
      return createFailureResult(`unexpected error: ${error}`);
    }
    const mainRootNodeDefinitions = rootNodeDefinitions.filter(({ id }) => typeof id === "undefined");
    const subRootNodeDefinitions = rootNodeDefinitions.filter(({ id }) => typeof id === "string" && id.length > 0);
    if (mainRootNodeDefinitions.length !== 1) {
      return createFailureResult("expected single root node without 'id' property defined to act as main root");
    }
    const subRootNodeIdenitifers = [];
    for (const { id } of subRootNodeDefinitions) {
      if (subRootNodeIdenitifers.includes(id)) {
        return createFailureResult(`multiple root nodes found with duplicate 'id' property value of '${id}'`);
      }
      subRootNodeIdenitifers.push(id);
    }
    const circularDependencyPath = findBranchCircularDependencyPath(rootNodeDefinitions);
    if (circularDependencyPath) {
      return createFailureResult(`circular dependency found in branch node references: ${circularDependencyPath}`);
    }
    return { succeeded: true };
  }
  function findBranchCircularDependencyPath(rootNodeDefinitions) {
    const rootNodeMappings = rootNodeDefinitions.map(
      (rootNodeDefinition) => ({
        id: rootNodeDefinition.id,
        refs: flattenDefinition(rootNodeDefinition).filter(isBranchNode).map(({ ref }) => ref)
      })
    );
    let badPathFormatted = null;
    const followRefs = (mapping, path = []) => {
      if (path.includes(mapping.id)) {
        const badPath = [...path, mapping.id];
        badPathFormatted = badPath.map((element) => !!element).join(" => ");
        return;
      }
      for (const ref of mapping.refs) {
        const subMapping = rootNodeMappings.find(({ id }) => id === ref);
        if (subMapping) {
          followRefs(subMapping, [...path, mapping.id]);
        }
      }
    };
    return badPathFormatted;
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
      case "success":
        validateSuccessNode(definition, depth);
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
  function validateSuccessNode(definition, depth) {
    if (definition.type !== "success") {
      throw new Error(`expected node type of 'success' for success node at depth '${depth}'`);
    }
    if (typeof definition.child === "undefined") {
      throw new Error(`expected property 'child' to be defined for success node at depth '${depth}'`);
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
        const containsNonInteger = !!definition.iterations.find((value) => !isInteger(value));
        if (definition.iterations.length !== 2 || containsNonInteger) {
          throw new Error(
            `expected array containing two integer values for 'iterations' property if defined for repeat node at depth '${depth}'`
          );
        }
      } else if (!isInteger(definition.iterations)) {
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
        const containsNonInteger = !!definition.attempts.find((value) => !isInteger(value));
        if (definition.attempts.length !== 2 || containsNonInteger) {
          throw new Error(
            `expected array containing two integer values for 'attempts' property if defined for retry node at depth '${depth}'`
          );
        }
      } else if (!isInteger(definition.attempts)) {
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
        const containsNonInteger = !!definition.duration.find((value) => !isInteger(value));
        if (definition.duration.length !== 2 || containsNonInteger) {
          throw new Error(
            `expected array containing two integer values for 'duration' property if defined for wait node at depth '${depth}'`
          );
        }
      } else if (!isInteger(definition.duration)) {
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

  // src/nodes/composite/Lotto.ts
  var import_lotto_draw = __toESM(require_dist());

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
    selectedChild;
    onUpdate(agent, options) {
      if (this.is("mistreevous.ready" /* READY */)) {
        const lottoDraw = (0, import_lotto_draw.default)({
          random: options.random,
          participants: this.children.map((child, index) => [child, this.tickets[index] || 1])
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
    getName = () => this.tickets.length ? `LOTTO [${this.tickets.join(",")}]` : "LOTTO";
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
      iterationsMin: null,
      iterationsMax: null,
      children: [],
      validate() {
        if (this.children.length !== 1) {
          throw new Error("a repeat node must have a single child");
        }
        if (this.iterations !== null) {
          if (this.iterations < 0) {
            throw new Error("a repeat node must have a positive number of iterations if defined");
          }
        } else if (this.iterationsMin !== null && this.iterationsMax !== null) {
          if (this.iterationsMin < 0 || this.iterationsMax < 0) {
            throw new Error(
              "a repeat node must have a positive minimum and maximum iteration count if defined"
            );
          }
          if (this.iterationsMin > this.iterationsMax) {
            throw new Error(
              "a repeat node must not have a minimum iteration count that exceeds the maximum iteration count"
            );
          }
        } else {
        }
      },
      createNodeInstance(namedRootNodeProvider, visitedBranches) {
        return new Repeat(
          this.attributes,
          this.iterations,
          this.iterationsMin,
          this.iterationsMax,
          this.children[0].createNodeInstance(namedRootNodeProvider, visitedBranches.slice())
        );
      }
    }),
    RETRY: () => ({
      type: "retry",
      attributes: [],
      attempts: null,
      attemptsMin: null,
      attemptsMax: null,
      children: [],
      validate() {
        if (this.children.length !== 1) {
          throw new Error("a retry node must have a single child");
        }
        if (this.attempts !== null) {
          if (this.attempts < 0) {
            throw new Error("a retry node must have a positive number of attempts if defined");
          }
        } else if (this.attemptsMin !== null && this.attemptsMax !== null) {
          if (this.attemptsMin < 0 || this.attemptsMax < 0) {
            throw new Error("a retry node must have a positive minimum and maximum attempt count if defined");
          }
          if (this.attemptsMin > this.attemptsMax) {
            throw new Error(
              "a retry node must not have a minimum attempt count that exceeds the maximum attempt count"
            );
          }
        } else {
        }
      },
      createNodeInstance(namedRootNodeProvider, visitedBranches) {
        return new Retry(
          this.attributes,
          this.attempts,
          this.attemptsMin,
          this.attemptsMax,
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
      durationMin: null,
      durationMax: null,
      validate() {
        if (this.duration !== null) {
          if (this.duration < 0) {
            throw new Error("a wait node must have a positive duration");
          }
        } else if (this.durationMin !== null && this.durationMax !== null) {
          if (this.durationMin < 0 || this.durationMax < 0) {
            throw new Error("a wait node must have a positive minimum and maximum duration");
          }
          if (this.durationMin > this.durationMax) {
            throw new Error("a wait node must not have a minimum duration that exceeds the maximum duration");
          }
        } else {
        }
      },
      createNodeInstance() {
        return new Wait(this.attributes, this.duration, this.durationMin, this.durationMax);
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
    const { placeholders, processedDefinition } = substituteStringLiterals2(definition);
    const tokens = parseTokensFromDefinition2(processedDefinition);
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
          popAndCheck2(tokens, "{");
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
          popAndCheck2(tokens, "{");
          stack.push(node.children);
          break;
        }
        case "SEQUENCE": {
          const node = ASTNodeFactories.SEQUENCE();
          currentScope.push(node);
          node.attributes = getAttributes(tokens, placeholders);
          popAndCheck2(tokens, "{");
          stack.push(node.children);
          break;
        }
        case "PARALLEL": {
          const node = ASTNodeFactories.PARALLEL();
          currentScope.push(node);
          node.attributes = getAttributes(tokens, placeholders);
          popAndCheck2(tokens, "{");
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
          popAndCheck2(tokens, "{");
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
          popAndCheck2(tokens, "{");
          stack.push(node.children);
          break;
        }
        case "SUCCEED": {
          const node = ASTNodeFactories.SUCCEED();
          currentScope.push(node);
          node.attributes = getAttributes(tokens, placeholders);
          popAndCheck2(tokens, "{");
          stack.push(node.children);
          break;
        }
        case "FAIL": {
          const node = ASTNodeFactories.FAIL();
          currentScope.push(node);
          node.attributes = getAttributes(tokens, placeholders);
          popAndCheck2(tokens, "{");
          stack.push(node.children);
          break;
        }
        case "WAIT": {
          const node = ASTNodeFactories.WAIT();
          currentScope.push(node);
          if (tokens[0] === "[") {
            const nodeArguments = getArguments(
              tokens,
              placeholders,
              (arg) => arg.type === "number" && !!arg.isInteger,
              "wait node durations must be integer values"
            ).map((argument) => argument.value);
            if (nodeArguments.length === 1) {
              node.duration = nodeArguments[0];
            } else if (nodeArguments.length === 2) {
              node.durationMin = nodeArguments[0];
              node.durationMax = nodeArguments[1];
            } else if (nodeArguments.length > 2) {
              throw new Error("invalid number of wait node duration arguments defined");
            }
          }
          node.attributes = getAttributes(tokens, placeholders);
          break;
        }
        case "REPEAT": {
          const node = ASTNodeFactories.REPEAT();
          currentScope.push(node);
          if (tokens[0] === "[") {
            const nodeArguments = getArguments(
              tokens,
              placeholders,
              (arg) => arg.type === "number" && !!arg.isInteger,
              "repeat node iteration counts must be integer values"
            ).map((argument) => argument.value);
            if (nodeArguments.length === 1) {
              node.iterations = nodeArguments[0];
            } else if (nodeArguments.length === 2) {
              node.iterationsMin = nodeArguments[0];
              node.iterationsMax = nodeArguments[1];
            } else {
              throw new Error("invalid number of repeat node iteration count arguments defined");
            }
          }
          node.attributes = getAttributes(tokens, placeholders);
          popAndCheck2(tokens, "{");
          stack.push(node.children);
          break;
        }
        case "RETRY": {
          const node = ASTNodeFactories.RETRY();
          currentScope.push(node);
          if (tokens[0] === "[") {
            const nodeArguments = getArguments(
              tokens,
              placeholders,
              (arg) => arg.type === "number" && !!arg.isInteger,
              "retry node attempt counts must be integer values"
            ).map((argument) => argument.value);
            if (nodeArguments.length === 1) {
              node.attempts = nodeArguments[0];
            } else if (nodeArguments.length === 2) {
              node.attemptsMin = nodeArguments[0];
              node.attemptsMax = nodeArguments[1];
            } else {
              throw new Error("invalid number of retry node attempt count arguments defined");
            }
          }
          node.attributes = getAttributes(tokens, placeholders);
          popAndCheck2(tokens, "{");
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
          throw new Error(`unexpected token '${token}'`);
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
  function popAndCheck2(tokens, expected) {
    const popped = tokens.shift();
    if (popped === void 0) {
      throw new Error("unexpected end of definition");
    }
    if (expected !== void 0) {
      var tokenMatchesExpectation = [].concat(expected).some((item) => popped.toUpperCase() === item.toUpperCase());
      if (!tokenMatchesExpectation) {
        const expectationString = [].concat(expected).map((item) => "'" + item + "'").join(" or ");
        throw new Error(`unexpected token found. Expected '${expectationString}' but got '${popped}'`);
      }
    }
    return popped;
  }
  function getArguments(tokens, stringArgumentPlaceholders, argumentValidator, validationFailedMessage) {
    const closer = popAndCheck2(tokens, ["[", "("]) === "[" ? "]" : ")";
    const argumentListTokens = [];
    const argumentList = [];
    while (tokens.length && tokens[0] !== closer) {
      argumentListTokens.push(tokens.shift());
    }
    argumentListTokens.forEach((token, index) => {
      const shouldBeArgumentToken = !(index & 1);
      if (shouldBeArgumentToken) {
        const argumentDefinition = getArgumentDefinition2(token, stringArgumentPlaceholders);
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
    popAndCheck2(tokens, closer);
    return argumentList;
  }
  function getArgumentDefinition2(token, stringArgumentPlaceholders) {
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
  function substituteStringLiterals2(definition) {
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
  function parseTokensFromDefinition2(definition) {
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
      this.rootNode = BehaviourTree._createRootNode(definition);
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
    static _createRootNode(definition) {
      try {
      } catch (exception) {
        console.log(exception);
      }
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
        BehaviourTree._applyLeafNodeGuardPaths(rootNode);
        return rootNode;
      } catch (exception) {
        throw new Error(`error parsing tree: ${exception.message}`);
      }
    }
    static _applyLeafNodeGuardPaths(rootNode) {
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
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=bundle.js.map
