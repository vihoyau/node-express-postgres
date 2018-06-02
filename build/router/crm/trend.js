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
const logindao_1 = require("../../redis/logindao");
const trend_1 = require("../../model/trend/trend");
const reflect_1 = require("../../model/trend/reflect");
const trendcomment_1 = require("../../model/trend/trendcomment");
const users_1 = require("../../model/users/users");
const shielded_1 = require("../../model/trend/shielded");
const winston_1 = require("../../config/winston");
exports.router = express_1.Router();
//crm查看全部的动态
exports.router.get('/allTrend', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { state, start, length } = req.query; //state in 'on' 'rejected'
        validator_1.validateCgi({ state, start, length }, validator_2.trendValidator.getAll);
        try {
            let recordsFiltered = yield trend_1.countByState(state);
            let trends = yield trend_1.findAllTrend(req.app.locals.sequelize, state, start, length);
            trends.forEach(element => {
                element.created = winston_1.timestamps(element.created);
            });
            return response_1.sendOK(res, { trends, recordsFiltered });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//crm查看某个动态的全部评论，为了方便十金客户及时查看所谓的违法评论证据，这里把 on&rejected的评论都展示出来
exports.router.get("/allCom", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { start, length, trenduuid } = req.query;
        validator_1.validateCgi({ start, length }, validator_2.trendValidator.getAllC);
        try {
            let recordsFiltered = yield trendcomment_1.getCountByTrendUUID(trenduuid);
            let com = yield trendcomment_1.findByTrenduuid(res.app.locals.sequelize, trenduuid, start, length);
            com.forEach((r) => {
                r.created = winston_1.timestamps(r.created);
            });
            return response_1.sendOK(res, { com, recordsFiltered });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//crm查看全部的举报
exports.router.get('/allReflect', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { state, start, length } = req.query;
        validator_1.validateCgi({ state, start, length }, validator_2.trendValidator.getAllR);
        try {
            let recordsFiltered = yield reflect_1.getCount(state);
            let reflects = yield reflect_1.findAllReflect(state, start, length);
            let arr = [];
            for (let i = 0; i < reflects.length; i++) {
                let obj;
                if (reflects[i].trenduuid) {
                    let trend = yield trend_1.findByTrendUUID(reflects[i].trenduuid);
                    obj = Object.assign({ reflects: reflects[i] }, { trend });
                    arr.push(obj);
                }
                else if (reflects[i].commentuuid) {
                    let com = yield trendcomment_1.findByPrimaryUUID(reflects[i].commentuuid);
                    obj = Object.assign({ reflects: reflects[i] }, { com });
                    arr.push(obj);
                }
            }
            return response_1.sendOK(res, { arr, recordsFiltered });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//rejected评论，或者动态
exports.router.delete('/', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { type, uuid, reflectuuid } = req.body;
        validator_1.validateCgi({ type, uuid }, validator_2.trendValidator.del);
        try {
            const info = req.loginInfo;
            if (!info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            if (type == 'comment') { //删除评论
                let com = yield trendcomment_1.delTrendComment(uuid);
                yield trend_1.trendDownCom(com.trenduuid); //减少评论数
                /* let children = await findByParent(uuid)
                for (let i = 0; i < children.length; i++) {
                    await delTrendComment(children[i].uuid)
                } */
            }
            else { //删除动态
                yield trend_1.updateTrend(uuid, { state: "rejected" });
                /* let com = await findByTrenduuid(uuid)
                for (let i = 0; i < com.length; i++) {
                    await delTrendComment(com[i].uuid)
                } */
            }
            if (reflectuuid)
                yield reflect_1.updateReflectState(reflectuuid, 'accepted');
            return response_1.sendOK(res, { msg: "succ" });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//拉黑用户
exports.router.put('/forbiden', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { useruuid } = req.body;
        validator_1.validateCgi({ useruuid }, validator_2.trendValidator.forbiden);
        try {
            const info = req.loginInfo;
            if (!info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            yield users_1.updateStateToApp(useruuid, 'off');
            return response_1.sendOK(res, { msg: "succ" });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//经查举报不实，只是修改举报状态为受理，不删除不拉黑
exports.router.put('/:reflectuuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let reflectuuid = req.params['reflectuuid'];
        validator_1.validateCgi({ reflectuuid }, validator_2.trendValidator.updateR);
        try {
            const info = req.loginInfo;
            if (!info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            yield reflect_1.updateReflectState(reflectuuid, 'accepted');
            return response_1.sendOK(res, { msg: "succ" });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//crm查看全部的动态屏蔽情况
exports.router.get('/shield', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { start, length } = req.query;
        let shield = yield shielded_1.findAllShielded(res.app.locals.sequelize, start, length);
        let recordsFiltered = yield shielded_1.getCount();
        for (let i = 0; i < shield.length; i++) {
            shield[i].created = winston_1.timestamps(shield[i].created);
            let user = yield users_1.findByPrimary(shield[i].useruuid);
            shield[i] = Object.assign(shield[i], { username: user.username, nickname: user.nickname, headurl: user.headurl });
        }
        return response_1.sendOK(res, { shield, recordsFiltered });
    });
});
//# sourceMappingURL=trend.js.map