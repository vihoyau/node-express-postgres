"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validator = require("validator");
const reqerror_1 = require("../lib/reqerror");
function validate(str, rules) {
    // console.log(str, typeof str, rules)
    for (let k in rules) {
        if (k == "require" || k === "transform")
            continue;
        let method = validator[k];
        if (typeof method !== "function") {
            throw new reqerror_1.ReqError(`invalid validator method ${k}`, 400);
        }
        let rule = rules[k];
        let [errmsg, param] = [rule.errmsg, rule.param];
        if (Array.isArray(param)) {
            if (!method.call(null, str, ...param))
                throw new reqerror_1.ReqError(errmsg, 400);
        }
        else if (typeof param == "object") {
            if (!method.call(null, str, param))
                throw new reqerror_1.ReqError(errmsg, 400);
        }
        else if (!method.call(null, str)) {
            throw new reqerror_1.ReqError(errmsg, 400);
        }
    }
}
exports.validate = validate;
function validateCgi(param, cgiConfig) {
    if (!param || !cgiConfig) {
        throw new reqerror_1.ReqError("invalid param", 400);
    }
    for (let k in cgiConfig) {
        let rules = cgiConfig[k];
        let userParam = param[k];
        if (userParam == null || userParam == undefined) {
            if (rules.require === 0) {
                continue;
            }
            throw new reqerror_1.ReqError(`缺少参数${k}！`, 400);
        }
        if (typeof userParam === "number") {
            userParam = userParam.toString();
        }
        validate(userParam, rules);
    }
}
exports.validateCgi = validateCgi;
//# sourceMappingURL=validator.js.map