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
const daemon_1 = require("../../daemon/daemon");
const users_ext_1 = require("../../model/users/users_ext");
const users_1 = require("../../model/users/users");
const utils_1 = require("../../lib/utils");
const moment = require("moment");
const wxpay_1 = require("../../config/wxpay");
const logindao_1 = require("../../redis/logindao");
const assert = require("assert");
const transfer_1 = require("../../model/pay/transfer");
exports.router = express_1.Router();
// TODO
exports.router.post('/:useruuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const useruuid = req.params["useruuid"];
        const loginInfo = req.loginInfo; // TODO
        const { amount, description } = req.body;
        try {
            assert(useruuid === loginInfo.getUuid()); // TODO
            let obj = { useruuid: useruuid, amount: amount, description: description };
            validator_1.validateCgi(obj, validator_2.paymentValidator.pay);
            let user = yield users_ext_1.findByPrimary(useruuid);
            if (!user)
                return response_1.sendNotFound(res, "不存在此用户！");
            let users = yield users_1.findByPrimary(useruuid);
            if (!users)
                return response_1.sendNotFound(res, "不存在此用户！");
            if (users.state === 'off')
                return response_1.sendNotFound(res, "账户异常，请重新登录！");
            if (user.balance < amount)
                return response_1.sendNotFound(res, "余额不足！");
            if (amount < 100)
                return response_1.sendNotFound(res, "转账金额不足！");
            if (!user.openid || user.openid === 'undefined')
                return response_1.sendNotFound(res, "未绑定微信公众号！");
            let transter = {
                partner_trade_no: `${moment().format("YYYYMMDDHHmmss")}${utils_1.randomInt(1000, 9999)}`,
                spbill_create_ip: "192.168.0.221",
                openid: user.openid,
                amount: amount,
                description: description,
                check_name: "NO_CHECK",
                mch_appid: wxpay_1.wxPaymentOpt.appid,
                mchid: wxpay_1.wxPaymentOpt.mch_id,
                nonce_str: `${new Date().getTime()}${utils_1.randomInt(1000, 9999)}`,
                useruuid: useruuid
            };
            yield transfer_1.transterAmount(req.app.locals.sequelize, useruuid, transter);
            daemon_1.notify("payment.pay", obj);
            return response_1.sendOK(res, { msg: "已经发送请求！" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=payment.js.map