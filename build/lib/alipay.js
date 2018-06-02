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
let fs = require("fs");
let crypto = require('crypto');
//将所有生成有序数列
function getVerifyParams(params) {
    return __awaiter(this, void 0, void 0, function* () {
        let sPara = [];
        if (!params)
            return null;
        for (let key in params) {
            // if ((!params[key]) || key == "sign" || key == "sign_type") {    //去掉sign sign_type参数
            //     continue
            // }
            sPara.push([key, params[key]]);
        }
        sPara = sPara.sort();
        let prestr = '';
        for (let i = 0; i < sPara.length; i++) {
            let obj = sPara[i];
            if (i == sPara.length - 1) {
                prestr = prestr + obj[0] + '=' + obj[1] + '';
            }
            else {
                prestr = prestr + obj[0] + '=' + obj[1] + '&';
            }
        }
        return prestr;
    });
}
exports.getVerifyParams = getVerifyParams;
//签名
function getSign(params) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let privatePem = yield fs.readFileSync("./js/config/rsa_private.pem");
            let Key = privatePem.toString();
            let sign = crypto.createSign('RSA-SHA256');
            sign.update(params);
            sign = sign.sign(Key, 'base64');
            return sign;
        }
        catch (err) {
            console.log('veriSign err', err);
            return err;
        }
    });
}
exports.getSign = getSign;
//将支付宝发来的数据生成有序数列以及做decodeURIComponent，生成待验签字符串
function getAliParams(params) {
    return __awaiter(this, void 0, void 0, function* () {
        let sPara = [];
        if (!params)
            return null;
        for (let key in params) {
            if ((!params[key]) || key == "sign" || key == "sign_type") {
                continue;
            }
            sPara.push([key, params[key]]);
        }
        sPara = sPara.sort();
        let prestr = '';
        for (let i = 0; i < sPara.length; i++) {
            let obj = sPara[i];
            if (i == sPara.length - 1) {
                prestr = prestr + obj[0] + '=' + decodeURIComponent(obj[1]) + '';
            }
            else {
                prestr = prestr + obj[0] + '=' + decodeURIComponent(obj[1]) + '&';
            }
        }
        return prestr;
    });
}
exports.getAliParams = getAliParams;
//通过支付宝公钥验签
function veriySign(params) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let publicPem = fs.readFileSync('./js/config/rsa_public.pem');
            let publicKey = publicPem.toString();
            let prestr = yield getAliParams(params); //去掉了 并且decode
            let sign = params['sign'] ? params['sign'] : "";
            let verify = crypto.createVerify('RSA-SHA256');
            verify.update(prestr);
            let signResult = verify.verify(publicKey, sign, 'base64');
            return signResult;
        }
        catch (err) {
            console.log('veriSign err', err);
        }
    });
}
exports.veriySign = veriySign;
// datetime.format("YYYY-MM-DD HH:mm:ss")
function getStartExpire(timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        let start = new Date();
        let expire = new Date(start.getTime() + timeout * 1000);
        return { start: utils_1.formatDate(start), expire: utils_1.formatDate(expire) };
    });
}
exports.getStartExpire = getStartExpire;
//# sourceMappingURL=alipay.js.map