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
//import { crmuserValidator } from "./validator"
//import { validateCgi } from "../../lib/validator"
const deduction_1 = require("../../model/mall/deduction");
const logindao_1 = require("../../redis/logindao");
const response_1 = require("../../lib/response");
const express_1 = require("express");
exports.router = express_1.Router();
//更新添加汇率基本信息
exports.router.post("/deductioncrm", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { exchange, deductiontext, usenumber } = req.body;
        try {
            // validateCgi({ exchange,deductiontext,usenumber }, crmuserValidator.pagination)
            let uuid = "0c163e52-f26d-4d77-ae71-dd3ae8184333";
            yield deduction_1.inserdeduction(exchange, deductiontext, usenumber, uuid);
            return response_1.sendOK(res, { "resdeduction": "ok" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//查询汇率
exports.router.get("/deductionsearch", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // validateCgi({ exchange,deductiontext,usenumber }, crmuserValidator.pagination)
            let uuid = "0c163e52-f26d-4d77-ae71-dd3ae8184333";
            let resdeduction = yield deduction_1.searchdeduction(uuid);
            return response_1.sendOK(res, resdeduction);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=deduction.js.map