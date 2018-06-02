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
const assert = require("assert");
class LoginInfo {
    constructor(uuid, key, token, login, perm) {
        [this.uuid, this.key, this.token, this.login] = [uuid, key, token, login];
        if (perm) {
            assert(typeof perm === "string");
            this.perm = perm;
            this.permMap = JSON.parse(perm);
        }
    }
    static valueOf(s) {
        assert(typeof s === "string");
        let obj = JSON.parse(s);
        if (!obj)
            throw new Error("invalid LoginInfo format");
        let { uuid, key, token, login, perm } = obj;
        if (perm)
            assert(typeof perm === "string");
        return new LoginInfo(uuid, key, token, login, perm);
    }
    getUuid() { return this.uuid; }
    getKey() { return this.key; }
    getToken() { return this.token; }
    getLogin() { return this.login; }
    getPerm() { return this.perm; }
    /*
    root | adminRO | adminRW | adsRO | adsRW
    */
    /**
     * {
     *      root:1
     *      ro/rw:1
     *  }
     */
    isCommon(field) {
        if (!this.permMap)
            return false;
        return !!this.permMap[field];
    }
    isRoot() {
        return this.isCommon("root");
    }
    isAdminRO() {
        return this.isCommon("adminRO");
    }
    isAdminRW() {
        return this.isCommon("adminRW");
    }
    //新添加的appuser权限
    isAppUser() {
        return this.isCommon("appuser");
    }
    isAdvertiserRW() {
        return this.isCommon("advertiserRW");
    }
    isAdsRO() {
        return this.isCommon("adsRO");
    }
    isAdsRW() {
        return this.isCommon("adsRW");
    }
    isGoodsRO() {
        return this.isCommon("goodsRO");
    }
    isGoodsRW() {
        return this.isCommon("goodsRW");
    }
}
exports.LoginInfo = LoginInfo;
const logger = require("winston");
const redispool_1 = require("../lib/redispool");
const [sessionDbOpt, Sessiontimeout] = [{ db: 15 }, 604800];
function setLoginAsync(uuid, loginInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        const content = JSON.stringify(loginInfo);
        yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.setAsync(uuid, content, "ex", Sessiontimeout); }), sessionDbOpt);
    });
}
exports.setLoginAsync = setLoginAsync;
function setAppLoginAsync(uuid, loginInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        const content = JSON.stringify(loginInfo);
        yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.setAsync("app" + uuid, content, "ex", Sessiontimeout); }), sessionDbOpt);
    });
}
exports.setAppLoginAsync = setAppLoginAsync;
function getLoginAsync(uuid, token) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!uuid || !token)
            return [undefined, "没有登录！"];
        let s = yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.getAsync(uuid); }), sessionDbOpt);
        if (!s)
            return [undefined, "没有登录！"];
        let info = LoginInfo.valueOf(s);
        if (token !== info.getToken())
            return [undefined, "没有登录！"];
        return [info, undefined];
    });
}
exports.getLoginAsync = getLoginAsync;
function delLogin(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return rds.delAsync(uuid); }), sessionDbOpt);
        }
        catch (e) {
            logger.error("delLogin error", e.message);
        }
    });
}
exports.delLogin = delLogin;
function delAppLogin(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return rds.delAsync("app" + uuid); }), sessionDbOpt);
        }
        catch (e) {
            logger.error("delLogin error", e.message);
        }
    });
}
exports.delAppLogin = delAppLogin;
const response_1 = require("../lib/response");
const reqerror_1 = require("../lib/reqerror");
//crm登录信息
function checkLogin(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { token, uuid } = req.cookies;
        if (!token && !uuid) {
            token = req.headers.token;
            uuid = req.headers.uuid;
        }
        try {
            let [info, errMsg] = yield getLoginAsync(uuid, token);
            if (info) {
                req.loginInfo = info;
                return next();
            }
            return response_1.sendError(res, new reqerror_1.ReqError(errMsg, 401));
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
}
exports.checkLogin = checkLogin;
//app登录信息和crm登录信息分开存，避免相互挤出登录状态
function checkAppLogin(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { token, uuid } = req.cookies;
        if (!token && !uuid) {
            token = req.headers.token;
            uuid = req.headers.uuid;
        }
        try {
            let [info, errMsg] = yield getLoginAsync("app" + uuid, token);
            if (info) {
                req.loginInfo = info;
                return next();
            }
            return response_1.sendError(res, new reqerror_1.ReqError(errMsg, 401));
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
}
exports.checkAppLogin = checkAppLogin;
function getLogininfo(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { token, uuid } = req.cookies;
        if (!token && !uuid) {
            token = req.headers.token;
            uuid = req.headers.uuid;
        }
        try {
            let [info] = yield getLoginAsync("app" + uuid, token);
            req.loginInfo = info;
            return next();
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
}
exports.getLogininfo = getLogininfo;
//# sourceMappingURL=logindao.js.map