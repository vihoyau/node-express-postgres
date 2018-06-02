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
const express_1 = require("express");
const response_1 = require("../../lib/response");
const crmuser_1 = require("../../model/ads/crmuser");
const comment_1 = require("../../model/ads/comment");
const logindao_1 = require("../../redis/logindao");
const winston_1 = require("../../config/winston");
//import { getPageCount } from "../../lib/utils"
exports.router = express_1.Router();
/**
 * 返回该管理员可操作的广告
 */
exports.router.get('/commentads', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        let commentarr = [];
        let crmuuid = loginInfo.getUuid();
        let { start, length, draw, state } = req.query;
        let recordsFiltered;
        try {
            if (loginInfo.isRoot || loginInfo.isAdminRW || loginInfo.isAdminRO) {
                let data = yield comment_1.querycrmcomment(req.app.locals.sequelize, parseInt(start), parseInt(length), state);
                recordsFiltered = yield comment_1.queryCountcrmcommnet(req.app.locals.sequelize, state);
                for (let j = 0; j < data.length; j++) {
                    data[j].created = winston_1.timestamps(data[j].created);
                    let e = data[j].state;
                    if (e == 'new') {
                        data[j].state = '待审核';
                    }
                    else if (e == 'on') {
                        data[j].state = '已通过';
                    }
                    else if (e == 'reject') {
                        data[j].state = '未通过';
                    }
                    else if (e == 'replied') {
                        data[j].state = '已回复';
                    }
                }
                commentarr.push({
                    'data': data
                });
                return response_1.sendOK(res, { 'datas': commentarr, draw: draw, recordsFiltered: recordsFiltered });
            }
            if (loginInfo.isAdsRO || loginInfo.isAdsRW) {
                validator_1.validateCgi({ commentuuid: crmuuid }, validator_2.crmcommmentValidator.commentuuid);
                let mgruuids = yield crmuser_1.queryCrmuser(crmuuid);
                if (!mgruuids) {
                    return response_1.sendOK(res, { data: '没数据', draw: draw });
                }
                for (let i = 0; i < mgruuids.length; i++) {
                    let data = yield comment_1.querycrmcomment(req.app.locals.sequelize, parseInt(start), parseInt(length), state, mgruuids[i]);
                    recordsFiltered = yield comment_1.queryCountcrmcommnet(req.app.locals.sequelize, state, mgruuids[i]);
                    for (let j = 0; j < data.length; j++) {
                        data[j].created = winston_1.timestamps(data[j].created);
                        let e = data[j].state;
                        if (e == 'new') {
                            data[j].state = '待审核';
                        }
                        else if (e == 'on') {
                            data[j].state = '已上架';
                        }
                        else if (e == 'reject') {
                            data[j].state = '拒绝';
                        }
                        else if (e == 'replied') {
                            data[j].state = '已回复';
                        }
                    }
                    commentarr.push({
                        'data': data
                    });
                }
                return response_1.sendOK(res, { 'datas': commentarr, draw: draw, recordsFiltered: recordsFiltered });
            }
            else {
                return response_1.sendNoPerm(res);
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/**
 * state   postgres  check ' new 为未审核  on 审核通过  reject 审核没通过  replied 已回复 '
 */
exports.router.post('/pending', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        let commentuuid = req.body.commentuuid;
        let state = req.body.state;
        let rejectcontent = req.body.rejectcontent;
        try {
            if (state == '1') {
                state = 'new';
            }
            else if (state == '2') {
                state = 'on';
            }
            else if (state == '3') {
                state = 'reject';
            }
            else if (state == '4') {
                state = 'replied';
            }
            if (loginInfo.isRoot || loginInfo.isAdminRW || loginInfo.isAdsRW) {
                yield comment_1.updatePendingcomment(commentuuid, state, rejectcontent);
                return response_1.sendOK(res, { 'data': 'succ' });
            }
            else {
                return response_1.sendNoPerm(res);
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=comment.js.map