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
const response_1 = require("../../lib/response");
const category_1 = require("../../model/ads/category");
exports.router = express_1.Router();
/* GET adtype listing. */
exports.router.get('/adtype', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let adtype = yield category_1.getCategory();
            let searchAll = yield category_1.getsearchAll("查看所有");
            let coupon = yield category_1.getsearchAll('优惠券');
            let recommend = yield category_1.getsearchAll('推荐');
            return response_1.sendOK(res, { adtype: adtype, searchAll: searchAll, coupon: coupon, recommend: recommend });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/* GET adslog listing. */
exports.router.get('/subtype', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // 获取参数
        const { parentuuid } = req.query;
        try {
            validator_1.validateCgi({ uuid: parentuuid }, validator_2.usersValidator.uuid);
            let subtype = yield category_1.getSubcategory(parentuuid);
            return response_1.sendOK(res, { subtype: subtype });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/:uuid', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // 获取参数
        let uuid = req.params["uuid"];
        try {
            validator_1.validateCgi({ uuid: uuid }, validator_2.usersValidator.uuid);
            let subtype = yield category_1.findByPrimary(uuid);
            return response_1.sendOK(res, { subtype: subtype });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=type.js.map