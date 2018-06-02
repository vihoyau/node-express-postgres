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
const lotterylevel_1 = require("../../model/mall/lotterylevel");
exports.router = express_1.Router();
//新增奖励等级
exports.router.post("/", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { level, prizes, state, limitcount } = req.body;
        try {
            validator_2.validateCgi({ level: parseInt(level), state: state, limitcount: parseInt(limitcount) }, validator_1.lotterylevelValidator.insertOptions);
            let prizeus = JSON.parse(prizes);
            for (let i = 0; i < prizeus.length; i++) {
                let obj = {
                    level: parseInt(level),
                    prizeuuid: prizeus[i].uuid,
                    num: parseInt(prizeus[i].num),
                    state: state,
                    title: prizeus[i].title,
                    awardnum: parseInt(prizeus[i].awardnum),
                    limitcount: parseInt(limitcount) //每个用户抽中改该等级奖品最高次数
                };
                yield lotterylevel_1.insertLotterylevel(obj);
            }
            return response_1.sendOK(res, { msg: "新增成功!" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//修改奖励等级信息
exports.router.put("/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        const { level, prizeuuid, title, num, state, awardnum, limitcount } = req.body;
        try {
            validator_2.validateCgi({ uuid: uuid, prizeuuid: prizeuuid, level: parseInt(level), title: title, num: num, state: state, awardnum: parseInt(awardnum), limitcount: parseInt(limitcount) }, validator_1.lotterylevelValidator.updateOptions);
            let obj = {
                level: parseInt(level),
                prizeuuid: prizeuuid,
                num: parseInt(num),
                state: state,
                title: title,
                awardnum: parseInt(awardnum),
                limitcount: parseInt(limitcount)
            };
            yield lotterylevel_1.updateLotterylevelInfo(obj, uuid);
            return response_1.sendOK(res, { msg: '编辑成功!' });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//获得奖励等级列表
exports.router.get("/", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { start, length, draw, search } = req.query;
        let { state } = req.query;
        try {
            let searchdata = search.value;
            validator_2.validateCgi({ start, length, searchdata }, validator_1.crmuserValidator.pagination);
            validator_2.validateCgi({ state }, validator_1.lotterylevelValidator.state);
            if (!state || state === 'undefined' || state == undefined)
                state = '';
            let recordsFiltered = yield lotterylevel_1.getCount(state);
            let lotterylevel = yield lotterylevel_1.getLotterylevelList(parseInt(start), parseInt(length), state);
            return response_1.sendOK(res, { draw: draw, Lotterylevel: lotterylevel, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//删除奖励等级
exports.router.delete("/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            validator_2.validateCgi({ uuid: uuid }, validator_1.lotterylevelValidator.UUID);
            yield lotterylevel_1.deleteLotterylevel(uuid);
            return response_1.sendOK(res, { msg: "删除成功" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=lotterylevel.js.map