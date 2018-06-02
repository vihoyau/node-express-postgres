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
const utils_1 = require("../../lib/utils");
const express_1 = require("express");
const coupon_1 = require("../../model/mall/coupon");
const usercoupon_1 = require("../../model/users/usercoupon");
const winston_1 = require("../../config/winston");
exports.router = express_1.Router();
//获得对应商家优惠券列表
exports.router.get("/business", logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { business } = req.query;
        try {
            validator_2.validateCgi({ business: business }, validator_1.couponValidator.business);
            const loginInfo = req.loginInfo;
            let coupon = yield coupon_1.getAPPBusinessCouponList(business);
            for (let i = 0; i < coupon.length; i++) {
                coupon[i].content.discount = coupon[i].content.discount / 10;
                coupon[i].tsrange[0] = winston_1.timestamptype(coupon[i].tsrange[0]);
                coupon[i].tsrange[1] = winston_1.timestamptype(coupon[i].tsrange[1]);
                coupon[i].price = coupon[i].price / 100;
                let usercoupon = yield usercoupon_1.getbyuseruuidandcouponuuid(loginInfo.getUuid(), coupon[i].uuid);
                coupon[i].id = usercoupon ? 'true' : null;
            }
            return response_1.sendOK(res, { coupon: coupon });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//获得优惠券列表
exports.router.get("/", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { page, count, kind } = req.query;
        try {
            let { cursor, limit } = yield utils_1.getPageCount(page, count);
            if (kind === null || kind === undefined)
                kind = '';
            let coupon = yield coupon_1.getAPPCouponList(cursor, limit, kind);
            coupon.forEach(r => {
                r.content.discount = r.content.discount / 10;
                r.tsrange[0] = winston_1.timestamptype(r.tsrange[0]);
                r.tsrange[1] = winston_1.timestamptype(r.tsrange[1]);
                r.price = r.price / 100;
            });
            return response_1.sendOK(res, { coupon: coupon, page: parseInt(page) + 1 + '', count: count });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=coupon.js.map