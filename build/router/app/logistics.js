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
const express_1 = require("express");
const logistics_1 = require("../../model/logistics/logistics");
exports.router = express_1.Router();
exports.router.get('/orderCode', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { orderCode } = req.query;
        try {
            validator_2.validateCgi({ orderCode: orderCode }, validator_1.logistics.order);
            let result = yield logistics_1.getByOrderCode(orderCode);
            return response_1.sendOK(res, { result: result });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=logistics.js.map