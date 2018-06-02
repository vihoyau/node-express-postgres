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
const logindao_1 = require("../../redis/logindao");
const response_1 = require("../../lib/response");
const validator_1 = require("./validator");
const validator_2 = require("../../lib/validator");
const express_1 = require("express");
const winston_1 = require("../../config/winston");
exports.router = express_1.Router();
/**
 * 咨询回复
 */
exports.router.post("/", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { content, uuid } = req.body;
        try {
            const info = req.loginInfo;
            if (!info.isRoot() && !info.isGoodsRW() && !info.isGoodsRO())
                return response_1.sendNoPerm(res);
            validator_2.validateCgi({ content: content, uuid: uuid }, validator_1.commentValidator.consultValidator);
            //查找当前用户是否对当前商品评论
            let contents = yield consult_1.findByPrimary(req.app.locals.sequelize, uuid);
            let content1, comment;
            content1 = contents[0].content;
            content1.push(JSON.parse(content));
            comment = yield consult_1.updateConsultByUuid(content1, uuid, "reply");
            return response_1.sendOK(res, { consult: comment });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/**
 * 列表显示咨询回复
 */
exports.router.get("/", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { start, length, draw, search } = req.query;
        try {
            let searchdata = search.value;
            const info = req.loginInfo;
            if (!info.isRoot() && !info.isGoodsRW() && !info.isGoodsRO())
                return response_1.sendNoPerm(res);
            validator_2.validateCgi({ start: start, length: length, searchdata: searchdata }, validator_1.commentValidator.pagination);
            let recordsFiltered = yield consult_1.getCount(req.app.locals.sequelize, searchdata);
            let consult = yield consult_1.findBy(req.app.locals.sequelize, searchdata, parseInt(start), parseInt(length));
            consult.forEach(r => {
                r.created = winston_1.timestamps(r.created);
                r.modified = winston_1.timestamps(r.modified);
            });
            return response_1.sendOK(res, { consult: consult, draw: draw, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get("/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            validator_2.validateCgi({ uuid: uuid }, validator_1.commentValidator.uuid);
            let consult = yield consult_1.findByPrimary(req.app.locals.sequelize, uuid);
            consult.forEach(r => {
                r.content.forEach((rs) => {
                    rs.time = winston_1.timestamps(rs.time);
                });
            });
            return response_1.sendOK(res, { consult: consult });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/**
 * 删除客服信息
 */
exports.router.delete("/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            validator_2.validateCgi({ uuid: uuid }, validator_1.commentValidator.uuid);
            yield consult_1.deleteConsult(uuid);
            return response_1.sendOK(res, { msg: "删除成功！" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=consult.js.map