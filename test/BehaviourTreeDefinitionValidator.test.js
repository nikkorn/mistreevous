const mistreevous = require("../dist/index");
const chai = require("chai");

var assert = chai.assert;

describe("The validateDefinition function", () => {
    it("does stuff", () => {
        assert.strictEqual(JSON.stringify(mistreevous.validateDefinition("root {}")), "Hello!");
    });
});
