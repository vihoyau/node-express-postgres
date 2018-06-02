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
const request_1 = require("../lib/request");
const wechat_1 = require("../config/wechat");
const wxshare_1 = require("../redis/wxshare");
const jsSHA = require("jssha");
function getToken() {
    return __awaiter(this, void 0, void 0, function* () {
        let appid = wechat_1.wxOpt.appid;
        let secret = wechat_1.wxOpt.secret;
        let opt = {
            url: `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`
        };
        let res = yield request_1.getAsync(opt);
        res = JSON.parse(res);
        if (res.access_token)
            return res.access_token;
        // throw winston.error(`smssend fail. ${res.errmsg}`)
    });
}
exports.getToken = getToken;
function sendWxShare() {
    return __awaiter(this, void 0, void 0, function* () {
        //获取缓存中token
        let access_token = yield wxshare_1.getAccessToken("access_token");
        if (!access_token) {
            access_token = yield getToken();
            yield wxshare_1.saveAccessToken("access_token", access_token);
        }
        let opt1 = {
            url: `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${access_token}&type=jsapi`,
        };
        //获取缓存中的ticket
        let jsapiticket = yield wxshare_1.getticket("jsapiticket");
        if (!jsapiticket) {
            let jsticket = yield request_1.postAsync(opt1);
            jsticket = JSON.parse(jsticket);
            jsapiticket = jsticket.ticket;
            yield wxshare_1.saveticket("jsapiticket", jsapiticket);
        }
        return jsapiticket;
    });
}
exports.sendWxShare = sendWxShare;
//生成当前时间戳
let createTimestamp = function () {
    let datetime = new Date().getTime();
    let timestam = datetime / 1000;
    return parseInt(timestam);
};
var createNonceStr = function () {
    return Math.random().toString(36).substr(2, 15);
};
var raw = function (args) {
    var keys = Object.keys(args);
    keys = keys.sort();
    var newArgs = [];
    keys.forEach(function (key) {
        newArgs[key.toLowerCase()] = args[key];
    });
    var string = '';
    for (var k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
};
/**
* @synopsis 签名算法
*
* @param jsapi_ticket 用于签名的 jsapi_ticket
* @param url 用于签名的 url ，注意必须动态获取，不能 hardcode
*
* @returns
*/
function getsign(jsapi_ticket, url) {
    return __awaiter(this, void 0, void 0, function* () {
        let appid = wechat_1.wxOpt.appid;
        var ret = {
            jsapi_ticket: jsapi_ticket,
            noncestr: createNonceStr(),
            timestamp: createTimestamp(),
            url: url
        };
        var string = raw(ret);
        // let shaObj = new jsSHA(string, "TEXT");
        let shaObj = new jsSHA("SHA-1", "TEXT");
        //let signature = shaObj.getHash('SHA-1', 'HEX');
        shaObj.update(string);
        let signature = shaObj.getHash("HEX");
        return { ret, signature, appid };
    });
}
exports.getsign = getsign;
//# sourceMappingURL=wxshare.js.map