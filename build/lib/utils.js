"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
function checkPassword(real, current) {
    let [a, b] = [real.length === 32 ? real : md5sum(real), current.length === 32 ? current : md5sum(current)];
    if (a !== b)
        throw new Error("密码不正确！");
}
exports.checkPassword = checkPassword;
function changeUsername(username) {
    if (username.length == 11)
        return username.substr(0, 3) + '****' + username.substr(7);
    return username;
}
exports.changeUsername = changeUsername;
//新添加
function checkState(real_state, current_state) {
    console.log(real_state.length);
    if (current_state != null) {
        let [a, b] = [real_state.length === 32 ? real_state : md5sum(real_state), current_state.length === 32 ? current_state : md5sum(current_state)];
        if (a == b)
            throw new Error("账号已禁用，请联系管理员！");
    }
}
exports.checkState = checkState;
function formatDate(d) {
    return moment(d).format("yyyymmddHHMMss");
}
exports.formatDate = formatDate;
function randomInt(from, to) {
    return Math.floor(Math.random() * (to - from) + from);
}
exports.randomInt = randomInt;
function md5sum(str) {
    return crypto_1.createHash('md5').update(str).digest("hex");
}
exports.md5sum = md5sum;
function sleepAsync(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
}
exports.sleepAsync = sleepAsync;
function getPageCount(page, count) {
    let limit = parseInt(count);
    let cursor = 0;
    if (page && page !== "0") {
        cursor = (parseInt(page) - 1) * parseInt(count);
    }
    return { cursor, limit };
}
exports.getPageCount = getPageCount;
function checkreq(param, sign, next) {
    return __awaiter(this, void 0, void 0, function* () {
        param.sort();
        let s = param.join(",");
        if (sign === md5sum(s)) {
            return next();
        }
        return "参数错误!";
    });
}
exports.checkreq = checkreq;
function toJson(perm) {
    if (perm === "root")
        return { root: 1 };
    if (perm === "adminRO")
        return { adminRO: 1 };
    if (perm === "adminRW")
        return { adminRW: 1 };
    if (perm === "adsRW")
        return { adsRW: 1 };
    //if (perm === "adsRO")
    //    return { adsRO: 1 }
    return { adsRO: 1 };
}
exports.toJson = toJson;
function getSign(order, key) {
    delete order.sign;
    let arr = new Array();
    for (let k in order) {
        arr.push(`${k}=${order[k]}`);
    }
    arr.sort();
    arr.push(`key=${key}`);
    return md5sum(arr.join("&")).toUpperCase();
}
exports.getSign = getSign;
//# sourceMappingURL=utils.js.map