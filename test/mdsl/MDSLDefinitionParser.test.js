const mistreevous = require("../../dist/index");
const chai = require("chai");

var assert = chai.assert;

describe("The parseMDSLToJSON function", () => {
    it("does stuff", () => {
        assert.strictEqual(mistreevous.parseMDSLToJSON("root {}"), JSON.stringify([{ type: "root" }]));
    });
});
