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
const comment_1 = require("../../model/mall/comment");
const logindao_1 = require("../../redis/logindao");
const response_1 = require("../../lib/response");
const validator_1 = require("./validator");
const validator_2 = require("../../lib/validator");
const express_1 = require("express");
const winston_1 = require("../../config/winston");
exports.router = express_1.Router();
/**
 * 新增评论
 */
exports.router.post("/", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { content, goodsuuid, parent } = req.body;
        try {
            const info = req.loginInfo;
            if (!info.isRoot() && !info.isGoodsRO() && !info.isGoodsRW())
                return response_1.sendNoPerm(res);
            validator_2.validateCgi({ content: content, goodsuuid: goodsuuid, parent: parent }, validator_1.commentValidator.insertOptions);
            let comment = yield comment_1.insertComment(content, goodsuuid, info.getUuid(), parent, "new");
            yield comment_1.updateComment(parent, 'replied');
            return response_1.sendOK(res, comment);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/**
 * 查看回复内容
 */
exports.router.get("/replied", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { uuid } = req.query;
        try {
            const info = req.loginInfo;
            if (!info.isRoot() && !info.isGoodsRO() && !info.isGoodsRW())
                return response_1.sendNoPerm(res);
            validator_2.validateCgi({ uuid: uuid }, validator_1.commentValidator.uuid);
            let comment = yield comment_1.getcomentByparent(uuid);
            return response_1.sendOK(res, comment);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/**
 * 对评论进行审批
 */
exports.router.patch("/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        const { state } = req.body;
        try {
            const info = req.loginInfo;
            if (!info.isRoot() && !info.isGoodsRO() && !info.isGoodsRW())
                return response_1.sendNoPerm(res);
            validator_2.validateCgi({ uuid: uuid, state: state }, validator_1.commentValidator.uuidAndState);
            let comment = yield comment_1.updateComment(uuid, state);
            return response_1.sendOK(res, comment);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/**
 * 列表显示需要审批的用户评论
 */
exports.router.get("/", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { start, length, draw, search } = req.query;
        try {
            let searchdata = search.value;
            const info = req.loginInfo;
            if (!info.isRoot() && !info.isGoodsRO() && !info.isGoodsRW())
                return response_1.sendNoPerm(res);
            validator_2.validateCgi({ start: start, length: length, searchdata: searchdata }, validator_1.commentValidator.pagination);
            let recordsFiltered = yield comment_1.getCount(req.app.locals.sequelize, searchdata);
            let comment = yield comment_1.listComment(req.app.locals.sequelize, searchdata, parseInt(start), parseInt(length));
            comment.forEach(comment => {
                comment.created = winston_1.timestamps(comment.created);
                comment.grealprice = comment.grealprice / 100;
                comment.gprice = comment.gprice / 100;
            });
            return response_1.sendOK(res, { comment: comment, draw: draw, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/**
 * 删除评论
 */
exports.router.delete("/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            const info = req.loginInfo;
            if (!info.isRoot() && !info.isGoodsRO() && !info.isGoodsRW())
                return response_1.sendNoPerm(res);
            validator_2.validateCgi({ uuid: uuid }, validator_1.commentValidator.uuid);
            let comment = yield comment_1.deleteComment(uuid);
            return response_1.sendOK(res, comment);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=comment.js.map