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
const validator_1 = require("../../lib/validator");
const logindao_1 = require("../../redis/logindao");
const validator_2 = require("./validator");
const response_1 = require("../../lib/response");
const express_1 = require("express");
const amountlog_1 = require("../../model/users/amountlog");
exports.router = express_1.Router();
//获取用户的零钱积分流水
exports.router.get('/', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { useruuid, start, length, starttime, endtime, type } = req.query;
        validator_1.validateCgi({ useruuid, start, length }, validator_2.balancePointLog.get);
        try {
            let recordsFiltered, logs;
            if (type == 'point') {
                recordsFiltered = yield amountlog_1.getPointCountByUser(req.app.locals.sequelize, useruuid, starttime, endtime);
                logs = yield amountlog_1.findPointByUserUUID(req.app.locals.sequelize, useruuid, start, length, starttime, endtime);
            }
            else {
                recordsFiltered = yield amountlog_1.getBalanceCountByUser(req.app.locals.sequelize, useruuid, starttime, endtime);
                logs = yield amountlog_1.findBalanceByUserUUID(req.app.locals.sequelize, useruuid, start, length, starttime, endtime);
            }
            for (let i = 0; i < logs.length; i++) {
                switch (logs[i].mode) {
                    case 'answer':
                        logs[i].mode = '答题';
                        break;
                    case 'invite':
                        logs[i].mode = '邀请';
                        break;
                    case 'lottery':
                        logs[i].mode = '抽奖';
                        break;
                    case 'collection':
                        logs[i].mode = '集道具';
                        break;
                    case 'reward':
                        logs[i].mode = '打赏';
                        break;
                    case 'recharge':
                        logs[i].mode = '充值';
                        break;
                    case 'withdraw':
                        logs[i].mode = '提现';
                        break;
                    default: break;
                }
            }
            return response_1.sendOK(res, { logs, recordsFiltered });
        }
        catch (e) {
            response_1.sendErrMsg(res, e, 500);
        }
    });
});
//重构获取用户的零钱积分流水
exports.router.post('/stream', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { useruuid, start, length, starttime, endtime, whatoption } = req.body;
        validator_1.validateCgi({ useruuid, start, length }, validator_2.balancePointLog.get);
        //whatoption有邀请，答题，抽奖，集道具
        //option返回一个对应的选项结果
        //invite邀请';lottery抽奖'; collection集道具'; reward打赏'; recharge充值'; withdraw提现'; 
        let commonoption;
        let recordsFiltered;
        let content;
        switch (whatoption) {
            case 'answer':
                recordsFiltered = yield amountlog_1.getAnswer(req.app.locals.sequelize, commonoption, start, length, useruuid, starttime, endtime);
                content = "答题";
                break;
            case 'invite':
                recordsFiltered = yield amountlog_1.getInvite(req.app.locals.sequelize, commonoption, start, length, useruuid, starttime, endtime);
                break;
            case 'lottery':
                commonoption = "lottery";
                recordsFiltered = yield amountlog_1.getOption(req.app.locals.sequelize, commonoption, start, length, useruuid, starttime, endtime);
                content = "抽奖";
                break;
            case 'collection':
                commonoption = "collection";
                recordsFiltered = yield amountlog_1.getOption(req.app.locals.sequelize, commonoption, start, length, useruuid, starttime, endtime);
                content = "集道具";
                break;
            case 'reward':
                commonoption = "reward";
                recordsFiltered = yield amountlog_1.getOption(req.app.locals.sequelize, commonoption, start, length, useruuid, starttime, endtime);
                content = "打赏";
                break;
            case 'recharge':
                commonoption = "recharge";
                recordsFiltered = yield amountlog_1.getOption(req.app.locals.sequelize, commonoption, start, length, useruuid, starttime, endtime);
                content = "充值";
                break;
            case 'withdraw':
                recordsFiltered = yield amountlog_1.getWithdraw(req.app.locals.sequelize, start, length, useruuid, starttime, endtime);
                content = "提现";
                break;
            default: break;
        }
        return response_1.sendOK(res, { recordsFiltered, content });
    });
});
//# sourceMappingURL=balancepointslog.js.map