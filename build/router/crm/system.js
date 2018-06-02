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
const validator_2 = require("./validator");
const logindao_1 = require("../../redis/logindao");
const express_1 = require("express");
const response_1 = require("../../lib/response");
const system_1 = require("../../model/system/system");
const users_1 = require("../../model/users/users");
const winston_1 = require("../../config/winston");
exports.router = express_1.Router();
exports.router.post('/', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { name, content } = req.body;
        try {
            const loginInfo = req.loginInfo;
            if (!loginInfo.isRoot() && !loginInfo.isGoodsRW())
                return response_1.sendNoPerm(res);
            validator_1.validateCgi({ name: name, content: content }, validator_2.systemValidator.contentValidator);
            let result = yield system_1.insertSystem(content, name);
            return response_1.sendOK(res, result ? result : { msg: "failed" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.put('/', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { name, content } = req.body;
        try {
            const loginInfo = req.loginInfo;
            if (name == 'informationEntrance') {
                if (!loginInfo.isAdvertiserRW() && !loginInfo.isRoot())
                    return response_1.sendNoPerm(res);
            }
            else {
                if (!loginInfo.isRoot() && !loginInfo.isGoodsRW())
                    return response_1.sendNoPerm(res);
            }
            validator_1.validateCgi({ name, content }, validator_2.systemValidator.contentValidator);
            let operation = yield system_1.findByName('operationstatus'); //获得system.system表中的开关操作标志状态值记录
            let status = operation.content.status; //获得system.system表中的status状态值
            let state = yield system_1.findByName('state'); //获得system.system表中的lotterystates状态值记录
            let lotterystate = state.content.lotterystate; //获得system.system表中的lotterystates状态值
            if (lotterystate === "on" && status === "1") {
                return response_1.sendOK(res, { message: '抽奖按钮已开启，不能修改抽奖设置' }); //返回操作信息和按钮状态
            }
            let event = yield system_1.findByName('eventname'); //得到eventname的记录
            let eventstate = event.content; //取出content的内容
            let eventstate_change = JSON.stringify(eventstate);
            if (eventstate_change === content) {
                return response_1.sendOK(res, { message: '活动名重复,请重新设置活动名称' });
            }
            else {
                if (name === "eventname") {
                    yield system_1.updateSystem(JSON.parse('{"status": "0"}'), 'operationstatus'); //更新status的状态,使到可以开启抽奖按钮
                }
            }
            yield system_1.updateSystem(JSON.parse(content), name);
            return response_1.sendOK(res, { message: '抽奖设置修改成功' });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { name } = req.query;
        try {
            validator_1.validateCgi({ name }, validator_2.systemValidator.sysname);
            let result = yield system_1.findByName(name);
            if (result)
                result.modified = winston_1.timestamps(result.modified);
            return response_1.sendOK(res, result ? result : { msg: "no data" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//获得禁用用户
exports.router.get('/offUsers', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { start, length } = req.query;
        validator_1.validateCgi({ start, length }, validator_2.systemValidator.offUsers);
        try {
            let recordsFiltered = yield users_1.getOffCount();
            let users = yield users_1.getAllOffUsers(start, length);
            users.forEach(r => {
                delete r.password;
            });
            return response_1.sendOK(res, { users, recordsFiltered });
        }
        catch (e) {
            response_1.sendError(res, e);
        }
    });
});
//# sourceMappingURL=system.js.map