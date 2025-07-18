"use strict";
var mistreevous = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
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
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/lotto-draw/dist/Participant.js
  var require_Participant = __commonJS({
    "node_modules/lotto-draw/dist/Participant.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Participant = void 0;
      var Participant = (
        /** @class */
        function() {
          function Participant2(participant, tickets) {
            if (tickets === void 0) {
              tickets = 1;
            }
            this._participant = participant;
            this._tickets = tickets;
          }
          Object.defineProperty(Participant2.prototype, "participant", {
            /** Gets the actual participant. */
            get: function() {
              return this._participant;
            },
            enumerable: false,
            configurable: true
          });
          Object.defineProperty(Participant2.prototype, "tickets", {
            /** Gets or sets the number of tickets held by the participant. */
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
        }()
      );
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
      var Lotto2 = (
        /** @class */
        function() {
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
        }()
      );
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
  var index_exports = {};
  __export(index_exports, {
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

  // src/Lookup.ts
  var Lookup = class {
    /**
     * The object holding any registered functions keyed on function name.
     */
    static registeredFunctions = {};
    /**
     * The object holding any registered subtree root node definitions keyed on tree name.
     */
    static registeredSubtrees = {};
    /**
     * Gets the function with the specified name.
     * @param name The name of the function.
     * @returns The function with the specified name.
     */
    static getFunc(name) {
      return this.registeredFunctions[name];
    }
    /**
     * Sets the function with the specified name for later lookup.
     * @param name The name of the function.
     * @param func The function.
     */
    static setFunc(name, func) {
      this.registeredFunctions[name] = func;
    }
    /**
     * Gets the function invoker for the specified agent and function name.
     * If a function with the specified name exists on the agent object then it will
     * be returned, otherwise we will then check the registered functions for a match.
     * @param agent The agent instance that this behaviour tree is modelling behaviour for.
     * @param name The function name.
     * @returns The function invoker for the specified agent and function name.
     */
    static getFuncInvoker(agent, name) {
      const processFunctionArguments = (args) => args.map((arg) => {
        if (typeof arg === "object" && arg !== null && Object.keys(arg).length === 1 && Object.prototype.hasOwnProperty.call(arg, "$")) {
          const agentPropertyName = arg["$"];
          if (typeof agentPropertyName !== "string" || agentPropertyName.length === 0) {
            throw new Error("Agent property reference must be a string?");
          }
          return agent[agentPropertyName];
        }
        return arg;
      });
      const agentFunction = agent[name];
      if (agentFunction && typeof agentFunction === "function") {
        return (args) => agentFunction.apply(agent, processFunctionArguments(args));
      }
      if (this.registeredFunctions[name] && typeof this.registeredFunctions[name] === "function") {
        const registeredFunction = this.registeredFunctions[name];
        return (args) => registeredFunction(agent, ...processFunctionArguments(args));
      }
      return null;
    }
    /**
     * Gets all registered subtree root node definitions.
     */
    static getSubtrees() {
      return this.registeredSubtrees;
    }
    /**
     * Sets the subtree with the specified name for later lookup.
     * @param name The name of the subtree.
     * @param subtree The subtree.
     */
    static setSubtree(name, subtree) {
      this.registeredSubtrees[name] = subtree;
    }
    /**
     * Removes the registered function or subtree with the specified name.
     * @param name The name of the registered function or subtree.
     */
    static remove(name) {
      delete this.registeredFunctions[name];
      delete this.registeredSubtrees[name];
    }
    /**
     * Remove all registered functions and subtrees.
     */
    static empty() {
      this.registeredFunctions = {};
      this.registeredSubtrees = {};
    }
  };

  // src/BehaviourTreeDefinitionUtilities.ts
  function isRootNodeDefinition(node) {
    return node.type === "root";
  }
  function isBranchNodeDefinition(node) {
    return node.type === "branch";
  }
  function isLeafNodeDefinition(node) {
    return ["branch", "action", "condition", "wait"].includes(node.type);
  }
  function isDecoratorNodeDefinition(node) {
    return ["root", "repeat", "retry", "flip", "succeed", "fail"].includes(node.type);
  }
  function isCompositeNodeDefinition(node) {
    return ["sequence", "selector", "lotto", "parallel", "race", "all"].includes(node.type);
  }
  function flattenDefinition(nodeDefinition) {
    const nodes = [];
    const processNode = (currentNodeDefinition) => {
      nodes.push(currentNodeDefinition);
      if (isCompositeNodeDefinition(currentNodeDefinition)) {
        currentNodeDefinition.children.forEach(processNode);
      } else if (isDecoratorNodeDefinition(currentNodeDefinition)) {
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

  // src/mdsl/MDSLArguments.ts
  function getArgumentJsonValue(arg) {
    if (arg.type === "property_reference") {
      return { $: arg.value };
    }
    return arg.value;
  }

  // src/mdsl/MDSLUtilities.ts
  function popAndCheck(tokens, expected) {
    const popped = tokens.shift();
    if (popped === void 0) {
      throw new Error("unexpected end of definition");
    }
    if (expected != void 0) {
      const expectedValues = typeof expected === "string" ? [expected] : expected;
      const tokenMatchesExpectation = expectedValues.some((item) => popped.toUpperCase() === item.toUpperCase());
      if (!tokenMatchesExpectation) {
        const expectationString = expectedValues.map((item) => "'" + item + "'").join(" or ");
        throw new Error("unexpected token found. Expected " + expectationString + " but got '" + popped + "'");
      }
    }
    return popped;
  }
  function tokenise(definition) {
    definition = definition.replace(/\/\*(.|\n)*?\*\//g, "");
    const { placeholders, processedDefinition } = substituteStringLiterals(definition);
    definition = processedDefinition.replace(/\(/g, " ( ");
    definition = definition.replace(/\)/g, " ) ");
    definition = definition.replace(/\{/g, " { ");
    definition = definition.replace(/\}/g, " } ");
    definition = definition.replace(/\]/g, " ] ");
    definition = definition.replace(/\[/g, " [ ");
    definition = definition.replace(/,/g, " , ");
    return {
      // Split the definition into raw token form.
      tokens: definition.replace(/\s+/g, " ").trim().split(" "),
      // The placeholders for string literals that were found in the definition.
      placeholders
    };
  }
  function substituteStringLiterals(definition) {
    const placeholders = {};
    const processedDefinition = definition.replace(/"(\\.|[^"\\])*"/g, (match) => {
      const strippedMatch = match.substring(1, match.length - 1);
      let placeholder = Object.keys(placeholders).find((key) => placeholders[key] === strippedMatch);
      if (!placeholder) {
        placeholder = `@@${Object.keys(placeholders).length}@@`;
        placeholders[placeholder] = strippedMatch;
      }
      return placeholder;
    });
    return { placeholders, processedDefinition };
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
    if (token.match(/^\$[_a-zA-Z][_a-zA-Z0-9]*/g)) {
      return {
        // The value is the identifier name with the '$' prefix removed.
        value: token.slice(1),
        type: "property_reference"
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
        throw new Error("expected agent function or registered function name identifier argument for attribute");
      }
      attributeArguments.filter((arg) => arg.type === "identifier").forEach((arg) => {
        throw new Error(
          `invalid attribute argument value '${arg.value}', must be string, number, boolean, agent property reference or null`
        );
      });
      if (nextAttributeName === "while" || nextAttributeName === "until") {
        let succeedOnAbort = false;
        if (tokens[0]?.toLowerCase() === "then") {
          tokens.shift();
          const resolvedStatusToken = popAndCheck(tokens, ["succeed", "fail"]);
          succeedOnAbort = resolvedStatusToken.toLowerCase() === "succeed";
        }
        attributes[nextAttributeName] = {
          call: attributeCallIdentifier.value,
          args: attributeArguments.map(getArgumentJsonValue),
          succeedOnAbort
        };
      } else {
        attributes[nextAttributeName] = {
          call: attributeCallIdentifier.value,
          args: attributeArguments.map(getArgumentJsonValue)
        };
      }
      nextAttributeName = tokens[0]?.toLowerCase();
    }
    return attributes;
  }

  // src/mdsl/MDSLDefinitionParser.ts
  function convertMDSLToJSON(definition) {
    const { tokens, placeholders } = tokenise(definition);
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
      if (isRootNodeDefinition(node)) {
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
      if (isCompositeNodeDefinition(topTreeStackTopNode)) {
        topTreeStackTopNode.children = topTreeStackTopNode.children || [];
        topTreeStackTopNode.children.push(node);
      } else if (isDecoratorNodeDefinition(topTreeStackTopNode)) {
        if (topTreeStackTopNode.child) {
          throw new Error("a decorator node must only have a single child node");
        }
        topTreeStackTopNode.child = node;
      }
      if (!isLeafNodeDefinition(node)) {
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
        case "RACE": {
          pushNode(createRaceNode(tokens, stringLiteralPlaceholders));
          break;
        }
        case "ALL": {
          pushNode(createAllNode(tokens, stringLiteralPlaceholders));
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
      type: "root"
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
  function createRaceNode(tokens, stringLiteralPlaceholders) {
    const node = {
      type: "race",
      ...parseAttributeTokens(tokens, stringLiteralPlaceholders)
    };
    popAndCheck(tokens, "{");
    return node;
  }
  function createAllNode(tokens, stringLiteralPlaceholders) {
    const node = {
      type: "all",
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
      ...parseAttributeTokens(tokens, stringLiteralPlaceholders)
    };
    if (nodeArguments.length) {
      node.weights = nodeArguments.map(({ value }) => value);
    }
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
        `invalid action node argument value '${arg.value}', must be string, number, boolean, agent property reference or null`
      );
    });
    return {
      type: "action",
      call: actionNameIdentifier.value,
      args: agentFunctionArgs.map(getArgumentJsonValue),
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
        `invalid condition node argument value '${arg.value}', must be string, number, boolean, agent property reference or null`
      );
    });
    return {
      type: "condition",
      call: conditionNameIdentifier.value,
      args: agentFunctionArgs.map(getArgumentJsonValue),
      ...parseAttributeTokens(tokens, stringLiteralPlaceholders)
    };
  }
  function createWaitNode(tokens, stringLiteralPlaceholders) {
    const node = { type: "wait" };
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
    if (isDecoratorNodeDefinition(definition) && isNullOrUndefined(definition.child)) {
      throw new Error(`a ${definition.type} node must have a single child node defined`);
    }
    if (isCompositeNodeDefinition(definition) && !definition.children?.length) {
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
        refs: flattenDefinition(rootNodeDefinition).filter(isBranchNodeDefinition).map(({ ref }) => ref)
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
    if (depth === 0 && definition.type !== "root") {
      throw new Error(`expected root node at base of definition but got node of type '${definition.type}'`);
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
      case "race":
        validateRaceNode(definition, depth);
        break;
      case "all":
        validateAllNode(definition, depth);
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
  function validateRaceNode(definition, depth) {
    if (definition.type !== "race") {
      throw new Error(`expected node type of 'race' for race node at depth '${depth}'`);
    }
    if (!Array.isArray(definition.children) || definition.children.length === 0) {
      throw new Error(`expected non-empty 'children' array to be defined for race node at depth '${depth}'`);
    }
    validateNodeAttributes(definition, depth);
    definition.children.forEach((child) => validateNode(child, depth + 1));
  }
  function validateAllNode(definition, depth) {
    if (definition.type !== "all") {
      throw new Error(`expected node type of 'all' for all node at depth '${depth}'`);
    }
    if (!Array.isArray(definition.children) || definition.children.length === 0) {
      throw new Error(`expected non-empty 'children' array to be defined for all node at depth '${depth}'`);
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

  // src/attributes/guards/GuardUnsatisifedException.ts
  var GuardUnsatisifedException = class extends Error {
    /**
     * @param source The node at which a guard condition failed.
     * @param guard The guard.
     */
    constructor(source, guard) {
      super("A guard path condition has failed");
      this.source = source;
      this.guard = guard;
    }
    /**
     * Gets whether the specified node is the node at which a guard condition failed.
     * @param node The node to check against the source node.
     * @returns Whether the specified node is the node at which a guard condition failed.
     */
    isSourceNode(node) {
      return node === this.source;
    }
  };

  // src/attributes/guards/GuardPath.ts
  var GuardPath = class {
    /**
     * @param nodes An array of objects defining a node instance -> guard link, ordered by node depth.
     */
    constructor(nodes) {
      this.nodes = nodes;
    }
    /**
     * Evaluate guard conditions for all guards in the tree path, moving outwards from the root.
     * @param agent The agent, required for guard evaluation.
     * @returns An evaluation results object.
     */
    evaluate(agent) {
      for (const details of this.nodes) {
        for (const guard of details.guards) {
          if (!guard.isSatisfied(agent)) {
            throw new GuardUnsatisifedException(details.node, guard);
          }
        }
      }
    }
  };

  // src/Utilities.ts
  function createUid() {
    const S4 = function() {
      return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1);
    };
    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
  }

  // src/nodes/Node.ts
  var Node = class {
    /**
     * @param type The node type.
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     */
    constructor(type, attributes, options) {
      this.type = type;
      this.options = options;
      this.uid = createUid();
      this.attributes = {
        entry: attributes.find(({ type: type2 }) => type2 === "entry"),
        step: attributes.find(({ type: type2 }) => type2 === "step"),
        exit: attributes.find(({ type: type2 }) => type2 === "exit"),
        while: attributes.find(({ type: type2 }) => type2 === "while"),
        until: attributes.find(({ type: type2 }) => type2 === "until")
      };
    }
    /**
     * The node unique identifier.
     */
    uid;
    /**
     * The node attributes.
     */
    attributes;
    /**
     * The node state.
     */
    _state = "mistreevous.ready" /* READY */;
    /**
     * The guard path to evaluate as part of a node update.
     */
    _guardPath;
    /**
     * Gets/Sets the state of the node.
     */
    getState = () => this._state;
    setState = (value) => {
      const previousState = this._state;
      this._state = value;
      if (previousState !== value) {
        this.onStateChanged(previousState);
      }
    };
    /**
     * Gets the unique id of the node.
     */
    getUid = () => this.uid;
    /**
     * Gets the type of the node.
     */
    getType = () => this.type;
    /**
     * Gets the node attributes.
     */
    getAttributes = () => Object.values(this.attributes).filter((attribute) => !!attribute);
    /**
     * Sets the guard path to evaluate as part of a node update.
     */
    setGuardPath = (value) => this._guardPath = value;
    /**
     * Gets whether a guard path is assigned to this node.
     */
    hasGuardPath = () => !!this._guardPath;
    /**
     * Gets whether this node is in the specified state.
     * @param value The value to compare to the node state.
     */
    is(value) {
      return this._state === value;
    }
    /**
     * Reset the state of the node.
     */
    reset() {
      this.setState("mistreevous.ready" /* READY */);
    }
    /**
     * Abort the running of this node.
     * @param agent The agent.
     */
    abort(agent) {
      if (!this.is("mistreevous.running" /* RUNNING */)) {
        return;
      }
      this.reset();
      this.attributes.exit?.callAgentFunction(agent, false, true);
    }
    /**
     * Update the node.
     * @param agent The agent.
     * @returns The result of the update.
     */
    update(agent) {
      if (this.is("mistreevous.succeeded" /* SUCCEEDED */) || this.is("mistreevous.failed" /* FAILED */)) {
        return;
      }
      try {
        this._guardPath.evaluate(agent);
        if (this.is("mistreevous.ready" /* READY */)) {
          this.attributes.entry?.callAgentFunction(agent);
        }
        this.attributes.step?.callAgentFunction(agent);
        this.onUpdate(agent);
        if (this.is("mistreevous.succeeded" /* SUCCEEDED */) || this.is("mistreevous.failed" /* FAILED */)) {
          this.attributes.exit?.callAgentFunction(agent, this.is("mistreevous.succeeded" /* SUCCEEDED */), false);
        }
      } catch (error) {
        if (error instanceof GuardUnsatisifedException && error.isSourceNode(this)) {
          this.abort(agent);
          this.setState(error.guard.succeedOnAbort ? "mistreevous.succeeded" /* SUCCEEDED */ : "mistreevous.failed" /* FAILED */);
        } else {
          throw error;
        }
      }
    }
    /**
     * Gets the details of this node instance.
     * @returns The details of this node instance.
     */
    getDetails() {
      return {
        id: this.uid,
        name: this.getName(),
        type: this.type,
        while: this.attributes.while?.getDetails(),
        until: this.attributes.until?.getDetails(),
        entry: this.attributes.entry?.getDetails(),
        step: this.attributes.step?.getDetails(),
        exit: this.attributes.exit?.getDetails(),
        state: this._state
      };
    }
    /**
     * Called when the state of this node changes.
     * @param previousState The previous node state.
     */
    onStateChanged(previousState) {
      this.options.onNodeStateChange?.({
        id: this.uid,
        type: this.type,
        while: this.attributes.while?.getDetails(),
        until: this.attributes.until?.getDetails(),
        entry: this.attributes.entry?.getDetails(),
        step: this.attributes.step?.getDetails(),
        exit: this.attributes.exit?.getDetails(),
        previousState,
        state: this._state
      });
    }
  };

  // src/nodes/leaf/Leaf.ts
  var Leaf = class extends Node {
  };

  // src/nodes/composite/Composite.ts
  var Composite = class extends Node {
    /**
     * @param type The node type.
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param children The child nodes.
     */
    constructor(type, attributes, options, children) {
      super(type, attributes, options);
      this.children = children;
    }
    /**
     * Gets the children of this node.
     */
    getChildren = () => this.children;
    /**
     * Reset the state of the node.
     */
    reset = () => {
      this.setState("mistreevous.ready" /* READY */);
      this.children.forEach((child) => child.reset());
    };
    /**
     * Abort the running of this node.
     * @param agent The agent.
     */
    abort = (agent) => {
      if (!this.is("mistreevous.running" /* RUNNING */)) {
        return;
      }
      this.children.forEach((child) => child.abort(agent));
      this.reset();
      this.attributes.exit?.callAgentFunction(agent, false, true);
    };
    /**
     * Gets the details of this node instance.
     * @returns The details of this node instance.
     */
    getDetails() {
      return {
        ...super.getDetails(),
        children: this.children.map((child) => child.getDetails())
      };
    }
  };

  // src/nodes/composite/Parallel.ts
  var Parallel = class extends Composite {
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param children The child nodes.
     */
    constructor(attributes, options, children) {
      super("parallel", attributes, options, children);
    }
    /**
     * Called when the node is being updated.
     * @param agent The agent.
     */
    onUpdate(agent) {
      for (const child of this.children) {
        if (child.getState() === "mistreevous.ready" /* READY */ || child.getState() === "mistreevous.running" /* RUNNING */) {
          child.update(agent);
        }
      }
      if (this.children.find((child) => child.is("mistreevous.failed" /* FAILED */))) {
        this.setState("mistreevous.failed" /* FAILED */);
        for (const child of this.children) {
          if (child.getState() === "mistreevous.running" /* RUNNING */) {
            child.abort(agent);
          }
        }
        return;
      }
      if (this.children.every((child) => child.is("mistreevous.succeeded" /* SUCCEEDED */))) {
        this.setState("mistreevous.succeeded" /* SUCCEEDED */);
        return;
      }
      this.setState("mistreevous.running" /* RUNNING */);
    }
    /**
     * Gets the name of the node.
     */
    getName = () => "PARALLEL";
  };

  // src/nodes/composite/Race.ts
  var Race = class extends Composite {
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param children The child nodes.
     */
    constructor(attributes, options, children) {
      super("race", attributes, options, children);
    }
    /**
     * Called when the node is being updated.
     * @param agent The agent.
     */
    onUpdate(agent) {
      for (const child of this.children) {
        if (child.getState() === "mistreevous.ready" /* READY */ || child.getState() === "mistreevous.running" /* RUNNING */) {
          child.update(agent);
        }
      }
      if (this.children.find((child) => child.is("mistreevous.succeeded" /* SUCCEEDED */))) {
        this.setState("mistreevous.succeeded" /* SUCCEEDED */);
        for (const child of this.children) {
          if (child.getState() === "mistreevous.running" /* RUNNING */) {
            child.abort(agent);
          }
        }
        return;
      }
      if (this.children.every((child) => child.is("mistreevous.failed" /* FAILED */))) {
        this.setState("mistreevous.failed" /* FAILED */);
        return;
      }
      this.setState("mistreevous.running" /* RUNNING */);
    }
    /**
     * Gets the name of the node.
     */
    getName = () => "RACE";
  };

  // src/nodes/composite/All.ts
  var All = class extends Composite {
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param children The child nodes.
     */
    constructor(attributes, options, children) {
      super("all", attributes, options, children);
    }
    /**
     * Called when the node is being updated.
     * @param agent The agent.
     */
    onUpdate(agent) {
      for (const child of this.children) {
        if (child.getState() === "mistreevous.ready" /* READY */ || child.getState() === "mistreevous.running" /* RUNNING */) {
          child.update(agent);
        }
      }
      if (this.children.every((child) => child.is("mistreevous.succeeded" /* SUCCEEDED */) || child.is("mistreevous.failed" /* FAILED */))) {
        this.setState(this.children.find((child) => child.is("mistreevous.succeeded" /* SUCCEEDED */)) ? "mistreevous.succeeded" /* SUCCEEDED */ : "mistreevous.failed" /* FAILED */);
        return;
      }
      this.setState("mistreevous.running" /* RUNNING */);
    }
    /**
     * Gets the name of the node.
     */
    getName = () => "ALL";
  };

  // src/nodes/composite/Selector.ts
  var Selector = class extends Composite {
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param children The child nodes.
     */
    constructor(attributes, options, children) {
      super("selector", attributes, options, children);
      this.children = children;
    }
    /**
     * Called when the node is being updated.
     * @param agent The agent.
     */
    onUpdate(agent) {
      for (const child of this.children) {
        if (child.getState() === "mistreevous.ready" /* READY */ || child.getState() === "mistreevous.running" /* RUNNING */) {
          child.update(agent);
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
    /**
     * Gets the name of the node.
     */
    getName = () => "SELECTOR";
  };

  // src/nodes/composite/Sequence.ts
  var Sequence = class extends Composite {
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param children The child nodes.
     */
    constructor(attributes, options, children) {
      super("sequence", attributes, options, children);
      this.children = children;
    }
    /**
     * Called when the node is being updated.
     * @param agent The agent.
     */
    onUpdate(agent) {
      for (const child of this.children) {
        if (child.getState() === "mistreevous.ready" /* READY */ || child.getState() === "mistreevous.running" /* RUNNING */) {
          child.update(agent);
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
    /**
     * Gets the name of the node.
     */
    getName = () => "SEQUENCE";
  };

  // src/nodes/composite/Lotto.ts
  var import_lotto_draw = __toESM(require_dist());
  var Lotto = class extends Composite {
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param weights The child node weights.
     * @param children The child nodes.
     */
    constructor(attributes, options, weights, children) {
      super("lotto", attributes, options, children);
      this.weights = weights;
    }
    /**
     * The child node selected to be the active one.
     */
    selectedChild;
    /**
     * Called when the node is being updated.
     * @param agent The agent.
     */
    onUpdate(agent) {
      if (this.is("mistreevous.ready" /* READY */)) {
        const lottoDraw = (0, import_lotto_draw.default)({
          // Hook up the optional 'random' behaviour tree function option to the one used by 'lotto-draw'.
          random: this.options.random,
          // Pass in each child node as a participant in the lotto draw with their respective ticket count.
          participants: this.children.map((child, index) => [child, this.weights?.[index] || 1])
        });
        this.selectedChild = lottoDraw.draw() || void 0;
      }
      if (!this.selectedChild) {
        throw new Error("failed to update lotto node as it has no active child");
      }
      if (this.selectedChild.getState() === "mistreevous.ready" /* READY */ || this.selectedChild.getState() === "mistreevous.running" /* RUNNING */) {
        this.selectedChild.update(agent);
      }
      this.setState(this.selectedChild.getState());
    }
    /**
     * Gets the name of the node.
     */
    getName = () => this.weights ? `LOTTO [${this.weights.join(",")}]` : "LOTTO";
  };

  // src/nodes/decorator/Decorator.ts
  var Decorator = class extends Node {
    /**
     * @param type The node type.
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param child The child node.
     */
    constructor(type, attributes, options, child) {
      super(type, attributes, options);
      this.child = child;
    }
    /**
     * Gets the children of this node.
     */
    getChildren = () => [this.child];
    /**
     * Reset the state of the node.
     */
    reset = () => {
      this.setState("mistreevous.ready" /* READY */);
      this.child.reset();
    };
    /**
     * Abort the running of this node.
     * @param agent The agent.
     */
    abort = (agent) => {
      if (!this.is("mistreevous.running" /* RUNNING */)) {
        return;
      }
      this.child.abort(agent);
      this.reset();
      this.attributes.exit?.callAgentFunction(agent, false, true);
    };
    /**
     * Gets the details of this node instance.
     * @returns The details of this node instance.
     */
    getDetails() {
      return {
        ...super.getDetails(),
        children: [this.child.getDetails()]
      };
    }
  };

  // src/nodes/decorator/Fail.ts
  var Fail = class extends Decorator {
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param child The child node.
     */
    constructor(attributes, options, child) {
      super("fail", attributes, options, child);
    }
    /**
     * Called when the node is being updated.
     * @param agent The agent.
     */
    onUpdate(agent) {
      if (this.child.getState() === "mistreevous.ready" /* READY */ || this.child.getState() === "mistreevous.running" /* RUNNING */) {
        this.child.update(agent);
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
    /**
     * Gets the name of the node.
     */
    getName = () => "FAIL";
  };

  // src/nodes/decorator/Flip.ts
  var Flip = class extends Decorator {
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param child The child node.
     */
    constructor(attributes, options, child) {
      super("flip", attributes, options, child);
    }
    /**
     * Called when the node is being updated.
     * @param agent The agent.
     */
    onUpdate(agent) {
      if (this.child.getState() === "mistreevous.ready" /* READY */ || this.child.getState() === "mistreevous.running" /* RUNNING */) {
        this.child.update(agent);
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
    /**
     * Gets the name of the node.
     */
    getName = () => "FLIP";
  };

  // src/nodes/decorator/Repeat.ts
  var Repeat = class extends Decorator {
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param iterations The number of iterations to repeat the child node.
     * @param iterationsMin The minimum possible number of iterations to repeat the child node.
     * @param iterationsMax The maximum possible number of iterations to repeat the child node.
     * @param child The child node.
     */
    constructor(attributes, options, iterations, iterationsMin, iterationsMax, child) {
      super("repeat", attributes, options, child);
      this.iterations = iterations;
      this.iterationsMin = iterationsMin;
      this.iterationsMax = iterationsMax;
    }
    /**
     * The number of target iterations to make.
     */
    targetIterationCount = null;
    /**
     * The current iteration count.
     */
    currentIterationCount = 0;
    /**
     * Called when the node is being updated.
     * @param agent The agent.
     */
    onUpdate(agent) {
      if (this.is("mistreevous.ready" /* READY */)) {
        this.child.reset();
        this.currentIterationCount = 0;
        this.setTargetIterationCount();
      }
      if (this.canIterate()) {
        this.setState("mistreevous.running" /* RUNNING */);
        if (this.child.getState() === "mistreevous.succeeded" /* SUCCEEDED */) {
          this.child.reset();
        }
        this.child.update(agent);
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
    /**
     * Gets the name of the node.
     */
    getName = () => {
      if (this.iterations !== null) {
        return `REPEAT ${this.iterations}x`;
      } else if (this.iterationsMin !== null && this.iterationsMax !== null) {
        return `REPEAT ${this.iterationsMin}x-${this.iterationsMax}x`;
      } else {
        return "REPEAT";
      }
    };
    /**
     * Reset the state of the node.
     */
    reset = () => {
      this.setState("mistreevous.ready" /* READY */);
      this.currentIterationCount = 0;
      this.child.reset();
    };
    /**
     * Gets whether an iteration can be made.
     * @returns Whether an iteration can be made.
     */
    canIterate = () => {
      if (this.targetIterationCount !== null) {
        return this.currentIterationCount < this.targetIterationCount;
      }
      return true;
    };
    /**
     * Sets the target iteration count.
     */
    setTargetIterationCount = () => {
      if (this.iterations !== null) {
        this.targetIterationCount = this.iterations;
      } else if (this.iterationsMin !== null && this.iterationsMax !== null) {
        const random = typeof this.options.random === "function" ? this.options.random : Math.random;
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
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param attempts The number of attempts to retry the child node.
     * @param attemptsMin The minimum possible number of attempts to retry the child node.
     * @param attemptsMax The maximum possible number of attempts to retry the child node.
     * @param child The child node.
     */
    constructor(attributes, options, attempts, attemptsMin, attemptsMax, child) {
      super("retry", attributes, options, child);
      this.attempts = attempts;
      this.attemptsMin = attemptsMin;
      this.attemptsMax = attemptsMax;
    }
    /**
     * The number of target attempts to make.
     */
    targetAttemptCount = null;
    /**
     * The current attempt count.
     */
    currentAttemptCount = 0;
    /**
     * Called when the node is being updated.
     * @param agent The agent.
     */
    onUpdate(agent) {
      if (this.is("mistreevous.ready" /* READY */)) {
        this.child.reset();
        this.currentAttemptCount = 0;
        this.setTargetAttemptCount();
      }
      if (this.canAttempt()) {
        this.setState("mistreevous.running" /* RUNNING */);
        if (this.child.getState() === "mistreevous.failed" /* FAILED */) {
          this.child.reset();
        }
        this.child.update(agent);
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
    /**
     * Gets the name of the node.
     */
    getName = () => {
      if (this.attempts !== null) {
        return `RETRY ${this.attempts}x`;
      } else if (this.attemptsMin !== null && this.attemptsMax !== null) {
        return `RETRY ${this.attemptsMin}x-${this.attemptsMax}x`;
      } else {
        return "RETRY";
      }
    };
    /**
     * Reset the state of the node.
     */
    reset = () => {
      this.setState("mistreevous.ready" /* READY */);
      this.currentAttemptCount = 0;
      this.child.reset();
    };
    /**
     * Gets whether an attempt can be made.
     * @returns Whether an attempt can be made.
     */
    canAttempt = () => {
      if (this.targetAttemptCount !== null) {
        return this.currentAttemptCount < this.targetAttemptCount;
      }
      return true;
    };
    /**
     * Sets the target attempt count.
     */
    setTargetAttemptCount = () => {
      if (this.attempts !== null) {
        this.targetAttemptCount = this.attempts;
      } else if (this.attemptsMin !== null && this.attemptsMax !== null) {
        const random = typeof this.options.random === "function" ? this.options.random : Math.random;
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
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param child The child node.
     */
    constructor(attributes, options, child) {
      super("root", attributes, options, child);
    }
    /**
     * Called when the node is being updated.
     * @param agent The agent.
     */
    onUpdate(agent) {
      if (this.child.getState() === "mistreevous.ready" /* READY */ || this.child.getState() === "mistreevous.running" /* RUNNING */) {
        this.child.update(agent);
      }
      this.setState(this.child.getState());
    }
    /**
     * Gets the name of the node.
     */
    getName = () => "ROOT";
  };

  // src/nodes/decorator/Succeed.ts
  var Succeed = class extends Decorator {
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param child The child node.
     */
    constructor(attributes, options, child) {
      super("succeed", attributes, options, child);
    }
    /**
     * Called when the node is being updated.
     * @param agent The agent.
     */
    onUpdate(agent) {
      if (this.child.getState() === "mistreevous.ready" /* READY */ || this.child.getState() === "mistreevous.running" /* RUNNING */) {
        this.child.update(agent);
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
    /**
     * Gets the name of the node.
     */
    getName = () => "SUCCEED";
  };

  // src/nodes/leaf/Action.ts
  var Action = class extends Leaf {
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param actionName The action name.
     * @param actionArguments The array of action arguments.
     */
    constructor(attributes, options, actionName, actionArguments) {
      super("action", attributes, options);
      this.actionName = actionName;
      this.actionArguments = actionArguments;
    }
    /**
     * Whether there is a pending update promise.
     */
    isUsingUpdatePromise = false;
    /**
     * The finished state result of an update promise.
     */
    updatePromiseResult = null;
    /**
     * Called when the node is being updated.
     * @param agent The agent.
     */
    onUpdate(agent) {
      if (this.isUsingUpdatePromise) {
        if (!this.updatePromiseResult) {
          return;
        }
        const { isResolved, value } = this.updatePromiseResult;
        if (isResolved) {
          if (value !== "mistreevous.succeeded" /* SUCCEEDED */ && value !== "mistreevous.failed" /* FAILED */) {
            throw new Error(
              "action node promise resolved with an invalid value, expected a State.SUCCEEDED or State.FAILED value to be returned"
            );
          }
          this.setState(value);
          return;
        } else {
          throw new Error(`action function '${this.actionName}' promise rejected with '${value}'`);
        }
      }
      const actionFuncInvoker = Lookup.getFuncInvoker(agent, this.actionName);
      if (actionFuncInvoker === null) {
        throw new Error(
          `cannot update action node as the action '${this.actionName}' function is not defined on the agent and has not been registered`
        );
      }
      let actionFunctionResult;
      try {
        actionFunctionResult = actionFuncInvoker(this.actionArguments);
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`action function '${this.actionName}' threw: ${error.stack}`);
        } else {
          throw new Error(`action function '${this.actionName}' threw: ${error}`);
        }
      }
      if (actionFunctionResult instanceof Promise) {
        actionFunctionResult.then(
          (result) => {
            if (!this.isUsingUpdatePromise) {
              return;
            }
            this.updatePromiseResult = {
              isResolved: true,
              value: result
            };
          },
          (reason) => {
            if (!this.isUsingUpdatePromise) {
              return;
            }
            this.updatePromiseResult = {
              isResolved: false,
              value: reason
            };
          }
        );
        this.setState("mistreevous.running" /* RUNNING */);
        this.isUsingUpdatePromise = true;
      } else {
        this.validateUpdateResult(actionFunctionResult);
        this.setState(actionFunctionResult || "mistreevous.running" /* RUNNING */);
      }
    }
    /**
     * Gets the name of the node.
     */
    getName = () => this.actionName;
    /**
     * Reset the state of the node.
     */
    reset = () => {
      this.setState("mistreevous.ready" /* READY */);
      this.isUsingUpdatePromise = false;
      this.updatePromiseResult = null;
    };
    /**
     * Gets the details of this node instance.
     * @returns The details of this node instance.
     */
    getDetails() {
      return {
        ...super.getDetails(),
        args: this.actionArguments
      };
    }
    /**
     * Called when the state of this node changes.
     * @param previousState The previous node state.
     */
    onStateChanged(previousState) {
      this.options.onNodeStateChange?.({
        id: this.uid,
        type: this.getType(),
        args: this.actionArguments,
        while: this.attributes.while?.getDetails(),
        until: this.attributes.until?.getDetails(),
        entry: this.attributes.entry?.getDetails(),
        step: this.attributes.step?.getDetails(),
        exit: this.attributes.exit?.getDetails(),
        previousState,
        state: this.getState()
      });
    }
    /**
     * Validate the result of an update function call.
     * @param result The result of an update function call.
     */
    validateUpdateResult = (result) => {
      switch (result) {
        case "mistreevous.succeeded" /* SUCCEEDED */:
        case "mistreevous.failed" /* FAILED */:
        case "mistreevous.running" /* RUNNING */:
        case void 0:
          return;
        default:
          throw new Error(
            `expected action function '${this.actionName}' to return an optional State.SUCCEEDED or State.FAILED value but returned '${result}'`
          );
      }
    };
  };

  // src/nodes/leaf/Condition.ts
  var Condition = class extends Leaf {
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param conditionName The name of the condition function.
     * @param conditionArguments The array of condition arguments.
     */
    constructor(attributes, options, conditionName, conditionArguments) {
      super("condition", attributes, options);
      this.conditionName = conditionName;
      this.conditionArguments = conditionArguments;
    }
    /**
     * Called when the node is being updated.
     * @param agent The agent.
     */
    onUpdate(agent) {
      const conditionFuncInvoker = Lookup.getFuncInvoker(agent, this.conditionName);
      if (conditionFuncInvoker === null) {
        throw new Error(
          `cannot update condition node as the condition '${this.conditionName}' function is not defined on the agent and has not been registered`
        );
      }
      let conditionFunctionResult;
      try {
        conditionFunctionResult = conditionFuncInvoker(this.conditionArguments);
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`condition function '${this.conditionName}' threw: ${error.stack}`);
        } else {
          throw new Error(`condition function '${this.conditionName}' threw: ${error}`);
        }
      }
      if (typeof conditionFunctionResult !== "boolean") {
        throw new Error(
          `expected condition function '${this.conditionName}' to return a boolean but returned '${conditionFunctionResult}'`
        );
      }
      this.setState(conditionFunctionResult ? "mistreevous.succeeded" /* SUCCEEDED */ : "mistreevous.failed" /* FAILED */);
    }
    /**
     * Gets the name of the node.
     */
    getName = () => this.conditionName;
    /**
     * Gets the details of this node instance.
     * @returns The details of this node instance.
     */
    getDetails() {
      return {
        ...super.getDetails(),
        args: this.conditionArguments
      };
    }
    /**
     * Called when the state of this node changes.
     * @param previousState The previous node state.
     */
    onStateChanged(previousState) {
      this.options.onNodeStateChange?.({
        id: this.uid,
        type: this.getType(),
        args: this.conditionArguments,
        while: this.attributes.while?.getDetails(),
        until: this.attributes.until?.getDetails(),
        entry: this.attributes.entry?.getDetails(),
        step: this.attributes.step?.getDetails(),
        exit: this.attributes.exit?.getDetails(),
        previousState,
        state: this.getState()
      });
    }
  };

  // src/nodes/leaf/Wait.ts
  var Wait = class extends Leaf {
    /**
     * @param attributes The node attributes.
     * @param options The behaviour tree options.
     * @param duration The duration that this node will wait to succeed in milliseconds.
     * @param durationMin The minimum possible duration in milliseconds that this node will wait to succeed.
     * @param durationMax The maximum possible duration in milliseconds that this node will wait to succeed.
     */
    constructor(attributes, options, duration, durationMin, durationMax) {
      super("wait", attributes, options);
      this.duration = duration;
      this.durationMin = durationMin;
      this.durationMax = durationMax;
    }
    /**
     * The time in milliseconds at which this node was first updated.
     */
    initialUpdateTime = 0;
    /**
     * The total duration in milliseconds that this node will be waiting for.
     */
    totalDuration = null;
    /**
     * The duration in milliseconds that this node has been waiting for.
     */
    waitedDuration = 0;
    /**
     * Called when the node is being updated.
     * @param agent The agent.
     */
    onUpdate(agent) {
      if (this.is("mistreevous.ready" /* READY */)) {
        this.initialUpdateTime = (/* @__PURE__ */ new Date()).getTime();
        this.waitedDuration = 0;
        if (this.duration !== null) {
          this.totalDuration = this.duration;
        } else if (this.durationMin !== null && this.durationMax !== null) {
          const random = typeof this.options.random === "function" ? this.options.random : Math.random;
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
      if (typeof this.options.getDeltaTime === "function") {
        const deltaTime = this.options.getDeltaTime();
        if (typeof deltaTime !== "number" || isNaN(deltaTime)) {
          throw new Error("The delta time must be a valid number and not NaN.");
        }
        this.waitedDuration += deltaTime * 1e3;
      } else {
        this.waitedDuration = (/* @__PURE__ */ new Date()).getTime() - this.initialUpdateTime;
      }
      if (this.waitedDuration >= this.totalDuration) {
        this.setState("mistreevous.succeeded" /* SUCCEEDED */);
      }
    }
    /**
     * Gets the name of the node.
     */
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
    /**
     * @param type The node attribute type.
     * @param args The array of attribute arguments.
     */
    constructor(type, args) {
      this.type = type;
      this.args = args;
    }
  };

  // src/attributes/guards/Guard.ts
  var Guard = class extends Attribute {
    /**
     * Creates a new instance of the Guard class.
     * @param type The node attribute type.
     * @param definition The node guard definition.
     */
    constructor(type, definition) {
      super(type, definition.args ?? []);
      this.definition = definition;
    }
    /**
     * Gets the name of the condition function that determines whether the guard is satisfied.
     */
    get condition() {
      return this.definition.call;
    }
    /**
     * Gets a flag defining whether the running node should move to the succeeded state when aborted, otherwise failed.
     */
    get succeedOnAbort() {
      return !!this.definition.succeedOnAbort;
    }
    /**
     * Gets the attribute details.
     */
    getDetails() {
      return {
        type: this.type,
        args: this.args,
        calls: this.condition,
        succeedOnAbort: this.succeedOnAbort
      };
    }
  };

  // src/attributes/guards/While.ts
  var While = class extends Guard {
    /**
     * Creates a new instance of the While class.
     * @param definition The while node guard definition.
     */
    constructor(definition) {
      super("while", definition);
    }
    /**
     * Gets whether the guard is satisfied.
     * @param agent The agent.
     * @returns Whether the guard is satisfied.
     */
    isSatisfied = (agent) => {
      const conditionFuncInvoker = Lookup.getFuncInvoker(agent, this.condition);
      if (conditionFuncInvoker === null) {
        throw new Error(
          `cannot evaluate node guard as the condition '${this.condition}' function is not defined on the agent and has not been registered`
        );
      }
      let conditionFunctionResult;
      try {
        conditionFunctionResult = conditionFuncInvoker(this.args);
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`guard condition function '${this.condition}' threw: ${error.stack}`);
        } else {
          throw new Error(`guard condition function '${this.condition}' threw: ${error}`);
        }
      }
      if (typeof conditionFunctionResult !== "boolean") {
        throw new Error(
          `expected guard condition function '${this.condition}' to return a boolean but returned '${conditionFunctionResult}'`
        );
      }
      return conditionFunctionResult;
    };
  };

  // src/attributes/guards/Until.ts
  var Until = class extends Guard {
    /**
     * Creates a new instance of the Until class.
     * @param definition The while node guard definition.
     */
    constructor(definition) {
      super("until", definition);
    }
    /**
     * Gets whether the guard is satisfied.
     * @param agent The agent.
     * @returns Whether the guard is satisfied.
     */
    isSatisfied = (agent) => {
      const conditionFuncInvoker = Lookup.getFuncInvoker(agent, this.condition);
      if (conditionFuncInvoker === null) {
        throw new Error(
          `cannot evaluate node guard as the condition '${this.condition}' function is not defined on the agent and has not been registered`
        );
      }
      let conditionFunctionResult;
      try {
        conditionFunctionResult = conditionFuncInvoker(this.args);
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`guard condition function '${this.condition}' threw: ${error.stack}`);
        } else {
          throw new Error(`guard condition function '${this.condition}' threw: ${error}`);
        }
      }
      if (typeof conditionFunctionResult !== "boolean") {
        throw new Error(
          `expected guard condition function '${this.condition}' to return a boolean but returned '${conditionFunctionResult}'`
        );
      }
      return !conditionFunctionResult;
    };
  };

  // src/attributes/callbacks/Callback.ts
  var Callback = class extends Attribute {
    /**
     * @param type The node attribute type.
     * @param args The array of decorator argument definitions.
     * @param functionName The name of the agent function to call.
     */
    constructor(type, args, functionName) {
      super(type, args);
      this.functionName = functionName;
    }
    /**
     * Gets the name of the agent function to call.
     */
    getFunctionName = () => this.functionName;
    /**
     * Gets the attribute details.
     */
    getDetails() {
      return {
        type: this.type,
        args: this.args,
        calls: this.getFunctionName()
      };
    }
  };

  // src/attributes/callbacks/Entry.ts
  var Entry = class extends Callback {
    /**
     * @param functionName The name of the agent function to call.
     * @param args The array of callback argument definitions.
     */
    constructor(functionName, args) {
      super("entry", args, functionName);
    }
    /**
     * Attempt to call the agent function that this callback refers to.
     * @param agent The agent.
     */
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
    /**
     * @param functionName The name of the agent function to call.
     * @param args The array of callback argument definitions.
     */
    constructor(functionName, args) {
      super("step", args, functionName);
    }
    /**
     * Attempt to call the agent function that this callback refers to.
     * @param agent The agent.
     */
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
    /**
     * @param functionName The name of the agent function to call.
     * @param args The array of callback argument definitions.
     */
    constructor(functionName, args) {
      super("exit", args, functionName);
    }
    /**
     * Attempt to call the agent function that this callback refers to.
     * @param agent The agent.
     * @param isSuccess Whether the decorated node was left with a success state.
     * @param isAborted Whether the decorated node was aborted.
     */
    callAgentFunction = (agent, isSuccess, isAborted) => {
      const callbackFuncInvoker = Lookup.getFuncInvoker(agent, this.getFunctionName());
      if (callbackFuncInvoker === null) {
        throw new Error(
          `cannot call exit function '${this.getFunctionName()}' as is not defined on the agent and has not been registered`
        );
      }
      callbackFuncInvoker([{ succeeded: isSuccess, aborted: isAborted }, ...this.args]);
    };
  };

  // src/BehaviourTreeBuilder.ts
  var MAIN_ROOT_NODE_KEY = Symbol("__root__");
  function buildRootNode(definition, options) {
    const rootNodeDefinitionMap = createRootNodeDefinitionMap(definition);
    validateBranchSubtreeLinks(
      [rootNodeDefinitionMap[MAIN_ROOT_NODE_KEY], ...Object.values(rootNodeDefinitionMap)],
      true
    );
    const rootNode = nodeFactory(rootNodeDefinitionMap[MAIN_ROOT_NODE_KEY], rootNodeDefinitionMap, options);
    applyLeafNodeGuardPaths(rootNode);
    return rootNode;
  }
  function nodeFactory(definition, rootNodeDefinitionMap, options) {
    const attributes = createNodeAttributes(definition);
    switch (definition.type) {
      case "root":
        return new Root(attributes, options, nodeFactory(definition.child, rootNodeDefinitionMap, options));
      case "repeat": {
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
          options,
          iterations,
          iterationsMin,
          iterationsMax,
          nodeFactory(definition.child, rootNodeDefinitionMap, options)
        );
      }
      case "retry": {
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
          options,
          attempts,
          attemptsMin,
          attemptsMax,
          nodeFactory(definition.child, rootNodeDefinitionMap, options)
        );
      }
      case "flip":
        return new Flip(attributes, options, nodeFactory(definition.child, rootNodeDefinitionMap, options));
      case "succeed":
        return new Succeed(attributes, options, nodeFactory(definition.child, rootNodeDefinitionMap, options));
      case "fail":
        return new Fail(attributes, options, nodeFactory(definition.child, rootNodeDefinitionMap, options));
      case "sequence":
        return new Sequence(
          attributes,
          options,
          definition.children.map((child) => nodeFactory(child, rootNodeDefinitionMap, options))
        );
      case "selector":
        return new Selector(
          attributes,
          options,
          definition.children.map((child) => nodeFactory(child, rootNodeDefinitionMap, options))
        );
      case "parallel":
        return new Parallel(
          attributes,
          options,
          definition.children.map((child) => nodeFactory(child, rootNodeDefinitionMap, options))
        );
      case "race":
        return new Race(
          attributes,
          options,
          definition.children.map((child) => nodeFactory(child, rootNodeDefinitionMap, options))
        );
      case "all":
        return new All(
          attributes,
          options,
          definition.children.map((child) => nodeFactory(child, rootNodeDefinitionMap, options))
        );
      case "lotto":
        return new Lotto(
          attributes,
          options,
          definition.weights,
          definition.children.map((child) => nodeFactory(child, rootNodeDefinitionMap, options))
        );
      case "branch":
        return nodeFactory(rootNodeDefinitionMap[definition.ref].child, rootNodeDefinitionMap, options);
      case "action":
        return new Action(attributes, options, definition.call, definition.args || []);
      case "condition":
        return new Condition(attributes, options, definition.call, definition.args || []);
      case "wait": {
        let duration = null;
        let durationMin = null;
        let durationMax = null;
        if (Array.isArray(definition.duration)) {
          durationMin = definition.duration[0];
          durationMax = definition.duration[1];
        } else if (isInteger(definition.duration)) {
          duration = definition.duration;
        }
        return new Wait(attributes, options, duration, durationMin, durationMax);
      }
    }
  }
  function createNodeAttributes(definition) {
    const attributes = [];
    if (definition.while) {
      attributes.push(new While(definition.while));
    }
    if (definition.until) {
      attributes.push(new Until(definition.until));
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
      if (node instanceof Leaf) {
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
          path.slice(0, depth + 1).map((node) => ({
            node,
            guards: node.getAttributes().filter((attribute) => attribute instanceof Guard)
          })).filter((details) => details.guards.length > 0)
        );
        currentNode.setGuardPath(guardPath);
      }
    });
  }

  // src/BehaviourTree.ts
  var BehaviourTree = class {
    /**
     * Creates a new instance of the BehaviourTree class.
     * @param definition The behaviour tree definition as either an MDSL string, root node definition object or array of root node definition objects.
     * @param agent The agent instance that this behaviour tree is modelling behaviour for.
     * @param options The behaviour tree options object.
     */
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
        this._rootNode = buildRootNode(json, options);
      } catch (exception) {
        throw new Error(`error building tree: ${exception.message}`);
      }
    }
    /**
     * The main root tree node.
     */
    _rootNode;
    /**
     * Gets whether the tree is in the RUNNING state.
     * @returns true if the tree is in the RUNNING state, otherwise false.
     */
    isRunning() {
      return this._rootNode.getState() === "mistreevous.running" /* RUNNING */;
    }
    /**
     * Gets the current tree state of SUCCEEDED, FAILED, READY or RUNNING.
     * @returns The current tree state.
     */
    getState() {
      return this._rootNode.getState();
    }
    /**
     * Step the tree.
     * Carries out a node update that traverses the tree from the root node outwards to any child nodes, skipping those that are already in a resolved state of SUCCEEDED or FAILED.
     * After being updated, leaf nodes will have a state of SUCCEEDED, FAILED or RUNNING. Leaf nodes that are left in the RUNNING state as part of a tree step will be revisited each
     * subsequent step until they move into a resolved state of either SUCCEEDED or FAILED, after which execution will move through the tree to the next node with a state of READY.
     *
     * Calling this method when the tree is already in a resolved state of SUCCEEDED or FAILED will cause it to be reset before tree traversal begins.
     */
    step() {
      if (this._rootNode.getState() === "mistreevous.succeeded" /* SUCCEEDED */ || this._rootNode.getState() === "mistreevous.failed" /* FAILED */) {
        this._rootNode.reset();
      }
      try {
        this._rootNode.update(this.agent);
      } catch (exception) {
        throw new Error(`error stepping tree: ${exception.message}`);
      }
    }
    /**
     * Resets the tree from the root node outwards to each nested node, giving each a state of READY.
     */
    reset() {
      this._rootNode.reset();
    }
    /**
     * Gets the details of every node in the tree, starting from the root.
     * @returns The details of every node in the tree, starting from the root.
     */
    getTreeNodeDetails() {
      return this._rootNode.getDetails();
    }
    /**
     * Registers the action/condition/guard/callback function or subtree with the given name.
     * @param name The name of the function or subtree to register.
     * @param value The function or subtree definition to register.
     */
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
        if (rootNodeDefinitions.length != 1 || typeof rootNodeDefinitions[0].id !== "undefined") {
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
    /**
     * Unregisters the registered action/condition/guard/callback function or subtree with the given name.
     * @param name The name of the registered action/condition/guard/callback function or subtree to unregister.
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
  };
  return __toCommonJS(index_exports);
})();
//# sourceMappingURL=mistreevous.js.map
