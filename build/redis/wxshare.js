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
const [MessagesDbOpt] = [{ db: 6 }];
function getAccessToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.getAsync(token); }), MessagesDbOpt);
    });
}
exports.getAccessToken = getAccessToken;
function saveAccessToken(token, content) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.setAsync(token, content, "ex", 60 * 60 * 2); }), MessagesDbOpt);
        }
        catch (e) {
            logger.error("saveWeather error", e.message);
        }
    });
}
exports.saveAccessToken = saveAccessToken;
function getticket(ticket) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.getAsync(ticket); }), MessagesDbOpt);
    });
}
exports.getticket = getticket;
function saveticket(ticket, content) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.setAsync(ticket, content, "ex", 60 * 60 * 2); }), MessagesDbOpt);
        }
        catch (e) {
            logger.error("saveWeather error", e.message);
        }
    });
}
exports.saveticket = saveticket;
//# sourceMappingURL=wxshare.js.map