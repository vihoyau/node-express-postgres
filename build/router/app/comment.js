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
const goods_1 = require("../../model/mall/goods");
const orders_1 = require("../../model/orders/orders");
const logindao_1 = require("../../redis/logindao");
const response_1 = require("../../lib/response");
const validator_1 = require("./validator");
const validator_2 = require("../../lib/validator");
const utils_1 = require("../../lib/utils");
const express_1 = require("express");
const comment_2 = require("../../model/ads/comment");
const assert = require("assert");
const winston_1 = require("../../config/winston");
const applaud_1 = require("../../model/ads/applaud");
exports.router = express_1.Router();
/**
 * 新增评论
 */
exports.router.post("/", logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { contents, orderuuid } = req.body;
        contents = JSON.parse(contents);
        try {
            for (let i = 0; i < contents.length; i++) {
                validator_2.validateCgi({ content: contents[i].content, goodsuuid: contents[i].uuid }, validator_1.commnetValidator.insertOptions);
                const loginInfo = req.loginInfo;
                let goods = yield goods_1.findByPrimary(contents[i].uuid);
                if (!goods) {
                    return response_1.sendNotFound(res, "商品不存在！");
                }
                yield comment_1.insertComment(contents[i].content, contents[i].uuid, loginInfo.getUuid(), null, "new");
            }
            yield orders_1.updateState('finish', orderuuid);
            return response_1.sendOK(res, { comment: "新增成功！" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/**
 * 列表显示已经通过审批的用户评论
 */
exports.router.get("/", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { goodsuuid, page, count } = req.query;
        try {
            validator_2.validateCgi({ page: page, count: count }, validator_1.commnetValidator.pageAndCount);
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let comment = yield comment_1.listAppComment(req.app.locals.sequelize, goodsuuid, cursor, limit);
            return response_1.sendOK(res, { comment: comment, page: parseInt(page) + 1 + "", count: count });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/**
 * 列表显示管理员评论
 */
exports.router.get("/parent", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { parent } = req.query;
        try {
            validator_2.validateCgi({ parent: parent }, validator_1.commnetValidator.parent);
            let comment = yield comment_1.getcomentByparent(parent);
            return response_1.sendOK(res, { comment: comment });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/**
 * 新增广告评论
 */
exports.router.post("/newAdscomment", logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let content = req.param('content');
        let adsuuid = req.param('adsuuid');
        let parent = req.param('parent');
        let useruuid = req.headers.uuid;
        try {
            if (parent != undefined && parent != null && parent != '') {
                validator_2.validateCgi({ content: content, useruuid: useruuid, adsuuid: adsuuid, parent: parent }, validator_1.adscommentValidator.insertparentComment);
                let re = yield comment_2.insertParentComment(content, useruuid, adsuuid, parent);
                assert(re != undefined, 'insert fail');
                return response_1.sendOK(res, { 'data': 'succ' });
            }
            else {
                validator_2.validateCgi({ content: content, useruuid: useruuid, adsuuid: adsuuid }, validator_1.adscommentValidator.insertComment);
                let re = yield comment_2.insertadsComment(content, useruuid, adsuuid);
                assert(re != undefined, 'insert fail');
                return response_1.sendOK(res, { 'data': 'succ2' });
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
        return undefined;
    });
});
//点赞评论，取消点赞评论
exports.router.post("/upcommentNum", logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let commentuuid = req.body.commentuuid;
        const loginInfo = req.loginInfo;
        try {
            validator_2.validateCgi({ commentUUID: commentuuid }, validator_1.adscommentValidator.commentuuid);
            let isexist = yield applaud_1.queryUphistory(loginInfo.getUuid(), commentuuid);
            let re = yield comment_2.queryCommentNum(commentuuid);
            if (!isexist) {
                re = yield comment_2.updateCommentNum(commentuuid, parseInt(re.getDataValue('upnum')) + 1);
                yield applaud_1.insertCommentApplaud(commentuuid, loginInfo.getUuid(), "nice");
                return response_1.sendOK(res, { "data": 'up' });
            }
            else {
                yield applaud_1.deleteByCommentUseruuid(loginInfo.getUuid(), commentuuid);
                re = yield comment_2.updateCommentNum(commentuuid, parseInt(re.getDataValue('upnum')) - 1);
                return response_1.sendOK(res, { "data": 'down' });
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//找出最火的那个评论
exports.router.get('/:adsuuid/commentOne', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let adsuuid = req.params['adsuuid'];
        let commentarr = [];
        let tempre = null;
        let tempdownre = null;
        try {
            validator_2.validateCgi({ commentUUID: adsuuid }, validator_1.adscommentValidator.commentuuid);
            let num = yield comment_2.queryadsCommentNum(req.app.locals.sequelize, adsuuid);
            let re = yield comment_2.queryadsCommentUpnumMAX(req.app.locals.sequelize, adsuuid);
            let downre = undefined;
            if (re[0] != undefined) {
                tempre = re[0];
                downre = yield comment_2.queryCommentParentDownLastcomment(req.app.locals.sequelize, re[0].commentuuid);
            }
            for (let i = 0; i < re.length; i++) {
                re[i].created = winston_1.timestamps(re[i].created);
            }
            if (downre == undefined) {
                downre == null;
            }
            else {
                tempdownre = downre[0];
            }
            commentarr.push({
                'commentnum': num,
                'commentupnumMAX': tempre,
                'downcomment': tempdownre
            });
            return response_1.sendOK(res, { 'data': commentarr });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//这个评论的回复数
exports.router.get('/:commentuuid/repliedCount', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let commentuuid = req.params['commentuuid'];
        try {
            validator_2.validateCgi({ commentUUID: commentuuid }, validator_1.adscommentValidator.commentuuid);
            let re = yield comment_2.querycommentRepliedCount(req.app.locals.sequelize, commentuuid);
            return response_1.sendOK(res, { 'num': re[0] });
        }
        catch (e) {
            e.info(response_1.sendError, req, e);
        }
    });
});
//找出全部的根评论
exports.router.get('/:adsuuid/commentAll', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let adsuuid = req.params['adsuuid'];
        let commentarr = [];
        try {
            validator_2.validateCgi({ commentUUID: adsuuid }, validator_1.adscommentValidator.commentuuid);
            let re = yield comment_2.queryCommentParent(req.app.locals.sequelize, adsuuid);
            for (let i = 0; i < re.length; i++) {
                re[i].created = winston_1.timestamps(re[i].created);
                let num = yield comment_2.queryCommentParentDownNum(req.app.locals.sequelize, adsuuid, re[i].commentuuid);
                commentarr.push({
                    'commentParent': re[i],
                    'num': num
                });
            }
            return response_1.sendOK(res, { 'dataarr': commentarr });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//获得这个评论的子评论
exports.router.get('/:commentuuid/commentAllByuuid', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let commentuuid = req.params['commentuuid'];
        let commentarr = [];
        try {
            validator_2.validateCgi({ commentUUID: commentuuid }, validator_1.adscommentValidator.commentuuid);
            let re = yield comment_2.queryCommentByparentuuid(req.app.locals.sequelize, commentuuid);
            for (let i = 0; i < re.length; i++) {
                re[i].created = winston_1.timestamps(re[i].created);
                commentarr.push({
                    'comment': re[i]
                });
            }
            return response_1.sendOK(res, { 'data': commentarr });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=comment.js.map