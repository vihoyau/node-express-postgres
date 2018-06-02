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
const address_1 = require("../../model/users/address");
exports.router = express_1.Router();
// TODO
exports.router.post('/', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { address, contact, phone, defaul } = req.body;
        const loginInfo = req.loginInfo;
        let useruuid = loginInfo.getUuid();
        try {
            validator_1.validateCgi({ useruuid: useruuid, address: address, contact: contact, phone: phone, defaul: defaul }, validator_2.addressValidator.create);
            let count = yield address_1.getCount(useruuid);
            if (count < 5) {
                let obj = {
                    useruuid: useruuid,
                    address: address,
                    contact: contact,
                    phone: phone,
                    defaul: defaul
                };
                if (count == 0) {
                    obj = {
                        useruuid: useruuid,
                        address: address,
                        contact: contact,
                        phone: phone,
                        defaul: "yes"
                    };
                }
                if (defaul === "yes")
                    yield address_1.updatedefaul(useruuid);
                let result = yield address_1.createAddress(obj);
                return response_1.sendOK(res, { address: result });
            }
            else {
                return response_1.sendNotFound(res, "对不起，您已经拥有5个收货地址！");
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// TODO
exports.router.delete('/:uuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            validator_1.validateCgi({ uuid: uuid }, validator_2.addressValidator.uuid);
            yield address_1.deleteAddress(uuid);
            return response_1.sendOK(res, { msg: "删除成功" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// TODO
exports.router.put('/:uuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        const { address, contact, phone, defaul } = req.body;
        try {
            const loginInfo = req.loginInfo;
            validator_1.validateCgi({ uuid: uuid, contact: contact, phone: phone, defaul: defaul }, validator_2.addressValidator.update);
            let addre = JSON.parse(address);
            console.log(addre);
            let obj = {
                address: address,
                contact: contact,
                phone: phone,
                defaul: defaul
            };
            yield address_1.updatedefaul(loginInfo.getUuid());
            let result = yield address_1.updateAddress(uuid, obj);
            return response_1.sendOK(res, result);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//TODO
exports.router.get("/default", logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const loginInfo = req.loginInfo;
            let address = yield address_1.getDefaultAddress(loginInfo.getUuid());
            return response_1.sendOK(res, { address: address });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// TODO
exports.router.get('/user/:useruuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const useruuid = req.params["useruuid"];
        try {
            validator_1.validateCgi({ uuid: useruuid }, validator_2.addressValidator.uuid);
            let result = yield address_1.findByUseruuid(useruuid);
            return response_1.sendOK(res, result);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// TODO
exports.router.get('/:uuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            validator_1.validateCgi({ uuid: uuid }, validator_2.addressValidator.uuid);
            let result = yield address_1.findByUuid(uuid);
            return response_1.sendOK(res, result);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// TODO
exports.router.patch('/:uuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            const loginInfo = req.loginInfo;
            validator_1.validateCgi({ useruuid: loginInfo.getUuid(), uuid: uuid }, validator_2.addressValidator.state);
            let result = yield address_1.updateState(req.app.locals.sequelize, loginInfo.getUuid(), uuid);
            return response_1.sendOK(res, { result: result });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=address.js.map