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
const validator_1 = require("./validator");
const validator_2 = require("../../lib/validator");
const logindao_1 = require("../../redis/logindao");
const response_1 = require("../../lib/response");
const express_1 = require("express");
const utils_1 = require("../../lib/utils");
const lotterylevel_1 = require("../../model/mall/lotterylevel");
const awardusers_1 = require("../../model/mall/awardusers");
const system_1 = require("../../model/system/system");
const prize_1 = require("../../model/mall/prize");
const amountlog_1 = require("../../model/users/amountlog");
const orders_1 = require("../../model/orders/orders");
const userprize_1 = require("../../model/users/userprize");
const usercoupon_1 = require("../../model/users/usercoupon");
const awardusers_2 = require("../../model/mall/awardusers");
const users_ext_1 = require("../../model/users/users_ext");
const orders_2 = require("../../router/app/orders");
const goods_1 = require("../../model/mall/goods");
const users_1 = require("../../model/users/users");
const lotterylog_1 = require("../../model/users/lotterylog");
const users_ext_2 = require("../../model/users/users_ext");
const logger = require("winston");
const moment = require("moment");
const amountmonitor_1 = require("../../lib/amountmonitor");
exports.router = express_1.Router();
//充值获得抽奖机会
exports.router.put('/exchange', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { count } = req.body;
            const loginInfo = req.loginInfo;
            let sys = yield system_1.findByName('model');
            let system = yield system_1.findByName('lotterycondition');
            let users_ext = yield users_ext_2.findByPrimary(loginInfo.getUuid());
            if (sys.content.type === 'pointlottery') { //积分抽奖
                if (users_ext.points < parseInt(system.content.point) * parseInt(count))
                    return response_1.sendNotFound(res, "您的积分不足！");
                yield users_ext_2.exchange(loginInfo.getUuid(), { points: parseInt(system.content.point) * parseInt(count), balance: 0 });
                yield users_1.addPointAndCashlottery(loginInfo.getUuid(), parseInt(count), 0);
            }
            else { //现金抽奖
                if (users_ext.balance < parseFloat(system.content.cash) * 100 * parseInt(count))
                    return response_1.sendNotFound(res, "您的零钱不足！");
                yield users_ext_2.exchange(loginInfo.getUuid(), { points: 0, balance: parseFloat(system.content.cash) * 100 * parseInt(count) });
                yield users_1.addPointAndCashlottery(loginInfo.getUuid(), 0, parseInt(count));
            }
            return response_1.sendOK(res, "成功获得抽奖机会！");
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//获得当前抽奖模式
exports.router.get('/lotterytype', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let sys = yield system_1.findByName('model');
            return response_1.sendOK(res, { sys: sys });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//获奖名单
exports.router.get('/lotteryusers', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let sys = yield system_1.findByName('model');
            let userprize = yield userprize_1.getLotteryUserprizes(req.app.locals.sequelize, sys.content.type);
            userprize.forEach(r => {
                r.username = utils_1.changeUsername(r.username);
            });
            return response_1.sendOK(res, { userprize: userprize });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//获得用户奖励列表
exports.router.get('/userprize', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const loginInfo = req.loginInfo;
            let userprize = yield userprize_1.getUserprizes(req.app.locals.sequelize, loginInfo.getUuid());
            return response_1.sendOK(res, { userprize: userprize });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//用户手动领取实物奖品
exports.router.post('/receivegoods', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { uuid, prize, address, message } = req.body;
        try {
            const loginInfo = req.loginInfo;
            let businessGoods = prize;
            businessGoods.number = 1;
            validator_2.validateCgi({ uuid: uuid }, validator_1.userprizeValidator.UUID);
            let obj = {
                useruuid: loginInfo.getUuid(),
                goods: [businessGoods],
                total_fee: 0,
                real_fee: 0,
                fee_info: {},
                address: address,
                message: message,
                goodpoint: 0,
                postage: 0,
                businessmen: businessGoods.businessmen,
                prize: 'true',
                state: 'wait-send'
            };
            //判断商品是否已下线
            let goods = yield goods_1.findByStateVir(businessGoods.uuid);
            goods.property = businessGoods.property;
            goods.number = businessGoods.number;
            let newpropertySet = businessGoods.property.split(",");
            if (businessGoods.tags) {
                let arr = yield orders_2.comparepro(goods.tags, newpropertySet, businessGoods.number);
                if (!arr) {
                    return response_1.sendNotFound(res, "商品已售完！！");
                }
                for (let i = 0; i < arr.length; i++) {
                    if (newpropertySet.length > 1 && !arr[i].data) {
                        return response_1.sendNotFound(res, "商品已售完！！");
                    }
                }
                yield goods_1.updateNumber(arr, businessGoods.uuid);
            }
            if (!goods)
                return response_1.sendNotFound(res, businessGoods.title + "已删除或已下架");
            let orders = yield orders_1.insertOrder(obj);
            orders.total_fee = orders.total_fee / 100;
            orders.real_fee = orders.real_fee / 100;
            yield userprize_1.updateUserprizeState(uuid); //将奖品设置为已领取
            return response_1.sendOK(res, { orders: orders });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//抽奖
exports.router.get("/", logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let sys = yield system_1.findByName('model'); //获得当前的奖励模式
            let lotterytype = sys.content.type;
            const loginInfo = req.loginInfo;
            validator_2.validateCgi({ lotterytype: lotterytype }, validator_1.userprizeValidator.lotterytype);
            let state = yield system_1.findByName('state'); //获得当前的奖励模式
            let operationstatus = yield system_1.findByName('operationstatus'); //获得当前的奖励模式       
            console.log(state.content.lotterystate);
            if (state.content.lotterystate === "on" && operationstatus.content.status === "1") { //抽奖按钮开启
                let system = yield system_1.findByName('timerange'); //获得抽奖获得开始的时间
                if (system) {
                    let time = (new Date());
                    if (new Date(system.content.starttime) <= time && time <= new Date(system.content.endtime)) { //如果是在设置的时间内访问
                        let users = yield users_1.findByPrimary(loginInfo.getUuid());
                        //**********************************减少用户可抽奖次数*************************************** */
                        let sys = yield system_1.findByName("lotterycondition");
                        if (sys) {
                            if (lotterytype === "pointlottery") { //积分抽奖
                                if (users.pointlottery > 0) {
                                    yield users_1.updatePointAndCashlottery(loginInfo.getUuid(), 1, 0); //修改用户的积分抽奖次数
                                }
                                else {
                                    return response_1.sendOK(res, { point: sys.content.point });
                                }
                            }
                            else { //零钱抽奖
                                if (users.cashlottery > 0) {
                                    yield users_1.updatePointAndCashlottery(loginInfo.getUuid(), 0, 1); //修改用户的零钱抽奖次数
                                }
                                else {
                                    return response_1.sendOK(res, { balance: sys.content.cash });
                                }
                            }
                        }
                        //***************************************************************************************** */
                        let awardusers = yield awardusers_1.findByLotterytype(loginInfo.getUuid(), lotterytype);
                        if (awardusers && (awardusers.receive === 'false' || awardusers.level === 0)) { //当前用户为后台设置的特殊用户
                            if (awardusers.level > 0) {
                                yield acceptPrize(req, users, awardusers.level, lotterytype, loginInfo); //领取奖品
                                yield awardusers_2.updateAwardusersInfo({ receive: 'true' }, awardusers.uuid); //标记用户已经领取奖品
                            }
                            return response_1.sendOK(res, { code: awardusers.level }); //返回后台设置的奖励等级
                        }
                        else { //进行随机抽奖
                            let code = yield randomDraw(); //随机抽奖产生随机数（0,1,2,3,4,5）
                            console.log("实际值" + code);
                            //----------------------处理奖品已经被领取后再次抽到该等级奖品---------------------------//
                            //let lotterylevel
                            if (code > 0) {
                                //  lotterylevel = await findByLevel(res.app.locals.sequelize, code, lotterytype)//查找对应等级的奖品
                                let numcount = yield lotterylevel_1.findnumcout(res.app.locals.sequelize, code, lotterytype); //查找对应等级的奖品  (相同等级属性的奖品总数)
                                let count = yield awardusers_2.findAwardusersByLevelCount(req.app.locals.sequelize, code, lotterytype, 'false'); //查找该等级设置的中奖用户的数量
                                if (parseInt(numcount) <= parseInt(count))
                                    code = 0;
                            }
                            code = yield lottery_restrictions(req, users, code, lotterytype, loginInfo); //普通用户抽奖限制设置
                            let newcode = yield acceptPrize(req, users, code, lotterytype, loginInfo); //领取奖品
                            console.log("处理后值" + newcode);
                            //-------------------------------------------------------------------------------------//
                            return response_1.sendOK(res, { code: newcode });
                        }
                    }
                    else { //未在设置的时间内访问                                                                             
                        return response_1.sendNotFound(res, "活动未开放，敬请期待！");
                    }
                }
            }
            else { //未在设置的时间内访问
                return response_1.sendNotFound(res, "活动未开放，敬请期待！");
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/**
 * 获得10的多少次幂
 * @param length
 */
/*async function power(length: number) {
    let num = 1
    for (let i = 0; i < length; i++) {
        num = num * 10
    }
    return num
}*/
/**
 * 随机抽奖
 */
function randomDraw() {
    return __awaiter(this, void 0, void 0, function* () {
        let possibility = yield system_1.findByName('possibility');
        let one = possibility.content.one;
        let two = possibility.content.two;
        let three = possibility.content.three;
        let four = possibility.content.four;
        let five = possibility.content.five;
        let ones = parseFloat(one);
        let twos = parseFloat(two);
        let threes = parseFloat(three);
        let fours = parseFloat(four);
        let fives = parseFloat(five);
        let cell = Math.random();
        let nums;
        let twoss = ones + twos;
        if (cell >= 0 && cell < ones) {
            nums = 1;
        }
        else if (cell >= ones && cell < twoss) {
            nums = 2;
        }
        else if (cell >= ones + twos && cell < ones + twos + threes) {
            nums = 3;
        }
        else if (cell >= ones + twos + threes && cell < ones + twos + threes + fours) {
            nums = 4;
        }
        else if (cell >= ones + twos + threes + fours && cell < ones + twos + threes + fours + fives) {
            nums = 5;
        }
        else if (cell >= ones + twos + threes + fours + fives && cell < 1) {
            nums = 0;
        }
        return nums;
    });
}
//普通用户的抽奖限制设置
function lottery_restrictions(req, users, code, lotterytype, loginInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        let lotterylevel = yield lotterylevel_1.getLotterylevels(req.app.locals.sequelize, code, lotterytype); //获得该奖励等级
        if (lotterylevel && lotterylevel.prizeuuid && lotterylevel.limitcount > 0) {
            let event = yield system_1.findByName('eventname'); //获得当前的活动名称记录
            let userprizenum = yield userprize_1.findPrizeCount(loginInfo.getUuid(), lotterylevel.prizeuuid, event.content.event); //单个用户获得该奖品的中奖次数
            //            if (lotterylevel.awardnum * (lotterylevel.limitcount - 1) < userprizenum) {
            if (lotterylevel.limitcount <= userprizenum) { //限制中奖次数
                return 0;
            }
            let prize_state = yield userprize_1.find_prize_state(lotterylevel.prizeuuid); //取得该奖品的state(balance,piont,goods,coupon)
            let prizenum = yield awardusers_1.get_user_event_prizenum(req.app.locals.sequelize, users.uuid, prize_state.state, event.content.event); //该奖品类型的数目
            let limitmount = yield system_1.findByName('limitmount');
            let balance = limitmount.content.balance;
            let point = limitmount.content.point;
            let goods = limitmount.content.goods;
            let coupon = limitmount.content.coupon;
            //数量
            if (prize_state.state === "balance") { //同一用户现金获奖最多3次
                if (parseInt(prizenum[0].prizenum) >= parseInt(balance)) {
                    return 0;
                }
            }
            else if (prize_state.state === "point") { //同一用户积分获奖最多1次
                if (parseInt(prizenum[0].prizenum) >= parseInt(point)) {
                    return 0;
                }
            }
            else if (prize_state.state === "goods") { //同一用户实物类获奖最多1次
                if (parseInt(prizenum[0].prizenum) >= parseInt(goods)) {
                    return 0;
                }
            }
            else if (prize_state.prize.state === "coupon") { //同一用户优惠劵获奖最多1次
                if (parseInt(prizenum[0].prizenum) >= parseInt(coupon)) {
                    return 0;
                }
            }
        }
        return code;
    });
}
/**
 * 领奖
 * @param users
 */
function acceptPrize(req, users, code, lotterytype, loginInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        //let lotterylevel = await findByLevel(req.app.locals.sequelize, code, lotterytype)
        let lotterylevel;
        if (code != 0) {
            lotterylevel = yield lotterylevel_1.getLotterylevels(req.app.locals.sequelize, code, lotterytype); //获得该奖励等级
            if (lotterylevel && lotterylevel.prizeuuid) { //如果奖品存在
                for (let i = 0; i < lotterylevel.awardnum; i++) {
                    let sys = yield system_1.findByName('eventname'); //获得活动名称
                    let obj = {
                        useruuid: users.uuid,
                        username: users.username,
                        prizeuuid: lotterylevel.prizeuuid,
                        lotterytype: lotterytype,
                        level: code,
                        eventname: sys.content.event //活动名称
                    };
                    let userprize = yield userprize_1.insertUserprize(obj); //领取奖品
                    //******************************************************************************************************** */
                    let prize = yield prize_1.findByPrimary(lotterylevel.prizeuuid); //获得所领取的奖品
                    if (prize) {
                        if (prize.state === 'coupon') { //奖品是优惠券
                            yield usercoupon_1.insertusercoupon(req.app.locals.sequelize, loginInfo.getUuid(), prize.prize.uuid); //发放优惠券到用户
                            yield userprize_1.updateUserprizeState(userprize.uuid); //标记奖品已经被领取
                        }
                        else if (prize.state === 'point') { //奖励是积分
                            yield users_ext_1.updatePoints(loginInfo.getUuid(), { points: parseInt(prize.prize.point), balance: 0, exp: 0 }); //增加积分
                            yield lotterylog_1.insertLotterylog({ useruuid: users.uuid, prizeinfo: prize, point: parseInt(prize.prize.point), balance: 0 });
                            logger.error(`用户${users.uuid}获得${prize.prize.point}积分奖励`);
                            yield userprize_1.updateUserprizeState(userprize.uuid); //标记奖品已经被领取
                            let obj = {
                                useruuid: users.uuid,
                                points: prize.prize.point,
                                mode: "lottery",
                                time: moment().format('YYYY-MM-DD HH:mm:ss')
                            };
                            yield amountlog_1.insertAmountLog(obj);
                        }
                        else if (prize.state === 'balance') { //奖励是零钱
                            yield users_ext_1.updatePoints(loginInfo.getUuid(), { points: 0, balance: parseFloat(prize.prize.balance) * 100, exp: 0 }); //增加积分
                            yield lotterylog_1.insertLotterylog({ useruuid: users.uuid, prizeinfo: prize, point: 0, balance: parseFloat(prize.prize.balance) * 100 });
                            logger.error(`用户${users.uuid}获得${parseFloat(prize.prize.balance) * 100}零钱奖励`);
                            yield userprize_1.updateUserprizeState(userprize.uuid); //标记奖品已经被领取
                            yield amountmonitor_1.amountcheck(req.app.locals.sequelize, loginInfo.getUuid(), "lottery", parseFloat(prize.prize.balance), 0);
                        }
                    }
                    //******************************************************************************************************** */
                }
            }
            yield lotterylevel_1.updateLotterylevelNum(lotterylevel.uuid); //减少奖励等级的发放数量
        }
        return code;
    });
}
//# sourceMappingURL=userprize.js.map