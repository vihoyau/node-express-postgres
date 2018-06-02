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
const response_1 = require("../../lib/response");
const logindao_1 = require("../../redis/logindao");
const message_1 = require("../../model/users/message");
const express_1 = require("express");
const orders_1 = require("../../model/orders/orders");
const users_1 = require("../../model/users/users");
const logistics_1 = require("../../model/logistics/logistics");
const shippercode_1 = require("../../model/logistics/shippercode");
const logistics_2 = require("../../lib/logistics");
exports.router = express_1.Router();
exports.router.post('/logistics', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { shipperCode, logisticCode, orderCode } = req.body;
        try {
            validator_2.validateCgi({ shipperCode, logisticCode, orderCode }, validator_1.logistics.code);
            let result = yield logistics_2.getOrderTracesByJson(shipperCode, logisticCode, orderCode);
            let lo = {
                logisticscode: logisticCode,
                shippercode: shipperCode,
                ordercode: orderCode
            };
            yield logistics_1.insertLogistics(lo);
            yield orders_1.updateLogistics(logisticCode, shipperCode, orderCode);
            let order = yield orders_1.findByPrimary(orderCode);
            let users;
            if (order) {
                users = yield users_1.findByPrimary(order.useruuid);
                let objc = {
                    useruuid: users.uuid,
                    username: users.username,
                    content: '已交付物流，详情查看订单',
                    state: 'send',
                    orderuuid: orderCode,
                    title: '物流注册消息'
                };
                yield message_1.createMessage(objc); //发送消息
            }
            return response_1.sendOK(res, { result: result });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.delete('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let uuid = req.params["uuid"];
        try {
            validator_2.validateCgi({ uuid }, validator_1.logistics.UUID);
            let order = yield logistics_1.findByPrimary(uuid);
            yield logistics_1.deleteLogistics(uuid);
            yield orders_1.modifiedLogistics(null, null, order.uuid);
            return response_1.sendOK(res, { result: '删除成功！' });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/shippercode', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let result = yield shippercode_1.getShipper(req.app.locals.sequelize);
            return response_1.sendOK(res, { result: result });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/bycode', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { shipperCode, logisticCode } = req.query;
        try {
            validator_2.validateCgi({ shipperCode, logisticCode }, validator_1.logistics.twoCode);
            let result = yield logistics_1.getByCode(shipperCode, logisticCode);
            return response_1.sendOK(res, { result: result });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/ordercode', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { orderCode } = req.query;
        try {
            validator_2.validateCgi({ orderCode }, validator_1.logistics.order);
            let result = yield logistics_1.getByOrderCode(orderCode);
            return response_1.sendOK(res, { result: result });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/shippercode', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { shipperName } = req.query;
        try {
            validator_2.validateCgi({ shipperName }, validator_1.logistics.shippername);
            let result = yield shippercode_1.getByShipperName(shipperName);
            return response_1.sendOK(res, { result: result });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/shippername', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { shipperCode } = req.query;
        try {
            validator_2.validateCgi({ shipperCode }, validator_1.logistics.shipper);
            let result = yield shippercode_1.getShipperName(shipperCode);
            return response_1.sendOK(res, { result: result });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { start, length, draw, search } = req.query;
        try {
            let searchdata = search.value;
            validator_2.validateCgi({ start, length, searchdata }, validator_1.logisticsValitater.pagination);
            let recordsFiltered = yield logistics_1.getCount(req.app.locals.sequelize, searchdata);
            let result = yield logistics_1.getAll(req.app.locals.sequelize, searchdata, parseInt(start), parseInt(length));
            return response_1.sendOK(res, { result: result, draw: draw, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=logistics.js.map