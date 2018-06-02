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
const logindao_1 = require("../../redis/logindao");
const response_1 = require("../../lib/response");
const express_1 = require("express");
const usercoupon_1 = require("../../model/users/usercoupon");
const crmuser_1 = require("../../model/ads/crmuser");
exports.router = express_1.Router();
//获得用户优惠券列表
exports.router.get("/", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { start, length, draw, search } = req.query;
            let { coupontype, state } = req.query;
            let searchdata = search.value;
            const loginInfo = req.loginInfo;
            let crmuser = yield crmuser_1.findByPrimary(loginInfo.getUuid());
            if (!coupontype || coupontype === undefined || coupontype === "undefined") {
                coupontype = '';
            }
            if (!state || state === undefined || state === "undefined") {
                state = '';
            }
            let recordsFiltered = yield usercoupon_1.getcouponlistCount(req.app.locals.sequelize, crmuser.mgruuids, searchdata, coupontype, state);
            let usercoupon = yield usercoupon_1.getcouponlist(req.app.locals.sequelize, crmuser.mgruuids, parseInt(start), parseInt(length), searchdata, coupontype, state);
            return response_1.sendOK(res, { usercoupon: usercoupon, draw: draw, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//优惠券确认使用
exports.router.patch("/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const uuid = req.params['uuid'];
            let usercoupon = yield usercoupon_1.usedUsercoupon('used', uuid);
            return response_1.sendOK(res, { usercoupon: usercoupon });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=usercoupon.js.map