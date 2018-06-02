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
const users_ext_1 = require("../../model/users/users_ext");
const coupon_1 = require("../../model/mall/coupon");
const message_1 = require("../../model/users/message");
const usercoupon_1 = require("../../model/users/usercoupon");
const system_1 = require("../../model/system/system");
const users_1 = require("../../model/users/users");
const orders_1 = require("../../model/orders/orders");
const logindao_1 = require("../../redis/logindao");
exports.router = express_1.Router();
//获取新消息
exports.router.post('/exchange', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { orderuuids, points, balance } = req.body;
        try {
            const info = req.loginInfo;
            balance = Math.round(parseFloat(balance) * 100);
            validator_1.validateCgi({ points: points, balance: balance }, validator_2.usersValidator.exchange);
            orderuuids.forEach((r) => {
                validator_1.validateCgi({ uuid: r }, validator_2.usersValidator.uuid);
            });
            if (balance < 0 || points < 0)
                return response_1.sendNotFound(res, "零钱不足!");
            let user = yield users_ext_1.findByPrimary(info.getUuid());
            if (user.points < parseInt(points))
                return response_1.sendNotFound(res, "积分不足!");
            if (user.balance < parseInt(balance))
                return response_1.sendNotFound(res, "零钱不足!");
            yield users_ext_1.exchange(info.getUuid(), { points: points, balance: balance });
            for (let i = 0; i < orderuuids.length; i++) {
                if (balance === 0) { //积分支付方式
                    yield orders_1.modifiedPointpay("pointpay", orderuuids[i]); //积分支付方式
                }
                else {
                    yield orders_1.modifiedBalancepay("balancepay", orderuuids[i]); //零钱支付方式
                }
                yield orders_1.updateState("wait-send", orderuuids[i]);
                let obj = {
                    useruuid: user.uuid,
                    username: user.username,
                    content: '已支付成功，系统正在出单',
                    state: 'send',
                    orderuuid: orderuuids[i],
                    title: '物流消息'
                };
                yield message_1.createMessage(obj); //发送消息
            }
            let system = yield system_1.findByName('numcondition');
            if (balance / 100 >= parseInt(system.content.minorder)) {
                yield users_1.addPointAndCashlottery(info.getUuid(), parseInt(system.content.invite), 0); //增加免费抽奖机会
            }
            response_1.sendOK(res, { exchange: "ok!" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//优惠券零钱支付方式
exports.router.post('/couponpay', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { couponuuid } = req.body;
        try {
            const info = req.loginInfo;
            validator_1.validateCgi({ uuid: couponuuid }, validator_2.usersValidator.uuid);
            let coupon = yield coupon_1.findByPrimary(couponuuid);
            let user = yield users_ext_1.findByPrimary(info.getUuid());
            if (user.balance < coupon.price)
                return response_1.sendNotFound(res, "零钱不足!");
            if (user.points < coupon.point)
                return response_1.sendNotFound(res, "积分不足!");
            yield users_ext_1.exchange(info.getUuid(), { points: coupon.point, balance: coupon.price }); //减零钱
            yield usercoupon_1.createdUsercoupon(info.getUuid(), couponuuid); //发放优惠券
            response_1.sendOK(res, { exchange: "ok!" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=pointorbalance.js.map