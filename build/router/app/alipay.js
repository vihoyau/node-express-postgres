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
const orders_1 = require("../../model/orders/orders");
const users_ext_1 = require("../../model/users/users_ext");
const moment = require("moment");
const validator_2 = require("./validator");
const alipay_1 = require("../../config/alipay");
const express_1 = require("express");
const alipay_2 = require("../../lib/alipay");
const response_1 = require("../../lib/response");
const logindao_1 = require("../../redis/logindao");
const evaluatejoin_1 = require("../../model/evaluate/evaluatejoin");
const evaluate_1 = require("./evaluate");
const evaluateactivity_1 = require("../../model/evaluate/evaluateactivity");
const orders_2 = require("./orders");
const logger = require("winston");
exports.router = express_1.Router();
const utils_1 = require("../../lib/utils");
const alipay_3 = require("../../model/pay/alipay");
function getOutTradeNo() {
    const prefix = "";
    return `${prefix}${moment().format("YYYYMMDDHHmmss")}${utils_1.randomInt(1000, 9999)}`;
}
exports.router.post('/', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        let { orderuuids } = req.body;
        let order;
        let ordersTotal_fee = 0;
        let ordersgoodpoint = 0;
        try {
            for (let i = 0; i < orderuuids.length; i++) {
                validator_1.validateCgi({ orderuuid: orderuuids[i] }, validator_2.alipayValidator.pay);
                order = yield orders_1.findByPrimary(orderuuids[i]);
                if (!order)
                    return response_1.sendNotFound(res, "不存在订单！");
                ordersTotal_fee += order.real_fee + order.postage;
                ordersgoodpoint += order.goodpoint;
            }
            let user = yield users_ext_1.findByPrimary(loginInfo.getUuid());
            if (user.points < ordersgoodpoint)
                return response_1.sendNotFound(res, "积分不足!");
            // await exchange(loginInfo.getUuid(), { points: ordersgoodpoint, balance: 0 })//减积分
            let aliOrder = order.goods[0];
            let datetime = moment().format("YYYY-MM-DD HH:mm:ss");
            let out_trade_no = getOutTradeNo();
            let bizOpt = {
                body: aliOrder.content,
                subject: aliOrder.title,
                out_trade_no: out_trade_no,
                timeout_express: alipay_1.aliPayOpt.timeout_express,
                total_amount: ordersTotal_fee / 100,
                seller_id: alipay_1.aliPayOpt.seller_id,
                product_code: "QUICK_MSECURITY_PAY",
            };
            //用于生成签名的参数
            logger.info(JSON.stringify(bizOpt));
            let allOpt = {
                app_id: alipay_1.aliPayOpt.app_id,
                method: alipay_1.aliPayOpt.method,
                charset: alipay_1.aliPayOpt.charset,
                format: alipay_1.aliPayOpt.format,
                sign_type: alipay_1.aliPayOpt.sign_type,
                timestamp: datetime,
                version: alipay_1.aliPayOpt.version,
                notify_url: alipay_1.aliPayOpt.notify_url,
                biz_content: JSON.stringify(bizOpt),
            };
            let unifiedOrder = yield alipay_2.getVerifyParams(allOpt); //所有参数参数排序 返回字符串
            let sign = yield alipay_2.getSign(unifiedOrder); //获取签名
            let allParam = {
                app_id: encodeURIComponent(alipay_1.aliPayOpt.app_id),
                biz_content: encodeURIComponent(JSON.stringify(bizOpt)),
                method: encodeURIComponent(alipay_1.aliPayOpt.method),
                format: encodeURIComponent(alipay_1.aliPayOpt.format),
                charset: encodeURIComponent(alipay_1.aliPayOpt.charset),
                sign_type: encodeURIComponent(alipay_1.aliPayOpt.sign_type),
                sign: encodeURIComponent(sign),
                timestamp: encodeURIComponent(datetime),
                version: encodeURIComponent(alipay_1.aliPayOpt.version),
                notify_url: encodeURIComponent(alipay_1.aliPayOpt.notify_url),
            };
            //插入阿里支付的记录表
            let obj = {
                out_trade_no,
                useruuid: loginInfo.getUuid(),
                orderuuids,
                state: 'new',
                total_amount: ordersTotal_fee / 100
            };
            let o = yield alipay_3.insertOne(obj);
            if (!o)
                return response_1.sendErrMsg(res, "insert failed", 500);
            logger.info(JSON.stringify(allParam));
            response_1.sendOK(res, { param: allParam });
        }
        catch (e) {
            return e;
        }
    });
});
//支付宝异步通知,该接口给支付宝调用
exports.router.post('/notify' /*, checkAppLogin*/, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let aliParams = req.body;
        try {
            console.log("支付宝异步通知参数");
            console.log(JSON.stringify(aliParams));
            let mysign = yield alipay_2.veriySign(aliParams); //获取签名
            if (mysign) {
                console.log("验签成功");
                //判断交易状态
                switch (aliParams.trade_status) {
                    case 'TRADE_SUCCESS':
                        console.log("交易成功");
                        yield updateAliPayState(aliParams.out_trade_no);
                        break;
                    case 'WAIT_BUYER_PAY':
                        console.log("交易创建，等待买家付款");
                        break;
                    case 'TRADE_CLOSED':
                        console.log("未付款交易超时关闭，或支付完成后全额退款");
                        break;
                    case 'TRADE_FINISHED':
                        console.log("交易结束，不可退款");
                        break;
                    default:
                        console.log("交易异常");
                        return;
                }
                console.log("success");
                return 'success';
            }
            else {
                console.log("验签失败");
            }
        }
        catch (e) {
            return e;
        }
    });
});
function updateAliPayState(out_trade_no) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield alipay_3.findByPrimary(out_trade_no);
        if (!res)
            return;
        yield alipay_3.updateState(out_trade_no, 'fin'); //更新阿里支付表的记录状态，不等待
        yield orders_2.updateOrderState(res.orderuuids, 'alipay', res.useruuid); //更新订单状态，不等待
    });
}
exports.router.post('/paygroup', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        let { activityuuid, groupuuid, addressuuid, property } = req.body;
        try {
            validator_1.validateCgi({ activityuuid, addressuuid }, validator_2.alipayValidator.paygroup);
            let join = yield evaluatejoin_1.findByUseruuidAndActuuid(loginInfo.getUuid(), activityuuid);
            let act = yield evaluateactivity_1.findByPrimaryUUID(activityuuid);
            if (!join)
                return response_1.sendNotFound(res, "不存在订单！");
            if (join && join.inputcount > alipay_1.bidMaxCount)
                return response_1.sendNotFound(res, "您尝试次数太多啦");
            if (join.bid < act.reserveprice)
                return response_1.sendNotFound(res, "出价不对");
            let now = moment().format("YYYY-MM-DD HH:mm:ss");
            if (act.endtime < now)
                return response_1.sendNotFound(res, "活动已经结束");
            yield evaluatejoin_1.updateEvaluatejoin(join.uuid, { groupuuid, addressuuid, property });
            let aliOrder = { content: "十金时代-暗拼猜团", title: "暗拼猜团" };
            let datetime = moment().format("YYYY-MM-DD HH:mm:ss");
            let out_trade_no = getOutTradeNo();
            let bizOpt = {
                body: aliOrder.content,
                subject: aliOrder.title,
                out_trade_no: out_trade_no,
                timeout_express: alipay_1.aliPayOpt.timeout_express,
                total_amount: join.bid,
                // seller_id: aliPayOpt.seller_id,     //不用传
                product_code: "QUICK_MSECURITY_PAY",
            };
            //用于生成签名的参数
            logger.info(JSON.stringify(bizOpt));
            let allOpt = {
                app_id: alipay_1.aliPayOpt.app_id,
                method: alipay_1.aliPayOpt.method,
                charset: alipay_1.aliPayOpt.charset,
                format: alipay_1.aliPayOpt.format,
                sign_type: alipay_1.aliPayOpt.sign_type,
                timestamp: datetime,
                version: alipay_1.aliPayOpt.version,
                notify_url: alipay_1.aliPayOpt.groupnotify_url,
                biz_content: JSON.stringify(bizOpt),
            };
            let unifiedOrder = yield alipay_2.getVerifyParams(allOpt); //所有参数参数排序 返回字符串
            let sign = yield alipay_2.getSign(unifiedOrder); //获取签名
            let allParam = {
                app_id: encodeURIComponent(alipay_1.aliPayOpt.app_id),
                biz_content: encodeURIComponent(JSON.stringify(bizOpt)),
                method: encodeURIComponent(alipay_1.aliPayOpt.method),
                format: encodeURIComponent(alipay_1.aliPayOpt.format),
                charset: encodeURIComponent(alipay_1.aliPayOpt.charset),
                sign_type: encodeURIComponent(alipay_1.aliPayOpt.sign_type),
                sign: encodeURIComponent(sign),
                timestamp: encodeURIComponent(datetime),
                version: encodeURIComponent(alipay_1.aliPayOpt.version),
                notify_url: encodeURIComponent(alipay_1.aliPayOpt.groupnotify_url),
            };
            //插入阿里支付的记录表
            let obj = {
                out_trade_no,
                useruuid: loginInfo.getUuid(),
                orderuuids: [join.uuid],
                state: 'new',
                total_amount: join.bid
            };
            let o = yield alipay_3.insertOne(obj);
            if (!o)
                return response_1.sendErrMsg(res, "insert failed", 500);
            logger.info(JSON.stringify(allParam));
            response_1.sendOK(res, { param: allParam });
        }
        catch (e) {
            return e;
        }
    });
});
exports.router.post('/groupnotify' /*, checkAppLogin*/, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let aliParams = req.body;
        try {
            console.log("支付宝异步通知参数");
            console.log(JSON.stringify(aliParams));
            let mysign = yield alipay_2.veriySign(aliParams); //获取签名
            if (mysign) {
                console.log("验签成功");
                //判断交易状态
                switch (aliParams.trade_status) {
                    case 'TRADE_SUCCESS':
                        console.log("交易成功");
                        yield joinGroupState(aliParams.out_trade_no);
                        break;
                    case 'WAIT_BUYER_PAY':
                        console.log("交易创建，等待买家付款");
                        break;
                    case 'TRADE_CLOSED':
                        console.log("未付款交易超时关闭，或支付完成后全额退款");
                        break;
                    case 'TRADE_FINISHED':
                        console.log("交易结束，不可退款");
                        break;
                    default:
                        console.log("交易异常");
                        return;
                }
                console.log("success");
                return 'success';
            }
            else {
                console.log("验签失败");
            }
        }
        catch (e) {
            return e;
        }
    });
});
function joinGroupState(out_trade_no) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield alipay_3.findByPrimary(out_trade_no);
        if (!res.orderuuids)
            return;
        let join = yield evaluatejoin_1.findJoinUUID(res.orderuuids[0]);
        if (join.leader) { //开团
            yield evaluate_1.createGroupAfterPay(join.activityuuid, res.useruuid);
        }
        else { //参团
            yield evaluate_1.joinGroupAfterPay(join.groupuuid, res.useruuid);
        }
    });
}
//# sourceMappingURL=alipay.js.map