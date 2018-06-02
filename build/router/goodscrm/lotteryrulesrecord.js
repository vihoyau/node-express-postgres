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
const validator_1 = require("../../lib/validator");
const validator_2 = require("../crm/validator");
const express_1 = require("express");
const response_1 = require("../../lib/response");
const logindao_1 = require("../../redis/logindao");
const lotteryrulesrecord_1 = require("../../model/users/lotteryrulesrecord");
const system_1 = require("../../model/system/system");
const validator_3 = require("./validator");
const winston_1 = require("../../config/winston");
exports.router = express_1.Router();
//点击抽奖管理菜单栏中的活动历史记录，获取活动历史抽奖记录
exports.router.get("/history", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { start, length, draw, search } = req.query;
            const loginInfo = req.loginInfo;
            if (!loginInfo.isRoot() && !loginInfo.isGoodsRW())
                return response_1.sendNoPerm(res);
            console.log(search);
            /*     let ads = JSON.parse(search)
                console.log(ads) */
            let searchdata = search.value;
            validator_1.validateCgi({ start: start, length: length, searchdata: searchdata }, validator_3.crmuserValidator.pagination);
            if (!searchdata || searchdata === 'undefined' || searchdata == undefined)
                searchdata = '';
            let recordsFiltered = yield lotteryrulesrecord_1.get_event_Count(req.app.locals.sequelize, searchdata); //获得活动的所有记录数
            let prize = yield lotteryrulesrecord_1.getevent_prizeList(req.app.locals.sequelize, parseInt(start), parseInt(length), searchdata); //得到所有的活动信息并分页显示
            return response_1.sendOK(res, { draw: draw, prize: prize, recordsFiltered: parseInt(recordsFiltered) });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//获取抽奖活动状态
exports.router.get("/eventstate", logindao_1.checkLogin, function (req, res, next) {
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
//切换抽奖开关按钮 按钮为关的时候保存历史数据 并修改时间
exports.router.put('/', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { name, content } = req.body;
        try {
            const loginInfo = req.loginInfo;
            if (!loginInfo.isRoot() && !loginInfo.isGoodsRW())
                return response_1.sendNoPerm(res);
            validator_1.validateCgi({ name, content }, validator_2.systemValidator.contentValidator);
            let result = yield system_1.updateSystem(JSON.parse(content), name); //更新抽奖开关状态
            let operation = yield system_1.findByName('operationstatus'); //获得system.system表中的开关操作标志状态值记录
            let status = operation.content.status; //获得system.system表中的开关操作标志状态值
            if (result.content.lotterystate === "off" && status === "2") {
                return response_1.sendOK(res, { message: '设置的结束时间已到，活动后台自动关闭,无需再手动关闭' });
            }
            //抽奖开关为关闭状态
            if (result.content.lotterystate === "off" && status === "1") {
                let event_time = yield system_1.findByName('timerange'); //获得当前的活动名称的时间限制记录
                event_time.content.endtime = (new Date()); //把当前的时间作为活动的结束时间
                event_time.content.endtime = winston_1.timestamps(event_time.content.endtime); //格式化结束时间
                console.log(event_time);
                let time_change = yield system_1.updateSystem(event_time.content, 'timerange'); //更新抽奖活动的结束时间 
                console.log(time_change);
                //  validateCgi({ level: parseInt(level), state: state, limitcount: parseInt(limitcount) }, lotterylevelValidator.insertOptions)
                let lotteryrules = yield lotteryrulesrecord_1.gelotteryrulesrecordList(req.app.locals.sequelize); //获取抽奖开关按钮关闭前的抽奖设置记录
                let mesg = new Array();
                for (let i = 0; i < lotteryrules.length; i++) {
                    mesg[i] = lotteryrules[i].content;
                }
                let event = yield system_1.findByName('eventname'); //获得当前的活动名称记录
                let eventstate = event.content.event; //获取活动名称
                //查找users.userprize的中奖记录
                let uuidnum = yield lotteryrulesrecord_1.getlotteryuserprizeList(req.app.locals.sequelize);
                let lotteryrulesrecord = {
                    lotteryrule: mesg,
                    awarduuid: uuidnum,
                    eventname: eventstate //活动名称
                };
                console.log(lotteryrulesrecord);
                yield lotteryrulesrecord_1.create_one_lotteryrulesrecord(lotteryrulesrecord); //创建历史的抽奖记录
                yield system_1.updateSystem(JSON.parse('{"status": "2"}'), 'operationstatus'); //更新system.system表中的开关操作标志状态值
                return response_1.sendOK(res, { message: '强制关闭成功' }); //返回操作信息和按钮状态
            }
            if (result.content.lotterystate === "on" && status === "0") {
                let statename = yield system_1.findByName(name); //获得当前的活动名称记录
                statename.content.lotterystate = content; //获取活动名称
                //判断设置的活动结束时间不能小于当前的时间
                let event_time = yield system_1.findByName('timerange'); //获得当前的活动名称记录
                let nowtime = (new Date());
                if (new Date(event_time.content.endtime) <= nowtime) {
                    return response_1.sendErrMsg(res, "设置的活动结束时间不能比当前时间早，请重新设置活动的结束时间", 409);
                }
                yield system_1.updateSystem(JSON.parse('{"status": "1"}'), 'operationstatus'); //更新system.system表中的开关操作标志状态值
                yield auto_check(req, res, next, result.content.lotterystate); //自动检测结束时间
                return response_1.sendOK(res, { message: '开启成功' }); //返回操作信息和按钮状态
            }
            if (result.content.lotterystate === "on" && status === "2") {
                return response_1.sendOK(res, { message: '该活动已结束，不能再次打开，请重新设置新的活动名称', lotterystate: result.content.lotterystate, status: status });
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
let timer;
//创建历史抽奖记录功能函数
function close_lottery_button(req, res, next, lotterystate) {
    return __awaiter(this, void 0, void 0, function* () {
        /*   let lotterystat = lotterystate */
        let statename = yield system_1.findByName('state'); //获得lotterystate当前状态 off 或 on
        try {
            if ("off" === statename.content.lotterystate) {
                clearInterval(timer); //关闭定时器
            }
            else {
                let lotteryrules = yield lotteryrulesrecord_1.gelotteryrulesrecordList(req.app.locals.sequelize); //获取抽奖开关按钮关闭前的抽奖设置记录
                let mesg = new Array();
                for (let i = 0; i < lotteryrules.length; i++) {
                    mesg[i] = lotteryrules[i].content;
                }
                let event = yield system_1.findByName('eventname'); //获得当前的活动名称记录
                let eventstate = event.content.event; //获取活动名称
                //查找users.userprize的中奖记录
                let uuidnum = yield lotteryrulesrecord_1.getlotteryuserprizeList(req.app.locals.sequelize);
                let lotteryrulesrecord = {
                    lotteryrule: mesg,
                    awarduuid: uuidnum,
                    eventname: eventstate //活动名称
                };
                console.log(lotteryrulesrecord);
                let message = yield lotteryrulesrecord_1.create_one_lotteryrulesrecord(lotteryrulesrecord); //创建历史的抽奖记录
                console.log(message);
                yield system_1.updateSystem(JSON.parse('{"status": "2"}'), 'operationstatus'); //更新system.system表中的开关操作标志状态值
                yield system_1.updateSystem(JSON.parse('{"lotterystate": "off"}'), 'state'); //更新system.system表中的抽奖开关为关
                clearInterval(timer); //关闭定时器
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
}
exports.close_lottery_button = close_lottery_button;
//抽奖按钮开启后，自动检测活动的结束时间，若没有强行关闭，则结束时间到了就自动关闭
function auto_check(req, res, next, lotterystate) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            timer = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                let event_time = yield system_1.findByName('timerange'); //获得当前的活动名称的时间限制记录
                let nowtime = (new Date()); //把当前的时间作为活动的结束时间
                if (new Date(event_time.content.endtime) < nowtime) { //此刻的时间大于设置的结束时间
                    close_lottery_button(req, res, next, lotterystate);
                }
            }), 1000); //每1秒检测一次
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
}
exports.auto_check = auto_check;
//通过users.lotteryrulesrecord表中的uuid来获取不同活动相对应的中奖用户名单
exports.router.get("/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //users.lotteryrulesrecord表中的uuid
        let uuid = req.params.uuid;
        const { start, length, draw, search } = req.query;
        let { state, lotterytype, receive } = req.query;
        try {
            const loginInfo = req.loginInfo;
            if (!loginInfo.isRoot() && !loginInfo.isGoodsRW())
                return response_1.sendNoPerm(res);
            let event_record = yield lotteryrulesrecord_1.find_one_lotteryrulesrecord(uuid); //某个活动的历史记录
            console.log(event_record);
            console.log(search);
            /*     let ads = JSON.parse(search)
                console.log(ads) */
            let searchdata = search.value;
            validator_1.validateCgi({ start: start, length: length, searchdata: searchdata }, validator_3.crmuserValidator.pagination);
            validator_1.validateCgi({ state: state, lotterytype: lotterytype, receive }, validator_3.userprizeValidator.stateAndlotterytype);
            if (!state || state === 'undefined' || state == undefined)
                state = '';
            if (!searchdata || searchdata === 'undefined' || searchdata == undefined)
                searchdata = '';
            let recordsFiltered = yield lotteryrulesrecord_1.get_one_event_Count(req.app.locals.sequelize, searchdata, state, lotterytype, receive, event_record.eventname);
            let usersprize_message_select = yield lotteryrulesrecord_1.getlotterytUserprizeList(req.app.locals.sequelize, searchdata, state, lotterytype, receive, event_record.eventname, parseInt(start), parseInt(length));
            console.log(usersprize_message_select);
            for (let i = 0; i < usersprize_message_select.length; i++) {
                usersprize_message_select[i].created = winston_1.timestamps(usersprize_message_select[i].created); //创建时间的格式转换
            }
            return response_1.sendOK(res, { draw: draw, usersprize_message_select: usersprize_message_select, recordsFiltered: parseInt(recordsFiltered) });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=lotteryrulesrecord.js.map