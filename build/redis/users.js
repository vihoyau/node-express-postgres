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
const logger = require("winston");
const redispool_1 = require("../lib/redispool");
const system_1 = require("../model/system/system");
const [MessagesDbOpt, openidDbOpt] = [{ db: 1 }, { db: 2 }];
function getInviteInterval() {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield system_1.findByName("invite");
        return res.content.val;
    });
}
function getSmsCode(username) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.getAsync(username); }), MessagesDbOpt);
    });
}
exports.getSmsCode = getSmsCode;
function saveSmsCode(username, content) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.setAsync(username, content, "ex", 600); }), MessagesDbOpt);
        }
        catch (e) {
            logger.error("saveSmsCode error", e.message);
        }
    });
}
exports.saveSmsCode = saveSmsCode;
//???????????
function getCaptchaCode(username) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.getAsync("Captcha" + username); }), MessagesDbOpt);
    });
}
exports.getCaptchaCode = getCaptchaCode;
//????????????
function saveCaptchaCode(username, content) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.setAsync("Captcha" + username, content, "ex", 600); }), MessagesDbOpt);
        }
        catch (e) {
            logger.error("saveCaptchaCode error", e.message);
        }
    });
}
exports.saveCaptchaCode = saveCaptchaCode;
// export async function getCaptchaCode2(username: string) {
//     return await getRedisClientAsync(async rds => await rds.getAsync("CaptchaCode" + username), MessagesDbOpt)
// }
// //???????????????
// export async function saveCaptchaCode2(username: string) {/*60S?????????????????????*/
//     try {
//         await getRedisClientAsync(async rds => await rds.setAsync("CaptchaCode" + username, "captcha", "ex", 60), MessagesDbOpt)
//     } catch (e) {
//         logger.error("saveCaptchaCode error", e.message)
//     }
// }
function getCaptchaCode3(username) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.getAsync("passCaptchaCode" + username); }), MessagesDbOpt);
    });
}
exports.getCaptchaCode3 = getCaptchaCode3;
function saveCaptchaCode3(username) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.setAsync("passCaptchaCode" + username, "captcha", "ex", 600); }), MessagesDbOpt);
        }
        catch (e) {
            logger.error("saveCaptchaCode error", e.message);
        }
    });
}
exports.saveCaptchaCode3 = saveCaptchaCode3;
//
function getInvite(username) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.getAsync("invite" + username); }), MessagesDbOpt);
    });
}
exports.getInvite = getInvite;
//
function saveInvite(username, content) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const interval = yield getInviteInterval();
            yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () {
                yield rds.setAsync("invite" + username, content, "ex", interval);
            }), MessagesDbOpt);
        }
        catch (e) {
            logger.error("saveInvite error", e.message);
        }
    });
}
exports.saveInvite = saveInvite;
function removeSmsCode(username) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.delAsync(username); }), MessagesDbOpt);
        }
        catch (e) {
            logger.error("removeSmsCode error", e.message);
        }
    });
}
exports.removeSmsCode = removeSmsCode;
function removeCaptchCode(username) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.delAsync("Captch" + username); }), MessagesDbOpt);
        }
        catch (e) {
            logger.error("removeCaptchCode error", e.message);
        }
    });
}
exports.removeCaptchCode = removeCaptchCode;
function getOpenidKey(openid) {
    return "openid_" + openid;
}
function saveOpenid(openid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.setAsync(getOpenidKey(openid), new Date().getTime(), "ex", 120); }), openidDbOpt);
    });
}
exports.saveOpenid = saveOpenid;
function getOpenid(openid) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.getAsync(getOpenidKey(openid)); }), openidDbOpt);
    });
}
exports.getOpenid = getOpenid;
//# sourceMappingURL=users.js.map