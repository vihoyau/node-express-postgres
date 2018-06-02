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
const redispool_1 = require("../lib/redispool");
const [MessagesDbOpt] = [{ db: 1 }];
function getUserAdsOperation(key) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.getAsync(key); }), MessagesDbOpt);
    });
}
exports.getUserAdsOperation = getUserAdsOperation;
function saveUserAdsOperation(key, value) {
    return __awaiter(this, void 0, void 0, function* () {
        yield redispool_1.getRedisClientAsync((rds) => __awaiter(this, void 0, void 0, function* () { return yield rds.setAsync(key, value, "ex", 600); }), MessagesDbOpt);
    });
}
exports.saveUserAdsOperation = saveUserAdsOperation;
//# sourceMappingURL=adsoperation.js.map