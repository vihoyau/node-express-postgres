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
const consult_1 = require("../../model/mall/consult");
const goods_1 = require("../../model/mall/goods");
const logindao_1 = require("../../redis/logindao");
const response_1 = require("../../lib/response");
const validator_1 = require("./validator");
const validator_2 = require("../../lib/validator");
const express_1 = require("express");
const winston_1 = require("../../config/winston");
exports.router = express_1.Router();
/**
 * 新增咨询
 */
exports.router.post("/", logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { content, goodsuuid } = req.body;
        try {
            validator_2.validateCgi({ content: content, goodsuuid: goodsuuid }, validator_1.commnetValidator.consult);
            const loginInfo = req.loginInfo;
            let goods = yield goods_1.findByPrimary(goodsuuid);
            if (!goods) {
                return response_1.sendNotFound(res, "商品不存在！");
            }
            //查找当前用户是否对当前商品评论
            let contents = yield consult_1.findByGoodsuuidAndUseruuid(goodsuuid, loginInfo.getUuid());
            let content1;
            let comment;
            if (!contents) {
                content1 = new Array;
                content1.push(JSON.parse(content));
                comment = yield consult_1.insertConsult(content1, goodsuuid, loginInfo.getUuid(), "new");
            }
            else {
                content1 = contents;
                content1.push(JSON.parse(content));
                comment = yield consult_1.updateConsult(content1, goodsuuid, loginInfo.getUuid(), "new");
            }
            return response_1.sendOK(res, { comment: comment });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/**
 * 列表显示商品客服信息
 */
exports.router.get("/", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { goodsuuid } = req.query;
        try {
            validator_2.validateCgi({ uuid: goodsuuid }, validator_1.commnetValidator.uuid);
            let comment = yield consult_1.listConsult(req.app.locals.sequelize, goodsuuid);
            comment.forEach(r => {
                r.content.forEach((rs) => {
                    rs.time = winston_1.timestamps(rs.time);
                });
            });
            return response_1.sendOK(res, { comment: comment });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/**
 * 显示客服信息详情
 */
exports.router.get("/:uuid", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { uuid } = req.query;
        try {
            validator_2.validateCgi({ uuid: uuid }, validator_1.commnetValidator.uuid);
            let comment = yield consult_1.findByPrimary(req.app.locals.sequelize, uuid);
            return response_1.sendOK(res, { comment: comment });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=consult.js.map