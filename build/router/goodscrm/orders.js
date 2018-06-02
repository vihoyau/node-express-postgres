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
const orders_1 = require("../../model/orders/orders");
const goods_1 = require("../../model/mall/goods");
const users_1 = require("../../model/users/users");
const logindao_1 = require("../../redis/logindao");
const validator_1 = require("../../lib/validator");
const validator_2 = require("./validator");
const winston_1 = require("../../config/winston");
const response_1 = require("../../lib/response");
const express_1 = require("express");
exports.router = express_1.Router();
exports.router.put('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { logisticscode, shippercode } = req.body;
        const uuid = req.params["uuid"];
        try {
            const loginInfo = req.loginInfo;
            validator_1.validateCgi({ logisticscode, shippercode, uuid }, validator_2.ordersValidator.logisticsCode);
            if (loginInfo.isAdminRO || loginInfo.isAdsRW || loginInfo.isAdsRO)
                return response_1.sendNoPerm(res);
            let orders = yield orders_1.updateLogistics(logisticscode, shippercode, uuid);
            return response_1.sendOK(res, orders);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.patch('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { state } = req.body;
        const uuid = req.params["uuid"];
        try {
            const loginInfo = req.loginInfo;
            if (loginInfo.isAdminRO || loginInfo.isAdsRW || loginInfo.isAdsRO)
                return response_1.sendNoPerm(res);
            validator_1.validateCgi({ state, uuid }, validator_2.ordersValidator.stateUuid);
            let orders = yield orders_1.updateState(state, uuid);
            return response_1.sendOK(res, orders);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { start, length, draw, search, state } = req.query;
        try {
            let searchdata = search.value;
            validator_1.validateCgi({ start, length, searchdata, state }, validator_2.ordersValidator.pagination);
            let obj = {
                searchdata: searchdata,
                state: state
            };
            /* switch (searchdata) {
                case "待支付":
                    obj = {
                        state: "wait-pay"
                    }
                    break;
                case "待发货":
                    obj = {
                        state: "wait-send"
                    }
                    break;
                case "待收货":
                    obj = {
                        state: "wait-recv"
                    }
                    break;
                case "待评论":
                    obj = {
                        state: "wait-comment"
                    }
                    break;
                case "待审核":
                    obj = {
                        state: "wait-ack"
                    }
                    break;
                case "已取消":
                    obj = {
                        state: "cancel",
                    }
                    break;
                case "完成":
                    obj = {
                        state: "finish"
                    }
                    break;
                default:
                    if (searchdata.length === 36 || searchdata.length === 32) {
                        obj = {
                            uuid: searchdata
                        }
                    } else {
                        obj = {
                            other: searchdata
                        }
                    }
                    break;
            } */
            let recordsFiltered = yield orders_1.getOrderCount(req.app.locals.sequelize, obj);
            let orders = yield orders_1.findAll(req.app.locals.sequelize, obj, parseInt(start), parseInt(length));
            orders.forEach(r => {
                r.real_fee = r.real_fee / 100;
                r.total_fee = r.total_fee / 100;
                r.created = winston_1.timestamps(r.created);
                r.modified = winston_1.timestamps(r.modified);
            });
            return response_1.sendOK(res, { orders, draw, recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/state', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { state, start, length, draw } = req.query;
        try {
            validator_1.validateCgi({ start, length, searchdata: undefined }, validator_2.ordersValidator.pagination);
            let recordsFiltered = yield orders_1.getCount({ state: state });
            let orders = yield orders_1.findByState(state, parseInt(start), parseInt(length));
            return response_1.sendOK(res, { orders: orders, draw: draw, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get("/waitSend", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { start, length, draw } = req.query;
        try {
            validator_1.validateCgi({ start, length, searchdata: undefined }, validator_2.ordersValidator.pagination);
            let recordsFiltered = yield orders_1.getCount({ state: 'wait-send' });
            let order = yield orders_1.findByWaitSend(parseInt(start), parseInt(length));
            return response_1.sendOK(res, { ordrer: order, draw: draw, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            validator_1.validateCgi({ uuid }, validator_2.ordersValidator.UUID);
            let orders = yield orders_1.findOrders(req.app.locals.sequelize, uuid);
            let userLevel;
            if (orders && orders.useruuid) {
                userLevel = yield users_1.finduserslevel(req.app.locals.sequelize, orders.useruuid);
            }
            orders.real_fee = orders.real_fee / 100;
            orders.total_fee = orders.total_fee / 100;
            orders.created = winston_1.timestamps(orders.created);
            orders.modified = winston_1.timestamps(orders.modified);
            return response_1.sendOK(res, { orders: orders, discount: userLevel.discount ? userLevel.discount : 100 });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.post('/', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { goods, total_fee, real_fee, fee_info, address, message, state } = req.body;
        try {
            const loginInfo = req.loginInfo;
            let obj = {
                useruuid: loginInfo.getUuid(),
                goods: JSON.parse(goods),
                total_fee: total_fee * 100,
                real_fee: real_fee * 100,
                fee_info: JSON.parse(fee_info),
                address: JSON.parse(address),
                message: message,
                state: state
            };
            validator_1.validateCgi(obj, validator_2.ordersValidator.orderinfoValidator);
            let good = JSON.parse(goods);
            for (let i = 0; i < good.length; i++) {
                //判断商品是否已下线
                let orders = yield goods_1.findByState(good[i].gooduuid);
                if (!orders)
                    return response_1.sendOK(res, { msg: "商品已删除或已下架" });
            }
            let orders = yield orders_1.insertOrder(obj);
            return response_1.sendOK(res, orders);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.delete('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            validator_1.validateCgi({ uuid: uuid }, validator_2.ordersValidator.UUID);
            yield orders_1.deleteOrder(uuid);
            return response_1.sendOK(res, "删除订单成功！");
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=orders.js.map