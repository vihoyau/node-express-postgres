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
const coupon_1 = require("../../model/mall/coupon");
const winston_1 = require("../../config/winston");
exports.router = express_1.Router();
//新增优惠券
exports.router.post("/", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { businessuuid, business, kind, title, content, price, point, tsrange, num, description, coupontype } = req.body;
        try {
            validator_2.validateCgi({ businessuuid: businessuuid, business: business, kind: kind, title: title, price: price, point: point, num: num, coupontype: coupontype }, validator_1.couponValidator.insertOptions);
            let obj = {
                businessuuid: businessuuid,
                business: business,
                kind: kind,
                title: title,
                content: JSON.parse(content),
                price: JSON.parse(price) * 100,
                point: JSON.parse(point),
                tsrange: JSON.parse(tsrange),
                num: JSON.parse(num),
                description: description,
                coupontype: coupontype
            };
            yield coupon_1.insertCoupon(obj);
            return response_1.sendOK(res, { msg: "新增成功!" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//修改优惠券信息
exports.router.put("/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        const { businessuuid, business, kind, title, content, price, point, tsrange, num, description, coupontype } = req.body;
        try {
            validator_2.validateCgi({ uuid: uuid, businessuuid: businessuuid, business: business, kind: kind, title: title, price: price, point: point, num: num, coupontype: coupontype }, validator_1.couponValidator.updateOptions);
            let obj = {
                businessuuid: businessuuid,
                kind: kind,
                business: business,
                title: title,
                content: JSON.parse(content),
                price: JSON.parse(price) * 100,
                point: JSON.parse(point),
                tsrange: JSON.parse(tsrange),
                description: description,
                num: JSON.parse(num),
                coupontype: coupontype,
            };
            yield coupon_1.updateCouponInfo(obj, uuid);
            return response_1.sendOK(res, { msg: '编辑成功!' });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//获得优惠券列表
exports.router.get("/", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { start, length, draw, search } = req.query;
        let { coupontype } = req.query;
        let { kind } = req.query;
        let { state } = req.query;
        try {
            let searchdata = search.value;
            validator_2.validateCgi({ start: start, length: length, searchdata: searchdata }, validator_1.crmuserValidator.pagination);
            if (!coupontype || coupontype === 'undefined' || coupontype == undefined)
                coupontype = '';
            if (!kind || kind === 'undefined' || kind == undefined)
                kind = '';
            if (!state || state === 'undefined' || state == undefined)
                state = '';
            let recordsFiltered = yield coupon_1.getCount(searchdata, coupontype, kind, state);
            let coupon = yield coupon_1.getCouponList(parseInt(start), parseInt(length), searchdata, coupontype, kind, state);
            coupon.forEach(r => {
                r.tsrange[0] = winston_1.timestamps(r.tsrange[0]);
                r.tsrange[1] = winston_1.timestamps(r.tsrange[1]);
                r.price = r.price / 100;
            });
            return response_1.sendOK(res, { draw: draw, coupon: coupon, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//删除优惠券
exports.router.delete("/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            validator_2.validateCgi({ uuid: uuid }, validator_1.couponValidator.UUID);
            yield coupon_1.deleteCoupon(uuid);
            return response_1.sendOK(res, { msg: "删除成功" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=coupon.js.map