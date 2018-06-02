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
const goods_view_1 = require("../../model/mall/goods_view");
const response_1 = require("../../lib/response");
const validator_1 = require("./validator");
const validator_2 = require("../../lib/validator");
const utils_1 = require("../../lib/utils");
const logindao_1 = require("../../redis/logindao");
const express_1 = require("express");
exports.router = express_1.Router();
//删除当前用户的全部商品浏览记录
exports.router.delete("/users", logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const loginInfo = req.loginInfo;
            validator_2.validateCgi({ uuid: loginInfo.getUuid() }, validator_1.usersValidator.uuid);
            yield goods_view_1.deleteAllbyuseruuid(loginInfo.getUuid());
            return response_1.sendOK(res, { msg: "删除成功" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//删除当前用户的一个商品浏览记录
exports.router.delete("/:uuid", logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            validator_2.validateCgi({ uuid: uuid }, validator_1.usersValidator.uuid);
            yield goods_view_1.delelteGoodsview(uuid);
            return response_1.sendOK(res, { msg: "删除成功" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//查询当前用户的商品浏览记录
exports.router.get("/", logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { page, count } = req.query;
        try {
            const loginInfo = req.loginInfo;
            const { cursor, limit } = utils_1.getPageCount(page, count);
            let goodsviews = yield goods_view_1.findAll(req.app.locals.sequelize, loginInfo.getUuid(), cursor, limit);
            goodsviews.forEach(r => {
                r.realprice = r.realprice / 100;
                r.price = r.price / 100;
            });
            return response_1.sendOK(res, { goodsviews: goodsviews });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=goods_view.js.map