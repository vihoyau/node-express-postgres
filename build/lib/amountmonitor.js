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
const system_1 = require("../model/system/system");
const users_1 = require("../model/users/users");
const amountlog_1 = require("../model/users/amountlog");
const logindao_1 = require("../redis/logindao");
const moment = require("moment");
const winston = require("winston");
function amountcheck(sequelize, useruuid, mode, fee, points) {
    return __awaiter(this, void 0, void 0, function* () {
        let obj = {
            useruuid: useruuid,
            amount: fee,
            points: points,
            mode: mode,
            time: moment().format('YYYY-MM-DD HH:mm:ss')
        };
        yield amountlog_1.insertAmountLog(obj);
        let limit = yield system_1.findByName("limit");
        limit = limit.content.val;
        let amount = yield amountlog_1.findTodayAmount(sequelize, useruuid);
        if (amount >= limit) { //拉黑
            yield users_1.resetAppUserState(useruuid, "off");
            logindao_1.delAppLogin(useruuid); //清除登录数据，用户立即被强制登出
            winston.info("user :" + useruuid + " be disabled because of excess just now");
        }
    });
}
exports.amountcheck = amountcheck;
//# sourceMappingURL=amountmonitor.js.map