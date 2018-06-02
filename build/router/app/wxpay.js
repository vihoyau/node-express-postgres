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
const express_1 = require("express");
const response_1 = require("../../lib/response");
const coupon_1 = require("../../model/mall/coupon");
const users_ext_1 = require("../../model/users/users_ext");
const validator_1 = require("./validator");
const validator_2 = require("../../lib/validator");
const orders_1 = require("../../model/orders/orders");
const wxpay_1 = require("../../config/wxpay");
const wxpay_2 = require("../../lib/wxpay");
const wxtrade_1 = require("../../model/pay/wxtrade");
const logindao_1 = require("../../redis/logindao");
const evaluatejoin_1 = require("../../model/evaluate/evaluatejoin");
const evaluateactivity_1 = require("../../model/evaluate/evaluateactivity");
const evaluate_1 = require("./evaluate");
const moment = require("moment");
exports.router = express_1.Router();
const orders_2 = require("./orders");
// TODO checkAppLogin
// charge/wxpay2/pay
exports.router.post('/pay', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { orderuuids } = req.body;
        const loginInfo = req.loginInfo;
        try {
            let ordersTotal_fee = 0;
            let ordersgoodpoint = 0;
            for (let i = 0; i < orderuuids.length; i++) {
                // 校验订单号
                validator_2.validateCgi({ orderuuid: orderuuids[i] }, validator_1.wxpayValidator.pay);
                let order = yield orders_1.findByPrimary(orderuuids[i]);
                if (!order)
                    return response_1.sendNotFound(res, "不存在订单！");
                ordersTotal_fee += order.real_fee + order.postage;
                ordersgoodpoint += order.goodpoint;
            }
            let user = yield users_ext_1.findByPrimary(loginInfo.getUuid());
            if (user.points < ordersgoodpoint)
                return response_1.sendNotFound(res, "积分不足!");
            //await exchange(loginInfo.getUuid(), { points: ordersgoodpoint, balance: 0 })//减积分
            // 请求生成订单
            let wxorder = yield wxpay_2.genPrePayUnifiedOrder({
                body: "十金时代-購買商品",
                total_fee: ordersTotal_fee,
                spbill_create_ip: "192.168.0.6",
                trade: "APP"
            }, wxpay_1.wxPayOpt);
            // 插入数据库
            wxorder['orderuuids'] = orderuuids;
            wxorder['status'] = 1;
            wxorder['useruuid'] = loginInfo.getUuid();
            yield wxtrade_1.insertNewTrade(wxorder);
            let timestamp = new Date().getTime().toString().slice(0, 10);
            let webParam = yield wxpay_2.getWebParam(wxorder.prepay_id, wxpay_1.wxPayOpt.appid, timestamp, wxpay_1.wxPayOpt.key, wxpay_1.wxPayOpt.mch_id);
            response_1.sendOK(res, { param: webParam });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//优惠券支付
exports.router.post('/couponpay', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { couponuuid } = req.body;
        try {
            const loginInfo = req.loginInfo;
            let coupon = yield coupon_1.findByPrimary(couponuuid);
            let user = yield users_ext_1.findByPrimary(loginInfo.getUuid());
            if (user.points < coupon.point)
                return response_1.sendNotFound(res, "积分不足!");
            //await exchange(loginInfo.getUuid(), { points: coupon.point, balance: 0 })//减积分
            // 请求生成订单
            let wxorder = yield wxpay_2.genPrePayUnifiedOrder({
                body: "十金时代-購買商品",
                total_fee: coupon.price,
                spbill_create_ip: "192.168.0.6",
                trade: "APP"
            }, wxpay_1.wxPayOpt);
            // 插入数据库
            yield wxtrade_1.insertNewTrade(wxorder);
            let timestamp = new Date().getTime().toString().slice(0, 10);
            let webParam = yield wxpay_2.getWebParam(wxorder.prepay_id, wxpay_1.wxPayOpt.appid, timestamp, wxpay_1.wxPayOpt.key, wxpay_1.wxPayOpt.mch_id);
            response_1.sendOK(res, { param: webParam });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//优惠券支付
exports.router.post('/htmlcouponpay', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { couponuuid, openid } = req.body;
        try {
            const loginInfo = req.loginInfo;
            let coupon = yield coupon_1.findByPrimary(couponuuid);
            let user = yield users_ext_1.findByPrimary(loginInfo.getUuid());
            if (user.points < coupon.point)
                return response_1.sendNotFound(res, "积分不足!");
            //await exchange(loginInfo.getUuid(), { points: coupon.point, balance: 0 })//减积分
            // 请求生成订单
            let wxorder = yield wxpay_2.genPrePayUnifiedOrderh5({
                body: "十金时代-購買商品",
                total_fee: coupon.price,
                spbill_create_ip: "192.168.0.6",
                trade: "JSAPI",
                openid: openid
            }, wxpay_1.wxPayOpt);
            // 插入数据库
            yield wxtrade_1.insertNewTrade(wxorder);
            let timestamp = new Date().getTime().toString().slice(0, 10);
            let webParam = yield wxpay_2.getWebParam(wxorder.prepay_id, wxpay_1.wxPayOpt.appid, timestamp, wxpay_1.wxPayOpt.key, wxpay_1.wxPayOpt.mch_id);
            response_1.sendOK(res, { param: webParam });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.post('/htmlpay', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { orderuuids, openid } = req.body;
        const loginInfo = req.loginInfo;
        try {
            let ordersTotal_fee = 0;
            let ordersgoodpoint = 0;
            for (let i = 0; i < orderuuids.length; i++) {
                // 校验订单号
                validator_2.validateCgi({ orderuuid: orderuuids[i] }, validator_1.wxpayValidator.pay);
                let order = yield orders_1.findByPrimary(orderuuids[i]);
                if (!order)
                    return response_1.sendNotFound(res, "不存在订单！");
                ordersTotal_fee += order.real_fee + order.postage;
                ordersgoodpoint += order.goodpoint;
            }
            let user = yield users_ext_1.findByPrimary(loginInfo.getUuid());
            if (user.points < ordersgoodpoint)
                return response_1.sendNotFound(res, "积分不足!");
            //await exchange(loginInfo.getUuid(), { points: ordersgoodpoint, balance: 0 })//减积分
            // 请求生成订单
            let wxorder = yield wxpay_2.genPrePayUnifiedOrderh5({
                body: "十金时代-購買商品",
                total_fee: ordersTotal_fee,
                spbill_create_ip: "192.168.0.6",
                trade: "JSAPI",
                openid: openid
            }, wxpay_1.wxPaymentOpt);
            // 插入数据库
            wxorder['orderuuids'] = orderuuids;
            wxorder['status'] = 1;
            wxorder['useruuid'] = loginInfo.getUuid();
            wxorder.trade_type = "WEB";
            yield wxtrade_1.insertNewTrade(wxorder);
            let timestamp = new Date().getTime().toString().slice(0, 10);
            let webParam = yield wxpay_2.getWebParamh5(wxorder.prepay_id, wxpay_1.wxPaymentOpt.appid, timestamp, wxpay_1.wxPaymentOpt.key, wxpay_1.wxPaymentOpt.mch_id);
            response_1.sendOK(res, { param: webParam });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.post('/htmlrecharge', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { moment, openid } = req.body;
        try {
            //validateCgi({ orderuuid: orderuuid }, wxpayValidator.pay)
            // 校验订单号
            // let order = await findByPrimary(orderuuid)
            // if (!order)
            //     return sendNotFound(res, "不存在订单！")
            // 请求生成订单
            let wxorder = yield wxpay_2.genPrePayUnifiedOrderh5({
                body: "十金时代-購買商品",
                total_fee: parseFloat(moment) * 100,
                spbill_create_ip: "192.168.0.6",
                trade: "JSAPI",
                openid: openid
            }, wxpay_1.wxPaymentOpt);
            // 插入数据库
            wxorder.trade_type = "WEB";
            let wxtrade = yield wxtrade_1.insertNewTrade(wxorder);
            let timestamp = new Date().getTime().toString().slice(0, 10);
            let webParam = yield wxpay_2.getWebParamh5(wxorder.prepay_id, wxpay_1.wxPaymentOpt.appid, timestamp, wxpay_1.wxPaymentOpt.key, wxpay_1.wxPaymentOpt.mch_id);
            response_1.sendOK(res, { param: webParam, id: wxtrade.uuid });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.post('/recharge', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { moment } = req.body;
        try {
            moment = Math.round(parseFloat(moment) * 100);
            validator_2.validateCgi({ moment: moment }, validator_1.wxpayValidator.momentvalidator);
            // 请求生成订单
            let wxorder = yield wxpay_2.genPrePayUnifiedOrder({
                body: "十金时代-購買商品",
                total_fee: moment,
                spbill_create_ip: "192.168.0.6",
                trade: "APP"
            }, wxpay_1.wxPayOpt);
            // 插入数据库
            let wxtrade = yield wxtrade_1.insertNewTrade(wxorder);
            let timestamp = new Date().getTime().toString().slice(0, 10);
            let webParam = yield wxpay_2.getWebParam(wxorder.prepay_id, wxpay_1.wxPayOpt.appid, timestamp, wxpay_1.wxPayOpt.key, wxpay_1.wxPayOpt.mch_id);
            response_1.sendOK(res, { param: webParam, id: wxtrade.uuid });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
function sendTradeOK(res) {
    res.send(`<xml> <return_code><![CDATA[SUCCESS]]></return_code> <return_msg><![CDATA[OK]]></return_msg> </xml>`);
}
function sendTradeFail(res) {
    res.status(403).send(`<xml> <return_code><![CDATA[FAIL]]></return_code> <return_msg><![CDATA[BAD]]></return_msg> </xml>`);
}
// 读取POST的body
function readRawBody(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let arr = new Array();
        req.on('data', function (chunk) {
            arr.push(chunk.toString());
        });
        req.on('end', function (chunk) {
            if (chunk) {
                arr.push(chunk.toString());
            }
            req.rawBody = arr.join();
            next();
        });
    });
}
// 微信后台回调，会有多次
exports.router.post('/notify', readRawBody, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let body = req.rawBody;
            // 校验
            let obj = yield wxpay_2.validateNotify(body, wxpay_1.wxPayOpt);
            // 检查订单是否已经完成
            let out_trade_no = obj.out_trade_no;
            let trade = yield wxtrade_1.findByTradeNo(out_trade_no);
            if (trade.state !== "new") {
                return sendTradeOK(res);
            }
            // 设置订单完成
            yield wxtrade_1.setWxTradeState(out_trade_no, "fin");
            yield updateState(out_trade_no);
            return sendTradeOK(res);
        }
        catch (e) {
            return sendTradeFail(res);
        }
    });
});
function updateState(out_trade_no) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield wxtrade_1.findByTradeNo(out_trade_no);
        if (!res.orderuuids)
            return;
        yield orders_2.updateOrderState(res.orderuuids, 'wxpay', res.useruuid);
    });
}
//支付开团&参团
exports.router.post('/paygroup', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { activityuuid, groupuuid, addressuuid, property } = req.body;
        const loginInfo = req.loginInfo;
        let useruuid = loginInfo.getUuid();
        try {
            // 校验订单号
            validator_2.validateCgi({ uuid: activityuuid, addressuuid }, validator_1.wxpayValidator.grouppay);
            let join = yield evaluatejoin_1.findByUseruuidAndActuuid(useruuid, activityuuid);
            let act = yield evaluateactivity_1.findByPrimaryUUID(activityuuid);
            if (!join)
                return response_1.sendNotFound(res, "没有参团信息！");
            if (join && join.inputcount > wxpay_1.bidMaxCount)
                return response_1.sendNotFound(res, "您尝试次数太多啦");
            if (join.bid < act.reserveprice)
                return response_1.sendNotFound(res, "出价不对");
            let now = moment().format("YYYY-MM-DD HH:mm:ss");
            if (act.endtime < now)
                return response_1.sendNotFound(res, "活动已经结束");
            yield evaluatejoin_1.updateEvaluatejoin(join.uuid, { groupuuid, addressuuid, property });
            // 请求生成订单
            let wxorder = yield wxpay_2.genPrePayUnifiedOrder({
                body: "十金时代-暗拼猜团",
                total_fee: join.bid * 100,
                spbill_create_ip: "192.168.0.6",
                trade: "APP"
            }, wxpay_1.wxGroupPayOpt);
            // 插入数据库
            wxorder['orderuuids'] = [join.uuid];
            wxorder['status'] = 1;
            wxorder['useruuid'] = loginInfo.getUuid();
            yield wxtrade_1.insertNewTrade(wxorder);
            let timestamp = new Date().getTime().toString().slice(0, 10);
            let webParam = yield wxpay_2.getWebParam(wxorder.prepay_id, wxpay_1.wxPayOpt.appid, timestamp, wxpay_1.wxPayOpt.key, wxpay_1.wxPayOpt.mch_id);
            response_1.sendOK(res, { param: webParam });
        }
        catch (e) {
            response_1.sendErrMsg(res, e, 500);
        }
    });
});
//html支付开团&参团
exports.router.post('/htmlpaygroup', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { activityuuid, groupuuid, addressuuid, property, openid } = req.body;
        const loginInfo = req.loginInfo;
        let useruuid = loginInfo.getUuid();
        try {
            // 校验订单号
            validator_2.validateCgi({ uuid: activityuuid, addressuuid }, validator_1.wxpayValidator.grouppay);
            let join = yield evaluatejoin_1.findByUseruuidAndActuuid(useruuid, activityuuid);
            let act = yield evaluateactivity_1.findByPrimaryUUID(activityuuid);
            if (!join)
                return response_1.sendNotFound(res, "没有参团信息！");
            if (join && join.inputcount > wxpay_1.bidMaxCount)
                return response_1.sendNotFound(res, "您尝试次数太多啦");
            if (join.bid < act.reserveprice)
                return response_1.sendNotFound(res, "出价不对");
            let now = moment().format("YYYY-MM-DD HH:mm:ss");
            if (act.endtime < now)
                return response_1.sendNotFound(res, "活动已经结束");
            yield evaluatejoin_1.updateEvaluatejoin(join.uuid, { groupuuid, addressuuid, property });
            // 请求生成订单
            let wxorder = yield wxpay_2.genPrePayUnifiedOrderh5({
                body: "十金时代-購買商品",
                total_fee: join.bid * 100,
                spbill_create_ip: "192.168.0.6",
                trade: "JSAPI",
                openid: openid
            }, wxpay_1.wxGroupPayOpt);
            // 插入数据库
            wxorder['orderuuids'] = [join.uuid];
            wxorder['status'] = 1;
            wxorder['useruuid'] = loginInfo.getUuid();
            yield wxtrade_1.insertNewTrade(wxorder);
            let timestamp = new Date().getTime().toString().slice(0, 10);
            let webParam = yield wxpay_2.getWebParam(wxorder.prepay_id, wxpay_1.wxPayOpt.appid, timestamp, wxpay_1.wxPayOpt.key, wxpay_1.wxPayOpt.mch_id);
            response_1.sendOK(res, { param: webParam });
        }
        catch (e) {
            response_1.sendErrMsg(res, e, 500);
        }
    });
});
exports.router.post('/groupnotify', readRawBody, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let body = req.rawBody;
            // 校验
            let obj = yield wxpay_2.validateNotify(body, wxpay_1.wxPayOpt);
            // 检查订单是否已经完成
            let out_trade_no = obj.out_trade_no;
            let trade = yield wxtrade_1.findByTradeNo(out_trade_no);
            if (trade.state !== "new") {
                return sendTradeOK(res);
            }
            // 设置订单完成
            yield wxtrade_1.setWxTradeState(out_trade_no, "fin");
            yield updateJoin(out_trade_no);
            return sendTradeOK(res);
        }
        catch (e) {
            return sendTradeFail(res);
        }
    });
});
function updateJoin(out_trade_no) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield wxtrade_1.findByTradeNo(out_trade_no);
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
//# sourceMappingURL=wxpay.js.map