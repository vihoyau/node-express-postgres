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
const logindao_1 = require("../../redis/logindao");
const response_1 = require("../../lib/response");
const history_1 = require("../../redis/history");
const goods_1 = require("../../model/mall/goods");
exports.router = express_1.Router();
/* GET goodslog listing. */
exports.router.get('/goods', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const loginInfo = req.loginInf;
            let ads = yield history_1.getGoods(loginInfo.getUuid());
            return response_1.sendOK(res, { ads: ads });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.delete('/goods/:uuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            validator_1.validateCgi({ uuid: uuid }, validator_2.goodsValidator.uuid);
            const loginInfo = req.loginInf;
            let goods = yield goods_1.findByPrimary(uuid);
            let goodss = yield history_1.getGoods(loginInfo.getUuid());
            if (goodss) {
                goodss.push(goods);
                let num = goodss.findIndex(goods);
                goods.splice(num, 1);
                goodss = yield history_1.saveGoods(loginInfo.getUuid(), goodss);
                return response_1.sendOK(res, { goodss: goodss });
            }
            return response_1.sendOK(res, {});
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
            yield history_1.removeGoods(loginInfo.getUuid());
            return response_1.sendOK(res, {});
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=goodslog.js.map