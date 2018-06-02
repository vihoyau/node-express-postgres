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
const validator_1 = require("./validator");
const validator_2 = require("../../lib/validator");
const logindao_1 = require("../../redis/logindao");
const response_1 = require("../../lib/response");
const express_1 = require("express");
const awardusers_1 = require("../../model/mall/awardusers");
const lotterylevel_1 = require("../../model/mall/lotterylevel");
const winston_1 = require("../../config/winston");
exports.router = express_1.Router();
//设置一二等奖用户和黑名单
exports.router.post("/", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { useruuid, username, level, state } = req.body;
        try {
            validator_2.validateCgi({ useruuid, username, level: parseInt(level), state }, validator_1.awardusersValidator.insertOptions);
            let obj = {
                useruuid: useruuid,
                username: username,
                level: parseInt(level),
                state: state
            };
            let numcount;
            if (parseInt(level) > 0) { //如果不是设置为黑名单
                numcount = yield lotterylevel_1.findByLevel(req.app.locals.sequelize, level, state);
                if (!numcount)
                    return response_1.sendNotFound(res, "请先设置奖励等级！");
            }
            if (parseInt(numcount) > 0 || parseInt(level) === 0) { //如果奖励等级存在
                let awardusersnum = yield awardusers_1.findAwardusersBylevelAndstate(req.app.locals.sequelize, level, state);
                if (parseInt(awardusersnum) < parseInt(numcount) || parseInt(level) === 0) {
                    let awardusers = yield awardusers_1.findAwardusersByUseruuid(useruuid, state);
                    if (awardusers)
                        return response_1.sendNotFound(res, "该获奖用户已存在！");
                    yield awardusers_1.insertAwardusers(obj);
                }
                else {
                    return response_1.sendNotFound(res, "该等级的奖励人数已达到最大人数！");
                }
            }
            else {
                return response_1.sendNotFound(res, "请先设置奖励等级！");
            }
            return response_1.sendOK(res, { awardusers: "添加成功！" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//修改一二等奖用户和黑名单
exports.router.put("/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        const { useruuid, username, level, state } = req.body;
        try {
            validator_2.validateCgi({ useruuid, username, level: parseInt(level), state }, validator_1.awardusersValidator.insertOptions);
            let obj = {
                useruuid,
                username,
                level: parseInt(level),
                state
            };
            //let numcount = await findLotterylevelBylevelAndstate(req.app.locals.sequelize, level, state)
            let numcount;
            if (parseInt(level) > 0) { //如果不是设置为黑名单
                numcount = yield lotterylevel_1.findByLevel(req.app.locals.sequelize, level, state);
                if (!numcount)
                    return response_1.sendNotFound(res, "请先设置奖励等级！");
            }
            if (parseInt(numcount) > 0 || parseInt(level) === 0) { //如果奖励等级存在
                let awardusersnum = yield awardusers_1.findAwardusersBylevelAndstate(req.app.locals.sequelize, level, state);
                if (parseInt(level) === 0 || parseInt(awardusersnum) <= parseInt(numcount)) {
                    let awardusers = yield awardusers_1.findAwardusersByUseruuid(useruuid, state);
                    if (awardusers && awardusers.uuid != uuid)
                        return response_1.sendNotFound(res, "该获奖用户已存在！");
                    yield awardusers_1.updateAwardusersInfo(obj, uuid);
                }
                else {
                    return response_1.sendNotFound(res, "该等级的奖励人数已达到最大人数！");
                }
            }
            else {
                return response_1.sendNotFound(res, "请在等级设置中设置奖励等级！");
            }
            return response_1.sendOK(res, { awardusers: "设置成功！" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//获得一二等奖用户和黑名单列表
exports.router.get("/", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { start, length, draw, search } = req.query;
        let { state, receive } = req.query;
        try {
            let searchdata = search.value;
            validator_2.validateCgi({ start, length, searchdata }, validator_1.crmuserValidator.pagination);
            validator_2.validateCgi({ state, receive }, validator_1.awardusersValidator.getOptions);
            if (!receive || receive === 'undefined' || receive == undefined)
                receive = '';
            if (!state || state === 'undefined' || state == undefined)
                state = '';
            let recordsFiltered = yield awardusers_1.getCount(searchdata, state, receive);
            let awardusers = yield awardusers_1.getAwardusersList(parseInt(start), parseInt(length), searchdata, state, receive);
            awardusers.forEach((r) => {
                r.created = winston_1.timestamps(r.created);
            });
            return response_1.sendOK(res, { draw: draw, awardusers: awardusers, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//删除一二等奖用户和黑名单
exports.router.delete("/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            validator_2.validateCgi({ uuid }, validator_1.awardusersValidator.UUID);
            yield awardusers_1.deleteAwardusers(uuid);
            return response_1.sendOK(res, { awardusers: "删除成功！" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=awardusers.js.map