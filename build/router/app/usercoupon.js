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
const users_ext_1 = require("../../model/users/users_ext");
const usercoupon_1 = require("../../model/users/usercoupon");
const coupon_1 = require("../../model/mall/coupon");
const winston_1 = require("../../config/winston");
exports.router = express_1.Router();
//购买优惠券
exports.router.post("/coupon", logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { couponuuid } = req.body;
            const loginInfo = req.loginInfo;
            let coupon = yield coupon_1.findByPrimary(couponuuid);
            validator_2.validateCgi({ couponuuid: couponuuid }, validator_1.usercouponValidator.insertOptions);
            yield users_ext_1.exchange(loginInfo.getUuid(), { points: coupon.point, balance: 0 }); //减积分
            yield usercoupon_1.createdUsercoupon(loginInfo.getUuid(), couponuuid);
            if (coupon.kind === 'entity') {
                yield coupon_1.updateCouponNum(couponuuid); //减少库存
            }
            return response_1.sendOK(res, { msg: "购买成功！" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//用户新增优惠券
exports.router.post("/", logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { couponuuid, business } = req.body;
        try {
            validator_2.validateCgi({ couponuuid: couponuuid }, validator_1.usercouponValidator.insertOptions);
            const loginInfo = req.loginInfo;
            let usercoupon = yield usercoupon_1.getbyuseruuidandcouponuuid(loginInfo.getUuid(), couponuuid);
            if (usercoupon) { //已拥有
                return response_1.sendNotFound(res, "您已经拥有该优惠券啦");
            }
            else { //创建一条新记录
                yield usercoupon_1.insertusercoupon(req.app.locals.sequelize, loginInfo.getUuid(), couponuuid);
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
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//获得下单商品可使用的优惠券列表
exports.router.get("/business", logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { business, total_fee } = req.query;
        try {
            validator_2.validateCgi({ business: business }, validator_1.usercouponValidator.business);
            validator_2.validateCgi({ total_fee: parseInt(total_fee) * 100 }, validator_1.usercouponValidator.total_fee);
            const loginInfo = req.loginInfo;
            let usercoupon = yield usercoupon_1.getGoodsCouponList(req.app.locals.sequelize, loginInfo.getUuid(), business);
            for (let i = 0; i < usercoupon.length; i++) {
                usercoupon[i].tsrange[0] = winston_1.timestamptype(usercoupon[i].tsrange[0]);
                usercoupon[i].tsrange[1] = winston_1.timestamptype(usercoupon[i].tsrange[1]);
                usercoupon[i].price = usercoupon[i].price / 100;
                if (usercoupon[i].content.quota && parseFloat(total_fee) < JSON.parse(usercoupon[i].content.quota)) { //筛选出满足满减条件的优惠券
                    usercoupon.splice(i, 1);
                }
                else if (usercoupon[i].content.cash && parseFloat(total_fee) < JSON.parse(usercoupon[i].content.cash)) { //筛选车满足现金券的优惠券
                    usercoupon.splice(i, 1);
                }
                if (parseFloat(total_fee) === 0) { //筛选出积分兑换
                    usercoupon.splice(i, 1);
                }
            }
            return response_1.sendOK(res, { usercoupon: usercoupon });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//选取优惠券
exports.router.put("/selected/:uuid", logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let uuid = req.params["uuid"];
        let { business } = req.body;
        try {
            //validateCgi({ uuid: uuid }, usercouponValidator.UUID)
            validator_2.validateCgi({ business: business }, validator_1.usercouponValidator.business);
            const loginInfo = req.loginInfo;
            let usercoupons = yield usercoupon_1.getGoodsCouponLists(req.app.locals.sequelize, loginInfo.getUuid(), business);
            if (usercoupons[0]) {
                yield usercoupon_1.updateSelected(usercoupons[0].uuid, null);
            }
            if (uuid != null && uuid != undefined && uuid != 'undefined' && uuid != 'null') {
                yield usercoupon_1.updateSelected(uuid, business);
                let coupon = yield usercoupon_1.findCouponByUsercouponuuid(uuid);
                return response_1.sendOK(res, { coupon: coupon });
            }
            else {
                return response_1.sendOK(res, { "msg": "取消成功！" });
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//获得用户选中的优惠券列表
exports.router.get("/userselected", logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { business } = req.query;
        try {
            let businesss = JSON.parse(business);
            businesss.forEach((r) => {
                validator_2.validateCgi({ business: r }, validator_1.usercouponValidator.business);
            });
            const loginInfo = req.loginInfo;
            let usercoupons = yield usercoupon_1.getUserSelectGoodsCoupon(req.app.locals.sequelize, loginInfo.getUuid(), businesss);
            return response_1.sendOK(res, { usercoupons: usercoupons });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//获得用户优惠券列表
exports.router.get("/", logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { kind, state } = req.query;
        try {
            validator_2.validateCgi({ kind: kind, state: state }, validator_1.usercouponValidator.pagination);
            const loginInfo = req.loginInfo;
            state = state ? state : '';
            let usercoupon = yield usercoupon_1.getusercouponlist(req.app.locals.sequelize, loginInfo.getUuid(), kind, state);
            return response_1.sendOK(res, { usercoupon: usercoupon });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//优惠券确认使用
exports.router.put("/:uuid", logindao_1.checkAppLogin, function (req, res, next) {
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