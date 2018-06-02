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
const lotterylevel_1 = require("../../model/mall/lotterylevel");
const system_1 = require("../../model/system/system");
exports.router = express_1.Router();
//获奖名单
exports.router.get('/', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let sys = yield system_1.findByName('model');
            let lotterylevel;
            if (sys) {
                lotterylevel = yield lotterylevel_1.getLotterylevel(sys.content.type);
            }
            return response_1.sendOK(res, { lotterylevel: lotterylevel });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//获取抽奖活动状态
exports.router.get("/eventstate", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let operation = yield system_1.findByName('operationstatus'); //获得system.system表中的开关操作标志状态值记录
            let status = operation.content.status; //获得system.system表中的开关操作标志状态值
            let result = yield system_1.findByName('state'); //获得system.system表中的开关状态标志状态值记录
            let lotterystate = result.content.lotterystate; //获得system.system表中的开关状态标志状态值   
            return response_1.sendOK(res, { lotterystate: lotterystate, status: status }); //返回开关状态信息    {"on" "1"} => 已开启  {"off","2"} : 已关闭
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=lotterylevel.js.map