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
const logistics_1 = require("../config/logistics");
const utils_1 = require("../lib/utils");
const iconv = require("iconv-lite");
const request_1 = require("../lib/request");
function logisticsReturn() {
    let res = {
        "EBusinessID": logistics_1.logistics.EBusinessID,
        "UpdateTime": new Date(),
        "Success": true
    };
    return res;
}
exports.logisticsReturn = logisticsReturn;
//await getOrderTracesByJson("YD", "3908740622276");
function getOrderTracesByJson(expCode, expNo, orderCode) {
    return __awaiter(this, void 0, void 0, function* () {
        let requestData = {
            'OrderCode': orderCode,
            'ShipperCode': expCode,
            'LogisticCode': expNo
        };
        let dataSign = new Buffer(utils_1.md5sum(JSON.stringify(requestData) + logistics_1.logistics.AppKey)).toString('base64');
        let options = {
            url: logistics_1.logistics.url,
            headers: {
                'accept': "*/*",
                'connection': "Keep-Alive",
                'user-agent': "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)",
                'Content-Type': "application/x-www-form-urlencoded"
            },
            form: {
                RequestData: iconv.encode(JSON.stringify(requestData), "UTF-8"),
                EBusinessID: logistics_1.logistics.EBusinessID,
                RequestType: logistics_1.logistics.RequestType,
                DataSign: iconv.encode(dataSign, "UTF-8"),
                DataType: logistics_1.logistics.DataType
            }
        };
        let s = yield request_1.postAsync(options);
        console.log(s);
        return s;
    });
}
exports.getOrderTracesByJson = getOrderTracesByJson;
//# sourceMappingURL=logistics.js.map