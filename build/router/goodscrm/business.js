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
const logindao_1 = require("../../redis/logindao");
const response_1 = require("../../lib/response");
const express_1 = require("express");
const business_1 = require("../../model/mall/business");
exports.router = express_1.Router();
//新增商家
exports.router.post("/", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { business, contacts, state, phone, address, detailaddr, description } = req.body;
        try {
            validator_2.validateCgi({ business, contacts, state, phone, description }, validator_1.businessValidator.insertOptions);
            let obj = { business, contacts, phone, state, address, description, detailaddr };
            yield business_1.insertbusiness(obj);
            return response_1.sendOK(res, { msg: '添加成功!' });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//获得所有商家名称
exports.router.get("/title", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let business = yield business_1.getbusiness();
            return response_1.sendOK(res, { business });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//获得商家列表
exports.router.get("/", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { start, length, draw, search } = req.query;
        try {
            let searchdata = search.value;
            validator_2.validateCgi({ start, length, searchdata }, validator_1.crmuserValidator.pagination);
            let recordsFiltered = yield business_1.getCount(searchdata);
            let business = yield business_1.getbusinesslist(parseInt(start), parseInt(length), searchdata);
            return response_1.sendOK(res, { draw, business, recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//获得商家详情
exports.router.get("/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const uuid = req.params["uuid"];
            validator_2.validateCgi({ uuid }, validator_1.businessValidator.UUID);
            let business = yield business_1.getByPrimary(uuid);
            return response_1.sendOK(res, { business });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//修改商家信息
exports.router.patch("/businessinfo/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        const { business, contacts, phone, address, description, detailaddr } = req.body;
        try {
            validator_2.validateCgi({ uuid, business, contacts, phone, description }, validator_1.businessValidator.updatabusiness);
            let obj = { business, contacts, address, phone, description, detailaddr };
            yield business_1.updatebusiness(obj, uuid);
            return response_1.sendOK(res, { msg: '修改成功!' });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//启用和禁用商家
exports.router.patch("/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        const { state } = req.body;
        try {
            validator_2.validateCgi({ uuid }, validator_1.businessValidator.updatestate);
            let obj = { state };
            yield business_1.updatebusiness(obj, uuid);
            return response_1.sendOK(res, { msg: '修改成功!' });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=business.js.map