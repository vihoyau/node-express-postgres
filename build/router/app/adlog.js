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
const express_1 = require("express");
const response_1 = require("../../lib/response");
const logindao_1 = require("../../redis/logindao");
const adslog_1 = require("../../model/ads/adslog");
const history_1 = require("../../redis/history");
const ads_1 = require("../../model/ads/ads");
const utils_1 = require("../../lib/utils");
exports.router = express_1.Router();
/* GET adslog listing. */
exports.router.get('/adslog', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // 获取参数
        const { page, count } = req.query;
        try {
            const loginInfo = req.loginInfo;
            validator_2.validateCgi({ count: count, page: page }, validator_1.usersValidator.pagecount);
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let adslogs = yield adslog_1.getByUserUuid(loginInfo.getUuid(), cursor, limit);
            return response_1.sendOK(res, { adslogs: adslogs, page: parseInt(page) + 1, count: count });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get("/:useruuid", logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const useruuid = req.params["useruuid"];
        const { page, count } = req.query;
        try {
            validator_2.validateCgi({ uuid: useruuid }, validator_1.usersValidator.uuid);
            const { cursor, limit } = utils_1.getPageCount(page, count);
            let adslogs = yield adslog_1.findadslogs(req.app.locals, useruuid, cursor, limit);
            return response_1.sendOK(res, { adslogs: adslogs });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/ads', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const loginInfo = req.loginInf;
            let ads = yield history_1.getAds(loginInfo.getUuid());
            return response_1.sendOK(res, { ads: ads });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.delete('/ads/:uuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            const loginInfo = req.loginInf;
            let ads = yield ads_1.findByPrimary(uuid);
            let adss = yield history_1.getAds(loginInfo.getUuid());
            if (adss) {
                adss.push(ads);
                let num = adss.findIndex(ads);
                adss.splice(num, 1);
                adss = yield history_1.saveAds(loginInfo.getUuid(), adss);
                return response_1.sendOK(res, { adss: adss });
            }
            return response_1.sendOK(res, { msg: "删除成功！" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.delete('/all', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const loginInfo = req.loginInf;
            yield history_1.removeAds(loginInfo.getUuid());
            return response_1.sendOK(res, { msg: "全部删除成功！" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=adlog.js.map