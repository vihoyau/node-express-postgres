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
const crypto_1 = require("crypto");
const sms_1 = require("../config/sms");
const request_1 = require("../lib/request");
const utils_1 = require("./utils");
function sendSms(mobile) {
    return __awaiter(this, void 0, void 0, function* () {
        let curTime = Math.round(new Date().getTime() / 1000).toString();
        let nonce = utils_1.randomInt(100000, 999999);
        let str = `${sms_1.smsOpt.app_secret}${nonce}${curTime}`;
        let checkSum = crypto_1.createHash('sha1').update(str).digest("hex");
        let options = {
            url: sms_1.smsOpt.url,
            headers: {
                'Content-Type': "application/x-www-form-urlencoded",
                'AppKey': sms_1.smsOpt.appKey,
                'CurTime': curTime,
                'CheckSum': checkSum,
                "Nonce": nonce
            },
            form: {
                mobile: mobile,
                templateid: sms_1.smsOpt.templateid,
            }
        };
        return yield request_1.postAsync(options);
    });
}
exports.sendSms = sendSms;
//# sourceMappingURL=sms.js.map