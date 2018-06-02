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
const wxpay_1 = require("../../config/wxpay");
const request_1 = require("../../lib/request");
const utils_1 = require("../../lib/utils");
const fs_1 = require("../../lib/fs");
const logger = require("winston");
const moment = require("moment");
const batchemiiter_1 = require("../../lib/batchemiiter");
const xml_1 = require("../../lib/xml");
const path = require("path");
const wxpay_2 = require("../../config/wxpay");
const transfer_1 = require("../../model/pay/transfer");
const paylog_1 = require("../../model/pay/paylog");
const amountlog_1 = require("../../model/users/amountlog");
const abandonCount = 10;
const minIntervel = 30 * 1000;
function sleep(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
}
let pem;
function readPemAsync() {
    return __awaiter(this, void 0, void 0, function* () {
        if (pem)
            return pem;
        let ca = yield fs_1.readFileAsync(path.join(wxpay_2.pemDir, "..", "cert", "/rootca.pem"));
        let key = yield fs_1.readFileAsync(path.join(wxpay_2.pemDir, "..", "cert", "/apiclient_key.pem"));
        let cert = yield fs_1.readFileAsync(path.join(wxpay_2.pemDir, "..", "cert", "/apiclient_cert.pem"));
        pem = { ca: ca, key: key, cert: cert };
        return pem;
    });
}
function postTransfer(xml) {
    return __awaiter(this, void 0, void 0, function* () {
        let pem = yield readPemAsync();
        let postOpt = {
            body: xml,
            ca: pem.ca,
            key: pem.key,
            cert: pem.cert,
            url: "https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers",
        };
        let body = yield request_1.postAsync(postOpt);
        let obj = yield xml_1.parseXmlAsync(body);
        if (!obj || !obj.xml)
            throw new Error("invalid result " + body);
        obj = obj.xml;
        let res = {};
        for (let k in obj) {
            let v = obj[k];
            res[k] = v[0];
        }
        if (res.return_code !== "SUCCESS")
            throw new Error("invalid result " + body);
        return res;
    });
}
function getSignXml(r, key) {
    let obj = {
        mch_appid: r.mch_appid,
        mchid: r.mchid,
        nonce_str: r.nonce_str,
        partner_trade_no: r.partner_trade_no,
        openid: r.openid,
        check_name: r.check_name,
        amount: r.amount,
        desc: r.description,
        spbill_create_ip: r.spbill_create_ip,
    };
    if (r.re_user_name)
        obj.re_user_name = r.re_user_name;
    obj.sign = utils_1.getSign(obj, key);
    return xml_1.buildXml(obj, { headless: true, rootName: "xml" });
}
class TimeInfo {
    constructor() {
        this.nextTime = 0;
        this.failcount = 0;
    }
    getNextTime() {
        return this.nextTime;
    }
    shouldAbandon() {
        return this.failcount >= abandonCount;
    }
    getFailCount() {
        return this.failcount;
    }
    resetTime(ms) {
        this.nextTime = new Date().getTime() + ms;
        return this;
    }
    incFailCount() {
        this.failcount++;
        return this;
    }
    setErrMsg(msg) {
        if (!msg)
            return this;
        if (!this.failMsgSet)
            this.failMsgSet = new Set();
        this.failMsgSet.add(msg);
        return this;
    }
    getErrMsg() {
        return this.failMsgSet;
    }
}
// ------------------------------------------------------------------------------------------------
let hasInit = false;
let batchEmmiter;
const eventPay = "payment.pay";
function init(eventMap) {
    eventMap.set(eventPay, emit);
}
exports.init = init;
function run() {
    hasInit = true;
    logger.info("start wx auto pay daemon");
    batchEmmiter = new batchemiiter_1.BatchEmitter(startPay);
    // setTimeout(() => emit("self"), 1000)
    setInterval(() => emit("self"), 30 * 1000);
    // setTimeout(findTest, 0)
}
exports.run = run;
function emit(event, args) {
    if (hasInit)
        batchEmmiter.emit(event);
}
exports.emit = emit;
let uuidTimeMap = new Map();
let num = 0;
function autoPay(uuid, info, finish) {
    return __awaiter(this, void 0, void 0, function* () {
        let transfer = yield transfer_1.findById(uuid);
        let xml = getSignXml(transfer, wxpay_1.wxPayOpt.key);
        // console.log(xml)
        let res = yield postTransfer(xml);
        if (res.result_code === "SUCCESS") {
            let ext = {
                payment_no: res.payment_no,
                payment_time: res.payment_time,
                partner_trade_no: res.partner_trade_no
            };
            let trans = yield transfer_1.setTransferState(uuid, ext, "fin"); //finishTransfer(uuid, JSON.stringify(ext))
            finish.push(uuid); // 转账成功
            if (trans) { //插入提现记录，by qizhibiao
                let obj2 = {
                    useruuid: trans.useruuid,
                    amount: trans.amount / 100,
                    mode: "withdraw",
                    time: moment().format('YYYY-MM-DD HH:mm:ss')
                };
                yield amountlog_1.insertAmountLog(obj2);
            }
            yield paylog_1.createdPaylog({ amount: transfer.amount, useruuid: transfer.useruuid, description: "转账成功" });
            logger.debug("pay success", uuid);
            return;
        }
        switch (res.err_code) {
            case "NOTENOUGH": // 余额不足
                info.resetTime(minIntervel);
                logger.warn("NOTENOUGH", uuid, res, num);
                if (num >= 3) {
                    logger.warn("update 余额不足");
                    yield transfer_1.setTransferStateAbandon(transfer, "NOTENOUGH");
                    yield paylog_1.createdPaylog({ amount: transfer.amount, useruuid: transfer.useruuid, description: "转账失败" });
                    finish.push(uuid);
                    num = 0;
                }
                num++;
                yield sleep(60 * 1000); // 60s后再尝试下一个转账
                break;
            // TODO 重新发送已经成功的请求？
            default: // 其他错误
                info.setErrMsg(res.err_code_des).incFailCount().resetTime(minIntervel);
                uuidTimeMap.set(uuid, info); // 设置下一次尝试
                logger.error("pay error", uuid, res);
                if (info.shouldAbandon()) {
                    let ext = {
                        failCount: info.getFailCount(),
                        errMsg: info.getErrMsg(),
                    };
                    // 设置转账状态为放弃，不再尝试
                    //await setTransferState(uuid, JSON.stringify(ext), "abandon") //await abandonTransfer(uuid, JSON.stringify(ext))
                    yield transfer_1.setTransferStateAbandon(transfer, JSON.stringify(ext));
                    yield paylog_1.createdPaylog({ amount: transfer.amount, useruuid: transfer.useruuid, description: "转账失败" });
                    finish.push(uuid);
                    logger.error("abandonTransfer", uuid, res);
                }
                break;
        }
    });
}
function startPay() {
    return __awaiter(this, void 0, void 0, function* () {
        const f = () => __awaiter(this, void 0, void 0, function* () {
            let finish = new Array();
            for (let [uuid, info] of uuidTimeMap.entries()) {
                if (new Date().getTime() <= info.getNextTime())
                    continue; // 两次尝试时间间隔没到
                try {
                    yield autoPay(uuid, info, finish); // 一次转账尝试
                }
                catch (e) {
                    logger.error(e);
                }
            }
            finish.forEach(uuid => uuidTimeMap.delete(uuid)); // 删除已经完成或者放弃的uuid
        });
        try {
            let uuids = yield transfer_1.findNewUUIDs(10000);
            if (uuids.length > 0) {
                uuids.forEach(uuid => uuidTimeMap.has(uuid) ? 0 : uuidTimeMap.set(uuid, new TimeInfo()));
            }
            return yield f();
        }
        catch (e) {
            logger.error("startPay", e.message);
        }
    });
}
//# sourceMappingURL=wxpay.js.map