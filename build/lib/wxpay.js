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
const utils_1 = require("../lib/utils");
const moment = require("moment");
const IM = require("immutable");
const xml_1 = require("../lib/xml");
const request_1 = require("../lib/request");
// 订单起始和失效时间
function getStartExpire(timeout) {
    let start = moment();
    let expire = moment().add("seconds", timeout);
    return { start: start.format("YYYYMMDDHHmmss"), expire: expire.format("YYYYMMDDHHmmss") };
}
// 生成订单号
function getOutTradeNo() {
    // const prefix = "LS"
    const prefix = "";
    return `${prefix}${moment().format("YYYYMMDDHHmmss")}${utils_1.randomInt(1000, 9999)}`;
}
// 订单签名
function getSign(order, key) {
    let arr = new Array();
    for (let k in order) {
        arr.push(`${k}=${order[k]}`);
    }
    arr.sort();
    arr.push(`key=${key}`);
    return utils_1.md5sum(arr.join("&")).toUpperCase();
}
function splitWxResponse(res) {
    let sign;
    let obj = {};
    for (let k in res) {
        if (k === "sign") {
            sign = res[k][0];
        }
        else {
            obj[k] = res[k][0];
        }
    }
    return [obj, sign];
}
function validateWxResponse(xml, sign, opt) {
    let return_code = xml.return_code;
    if (return_code !== "SUCCESS") {
        throw new Error("准备订单失败2！");
    }
    if (!(opt.appid === xml.appid && opt.mch_id == xml.mch_id)) {
        throw new Error("准备订单失败4！");
    }
    let tmp = getSign(xml, opt.key);
    if (tmp !== sign)
        throw new Error("准备订单失败3！");
}
function genPrePayUnifiedOrder(obj, wxPayOpt) {
    return __awaiter(this, void 0, void 0, function* () {
        let out_trade_no = getOutTradeNo();
        const { start, expire } = getStartExpire(wxPayOpt.timeout);
        let $order = IM.Map({
            appid: wxPayOpt.appid,
            mch_id: wxPayOpt.mch_id,
            body: obj.body,
            notify_url: wxPayOpt.notify_url,
            spbill_create_ip: obj.spbill_create_ip,
            total_fee: obj.total_fee,
            trade_type: obj.trade,
            //device_info: "WEB",
            time_start: start,
            time_expire: expire,
            out_trade_no: out_trade_no,
            attach: out_trade_no,
            nonce_str: utils_1.md5sum(`${utils_1.randomInt(100000, 999999)}`),
        });
        let $signOrder = $order.set("sign", getSign($order.toJS(), wxPayOpt.key));
        let xmlx = xml_1.buildXml($signOrder.toJS(), { headless: true, rootName: "xml" });
        let postOpt = {
            url: "https://api.mch.weixin.qq.com/pay/unifiedorder",
            body: xmlx
        };
        // 请求微信服务器生成订单
        let body = yield request_1.postAsync(postOpt);
        // TODO
        if (body === 0) {
            // 解析结果
            let res = yield xml_1.parseXmlAsync(body);
            if (!res.xml || !res.xml.return_code)
                throw new Error("准备订单失败1！");
            let [resobj, sign] = splitWxResponse(res.xml);
            // 校验结果
            validateWxResponse(resobj, sign, wxPayOpt);
            return $order.set("prepay_id", resobj.prepay_id).toJS();
        }
        else {
            //let resobj = { prepay_id: 111 }
            let res = yield xml_1.parseXmlAsync(body);
            if (!res.xml || !res.xml.return_code)
                throw new Error("准备订单失败1！");
            let [resobj, sign] = splitWxResponse(res.xml);
            // 校验结果
            validateWxResponse(resobj, sign, wxPayOpt);
            return $order.set("prepay_id", resobj.prepay_id).toJS();
        }
    });
}
exports.genPrePayUnifiedOrder = genPrePayUnifiedOrder;
function genPrePayUnifiedOrderh5(obj, wxPaymentOpt) {
    return __awaiter(this, void 0, void 0, function* () {
        let out_trade_no = getOutTradeNo();
        const { start, expire } = getStartExpire(wxPaymentOpt.timeout);
        let $order = IM.Map({
            appid: wxPaymentOpt.appid,
            mch_id: wxPaymentOpt.mch_id,
            openid: obj.openid,
            body: obj.body,
            notify_url: wxPaymentOpt.notify_url,
            spbill_create_ip: obj.spbill_create_ip,
            total_fee: obj.total_fee,
            trade_type: obj.trade,
            device_info: "WEB",
            time_start: start,
            time_expire: expire,
            out_trade_no: out_trade_no,
            attach: out_trade_no,
            nonce_str: utils_1.md5sum(`${utils_1.randomInt(100000, 999999)}`),
        });
        let $signOrder = $order.set("sign", getSign($order.toJS(), wxPaymentOpt.key));
        let xmlx = xml_1.buildXml($signOrder.toJS(), { headless: true, rootName: "xml" });
        let postOpt = {
            url: "https://api.mch.weixin.qq.com/pay/unifiedorder",
            body: xmlx
        };
        // 请求微信服务器生成订单
        let body = yield request_1.postAsync(postOpt);
        // TODO
        if (body === 0) {
            // 解析结果
            let res = yield xml_1.parseXmlAsync(body);
            if (!res.xml || !res.xml.return_code)
                throw new Error("准备订单失败1！");
            let [resobj, sign] = splitWxResponse(res.xml);
            // 校验结果
            validateWxResponse(resobj, sign, wxPaymentOpt);
            return $order.set("prepay_id", resobj.prepay_id).toJS();
        }
        else {
            //let resobj = { prepay_id: 111 }
            let res = yield xml_1.parseXmlAsync(body);
            if (!res.xml || !res.xml.return_code)
                throw new Error("准备订单失败1！");
            let [resobj, sign] = splitWxResponse(res.xml);
            // 校验结果
            validateWxResponse(resobj, sign, wxPaymentOpt);
            return $order.set("prepay_id", resobj.prepay_id).toJS();
        }
    });
}
exports.genPrePayUnifiedOrderh5 = genPrePayUnifiedOrderh5;
/*
{ appid: 'wxd4d6f72d56dd0022',
  attach: 'ABCDEFG2017010918525986594',
  bank_type: 'CFT',
  cash_fee: '1',
  device_info: 'WEB',
  fee_type: 'CNY',
  is_subscribe: 'Y',
  mch_id: '1428010502',
  nonce_str: '42b141e65e335ea4026b33dfc3f74dbe',
  openid: 'oR60tw9Hs4Lf7BEk9lPjUCfyDcIE',
  out_trade_no: 'ABCDEFG2017010918525986594',
  result_code: 'SUCCESS',
  return_code: 'SUCCESS',
  time_end: '20170109185313',
  total_fee: '1',
  trade_type: 'JSAPI',
  transaction_id: '4002322001201701095757764932' }
*/
function validateNotify(s, opt) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield xml_1.parseXmlAsync(s);
        let [xml, sign] = splitWxResponse(res.xml);
        let return_code = xml.return_code;
        if (return_code !== "SUCCESS") {
            console.log("ERx", xml.return_code, xml.return_code !== "SUCCESS");
            throw new Error("validateNotify");
        }
        /*
            // TODO
            if (!(opt.appid === xml.appid && opt.mch_id === xml.mch_id)) {
                console.log("ERx22", opt.appid, xml.appid, opt.appid === xml.appid, opt.mch_id, xml.mch_id, opt.mch_id === xml.mch_id)
                throw new Error("validateNotify2")
            }
        */
        let tmp = getSign(xml, opt.key);
        if (tmp === sign)
            return xml;
        throw new Error("validateNotify3");
    });
}
exports.validateNotify = validateNotify;
// 前端微信支付唤起参数
function getWebParam(prepay_id, appid, timestamp, key, mch_id) {
    return __awaiter(this, void 0, void 0, function* () {
        let map = {
            appid: appid,
            noncestr: utils_1.md5sum(`${utils_1.randomInt(0, 9999999)}`),
            package: "Sign=WXPay",
            partnerid: mch_id,
            prepayid: prepay_id,
            timestamp: timestamp
        };
        // let map = {
        //     appid: appid,
        //     timestamp: timestamp,
        //     noncestr: md5sum(`${randomInt(0, 9999999)}`),
        //     package: "prepay_id=" + prepay_id,
        //     signtype: "MD5"
        // } as any
        map.paySign = getSign(map, key);
        map.mch_id = mch_id;
        return map;
    });
}
exports.getWebParam = getWebParam;
function getWebParamh5(prepay_id, appid, timestamp, key, mch_id) {
    return __awaiter(this, void 0, void 0, function* () {
        // let map = {
        //     appid: appid,
        //     noncestr: md5sum(`${randomInt(0, 9999999)}`),
        //     package: "Sign=WXPay",
        //     partnerid: mch_id,
        //     prepayid: prepay_id,
        //     timestamp: timestamp
        // } as any
        let map = {
            appId: appid,
            timeStamp: timestamp,
            nonceStr: utils_1.md5sum(`${utils_1.randomInt(0, 9999999)}`),
            package: "prepay_id=" + prepay_id,
            signType: "MD5"
        };
        map.paySign = getSign(map, key);
        return map;
    });
}
exports.getWebParamh5 = getWebParamh5;
//# sourceMappingURL=wxpay.js.map