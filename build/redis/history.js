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
const MessagesDbOpt = { db: 3 };
function getAds(username) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.getAsync(username); }), MessagesDbOpt);
    });
}
exports.getAds = getAds;
function saveAds(username, ads) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.setAsync(username, ads, "ex", 600); }), MessagesDbOpt);
        }
        catch (e) {
            logger.error("saveAds error", e.message);
        }
    });
}
exports.saveAds = saveAds;
function removeAds(username) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.delAsync(username); }), MessagesDbOpt);
        }
        catch (e) {
            logger.error("removeAds error", e.message);
        }
    });
}
exports.removeAds = removeAds;
function getGoods(username) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.getAsync(username); }), MessagesDbOpt);
    });
}
exports.getGoods = getGoods;
function saveGoods(username, goods) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.setAsync(username, goods, "ex", 600); }), MessagesDbOpt);
        }
        catch (e) {
            logger.error("saveGoods error", e.message);
        }
    });
}
exports.saveGoods = saveGoods;
function removeGoods(username) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.delAsync(username); }), MessagesDbOpt);
        }
        catch (e) {
            logger.error("removeGoods error", e.message);
        }
    });
}
exports.removeGoods = removeGoods;
function getAnswerAds(opt) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.getAsync(opt); }), MessagesDbOpt);
    });
}
exports.getAnswerAds = getAnswerAds;
function saveAnswerAds(opt, val) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.setAsync(opt, val, "ex", 5); }), MessagesDbOpt);
        }
        catch (e) {
            logger.error("saveAds error", e.message);
        }
    });
}
exports.saveAnswerAds = saveAnswerAds;
//# sourceMappingURL=history.js.map