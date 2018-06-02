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
const favoriate_1 = require("../../model/mall/favoriate");
const statistics_1 = require("../../model/users/statistics");
const response_1 = require("../../lib/response");
const validator_1 = require("./validator");
const validator_2 = require("../../lib/validator");
const utils_1 = require("../../lib/utils");
const logindao_1 = require("../../redis/logindao");
const express_1 = require("express");
exports.router = express_1.Router();
/**
 * 收藏商品
 */
exports.router.post("/goods", logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { gooduuid } = req.body;
        try {
            validator_2.validateCgi({ gooduuid }, validator_1.favoriateValitator.gooduuid);
            const loginInfo = req.loginInfo;
            let favoriate = yield favoriate_1.insertFavoriate(loginInfo.getUuid(), gooduuid);
            let obj = {
                useruuid: loginInfo.getUuid(),
                loginnumber: 0,
                searchnumber: 1,
                favoritenumber: 0,
                type: 'goods',
            };
            yield statistics_1.insertStatistics(obj);
            return response_1.sendOK(res, { favoriate: favoriate });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/**
 * 列表显示已收藏的商品
 */
exports.router.get("/", logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { page, count } = req.query;
        try {
            validator_2.validateCgi({ page: page, count: count }, validator_1.favoriateValitator.pageAndCount);
            const loginInfo = req.loginInfo;
            const { cursor, limit } = utils_1.getPageCount(page, count);
            let favoriate = yield favoriate_1.getFavoriateByDeletedAndUseruuid(req.app.locals.sequelize, loginInfo.getUuid(), cursor, limit);
            favoriate.forEach(r => {
                r.price = r.price / 100;
                r.realprice = r.realprice / 100;
            });
            return response_1.sendOK(res, { favoriate: favoriate });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/**
 * 取消关注
 */
exports.router.delete("/:uuid", logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const gooduuid = req.params["uuid"];
        try {
            const loginInfo = req.loginInfo;
            yield favoriate_1.deleteFavoriateByUuid(gooduuid, loginInfo.getUuid());
            return response_1.sendOK(res, { favoriate: "取消关注成功" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=favoriate_mall.js.map