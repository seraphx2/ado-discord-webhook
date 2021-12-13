"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Newline = void 0;
const eol_1 = require("eol");
class Newline {
    generate(input) {
        return (0, eol_1.auto)(String(input));
    }
}
exports.Newline = Newline;
