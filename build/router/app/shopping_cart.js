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
const shopping_cart_1 = require("../../model/orders/shopping_cart");
const shopping_cart_2 = require("../../model/orders/shopping_cart");
const logindao_1 = require("../../redis/logindao");
const validator_1 = require("../../lib/validator");
const validator_2 = require("./validator");
const response_1 = require("../../lib/response");
const express_1 = require("express");
const utils_1 = require("../../lib/utils");
exports.router = express_1.Router();
/**
 * 根据useruuid查询其所对应的的购物车列表
 */
exports.router.get('/', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { page, count } = req.query;
        try {
            validator_1.validateCgi({ page: page, count: count }, validator_2.shoppingCartValidator.pageAndCount);
            const loginInfo = req.loginInfo;
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let cart = yield shopping_cart_1.findByUseruuid(req.app.locals.sequelize, loginInfo.getUuid(), cursor, limit);
            cart.forEach(r => {
                r.goodprice = r.goodprice / 100;
                r.postage = r.postage / 100;
            });
            return response_1.sendOK(res, cart);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/**
 * 添加购物车信息
 */
exports.router.post('/goods', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { gooduuid, property, number, pic, goodpoint, goodprice, stock } = req.body;
        try {
            validator_1.validateCgi({ gooduuid: gooduuid, property: property, goodpoint: parseInt(goodpoint), goodprice: parseInt(goodprice), stock: parseInt(stock) }, validator_2.shoppingCartValidator.insertGoods);
            const loginInfo = req.loginInfo;
            goodprice = parseFloat(goodprice) * 100;
            let numbers = yield shopping_cart_1.findNumberByUseruuidGooduuid(loginInfo.getUuid(), gooduuid, property);
            let cart;
            if (numbers == undefined) {
                cart = yield shopping_cart_2.insertShoppingCart(loginInfo.getUuid(), gooduuid, property, parseInt(number), pic, parseInt(goodpoint), parseInt(goodprice), parseInt(stock));
            }
            else {
                cart = yield shopping_cart_1.updateByUseruuidAndGooduuid(loginInfo.getUuid(), gooduuid, property, numbers + parseInt(number));
            }
            return response_1.sendOK(res, cart);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/**
 * 通过+/-来修改购买商品的数量
 */
exports.router.put('/:uuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        const { number } = req.body;
        try {
            validator_1.validateCgi({ uuid: uuid, number: number }, validator_2.shoppingCartValidator.numberAndUuid);
            let cart = yield shopping_cart_2.updateNumberByUuid(uuid, parseInt(number));
            return response_1.sendOK(res, cart);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/**
 * 删除购物车中指定的商品
 */
exports.router.delete('/:uuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            validator_1.validateCgi({ uuid: uuid }, validator_2.shoppingCartValidator.uuid);
            let cart = yield shopping_cart_2.deleteByUuid(uuid);
            return response_1.sendOK(res, { cart: cart });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=shopping_cart.js.map