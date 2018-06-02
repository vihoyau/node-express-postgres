"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ReqError extends Error {
    constructor(msg, code = 401) {
        super(msg);
        this.code = code;
    }
    getCode() {
        return this.code;
    }
}
exports.ReqError = ReqError;
//# sourceMappingURL=reqerror.js.map