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
const bluebird_1 = require("bluebird");
const assert = require("assert");
const log = require("winston");
const fs_1 = require("fs");
const statAsync = bluebird_1.promisify(fs_1.stat);
const path = require("path");
function init(seqz) {
    return __awaiter(this, void 0, void 0, function* () {
        let models = [
            "./users/users",
            "./users/users_ext",
            "./users/address",
            "./users/levels",
            "./users/smscode",
            "./users/statistics",
            "./users/reward",
            "./users/message",
            "./users/usercoupon",
            "./users/userprize",
            "./users/lotterylog",
            "./users/amountlog",
            "./users/lotteryrulesrecord",
            "./pay/transfer",
            "./pay/wxtrade",
            "./pay/paylog",
            "./pay/alipay",
            "./mall/category",
            "./mall/goods",
            "./mall/comment",
            "./mall/favoriate",
            "./mall/goods_ext",
            "./mall/banner",
            "./mall/deduction",
            "./mall/crmuser",
            "./mall/goods_view",
            "./mall/consult",
            "./mall/business",
            "./mall/coupon",
            "./mall/prize",
            "./mall/collectionaward",
            "./mall/collectioncreate",
            "./mall/usercollection",
            "./mall/awardusers",
            "./mall/lotterylevel",
            "./ads/ads_view",
            "./ads/crmuser",
            "./ads/ads",
            "./ads/ads_ext",
            "./ads/adslog",
            "./ads/advertiser",
            "./ads/favoriate",
            "./ads/hotkey",
            "./ads/daysum",
            "./ads/monthsum",
            "./ads/category",
            "./ads/invitation",
            "./ads/inviterule",
            "./ads/applaud",
            "./ads/comment",
            "./logistics/logistics",
            "./logistics/shippercode",
            "./orders/shopping_cart",
            "./orders/orders",
            "./system/system",
            "./puton/plan",
            "./puton/unit",
            "./puton/controltime",
            "./ads/adsoperation",
            "./ads/paymoney",
            "./ads/incomemoney",
            "./evaluate/evaluateactivity",
            "./evaluate/evaluategroup",
            "./evaluate/evaluatejoin",
            "./evaluate/evaluatelog",
            "./ads/informationads",
            "./ads/informationcategory",
            "./ads/infocomment",
            "./trend/reflect",
            "./trend/trend",
            "./trend/trendcomment",
            "./trend/shielded"
        ];
        try {
            for (let modelPath of models) {
                let p = path.join(__dirname, modelPath) + ".js";
                log.debug("loading model", p);
                yield statAsync(p);
                let m = require(modelPath);
                assert(m.defineFunction, "miss defineFunction");
                seqz.import(modelPath, m.defineFunction);
            }
        }
        catch (e) {
            log.error("init model fail ", e.message);
            process.exit(1);
        }
    });
}
exports.init = init;
//# sourceMappingURL=init.js.map