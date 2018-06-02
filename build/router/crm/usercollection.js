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
const logindao_1 = require("../../redis/logindao");
exports.router = express_1.Router();
const response_1 = require("../../lib/response");
const collectioncreate_1 = require("../../model/mall/collectioncreate");
const orders_1 = require("../../model/orders/orders");
const usercoupon_1 = require("../../model/users/usercoupon");
const users_ext_1 = require("../../model/users/users_ext");
const lotterylog_1 = require("../../model/users/lotterylog");
const amountmonitor_1 = require("../../lib/amountmonitor");
const amountlog_1 = require("../../model/users/amountlog");
const goods_1 = require("../../model/mall/goods");
const global_1 = require("../../lib/global");
const moment = require("moment");
const validator_1 = require("../../lib/validator");
const validator_2 = require("./validator");
//创建活动
const usercollection_1 = require("../../model/mall/usercollection");
const goods_2 = require("../../model/mall/goods");
// 用户参加活动
exports.router.post('/useractivity', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { Activityuuid } = req.body;
        validator_1.validateCgi({ Activityuuid: Activityuuid }, validator_2.collectionValidator.UUID);
        try {
            const info = req.loginInfo;
            let Useruuid = info.getUuid();
            let CollectionState = 0;
            // if (!info.isAdminRW() && !info.isRoot())
            //     return sendNoPerm(res)
            let tmp = {
                Activityuuid: Activityuuid,
                Useruuid: Useruuid,
                CollectionState: CollectionState
            };
            //查询该活动用户是否已经参加过
            let selectUserCollections = yield usercollection_1.selectUserCollection(tmp);
            if (selectUserCollections && selectUserCollections.CardAmount !== 0) {
                let ac_ext = yield usercollection_1.find_UserInfo_Activity(Activityuuid, Useruuid);
                let resState = { "CollectionState": "false", ac_ext };
                return response_1.sendOK(res, resState);
            }
            else if (!selectUserCollections) {
                yield usercollection_1.addUserCollection(tmp);
                let resw = yield usercollection_1.find_Info_Activity(Activityuuid);
                let resState = { "CollectionState": "true", resw };
                return response_1.sendOK(res, resState);
            }
            else if (selectUserCollections && selectUserCollections.CardAmount === 0) {
                let resw = yield usercollection_1.find_Info_Activity(Activityuuid);
                let resState = { "CollectionState": "true", resw };
                return response_1.sendOK(res, resState);
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//收集卡牌
exports.router.post('/userjoinactivity', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { Activityuuid } = req.body;
        validator_1.validateCgi({ Activityuuid: Activityuuid }, validator_2.collectionValidator.UUID);
        try {
            const info = req.loginInfo;
            // if (!info.isAppUser())
            //     return sendNoPerm(res)
            let Useruuid = info.getUuid();
            let tmp = {
                Activityuuid: Activityuuid,
                Useruuid: Useruuid //用户uuid
            };
            //判断该用户是否已经收集过该活动的卡牌
            let selectUserCollections = yield usercollection_1.selectUserCollection(tmp);
            let CollectionStates = 1;
            if (selectUserCollections.ChipIdAmounts) {
                return response_1.sendOK(res, { "addUserCollections": "false" }); //返回已参加过
            }
            else {
                let tmp = {
                    Activityuuid: Activityuuid,
                    Useruuid: Useruuid,
                    CollectionState: CollectionStates
                };
                //给数据赋初始值
                let Collections = yield usercollection_1.UserCollectionCard(tmp);
                let addUserCollections = { "addUserCollections": "true", Collections };
                return response_1.sendOK(res, addUserCollections);
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//帮我收藏卡牌
exports.router.post('/helpothercollection', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //UserId是用户发出链接的用户id
        let { Activityuuid, UserId } = req.body;
        validator_1.validateCgi({ Activityuuid: Activityuuid, UserId: UserId }, validator_2.collectionValidator.UserId);
        try {
            const info = req.loginInfo;
            let Useruuid = info.getUuid();
            //查看该用户是否在该活动有帮别人收集过的记录
            let rs = yield global_1.getModel("mall.collectioncreate").findOne({ where: { uuid: Activityuuid } });
            let collectiondone = rs.collectiondone;
            let helpUser;
            if (collectiondone) {
                collectiondone.forEach((r) => {
                    if (r === Useruuid) {
                        helpUser = { "res": "done" };
                    }
                });
            }
            if (helpUser) {
                return response_1.sendOK(res, helpUser);
            }
            // if (!info.isAppUser())
            //     return sendNoPerm(res)
            let tmp = {
                Activityuuid: Activityuuid,
                Useruuid: Useruuid,
                UserId: UserId //该链接的对象
            };
            //判断该用户是否已经帮他收集过该活动的卡牌
            let selectUserCollectionCards = yield usercollection_1.selectUserCollectionCard(tmp);
            let isNoColletion = selectUserCollectionCards.CollectionGetUserId;
            let tmp2 = {
                Activityuuid: Activityuuid,
                Useruuid: Useruuid,
            };
            let selectUserCollections = yield usercollection_1.selectUserCollection(tmp2);
            if (!selectUserCollections) {
                yield usercollection_1.addUserCollection(tmp2);
            }
            let helpfalse;
            if (isNoColletion) {
                isNoColletion.forEach((r) => {
                    if (r === Useruuid) {
                        helpfalse = { "res": "false" };
                    }
                });
            }
            if (helpfalse) {
                return response_1.sendOK(res, helpfalse);
            }
            let tmp1 = {
                Activityuuid: Activityuuid,
                Useruuid: Useruuid,
                UserId: UserId //该链接的对象
            };
            let rss = yield global_1.getModel("mall.usercollection").findOne({ where: { Activityuuid, Useruuid: UserId } });
            if (rs.State === 2) {
                return response_1.sendNotFound(res, "活动已经结束，停止收集");
            }
            if (rss.CollectionState === 2 || rss.CollectionState === 3) {
                return response_1.sendNotFound(res, "该用户已收集完成，停止帮他收集");
            }
            //给卡牌数据赋值
            let Collections = yield usercollection_1.UserCollectionCardHelp(tmp);
            //录入该活动帮忙的用户
            yield usercollection_1.insertUserCollection(Activityuuid, Useruuid);
            //给碎片数据赋值
            let Collections2 = yield usercollection_1.UserCollectionchipHelp(tmp1);
            let join = { "res": "true", Collections, Collections2 };
            return response_1.sendOK(res, join);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//APP活动详情展示
exports.router.get('/activityInfo/:Activityuuid', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let Activityuuid = req.params["Activityuuid"];
            validator_1.validateCgi({ Activityuuid: Activityuuid }, validator_2.collectionValidator.UUID);
            let ac_ext = yield usercollection_1.find_Info_Activity(Activityuuid);
            return response_1.sendOK(res, ac_ext); //返回ac_ext的信息
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//APP用户活动详情展示
exports.router.get('/activityUserInfo/:Activityuuid/:Useruuid', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let Activityuuid = req.params["Activityuuid"];
            let Useruuid = req.params["Useruuid"];
            validator_1.validateCgi({ Activityuuid: Activityuuid, Useruuid: Useruuid }, validator_2.collectionValidator.lofo);
            let ac_ext = yield usercollection_1.find_UserInfo_Activity(Activityuuid, Useruuid);
            return response_1.sendOK(res, ac_ext); //返回ac_ext的信息
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//收集道具活动查看所有的活动管理功能
exports.router.get('/selectAll', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let ac_ext = yield collectioncreate_1.find_All_Activity();
            return response_1.sendOK(res, ac_ext); //返回ac_ext的信息
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//查看用户出生年份
exports.router.get('/userbirthday/:Activityuuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let Activityuuid = req.params["Activityuuid"];
            // validateCgi({ Activityuuid: Activityuuid }, collectionValidator.UUID)
            const info = req.loginInfo;
            let uuid = info.getUuid();
            let fortuneuuid = "99e892f2-24b8-467c-bc68-c710a8b95206";
            validator_1.validateCgi({ uuid: uuid }, validator_2.advertiserValidator.UUID);
            let answer = yield usercollection_1.findisNoFor(Activityuuid);
            let birthday = yield usercollection_1.findUserBirthday(uuid);
            let fortuneall = yield usercollection_1.findfortune(fortuneuuid);
            let fortune = fortuneall.fortune;
            let emolument = fortuneall.emolument;
            let longevity = fortuneall.longevity;
            let property = fortuneall.property;
            let happiness = fortuneall.happiness;
            let fortunejson = JSON.parse(fortune);
            let emolumentjson = JSON.parse(emolument);
            let longevityjson = JSON.parse(longevity);
            let propertyjson = JSON.parse(property);
            let happinessjson = JSON.parse(happiness);
            let isNoFortune;
            if (answer === 1) {
                return response_1.sendOK(res, { birthday, "answer": "true", fortune: fortunejson, emolument: emolumentjson, longevity: longevityjson, property: propertyjson, happiness: happinessjson });
            }
            else {
                isNoFortune === 0;
            }
            {
                return response_1.sendOK(res, { birthday, "answer": "false", fortune: fortunejson, emolument: emolumentjson, longevity: longevityjson, property: propertyjson, happiness: happinessjson });
            }
            //返回年份及活动信息的信息
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//领取奖励
exports.router.post('/getreward', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let { Activityuuid, address } = req.body;
            const info = req.loginInfo;
            let uuid = info.getUuid();
            let stateaward = yield usercollection_1.find_UserInfo_Activity(Activityuuid, uuid);
            let colstate = stateaward.res;
            let CollectionState = colstate.CollectionState;
            //判断收集状态
            if (CollectionState !== 2) {
                response_1.sendOK(res, { "reward": "false" });
            }
            else if (CollectionState === 2) {
                let selectCollections = yield usercollection_1.find_Info_Activity(Activityuuid);
                let rewardmethod = selectCollections.rewardmethod;
                let Couponid = selectCollections.Couponid;
                let Gooduuid = selectCollections.Gooduuid;
                let RedPacket = selectCollections.RedPacket;
                let point = selectCollections.Point;
                let rewardNumber = selectCollections.rewardNumber;
                let rewardDoneNumber = selectCollections.rewardDone;
                if (rewardDoneNumber >= rewardNumber) {
                    return response_1.sendOK(res, { "reward": "done" });
                }
                let rewardDone = rewardDoneNumber++;
                yield usercollection_1.insertrewardDone(Activityuuid, rewardDone);
                // validateCgi({ Activityuuid: Activityuuid, Useruuid: Useruuid }, collectionValidator.lofo)
                let ac_ext = yield usercollection_1.find_UserInfo_Activity(Activityuuid, uuid);
                let act = yield usercollection_1.find_Info_Activity(Activityuuid);
                let CardAmount = ac_ext.res;
                let cardcard = CardAmount.CardIdAmounts;
                let amount = act.CardIdAmounts;
                let pointTotal = 0;
                //累计获取的积分
                for (let i = 1; i < amount + 1; i++) {
                    let card = "card" + i;
                    pointTotal += ((cardcard[card]) - 1) * point;
                }
                let pointtitle = point + "积分";
                let redpacktitle = RedPacket + "元";
                let created = new Date;
                //积分详情
                let awardpointinfo = {
                    "uuid": uuid,
                    "prize": { "balance": point }, "state": "balance", "title": pointtitle,
                    "created": created, "modified": created
                };
                //红包详情
                let awardredpacketinfo = {
                    "uuid": uuid,
                    "prize": { "balance": point }, "state": "balance", "title": redpacktitle,
                    "created": created, "modified": created
                };
                //添加积分
                yield users_ext_1.updatePoints(uuid, { points: pointTotal, balance: 0, exp: 0 }); //增加积分
                let obj = {
                    useruuid: uuid,
                    points: pointTotal,
                    mode: "collection",
                    time: moment().format('YYYY-MM-DD HH:mm:ss')
                };
                yield amountlog_1.insertAmountLog(obj);
                //积分记录
                yield lotterylog_1.insertLotterylog({ useruuid: uuid, prizeinfo: awardpointinfo, point: parseInt(pointTotal), balance: 0 });
                // if (RedPacket === 0 && !Couponid) {
                if (rewardmethod === 1) {
                    let goods = yield goods_2.findByPrimary(Gooduuid);
                    let goodpoints = { "goodpoint": goods.points };
                    let goodprices = { "goodprice": goods.price };
                    let gooduuids = { "gooduuid": goods.uuid };
                    let number = { "number": 1 };
                    let businessGoods = Object.assign({}, goods, goodpoints, goodprices, gooduuids, number);
                    // let number = 1
                    let obj = {
                        useruuid: uuid,
                        goods: [businessGoods],
                        total_fee: 0,
                        real_fee: 0,
                        fee_info: {},
                        address: address,
                        message: "",
                        goodpoint: 0,
                        postage: 0,
                        businessmen: businessGoods.businessmen,
                        // businessmen: "官方活动",
                        prize: 'true',
                        state: 'wait-send'
                    };
                    // 判断商品是否已下线
                    let goodsOnline = yield goods_1.findByStateVir(Gooduuid);
                    if (!goodsOnline)
                        return response_1.sendNotFound(res, businessGoods.title + "已删除或已下架");
                    let orders = yield orders_1.insertOrder(obj);
                    orders.total_fee = orders.total_fee / 100;
                    orders.real_fee = orders.real_fee / 100;
                    let rewardtimestamp = new Date().getTime();
                    let timestamp4 = new Date(rewardtimestamp);
                    yield usercollection_1.getreward(uuid, Activityuuid, timestamp4); //将奖品设置为已领取
                    return response_1.sendOK(res, { "reward": "true" });
                    //获取优惠券
                    // } else if (!Gooduuid && RedPacket === 0) {
                }
                else if (rewardmethod === 2) {
                    yield usercoupon_1.insertusercoupon(req.app.locals.sequelize, uuid, Couponid); //发放优惠券到用户
                    let rewardtimestamp = new Date().getTime();
                    let timestamp4 = new Date(rewardtimestamp);
                    yield usercollection_1.getreward(uuid, Activityuuid, timestamp4); //将奖品设置为已领取
                    return response_1.sendOK(res, { "reward": "true" });
                    //获取红包
                    // } else if (!Gooduuid && !Couponid) {
                }
                else if (rewardmethod === 0) {
                    yield users_ext_1.updatePoints(uuid, { points: 0, balance: parseFloat(RedPacket) * 100, exp: 0 }); //增加积分
                    yield lotterylog_1.insertLotterylog({ useruuid: uuid, prizeinfo: awardredpacketinfo, point: 0, balance: parseFloat(RedPacket) * 100 });
                    yield amountmonitor_1.amountcheck(req.app.locals.sequelize, uuid, "collection", parseFloat(RedPacket), 0);
                    let rewardtimestamp = new Date().getTime();
                    let timestamp4 = new Date(rewardtimestamp);
                    yield usercollection_1.getreward(uuid, Activityuuid, timestamp4); //将奖品设置为已领取
                    return response_1.sendOK(res, { "reward": "true" });
                }
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//查看活动crm记录
exports.router.get('/getrewardinfo/:Activityuuid', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let Activityuuid = req.params["Activityuuid"];
            // let Activityuuid = req.params["Activityuuid"];
            let { start, length, State } = req.query;
            let CollectionState = State;
            let recordsFiltered;
            let userreward;
            if (State) {
                let obj1 = {};
                obj1 = {
                    $and: [
                        { CollectionState: CollectionState },
                        { Activityuuid }
                    ]
                };
                userreward = yield usercollection_1.findColInfo1(obj1, parseInt(start), parseInt(length));
                let recordsFiltereds = yield usercollection_1.getCount1(Activityuuid, CollectionState);
                recordsFiltered = recordsFiltereds.length;
            }
            else {
                let obj = {};
                obj = {
                    $or: [
                        { Activityuuid }
                    ]
                };
                userreward = yield usercollection_1.findColInfo1(obj, parseInt(start), parseInt(length));
                let recordsFiltereds = yield usercollection_1.find_UserInfoLog(Activityuuid);
                recordsFiltered = recordsFiltereds.length;
            }
            let activity = yield usercollection_1.find_Info_Activity(Activityuuid);
            let userlog = [];
            if (userreward.length !== 0) {
                for (let i = 0; i < userreward.length; i++) {
                    let userinfo;
                    let rewardinfo = userreward[i];
                    let Useruuid = rewardinfo.Useruuid;
                    let User = yield usercollection_1.find_User(Useruuid);
                    let username = User.username;
                    let createtime = User.created.getTime();
                    let jointime = userreward[i].createTime.getTime();
                    let CollectionState = rewardinfo.CollectionState;
                    let CardIdAmounts = rewardinfo.CardIdAmounts;
                    let Filename = activity.Filename;
                    let rewardtimestamp;
                    if (CollectionState == 3) {
                        rewardtimestamp = (rewardinfo.rewardtimestamp).getTime();
                    }
                    userinfo = { CollectionState, username, Useruuid, createtime, Filename, CardIdAmounts, rewardtimestamp, jointime };
                    userlog.push(userinfo);
                }
                return response_1.sendOK(res, { userlog, recordsFiltered: recordsFiltered });
            }
            else {
                return response_1.sendOK(res, { userlog, recordsFiltered: userreward.length });
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/getuserinfo/:Activityuuid/:useruuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { start, length } = req.query;
        let Activityuuid = req.params["Activityuuid"];
        let Useruuid = req.params["useruuid"];
        let userinfo = yield usercollection_1.find_UserInfo_Activity(Activityuuid, Useruuid);
        let UserCollection = userinfo.UserCollection;
        let Start = parseInt(start);
        let Length = parseInt(length);
        let userCollection = [];
        if (UserCollection) {
            if (UserCollection.length < (Start + Length)) {
                for (let i = Start; i < UserCollection.length; i++) {
                    userCollection.push(UserCollection[i]);
                }
            }
            else {
                for (let i = Start; i < Start + Length; i++) {
                    userCollection.push(UserCollection[i]);
                }
            }
            return response_1.sendOK(res, { userCollection, recordsFiltered: UserCollection.length });
        }
        else {
            return response_1.sendOK(res, { userCollection, recordsFiltered: 0 });
        }
    });
});
//# sourceMappingURL=usercollection.js.map