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
const statistics_1 = require("../../model/users/statistics");
const reward_1 = require("../../model/users/reward");
const reward_2 = require("../../model/users/reward");
const logindao_1 = require("../../redis/logindao");
const winston_1 = require("../../config/winston");
exports.router = express_1.Router();
exports.router.get('/reward/user', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { useruuid, start, length, draw, search } = req.query;
        try {
            let searchdata = search.value;
            const info = req.loginInfo;
            if (!info.isGoodsRW() || !info.isRoot())
                return response_1.sendNoPerm(res);
            validator_1.validateCgi({ useruuid, start, length, searchdata }, validator_2.invireRul.infomation);
            let obj = {};
            if (searchdata) {
                obj = {
                    useruuid,
                    $or: [
                        { username: { $like: '%' + searchdata + '%' } },
                        { reaname: { $like: '%' + searchdata + '%' } }
                    ]
                };
            }
            else {
                obj = { useruuid };
            }
            let recordsFiltered = yield reward_1.getCount(obj);
            let statistics = yield reward_1.getRewardByUser(obj, parseInt(start), parseInt(length));
            return response_1.sendOK(res, { statistics: statistics, draw: draw, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/reward/type', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { type, useruuid, start, length, draw, search } = req.query;
        try {
            let searchdata = search.value;
            const info = req.loginInfo;
            if (!info.isGoodsRW() || !info.isRoot())
                return response_1.sendNoPerm(res);
            validator_1.validateCgi({ type, useruuid, start, length, searchdata }, validator_2.invireRul.infoAndType);
            let obj = {};
            if (searchdata) {
                obj = {
                    useruuid,
                    $or: [
                        { username: { $like: '%' + searchdata + '%' } },
                        { reaname: { $like: '%' + searchdata + '%' } }
                    ]
                };
            }
            else {
                obj = { type, useruuid };
            }
            let recordsFiltered = yield reward_1.getCount(obj);
            let statistics = yield reward_1.getRewardByType(obj, parseInt(start), parseInt(length));
            return response_1.sendOK(res, { statistics, draw, recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//����app�û���¼��־
exports.router.get('/loginlog', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { useruuid, start, length, starttime, endtime } = req.query;
        validator_1.validateCgi({ useruuid, start, length }, validator_2.userLoginLog.get);
        try {
            let recordsFiltered = yield statistics_1.getCountByUserAndTime(res.app.locals.sequelize, useruuid, new Date(starttime), new Date(endtime));
            let logs = yield statistics_1.getLogsByUserAndTime(res.app.locals.sequelize, useruuid, new Date(starttime), new Date(endtime), start, length);
            logs.forEach(r => {
                r.created = winston_1.timestamps(r.created);
            });
            return response_1.sendOK(res, { logs, recordsFiltered });
        }
        catch (e) {
            response_1.sendError(res, e);
        }
    });
});
exports.router.get('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params['uuid'];
        try {
            const info = req.loginInfo;
            if (!info.isGoodsRW() || !info.isRoot())
                return response_1.sendNoPerm(res);
            validator_1.validateCgi({ uuid }, validator_2.invireRul.UUID);
            let statistics = yield statistics_1.findByPrimary(uuid);
            return response_1.sendOK(res, { statistics });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get("/", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { start, length, draw, search, timeRange } = req.query;
        try {
            const info = req.loginInfo;
            if (!info.isGoodsRO() && !info.isRoot() && !info.isGoodsRW() && !info.isAdminRO() && !info.isAdminRW())
                return response_1.sendNoPerm(res);
            let searchdata = search.value;
            validator_1.validateCgi({ start, length, searchdata }, validator_2.adsValidator.pagination);
            let recordsFiltered = yield reward_2.getUserAndlevelsCount(req.app.locals.sequelize, searchdata, JSON.parse(timeRange));
            let users = yield reward_2.getUserAndlevels(req.app.locals.sequelize, searchdata, parseInt(start), parseInt(length), JSON.parse(timeRange));
            users.forEach(r => {
                r.created = winston_1.timestamps(r.created);
                r.modified = winston_1.timestamps(r.modified);
            });
            return response_1.sendOK(res, { users: users, draw: draw, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=statistics.js.map