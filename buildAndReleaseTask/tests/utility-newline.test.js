"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const newline_1 = require("../utility/newline");
describe('#newline()', function () {
    it('should return a multiline string with \\n', function () {
        var input = `Line1
Line2`;
        let result = new newline_1.Newline().generate(input);
        expect(result).toBe("Line1\r\nLine2");
    });
});
