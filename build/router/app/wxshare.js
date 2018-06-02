"use strict";
// import { Router/* , Request, Response, NextFunction  */} from "express"
// //  import {sendOK} from "../../lib/response"
// // import { sendWxShare,getsign } from "../../lib/wxshare"
// // // import { checkLogin } from "../../redis/logindao"
// // import {wxOpt} from "../../config/wechat"
// export const router = Router()
// // router.get('/share', async function (req: Request, res: Response, next: NextFunction) {
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// //         let {url} = req.query
// //         // let url = req.params["url"];
// //         //获取ticket
// //          let jsapiticket=await sendWxShare()
// //         // //获取签名
// //          let sign=await getsign(jsapiticket,url)
// //         // let ressign={noncestr:sign.ret.noncestr,timestamp:sign.ret.timestamp,appid:sign.appid,signature:sign.signature}
// //          return sendOK(res,sign /* ressign */)
// // })
const express_1 = require("express");
const response_1 = require("../../lib/response");
const wxshare_1 = require("../../lib/wxshare");
exports.router = express_1.Router();
/* GET adtype listing. */
exports.router.get('/share', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let { url } = req.query;
            // let url = req.params["url"];
            //获取ticket
            let jsapiticket = yield wxshare_1.sendWxShare();
            // //获取签名
            let sign = yield wxshare_1.getsign(jsapiticket, url);
            let ressign = { noncestr: sign.ret.noncestr, timestamp: sign.ret.timestamp, appid: sign.appid, signature: sign.signature };
            //return sendOK(res,sign /* ressign */)
            return response_1.sendOK(res, ressign);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=wxshare.js.map