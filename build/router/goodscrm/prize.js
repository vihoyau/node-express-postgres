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
const prize_1 = require("../../model/mall/prize");
exports.router = express_1.Router();
//新增奖品
exports.router.post("/", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { title, prize, state } = req.body;
        try {
            validator_2.validateCgi({ title, state }, validator_1.prizeValidator.insertOptions);
            let obj = {
                title: title,
                prize: JSON.parse(prize),
                state: state
            };
            yield prize_1.insertPrize(obj);
            return response_1.sendOK(res, { msg: "新增成功!" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//修改奖品信息
exports.router.put("/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        const { title, prize, state } = req.body;
        try {
            validator_2.validateCgi({ title, uuid, state }, validator_1.prizeValidator.updateOptions);
            let obj = {
                title: title,
                prize: JSON.parse(prize),
                state: state
            };
            yield prize_1.updatePrizeInfo(obj, uuid);
            return response_1.sendOK(res, { msg: '编辑成功!' });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//获得奖品列表
exports.router.get("/", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { start, length, draw, search } = req.query;
        let { state } = req.query;
        try {
            let searchdata = search.value;
            validator_2.validateCgi({ start, length, searchdata, state }, validator_1.crmuserValidator.pagination);
            if (!state || state === 'undefined' || state == undefined)
                state = '';
            if (!searchdata || searchdata === 'undefined' || searchdata == undefined)
                searchdata = '';
            let recordsFiltered = yield prize_1.getCount(searchdata, state);
            let prize = yield prize_1.getPrizeList(parseInt(start), parseInt(length), searchdata, state);
            return response_1.sendOK(res, { draw: draw, prize: prize, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//删除奖品
exports.router.delete("/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            validator_2.validateCgi({ uuid: uuid }, validator_1.prizeValidator.UUID);
            yield prize_1.deletePrize(req.app.locals.sequelize, uuid);
            return response_1.sendOK(res, { msg: "删除成功" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=prize.js.map