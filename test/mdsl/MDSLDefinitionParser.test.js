const mistreevous = require("../../dist/index");
const chai = require("chai");

var assert = chai.assert;

describe("The convertMDSLToJSON function", () => {
    it("does stuff", () => {
        assert.strictEqual(mistreevous.convertMDSLToJSON("root {}"), JSON.stringify([{ type: "root" }]));
    });
});
