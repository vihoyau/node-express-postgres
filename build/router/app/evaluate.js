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
const logindao_1 = require("../../redis/logindao");
const validator_2 = require("./validator");
const response_1 = require("../../lib/response");
const express_1 = require("express");
const evaluatejoin_1 = require("../../model/evaluate/evaluatejoin");
const evaluateactivity_1 = require("../../model/evaluate/evaluateactivity");
const evaluategroup_1 = require("../../model/evaluate/evaluategroup");
const goods_1 = require("../../model/mall/goods");
const users_ext_1 = require("../../model/users/users_ext");
const users_1 = require("../../model/users/users");
const evaluate_1 = require("../../router/crm/evaluate");
const winston_1 = require("../../config/winston");
const utils_1 = require("../../lib/utils");
const wxpay_1 = require("../../config/wxpay");
exports.router = express_1.Router();
//开团,试图开团
exports.router.post("/tryopen", logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { activityuuid, /* addressuuid,*/ bid } = req.body;
        const info = req.loginInfo;
        const useruuid = info.getUuid();
        validator_1.validateCgi({ activityuuid, /*addressuuid,*/ bid }, validator_2.evaluateValidator.opengroup);
        try {
            let act = yield evaluateactivity_1.findByPrimaryUUID(activityuuid);
            let nowtime = winston_1.timestamps();
            if (act.endtime < nowtime || act.state == 'finish')
                return response_1.sendErrMsg(res, "活动已经结束", 502);
            let join = yield evaluatejoin_1.findByUseruuidAndActuuid(useruuid, activityuuid); //获取参团信息
            if (join && join.groupuuid)
                return response_1.sendErrMsg(res, "您已经参团本活动", 501);
            if (join && join.inputcount > wxpay_1.bidMaxCount)
                return response_1.sendErrMsg(res, "您尝试次数太多啦", 501);
            if (join && join.guess)
                return response_1.sendErrMsg(res, "您已经猜成功过啦", 500);
            if (join) {
                join.inputcount++;
                join.bid = bid;
                join.leader = true;
                yield evaluatejoin_1.updateEvaluatejoin(join.uuid, join);
            }
            else {
                let obj = {
                    useruuid,
                    activityuuid,
                    bid,
                    /*addressuuid,*/
                    inputcount: 1,
                    leader: true,
                    pay: false
                };
                join = yield evaluatejoin_1.createEvaluatejoin(obj);
            }
            if (bid < (act.reserveprice) * 0.8) {
                let msg = "亲，您太小看咱家宝贝了吧！" +
                    ((wxpay_1.bidMaxCount - join.inputcount + 1) > 0 ? "还有" + (wxpay_1.bidMaxCount - join.inputcount + 1) + "次机会" : "没有猜价机会了哦");
                return response_1.sendErrMsg(res, msg, 503);
            }
            if (bid < act.reserveprice) {
                let msg = "您距离专家只剩一步之遥!" +
                    ((wxpay_1.bidMaxCount - join.inputcount + 1) > 0 ? "还有" + (wxpay_1.bidMaxCount - join.inputcount + 1) + "次机会" : "没有猜价机会了哦");
                return response_1.sendErrMsg(res, msg, 504);
            }
            yield evaluatejoin_1.updateEvaluatejoin(join.uuid, { guess: true });
            if (bid == act.reserveprice)
                return response_1.sendOK(res, { msg: "大神！请受我一拜！", joinuuid: join.uuid });
            if (bid > act.reserveprice && bid <= act.marketprice)
                return response_1.sendOK(res, { msg: "高手，不愧为识货大师！", joinuuid: join.uuid });
            if (bid > act.marketprice)
                return response_1.sendOK(res, { msg: "豪，请收下我的膝盖吧！", joinuuid: join.uuid });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//更新商品属性
exports.router.post("/updateProperty", logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { uuid, property, groupuuid } = req.body;
        yield evaluatejoin_1.updateEvaluatejoin(uuid, { property, groupuuid });
        return response_1.sendOK(res, { msg: "ok" });
    });
});
//支付成功，创建一个团
function createGroupAfterPay(activityuuid, useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let obj = {
                activityuuid,
                useruuids: [useruuid],
                state: "processing",
            };
            let group = yield evaluategroup_1.createGroup(obj);
            let join = yield evaluatejoin_1.findByUseruuidAndActuuid(useruuid, activityuuid);
            join.pay = true;
            join.groupuuid = group.uuid;
            yield evaluatejoin_1.updateEvaluatejoin(join.uuid, join);
            return "成功开团，快去邀请好友";
        }
        catch (e) {
            return e;
        }
    });
}
exports.createGroupAfterPay = createGroupAfterPay;
//参团，试图参团
exports.router.put("/tryjoin", logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { groupuuid, /*addressuuid,*/ bid } = req.body;
        const info = req.loginInfo;
        const useruuid = info.getUuid();
        validator_1.validateCgi({ groupuuid, /*addressuuid,*/ bid }, validator_2.evaluateValidator.joingroup);
        try {
            let group = yield evaluategroup_1.findByGroupUUID(groupuuid);
            let act = yield evaluateactivity_1.findByPrimaryUUID(group.activityuuid);
            let nowtime = winston_1.timestamps();
            if (act.endtime < nowtime || act.state == 'finish')
                return response_1.sendErrMsg(res, "活动已经结束", 502);
            let join = yield evaluatejoin_1.findByUseruuidAndActuuid(useruuid, group.activityuuid); //获取参团信息
            if (join && join.groupuuid)
                return response_1.sendErrMsg(res, "您已经参团本活动", 501);
            if (join && join.inputcount > wxpay_1.bidMaxCount)
                return response_1.sendErrMsg(res, "您尝试次数太多啦", 501);
            if (join && join.guess)
                return response_1.sendErrMsg(res, "您已经猜成功过啦", 500);
            if (join) {
                join.inputcount++;
                join.bid = bid;
                join.leader = false;
                yield evaluatejoin_1.updateEvaluatejoin(join.uuid, join);
            }
            else {
                let obj = {
                    useruuid,
                    activityuuid: group.activityuuid,
                    bid,
                    inputcount: 1,
                    leader: false,
                    pay: false
                };
                join = yield evaluatejoin_1.createEvaluatejoin(obj);
            }
            if (bid < (act.reserveprice) * 0.8) {
                let msg = "亲，您太小看咱家宝贝了吧！" +
                    ((wxpay_1.bidMaxCount - join.inputcount + 1) > 0 ? "还有" + (wxpay_1.bidMaxCount - join.inputcount + 1) + "次机会" : "没有猜价机会了哦");
                return response_1.sendErrMsg(res, msg, 503);
            }
            if (bid < act.reserveprice) {
                let msg = "您距离专家只剩一步之遥!" +
                    ((wxpay_1.bidMaxCount - join.inputcount + 1) > 0 ? "还有" + (wxpay_1.bidMaxCount - join.inputcount + 1) + "次机会" : "没有猜价机会了哦");
                return response_1.sendErrMsg(res, msg, 504);
            }
            yield evaluatejoin_1.updateEvaluatejoin(join.uuid, { guess: true });
            if (bid == act.reserveprice)
                return response_1.sendOK(res, { msg: "大神！请受我一拜！", joinuuid: join.uuid });
            if (bid > act.reserveprice && act.marketprice)
                return response_1.sendOK(res, { msg: "高手，不愧为识货大师！", joinuuid: join.uuid });
            if (bid > act.marketprice)
                return response_1.sendOK(res, { msg: "豪，请收下我的膝盖吧！", joinuuid: join.uuid });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//支付成功，加入一个团
function joinGroupAfterPay(groupuuid, useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let group = yield evaluategroup_1.findByGroupUUID(groupuuid);
            let join = yield evaluatejoin_1.findByUseruuidAndActuuid(useruuid, group.activityuuid);
            join.pay = true;
            join.groupuuid = groupuuid;
            yield evaluatejoin_1.updateEvaluatejoin(join.uuid, join); //更新参与表的支付记录和所属团
            group.useruuids.push(useruuid);
            let act = yield evaluateactivity_1.findByPrimaryUUID(group.activityuuid);
            if (act.amount == group.useruuids.length) {
                group.state = 'finish'; //达到人数就把状态改为完成
                //todo  自动生成订单
                yield evaluate_1.fulfillGroup(group.uuid);
            }
            yield evaluategroup_1.updateGroup(groupuuid, group); //更新这个团的信息
            return "成功加入团";
        }
        catch (e) {
            return e;
        }
    });
}
exports.joinGroupAfterPay = joinGroupAfterPay;
//零钱支付 参团&开团
exports.router.post("/chargePay", logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { activityuuid, groupuuid, addressuuid, property } = req.body;
        if (activityuuid)
            validator_1.validateCgi({ uuid: activityuuid }, validator_2.evaluateValidator.uuid);
        if (groupuuid)
            validator_1.validateCgi({ uuid: groupuuid }, validator_2.evaluateValidator.uuid);
        let useruuid = req.headers.uuid;
        try {
            let join = yield evaluatejoin_1.findByUseruuidAndActuuid(useruuid, activityuuid);
            let act = yield evaluateactivity_1.findByPrimaryUUID(activityuuid);
            if (!join)
                return response_1.sendNotFound(res, "没有参团信息！");
            if (join && join.pay)
                return response_1.sendNotFound(res, "已经支付参团");
            if (join && join.inputcount > wxpay_1.bidMaxCount)
                return response_1.sendNotFound(res, "您尝试次数太多啦");
            if (join.bid < act.reserveprice)
                return response_1.sendNotFound(res, "出价不对");
            let user_ext = yield users_ext_1.findByPrimary(useruuid);
            if (user_ext.balance < join.bid * 100)
                return response_1.sendNotFound(res, "余额不足");
            yield users_ext_1.exchange(useruuid, { points: 0, balance: join.bid * 100 });
            yield evaluatejoin_1.updateEvaluatejoin(join.uuid, { groupuuid, addressuuid, property });
            if (groupuuid)
                yield joinGroupAfterPay(groupuuid, useruuid);
            else
                yield createGroupAfterPay(activityuuid, useruuid);
            return response_1.sendOK(res, { msg: "succ" });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//查找只缺一个成员的团
exports.router.get("/findgroup", /* checkAppLogin, */ function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { activityuuid } = req.query;
        try {
            validator_1.validateCgi({ activityuuid }, validator_2.evaluateValidator.creategroup);
            let groups = yield evaluategroup_1.findByState(activityuuid, 'processing');
            let array = [];
            for (let i = 0; i < groups.length; i++) {
                let act = yield evaluateactivity_1.findByPrimaryUUID(groups[i].activityuuid);
                if (act.amount == groups[i].useruuids.length + 1) {
                    let user = [];
                    for (let j = 0; j < groups[i].useruuids.length; j++) {
                        let someOne = yield users_1.findByPrimary(groups[i].useruuids[j]);
                        delete someOne.password;
                        user.push(someOne);
                    }
                    let good = yield goods_1.findByPrimary(act.gooduuid);
                    let obj = Object.assign(groups[i], { title: good.title }, { userInfo: user }, { endtime: act.endtime });
                    array.push(obj);
                }
            }
            return response_1.sendOK(res, array);
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//查找正在进行的活动
exports.router.get("/processing", /* checkAppLogin, */ function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { page, count } = req.query;
        validator_1.validateCgi({ page, count }, validator_2.evaluateValidator.get);
        try {
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let array = [];
            let nowtime = winston_1.timestamps();
            let act = yield evaluateactivity_1.findAllProcessingActivity(req.app.locals.sequelize, cursor, limit, nowtime);
            for (let i = 0; i < act.length; i++) {
                act[i].created = winston_1.timestamps(act[i].created);
                act[i].modified = winston_1.timestamps(act[i].modified);
                let good = yield goods_1.findByPrimary(act[i].gooduuid);
                good.price = good.price / 100;
                good.realprice = good.realprice / 100;
                let obj = Object.assign(act[i], { good }, { page: parseInt(page) + 1, count });
                array.push(obj);
            }
            return response_1.sendOK(res, array);
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//获取某个活动的详情
exports.router.get("/theAct/:uuid", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let activityuuid = req.params.uuid;
        validator_1.validateCgi({ uuid: activityuuid }, validator_2.evaluateValidator.uuid);
        try {
            let act = yield evaluateactivity_1.findByPrimaryUUID(activityuuid);
            act.created = winston_1.timestamps(act.created);
            act.modified = winston_1.timestamps(act.modified);
            let good = yield goods_1.findByPrimary(act.gooduuid);
            good.price = good.price / 100;
            good.realprice = good.realprice / 100;
            let obj = Object.assign(act, { good });
            return response_1.sendOK(res, obj);
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//获取自己参团信息
exports.router.get('/joinInfo', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const info = req.loginInfo;
        const useruuid = info.getUuid();
        let arr = [];
        try {
            let join = yield evaluatejoin_1.findByUserUUID(useruuid);
            for (let i = 0; i < join.length; i++) {
                let act = yield evaluateactivity_1.findByPrimaryUUID(join[i].activityuuid);
                let good = yield goods_1.findByPrimary(act.gooduuid);
                good.price = good.price / 100;
                good.realprice = good.realprice / 100;
                let obj;
                if (join[i].groupuuid) {
                    let group = yield evaluategroup_1.findByGroupUUID(join[i].groupuuid);
                    obj = Object.assign({ actEndtime: act.endtime, actAmount: act.amount }, { join: join[i] }, { good }, { groupUsers: group.useruuids, groupState: group.state });
                }
                else {
                    obj = Object.assign({ actEndtime: act.endtime, actAmount: act.amount }, { join: join[i] }, { good });
                }
                arr.push(obj);
            }
            return response_1.sendOK(res, arr);
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//获取某个团的信息
exports.router.get('/theGroup', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { groupuuid } = req.query;
        validator_1.validateCgi({ groupuuid }, validator_2.evaluateValidator.addgroup);
        try {
            let group = yield evaluategroup_1.findByGroupUUID(groupuuid);
            let user = [];
            for (let i = 0; i < group.useruuids.length; i++) {
                let someOne = yield users_1.findByPrimary(group.useruuids[i]);
                delete someOne.password;
                user.push(someOne);
            }
            let act = yield evaluateactivity_1.findByPrimaryUUID(group.activityuuid);
            group = Object.assign({ endtime: act.endtime, amount: act.amount }, { userInfo: user }, group);
            return response_1.sendOK(res, group);
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//# sourceMappingURL=evaluate.js.map