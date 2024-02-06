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
  } catch (error) {
    return createValidationFailureResult(`invalid MDSL: ${error}`);
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
  return { succeeded: true };
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
  return { succeeded: true };
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
  const rootNode = nodeFactory(rootNodeDefinitionMap[MAIN_ROOT_NODE_KEY]);
  applyLeafNodeGuardPaths(rootNode);
  return rootNode;
}
function nodeFactory(definition) {
  const attributes = nodeAttributesFactory(definition);
  switch (definition.type) {
    case "root":
      return new Root(attributes, nodeFactory(definition.child));
    default:
      throw new Error(`unexpected node type of '${definition.type}'`);
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
    if (!definition) {
      throw new Error("the tree definition must be a string ro");
    }
    if (typeof agent !== "object" || agent === null) {
      throw new Error("the agent must be defined and not null");
    }
    try {
      this.rootNode = this._createRootNode(definition);
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
  _createRootNode(definition) {
    let resolvedDefinition;
    if (typeof definition === "string") {
      try {
        resolvedDefinition = convertMDSLToJSON(definition);
      } catch (exception) {
        throw new Error(`invalid mdsl definition: ${exception.message}`);
      }
    } else {
      resolvedDefinition = definition;
    }
    return buildRootNode(Array.isArray(resolvedDefinition) ? resolvedDefinition : [resolvedDefinition]);
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
