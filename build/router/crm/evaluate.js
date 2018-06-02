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
const evaluateactivity_1 = require("../../model/evaluate/evaluateactivity");
const evaluategroup_1 = require("../../model/evaluate/evaluategroup");
const evaluatejoin_1 = require("../../model/evaluate/evaluatejoin");
const evaluatelog_1 = require("../../model/evaluate/evaluatelog");
const orders_1 = require("../../model/orders/orders");
const goods_1 = require("../../model/mall/goods");
const users_ext_1 = require("../../model/users/users_ext");
const users_1 = require("../../model/users/users");
const address_1 = require("../../model/users/address");
const winston_1 = require("../../config/winston");
exports.router = express_1.Router();
//增加一个暗拼活动
exports.router.post("/add", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { tag, starttime, endtime, amount, gooduuid, marketprice, reserveprice, freeprobability } = req.body;
        let obj = { tag, starttime, endtime, amount, gooduuid, marketprice, reserveprice, freeprobability };
        validator_1.validateCgi(obj, validator_2.evaluateValidator.add);
        try {
            if (parseFloat(marketprice) <= parseFloat(reserveprice))
                return response_1.sendErrMsg(res, "底价应该低于市场价", 500);
            const info = req.loginInfo;
            if (!info.isAdvertiserRW() && !info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            yield evaluateactivity_1.createEvaluateActivity(obj);
            return response_1.sendOK(res, { msg: "创建成功" });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//修改一个暗拼活动
exports.router.put("/update", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { uuid, tag, starttime, endtime, amount, gooduuid, marketprice, reserveprice, freeprobability } = req.body;
        let obj = { uuid, tag, starttime, endtime, amount, gooduuid, marketprice, reserveprice, freeprobability };
        validator_1.validateCgi(obj, validator_2.evaluateValidator.update);
        try {
            if (parseFloat(marketprice) <= parseFloat(reserveprice))
                return response_1.sendErrMsg(res, "底价应该低于市场价", 500);
            const info = req.loginInfo;
            if (!info.isAdvertiserRW() && !info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            let nowtime = winston_1.timestamps();
            let act = yield evaluateactivity_1.findByPrimaryUUID(uuid);
            if (act.starttime < nowtime)
                return response_1.sendErrMsg(res, "已经开始，不能修改", 501);
            delete obj.uuid;
            yield evaluateactivity_1.updateEvaluateActivity(uuid, obj);
            return response_1.sendOK(res, { msg: "修改成功" });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//删除一个暗拼活动
exports.router.delete("/act", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { uuid } = req.body;
        validator_1.validateCgi({ uuid }, validator_2.evaluateValidator.del);
        try {
            const info = req.loginInfo;
            if (!info.isAdvertiserRW() && !info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            let nowtime = winston_1.timestamps();
            let activity = yield evaluateactivity_1.findByPrimaryUUID(uuid);
            if (activity.starttime < nowtime /* && activity.endtime > nowtime */)
                return response_1.sendErrMsg(res, "暂时不能删除", 501);
            yield evaluateactivity_1.delEvaluateActivity(uuid);
            return response_1.sendOK(res, { msg: "删除成功" });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//查询全部暗拼活动
exports.router.get("/act", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { search, start, length } = req.query;
        validator_1.validateCgi({ start, length }, validator_2.evaluateValidator.getAllact);
        if (search.value)
            validator_1.validateCgi({ search: search.value }, validator_2.evaluateValidator.getAllactTag);
        try {
            let recordsFiltered;
            let arr;
            if (search.value) {
                recordsFiltered = yield evaluateactivity_1.actGetCountByTag(req.app.locals.sequelize, search.value);
                arr = yield evaluateactivity_1.findAllEvaluateActivityByTag(search.value, start, length);
            }
            else {
                recordsFiltered = yield evaluateactivity_1.actGetCount();
                arr = yield evaluateactivity_1.findAllEvaluateActivity(start, length);
            }
            let nowtime = winston_1.timestamps();
            let array = [];
            for (let i = 0; i < arr.length; i++) {
                arr[i].created = winston_1.timestamps(arr[i].created);
                arr[i].modified = winston_1.timestamps(arr[i].modified);
                if (nowtime < arr[i].starttime)
                    arr[i]['status'] = '未开始';
                else if (nowtime > arr[i].endtime)
                    arr[i]['status'] = '已结束';
                else if (nowtime > arr[i].starttime && nowtime < arr[i].endtime && !arr[i].state)
                    arr[i]['status'] = '进行中';
                else
                    arr[i]['status'] = '已结束';
                let good = yield goods_1.findByPrimary(arr[i].gooduuid);
                let obj = Object.assign(arr[i], { title: good.title });
                array.push(obj);
            }
            return response_1.sendOK(res, { array, recordsFiltered });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//停止一个暗拼活动,提前结束
exports.router.put("/stop", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { uuid } = req.body;
        validator_1.validateCgi({ uuid }, validator_2.evaluateValidator.stop);
        try {
            const info = req.loginInfo;
            if (!info.isAdvertiserRW() && !info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            let nowtime = winston_1.timestamps();
            let activity = yield evaluateactivity_1.findByPrimaryUUID(uuid);
            if (nowtime < activity.starttime || nowtime > activity.endtime)
                return response_1.sendErrMsg(res, "活动未开始或已经结束", 501);
            let obj = { state: "finish" };
            yield evaluateactivity_1.updateEvaluateActivity(uuid, obj);
            return response_1.sendOK(res, { msg: "已提前结束" });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//查询某活动全部的团
exports.router.get("/group", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { activityuuid, start, length } = req.query;
        validator_1.validateCgi({ activityuuid, start, length }, validator_2.evaluateValidator.getAll);
        try {
            let recordsFiltered = yield evaluategroup_1.groupGetCount({ activityuuid });
            let arr = yield evaluategroup_1.findGroup(activityuuid, start, length);
            let array = [];
            for (let i = 0; i < arr.length; i++) {
                arr[i].created = winston_1.timestamps(arr[i].created);
                arr[i].modified = winston_1.timestamps(arr[i].modified);
                let useruuids = arr[i].useruuids;
                let usernames = [];
                for (let j = 0; j < useruuids.length; j++) {
                    let user = yield users_1.findByPrimary(useruuids[j]);
                    if (user)
                        usernames.push(user.username);
                }
                arr[i]['usernames'] = usernames;
                let act = yield evaluateactivity_1.findByPrimaryUUID(arr[i].activityuuid);
                let good = yield goods_1.findByPrimary(act.gooduuid);
                let obj = Object.assign(arr[i], { title: good.title });
                array.push(obj);
            }
            return response_1.sendOK(res, { array, recordsFiltered });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
/* router.put("/fulfill", checkLogin, async function (req: Request, res: Response, next: NextFunction) {
    let { groupuuid } = (req as any).body
    validateCgi({ groupuuid }, evaluateValidator.fulfill)

    try {
        const info: LoginInfo = (req as any).loginInfo
        if (!info.isAdvertiserRW() && !info.isAdminRW() && !info.isRoot())
            return sendNoPerm(res)

        let group = await findByGroupUUID(groupuuid)
        if (group.state != 'finish')
            return sendErrMsg(res, "这个团还没达到人数,或者已经生成订单", 501)

        let act = await findByPrimaryUUID(group.activityuuid)
        let good = await findByPrimary(act.gooduuid)
        if (good.state != 'onsale' || good.delete == 1)
            return sendErrMsg(res, "商品已经下架", 502)

        let obj: any = {}
        obj.groupuuid = groupuuid
        obj.state = 'fulfill'
        obj.created = group.created
        obj.goodtitle = good.title
        obj.activityuuid = act.uuid

        let join = await findUserByGroupUUID(groupuuid)
        const rand = Math.random()
        let index = undefined
        if (rand < act.freeprobability) {//有人要免单了
            index = Math.floor(Math.random() * join.length)
        }

        let users: any = []
        for (let i = 0; i < join.length; i++) {
            if (i > 0)  //退回多余的钱
                await recharge(join[i].useruuid, (join[i].bid - join[0].bid) * 100)

            if (i == index) //给这个人免单
                await recharge(join[i].useruuid, join[i].bid * 100)

            let addr = await findByUuid(join[i].addressuuid)
            let obj = Object.assign(good, { property: join[i].property })
            let ord = {
                useruuid: join[i].useruuid,
                goods: [obj],
                total_fee: join[0].bid * 100,
                real_fee: join[0].bid * 100,
                fee_info: "以团内最低出价为成交价，多付部分退回钱包",
                address: addr,
                state: 'wait-send',
                fee_type: 'wxpay'   //这里就写微信支付吧，没关系
            }
            let order = await insertOrder(ord)
            users.push({ useruuid: join[i].useruuid, orderuuid: order.uuid, bid: join[i].bid, refund: join[i].bid - join[0].bid })
        }
        obj.users = users
        obj.turnover = join[0].bid
        group.state = 'fulfill'
        await updateGroup(group.uuid, group)    //更新团的状态为fulfill

        await insertEvaluateLog(obj)   //插入日志记录

        return sendOK(res, { msg: "已经生成订单" })
    } catch (e) {
        return sendErrMsg(res, e, 500)
    }
}) */
//兑现一个团，也就是,1.给团成员生成订单，2.退回多余的钱，3.按规则免单
function fulfillGroup(groupuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let group = yield evaluategroup_1.findByGroupUUID(groupuuid);
            let act = yield evaluateactivity_1.findByPrimaryUUID(group.activityuuid);
            let good = yield goods_1.findByPrimary(act.gooduuid);
            let obj = {};
            obj.groupuuid = groupuuid;
            obj.state = 'fulfill';
            obj.created = group.created;
            obj.goodtitle = good.title;
            obj.activityuuid = act.uuid;
            let join = yield evaluatejoin_1.findUserByGroupUUID(groupuuid);
            const rand = Math.random();
            let index = undefined;
            if (rand < act.freeprobability) { //有人要免单了
                index = Math.floor(Math.random() * join.length);
            }
            let users = [];
            for (let i = 0; i < join.length; i++) {
                if (i > 0) //退回多余的钱
                    yield users_ext_1.recharge(join[i].useruuid, (join[i].bid - join[0].bid) * 100);
                if (i == index) //给这个人免单
                    yield users_ext_1.recharge(join[i].useruuid, join[i].bid * 100);
                let addr = yield address_1.findByUuid(join[i].addressuuid);
                let obj = Object.assign(good, { property: join[i].property });
                let ord = {
                    useruuid: join[i].useruuid,
                    goods: [obj],
                    total_fee: join[0].bid * 100,
                    real_fee: join[0].bid * 100,
                    fee_info: "以团内最低出价为成交价，多付部分退回钱包",
                    address: addr,
                    state: 'wait-send',
                    fee_type: 'wxpay' //这里就写微信支付吧，没关系
                };
                let order = yield orders_1.insertOrder(ord);
                users.push({ useruuid: join[i].useruuid, orderuuid: order.uuid, bid: join[i].bid, refund: join[i].bid - join[0].bid });
            }
            obj.users = users;
            obj.turnover = join[0].bid;
            group.state = 'fulfill';
            yield evaluategroup_1.updateGroup(group.uuid, group); //更新团的状态为fulfill
            yield evaluatelog_1.insertEvaluateLog(obj); //插入日志记录
            return '生成订单成功';
        }
        catch (e) {
            return e;
        }
    });
}
exports.fulfillGroup = fulfillGroup;
//重启一个活动
exports.router.post("/restart", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { uuid, starttime, endtime } = req.body;
        validator_1.validateCgi({ uuid, starttime, endtime }, validator_2.evaluateValidator.restart);
        try {
            const info = req.loginInfo;
            if (!info.isAdvertiserRW() && !info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            yield evaluateactivity_1.updateEvaluateActivityUUID(req.app.locals.sequelize, uuid, starttime, endtime);
            return response_1.sendOK(res, { msg: "重启成功，克隆了一个活动，旧活动保留" });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
/*
router.put("/cancel", checkLogin, async function (req: Request, res: Response, next: NextFunction) {
    let { groupuuid } = (req as any).body
    validateCgi({ groupuuid }, evaluateValidator.fulfill)

    try {
        const info: LoginInfo = (req as any).loginInfo
        if (!info.isAdvertiserRW() && !info.isAdminRW() && !info.isRoot())
            return sendNoPerm(res)

        let nowtime = timestamps()
        let group = await findByGroupUUID(groupuuid)
        let act = await findByPrimaryUUID(group.activityuuid)
        let good = await findByPrimary(act.gooduuid)
        if (nowtime < act.endtime && act.state == '')
            return sendErrMsg(res, "活动还在进行，不能取消团", 501)

        if (group.state == 'cancelled')
            return sendErrMsg(res, "团已经取消，不能重复操作", 502)

        let obj: any = {}
        obj.groupuuid = groupuuid
        obj.goodtitle = good.title
        obj.created = group.created
        obj.state = 'cancelled'
        obj.activityuuid = act.uuid

        let users: any = []
        let join = await findUserByGroupUUID(groupuuid)
        for (let i = 0; i < join.length; i++) { //退回到零钱
            await recharge(join[i].useruuid, join[i].bid * 100)
            users.push({ useruuid: join[i].useruuid, bid: join[i].bid })
        }
        obj.users = users
        group.state = 'cancelled'
        await updateGroup(group.uuid, group)    //更新团的状态为cancelled

        await insertEvaluateLog(obj)   //插入日志记录

        return sendOK(res, { msg: "团取消，钱退回到用户零钱" })
    } catch (e) {
        return sendErrMsg(res, e, 500)
    }
}) */
//人数不足，取消团
function cancelGroup(groupuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let group = yield evaluategroup_1.findByGroupUUID(groupuuid);
            let act = yield evaluateactivity_1.findByPrimaryUUID(group.activityuuid);
            let good = yield goods_1.findByPrimary(act.gooduuid);
            let obj = {};
            obj.groupuuid = groupuuid;
            obj.goodtitle = good.title;
            obj.created = group.created;
            obj.state = 'cancelled';
            obj.activityuuid = act.uuid;
            let users = [];
            let join = yield evaluatejoin_1.findUserByGroupUUID(groupuuid);
            for (let i = 0; i < join.length; i++) { //退回到零钱
                yield users_ext_1.recharge(join[i].useruuid, join[i].bid * 100);
                users.push({ useruuid: join[i].useruuid, bid: join[i].bid });
            }
            obj.users = users;
            group.state = 'cancelled';
            yield evaluategroup_1.updateGroup(group.uuid, group); //更新团的状态为cancelled
            yield evaluatelog_1.insertEvaluateLog(obj); //插入日志记录
            return "团取消，钱退回到用户零钱";
        }
        catch (e) {
            return e;
        }
    });
}
exports.cancelGroup = cancelGroup;
//查看组团历史记录
exports.router.get('/his', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { activityuuid, state, start, length } = req.query;
        validator_1.validateCgi({ activityuuid, state, start, length }, validator_2.evaluateValidator.his);
        try {
            const info = req.loginInfo;
            if (!info.isAdvertiserRW() && !info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            let groups = yield evaluatelog_1.findByState(activityuuid, state, start, length);
            let recordsFiltered = yield evaluatelog_1.getCountByStateAndActUUID(state, activityuuid);
            for (let i = 0; i < groups.length; i++) {
                let users = groups[i].users;
                for (let j = 0; j < users.length; j++) {
                    let someOne = yield users_1.findByPrimary(users[j].useruuid);
                    groups[i].users[j] = Object.assign({ userInfo: someOne }, groups[i].users[j]);
                }
            }
            return response_1.sendOK(res, { groups, recordsFiltered });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//# sourceMappingURL=evaluate.js.map