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
const adslog_1 = require("../../model/ads/adslog");
const logindao_2 = require("../../redis/logindao");
const winston_1 = require("../../config/winston");
exports.router = express_1.Router();
exports.router.get('/', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let ip = req.header("remoteip");
        const { page, count } = req.query;
        let { token, uuid } = req.cookies;
        try {
            if (ip !== "127.0.0.1")
                yield logindao_2.getLoginAsync(uuid, token);
            validator_1.validateCgi({ page: page, count: count }, validator_2.adsLogValidator.pageCount);
            let result = yield adslog_1.getPayReadyLogs(page, count);
            res.json(result);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//���ÿ�
exports.router.get('/visitors/:adsuuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let adsuuid = req.params["adsuuid"];
        const { start, length, draw, search } = req.query;
        try {
            let searchdata = search.value;
            validator_1.validateCgi({ adsuuid: adsuuid, start: start, length: length, searchdata: searchdata }, validator_2.adsLogValidator.pagination);
            let recordsFiltered = yield adslog_1.getCount2(req.app.locals.sequelize, adsuuid, searchdata);
            let adslogs = yield adslog_1.getByAdsUuid2(req.app.locals.sequelize, adsuuid, searchdata, parseInt(start), parseInt(length));
            adslogs.forEach(r => {
                r.created = winston_1.timestamps(r.created);
                r.modified = winston_1.timestamps(r.modified);
            });
            return response_1.sendOK(res, { adslogs: adslogs, draw: draw, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.patch('/payment', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let ip = req.header("remoteip");
        if (ip !== "127.0.0.1")
            return response_1.sendNoPerm(res);
        try {
            const uuids = JSON.parse(req.body.uuids);
            if (!uuids || uuids.length === 0) {
                return response_1.sendErrMsg(res, "bad request", 401);
            }
            uuids.forEach(uuid => validator_1.validateCgi({ uuid: uuid }, validator_2.adsLogValidator.uuid));
            let ret = yield adslog_1.setPaymentDone(uuids);
            console.log(ret);
            res.json({ msg: ret });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/* GET adslog listing. */
exports.router.get('/:adsuuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let adsuuid = req.params["adsuuid"];
        const { start, length, draw, search } = req.query;
        try {
            let searchdata = search.value;
            validator_1.validateCgi({ adsuuid: adsuuid, start: start, length: length, searchdata: searchdata }, validator_2.adsLogValidator.pagination);
            let recordsFiltered = yield adslog_1.getCount(req.app.locals.sequelize, adsuuid, searchdata);
            let adslogs = yield adslog_1.getByAdsUuid(req.app.locals.sequelize, adsuuid, searchdata, parseInt(start), parseInt(length));
            adslogs.forEach(r => {
                r.created = winston_1.timestamps(r.created);
                r.modified = winston_1.timestamps(r.modified);
            });
            return response_1.sendOK(res, { adslogs: adslogs, draw: draw, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=adslog.js.map