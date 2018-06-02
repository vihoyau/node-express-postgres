"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aliPayOpt = {
    app_id: "2017030906138138",
    timeout_express: (10 * 10) + "m",
    method: "alipay.trade.app.pay",
    seller_id: "shijinsz2016@163.com",
    format: "JSON",
    charset: "utf-8",
    sign_type: "RSA2",
    version: "1.0",
    partner: "2088521662881283",
    notify_url: "https://39.108.171.104/app/api/alipay/notify",
    groupnotify_url: "https://39.108.171.104/app/api/alipay/groupnotify",
    geteway: "https://www.alipay.com/cooperate/gateway.do" //统一网关
};
exports.bidMaxCount = 2;
//# sourceMappingURL=alipay.js.map