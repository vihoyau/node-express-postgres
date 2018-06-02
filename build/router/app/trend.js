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
const validator_2 = require("./validator");
const express_1 = require("express");
const upload_1 = require("../../lib/upload");
const resource_1 = require("../../config/resource");
const response_1 = require("../../lib/response");
const logindao_1 = require("../../redis/logindao");
const history_1 = require("../../redis/history");
const amountmonitor_1 = require("../../lib/amountmonitor");
const amountlog_1 = require("../../model/users/amountlog");
const utils_1 = require("../../lib/utils");
const fs_1 = require("../../lib/fs");
const message_1 = require("../../model/users/message");
const child_process = require("child_process");
const trend_1 = require("../../model/trend/trend");
const reflect_1 = require("../../model/trend/reflect");
const reward_1 = require("../../model/users/reward");
const trendcomment_1 = require("../../model/trend/trendcomment");
const users_ext_1 = require("../../model/users/users_ext");
const winston_1 = require("../../config/winston");
const users_1 = require("../../model/users/users");
const adslog_1 = require("../../model/ads/adslog");
const applaud_1 = require("../../model/ads/applaud");
const shielded_1 = require("../../model/trend/shielded");
const path = require("path");
const winston = require("winston");
exports.router = express_1.Router();
function array_remove_repeat(a) {
    return __awaiter(this, void 0, void 0, function* () {
        let r = [];
        for (let i = 0; i < a.length; i++) {
            let flag = true;
            let temp = a[i];
            for (let j = 0; j < r.length; j++) {
                if (temp === r[j]) {
                    flag = false;
                    break;
                }
            }
            if (flag) {
                r.push(temp);
            }
        }
        return r;
    });
}
function array_union(a, b) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield array_remove_repeat(a.concat(b));
    });
}
function array_intersection(a, b) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = [];
        for (let i = 0; i < b.length; i++) {
            let temp = b[i];
            for (let j = 0; j < a.length; j++) {
                if (temp === a[j]) {
                    result.push(temp);
                    break;
                }
            }
        }
        return yield array_remove_repeat(result);
    });
}
//随机红包
function randAlloc(total, min, max, length) {
    // 首先要判断是否符合 min 和 max 条件
    if (min * length > total || max * length < total) {
        throw Error(`没法满足最最少 ${min} 最大 ${max} 的条件`);
    }
    const result = [];
    let restValue = total;
    let restLength = length;
    for (let i = 0; i < length - 1; i++) {
        restLength--;
        // 这一次要发的数量必须保证剩下的要足最小量
        // 同进要保证剩下的不能大于需要的最大量
        const restMin = restLength * min;
        const restMax = restLength * max;
        // 可发的量
        const usable = restValue - restMin;
        // 最少要发的量
        const minValue = Math.max(min, restValue - restMax);
        // 以 minValue 为最左，max 为中线来进行随机，即随机范围是 (max - minValue) * 2
        // 如果这个范围大于 usable - minValue，取 usable - minValue
        const limit = Math.min(usable - minValue, (max - minValue) * 2);
        // 随机部分加上最少要发的部分就是应该发的，但是如果大于 max，最大取到 max
        result[i] = Math.min(max, minValue + Math.floor(limit * Math.random()));
        restValue -= result[i];
    }
    result[length - 1] = restValue;
    return result;
}
//预先添加一个动态
exports.router.post('/add', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { useruuid } = req.headers.uuid;
        try {
            let obj = { useruuid, content: "" };
            let t = yield trend_1.insertTrend(obj);
            return response_1.sendOK(res, t);
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//删除动态
exports.router.delete('/:uuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let uuid = req.params['uuid'];
        try {
            let mediaName;
            let trend = yield trend_1.findByTrendUUID(uuid);
            if (trend.pics && trend.pics.length > 0) { //删除图片
                for (let i = 0; i < trend.pics.length; i++) {
                    mediaName = path.join(resource_1.trendImgOpt.targetDir, trend.pics[i]);
                    yield fs_1.removeAsync(mediaName);
                }
            }
            if (trend.mov) { //删除视频
                mediaName = path.join(resource_1.trendImgOpt.targetDir, trend.mov);
                yield fs_1.removeAsync(mediaName);
                yield fs_1.removeAsync(trend.preview);
            }
            yield trend_1.deleteTrend(uuid);
            return response_1.sendOK(res, { msg: "删除成功" });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//上传动态图片
exports.router.post('/:uuid/uploadPic', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let uuid = req.params['uuid'];
        try {
            let newPath = yield upload_1.uploadAdsImage(req, {
                uuid: uuid,
                glob: resource_1.trendImgOpt.glob,
                tmpDir: resource_1.trendImgOpt.tmpDir,
                maxSize: resource_1.trendImgOpt.maxSize,
                extnames: resource_1.trendImgOpt.extnames,
                maxFiles: resource_1.trendImgOpt.maxFiles,
                targetDir: resource_1.trendImgOpt.targetDir,
                fieldName: resource_1.trendImgOpt.fieldName,
            });
            return response_1.createdOk(res, { path: newPath });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//删除动态图片
exports.router.delete('/:trenduuid/image', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { mediaName } = req.query;
        //let trenduuid = req.params["trenduuid"]
        try {
            mediaName = path.join(resource_1.trendImgOpt.targetDir, /* trenduuid, */ mediaName);
            yield fs_1.removeAsync(mediaName);
            return response_1.sendOK(res, { msg: "succ" });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//编辑提交动态
exports.router.put('/update', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { uuid, content, pics, question_ext, answer_mold, mold, reward } = req.body;
        validator_1.validateCgi({ uuid, /* content, */ mold }, validator_2.trendValidator.newTrend);
        let useruuid = req.headers.uuid;
        try {
            /*  let trend = await findByTrendUUID(uuid)
             if (trend.content != '')
                 return sendErrMsg(res, "已经发布", 500) */
            switch (mold) {
                case 'default': {
                    yield trend_1.updateTrend(uuid, { useruuid, content, pics, mold, state: 'on' });
                    break;
                }
                case 'redpaper': {
                    validator_1.validateCgi({
                        mold: answer_mold.mold, type: answer_mold.type,
                        amount: answer_mold.amount, total: answer_mold.total
                    }, validator_2.trendValidator.answer_mold);
                    let user_ext = yield users_ext_1.findByPrimary(useruuid);
                    if (answer_mold.mold == 'point') {
                        if (answer_mold.type == 'random') {
                            if (user_ext.points < answer_mold.total)
                                return response_1.sendErrMsg(res, "积分不足", 500);
                            yield users_ext_1.exchange(useruuid, { points: answer_mold.total, balance: 0 });
                        }
                        else { //定额积分，total意义是每人积分
                            if (user_ext.points < (answer_mold.total * answer_mold.amount))
                                return response_1.sendErrMsg(res, "积分不足", 500);
                            yield users_ext_1.exchange(useruuid, { points: answer_mold.total * answer_mold.amount, balance: 0 });
                        }
                    }
                    else {
                        if (user_ext.balance < answer_mold.total * 100)
                            return response_1.sendErrMsg(res, "零钱不足", 500);
                        yield users_ext_1.exchange(useruuid, { points: 0, balance: answer_mold.total * 100 }); //数据库的零钱，单位是分
                    }
                    let random;
                    if (answer_mold.type == 'random') //产生随机红包
                        random = randAlloc(answer_mold.total, 1, 2 * (answer_mold.total / answer_mold.amount), answer_mold.amount);
                    yield trend_1.updateTrend(uuid, { useruuid, content, pics, mold, answer_mold, question_ext, random, state: 'on' });
                    break;
                }
                case 'reward': {
                    yield trend_1.updateTrend(uuid, { useruuid, content, pics, mold, reward, state: 'on' });
                    break;
                }
                default: return response_1.sendErrMsg(res, "mold异常", 500);
            }
            return response_1.sendOK(res, { msg: "succ" });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//动态搜索关键字
exports.router.get('/keyword', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { page, count, keyword } = req.query;
        validator_1.validateCgi({ page, count }, validator_2.trendValidator.getAll);
        let useruuid = req.headers.uuid;
        try {
            let arr = [];
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let trends = yield trend_1.findAllTrendByKeyWord(req.app.locals.sequelize, cursor, limit, keyword);
            for (let i = 0; i < trends.length; i++) {
                let applaud = 0;
                if (useruuid)
                    applaud = yield applaud_1.findByUseruuidAndAdsuuid(trends[i].uuid, useruuid);
                trends[i].modified = winston_1.timestamps(trends[i].modified);
                trends[i].created = winston_1.timestamps(trends[i].created);
                trends[i].username = utils_1.changeUsername(trends[i].username);
                arr.push({ trend: trends[i], applaud: applaud ? 1 : 0 });
            }
            return response_1.sendOK(res, arr);
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//查看自己屏蔽的人
exports.router.get('/shield', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { useruuid, page, count } = req.query;
        let { cursor, limit } = utils_1.getPageCount(page, count);
        let s = yield shielded_1.findAllByUserUUID(req.app.locals.sequelize, useruuid, cursor, limit);
        s.forEach(r => {
            r.created = winston_1.timestamps(r.created);
        });
        return response_1.sendOK(res, s);
    });
});
//屏蔽某人的动态
exports.router.post('/shield', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { useruuid, shielduuid } = req.body;
        let ress = yield shielded_1.insertShielded({ useruuid, shielduuid });
        if (ress)
            return response_1.sendOK(res, { msg: "屏蔽成功" });
        return response_1.sendErrMsg(res, "屏蔽失败", 500);
    });
});
//移除屏蔽
exports.router.put('/shield', /* checkAppLogin, */ function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { useruuid, shielduuid } = req.body;
        let r = yield shielded_1.deleteShielded(useruuid, shielduuid);
        if (r)
            return response_1.sendOK(res, { msg: "移除成功" });
        return response_1.sendErrMsg(res, "移除失败", 500);
    });
});
//查看动态列表
exports.router.get('/list', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { page, count } = req.query;
        validator_1.validateCgi({ page, count }, validator_2.trendValidator.getAll);
        let useruuid = req.headers.uuid;
        try {
            let arr = [];
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let trends;
            if (useruuid) {
                let shield = yield shielded_1.findShielduuidByUserUUID(req.app.locals.sequelize, useruuid);
                trends = yield trend_1.findAllTrend(req.app.locals.sequelize, 'on', cursor, limit, shield && shield.length > 0 ? shield : undefined);
            }
            else {
                trends = yield trend_1.findAllTrend(req.app.locals.sequelize, 'on', cursor, limit, undefined);
            }
            for (let i = 0; i < trends.length; i++) {
                let applaud = 0;
                if (useruuid)
                    applaud = yield applaud_1.findByUseruuidAndAdsuuid(trends[i].uuid, useruuid);
                trends[i].modified = winston_1.timestamps(trends[i].modified);
                trends[i].created = winston_1.timestamps(trends[i].created);
                trends[i].username = utils_1.changeUsername(trends[i].username);
                arr.push({ trend: trends[i], applaud: applaud ? 1 : 0 });
            }
            return response_1.sendOK(res, arr);
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//查看某个动态的详情
exports.router.get('/detail', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { trenduuid } = req.query;
        let useruuid = req.headers.uuid;
        try {
            validator_1.validateCgi({ uuid: trenduuid }, validator_2.trendValidator.uuid);
            let trend = yield trend_1.findByTrendUUID(trenduuid);
            let user = yield users_1.findByPrimary(trend.useruuid);
            let answered = 0; //答题标记
            let applaud = null; //点赞标记
            let own = false; //是不是自己的动态
            if (useruuid) {
                //获取答题记录
                let adslog = yield adslog_1.getByTwoUuid(trenduuid, useruuid);
                if (adslog && adslog.state)
                    answered = 1;
                if (!adslog) {
                    let adlog = {
                        aduuid: trenduuid,
                        useruuid: user.uuid,
                        username: user.username,
                        openid: user.openid
                    };
                    yield adslog_1.insertAdslog(adlog);
                }
                let laud = yield applaud_1.findByUseruuidAndAdsuuid(trenduuid, useruuid); //点赞记录
                if (laud) {
                    applaud = laud.state;
                }
                if (trend.useruuid == useruuid) {
                    own = true;
                }
            }
            trend.created = winston_1.timestamps(trend.created);
            trend.modified = winston_1.timestamps(trend.modified);
            let answerCount = 0;
            if (trend.mold == 'redpaper')
                answerCount = yield adslog_1.getCountByAdsUUID(trend.uuid);
            let obj = Object.assign(trend, { headurl: user.headurl, username: utils_1.changeUsername(user.username), nickname: user.nickname });
            return response_1.sendOK(res, { trend: obj, questionindex: 0, answer: answered, applaud, own, answerCount });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//答题
exports.router.post('/answer', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { answer, trenduuid } = req.body;
        try {
            const loginInfo = req.loginInfo;
            let opt = yield history_1.getAnswerAds(trenduuid);
            if (opt && opt === loginInfo.getUuid()) {
                return response_1.sendNotFound(res, "不能重复提交");
            }
            else {
                yield history_1.saveAnswerAds(trenduuid, loginInfo.getUuid());
            }
            let adslog = yield adslog_1.getByTwoUuid(trenduuid, loginInfo.getUuid());
            if (adslog && adslog.state)
                return response_1.sendNotFound(res, "不能重复答题");
            let points = 0;
            let rebalance = 0;
            let appUser = yield users_1.findByPrimary(loginInfo.getUuid());
            let trend = yield trend_1.findByTrendUUID(trenduuid);
            //*********************************************答题*********************************************** */
            let answerSet = Array.from(new Set(trend.question_ext.answers)); //真确答案
            let newAnswerSet = Array.from(new Set(answer)); //回答的答案
            let union = yield array_union(answerSet, newAnswerSet); //并集
            let intersectionSet = yield array_intersection(answerSet, newAnswerSet); //交集
            //*************************************************************************************************** */
            //全对用户加points广告totalpoints减广告points
            if (intersectionSet.length === answerSet.length && intersectionSet.length === newAnswerSet.length) {
                if (trend.answer_mold.type == 'quota') { //定额
                    switch (trend.answer_mold.mold) {
                        case "point":
                            points = trend.answer_mold.total; //定额积分红包的total意义是每人积分
                            rebalance = 0;
                            break;
                        case "balance":
                            points = 0;
                            rebalance = trend.answer_mold.total / trend.answer_mold.amount;
                            trend.answer_mold.total -= rebalance;
                            break;
                    }
                }
                else { //随机
                    switch (trend.answer_mold.mold) {
                        case 'point':
                            points = trend.random[0];
                            trend.random.splice[0];
                            rebalance = 0;
                            trend.answer_mold.total -= points;
                            break;
                        case 'balance':
                            points = 0;
                            rebalance = trend.random[0];
                            trend.random.splice[0];
                            trend.answer_mold.total -= rebalance;
                            break;
                    }
                }
                trend.answer_mold.amount--;
            }
            else if ((union.length - intersectionSet.length) == (answerSet.length - newAnswerSet.length) && newAnswerSet.length > 0) {
                if (trend.answer_mold.type == 'quota') { //定额
                    switch (trend.answer_mold.mold) {
                        case "point":
                            points = Math.floor(trend.answer_mold.total / 2);
                            rebalance = 0;
                            break;
                        case "balance":
                            points = 0;
                            rebalance = Math.floor(trend.answer_mold.total / (trend.answer_mold.amount * 2));
                            trend.answer_mold.total -= rebalance;
                            break;
                    }
                }
                else { //随机
                    switch (trend.answer_mold.mold) {
                        case "point":
                            points = trend.random[0];
                            trend.random.splice[0];
                            rebalance = 0;
                            trend.answer_mold.total -= points;
                            break;
                        case "balance":
                            points = 0;
                            rebalance = trend.random[0];
                            trend.random.splice[0];
                            trend.answer_mold.total -= rebalance;
                            break;
                    }
                }
                trend.answer_mold.amount--;
            }
            let upd = {
                answer_mold: trend.answer_mold,
                random: trend.random
            };
            let updateUser = {
                points: points,
                balance: rebalance * 100,
                exp: points
            };
            yield trend_1.updateTrend(trend.uuid, upd); //广告减积分和零钱
            yield users_ext_1.updatePoints(appUser.uuid, updateUser); //用户加积分零钱和经验
            //修改广告记录
            if (!adslog) { //不存在广告记录
                let newadslog = {
                    aduuid: trenduuid,
                    useruuid: loginInfo.getUuid(),
                    points: points,
                    balance: rebalance,
                    openid: appUser.openid,
                    answercount: 1,
                    state: 'fin'
                };
                yield adslog_1.insertAdslog(newadslog); //添加广告记录
            }
            else { //存在广告记录
                if (!adslog.points) { //如果积分不存在
                    adslog.points = points;
                }
                else { //积分存在
                    adslog.points = adslog.points + points;
                }
                if (adslog.answercount) { //答题数不存在
                    adslog.answercount = 1;
                }
                else { //答题数存在
                    adslog.answercount = adslog.answercount + 1;
                }
                if (adslog.balance) { //积分不存在
                    adslog.balance = rebalance;
                }
                else { //积分存在
                    adslog.balance = adslog.balance + rebalance;
                }
                let updateadslog = {
                    points: adslog.points,
                    balance: adslog.rebalance,
                    answercount: adslog.answercount,
                    state: 'fin'
                };
                yield adslog_1.updateAdslog(updateadslog, adslog.uuid); //修改答题记录
            }
            let reward = {
                useruuid: loginInfo.getUuid(),
                username: appUser.username,
                realname: appUser.realname,
                point: points,
                balance: rebalance,
                type: 'answer'
            };
            if (reward.point !== -1 || reward.balance !== -1) {
                yield reward_1.insertReward(reward);
                yield amountmonitor_1.amountcheck(req.app.locals.sequelize, loginInfo.getUuid(), "answer", rebalance, reward.point);
            }
            return response_1.createdOk(res, { answers: trend.question_ext.answers, points: points + '', balance: rebalance + '', trend: trend });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//评论动态
exports.router.post('/com', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { trenduuid, parent, content } = req.body;
        validator_1.validateCgi({ trenduuid, content }, validator_2.trendValidator.com);
        let useruuid = req.headers['uuid'];
        try {
            let obj = { trenduuid, parent, content, useruuid, reward: false, state: 'on' };
            if (!parent)
                delete obj.parent;
            yield trendcomment_1.insertComment(obj);
            yield trend_1.trendUpdateCom(trenduuid);
            return response_1.sendOK(res, { msg: "succ" });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//点赞动态
exports.router.post('/nice', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { trenduuid } = req.body;
        try {
            const loginInfo = req.loginInfo;
            let applaud = yield applaud_1.findByUseruuidAndAdsuuid(trenduuid, loginInfo.getUuid());
            if (applaud)
                return response_1.sendErrMsg(res, "不能重复点赞", 500);
            yield trend_1.trendUpdateNice(trenduuid);
            let r = yield applaud_1.insertApplaud(trenduuid, loginInfo.getUuid(), 'nice');
            if (r)
                return response_1.sendOK(res, { msg: "succ" });
            else
                return response_1.sendErrMsg(res, "点赞失败", 500);
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//取消点赞
exports.router.put('/cancel/:trenduuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const trenduuid = req.params["trenduuid"];
        try {
            const loginInfo = req.loginInfo;
            yield trend_1.trendCutNice(trenduuid); //减少好评
            let laud = yield applaud_1.findByUseruuidAndAdsuuid(trenduuid, loginInfo.getUuid()); //点赞记录
            yield applaud_1.deleteByAdsUuid(laud.uuid);
            return response_1.sendOK(res, { msg: "succ" });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//点赞评论，取消点赞评论
exports.router.post("/upcommentNum", logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let commentuuid = req.body.commentuuid;
        const loginInfo = req.loginInfo;
        try {
            validator_1.validateCgi({ commentUUID: commentuuid }, validator_2.trendValidator.commentuuid);
            let isexist = yield applaud_1.queryUphistory(loginInfo.getUuid(), commentuuid);
            let re = yield trendcomment_1.queryCommentNum(commentuuid);
            if (!isexist) {
                re = yield trendcomment_1.updateCommentNum(commentuuid, parseInt(re.getDataValue('upnum')) + 1);
                yield applaud_1.insertCommentApplaud(commentuuid, loginInfo.getUuid(), "nice");
                return response_1.sendOK(res, { "data": 'up' });
            }
            else {
                yield applaud_1.deleteByCommentUseruuid(loginInfo.getUuid(), commentuuid);
                re = yield trendcomment_1.updateCommentNum(commentuuid, parseInt(re.getDataValue('upnum')) - 1);
                return response_1.sendOK(res, { "data": 'down' });
            }
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//这个评论的回复数
exports.router.get('/:commentuuid/repliedCount', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let commentuuid = req.params['commentuuid'];
        try {
            validator_1.validateCgi({ commentUUID: commentuuid }, validator_2.trendValidator.commentuuid);
            let re = yield trendcomment_1.querycommentRepliedCount(req.app.locals.sequelize, commentuuid);
            let com1 = null;
            if (re[0].length > 0) { //如果有回复，就把第一条回复给前端
                com1 = yield trendcomment_1.findFirstComByParent(req.app.locals.sequelize, commentuuid);
            }
            return response_1.sendOK(res, { 'num': re[0], com1 });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//获得这个评论的全部子评论
exports.router.get('/:commentuuid/commentAllByuuid', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let commentuuid = req.params['commentuuid'];
        let useruuid = req.headers.uuid;
        let commentarr = [];
        try {
            validator_1.validateCgi({ commentUUID: commentuuid }, validator_2.trendValidator.commentuuid);
            let re = yield trendcomment_1.queryCommentByparentuuid(req.app.locals.sequelize, commentuuid);
            for (let i = 0; i < re.length; i++) {
                re[i].created = winston_1.timestamps(re[i].created);
                re[i].username = utils_1.changeUsername(re[i].username);
                let applaud = null;
                if (useruuid)
                    applaud = yield applaud_1.queryUphistory(useruuid, re[i].commentuuid);
                commentarr.push({ 'comment': re[i], applaud });
            }
            return response_1.sendOK(res, { 'data': commentarr });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//查看某个动态的全部评论
exports.router.get('/:trenduuid/commentAll', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let trenduuid = req.params['trenduuid'];
        let { page, count } = req.query;
        validator_1.validateCgi({ page, count }, validator_2.trendValidator.getTrend);
        let commentarr = [];
        let useruuid = req.headers.uuid;
        try {
            validator_1.validateCgi({ commentUUID: trenduuid }, validator_2.trendValidator.commentuuid);
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let re = yield trendcomment_1.queryCommentParent(req.app.locals.sequelize, trenduuid, cursor, limit);
            for (let i = 0; i < re.length; i++) {
                re[i].created = winston_1.timestamps(re[i].created);
                re[i].username = utils_1.changeUsername(re[i].username);
                let num = yield trendcomment_1.queryCommentParentDownNum(req.app.locals.sequelize, trenduuid, re[i].commentuuid);
                let applaud = null;
                if (useruuid)
                    applaud = yield applaud_1.queryUphistory(useruuid, re[i].commentuuid);
                commentarr.push({ commentParent: re[i], num, applaud });
            }
            return response_1.sendOK(res, commentarr);
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//举报评论&动态
exports.router.post('/reflect', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { commentuuid, trenduuid, reason } = req.body;
        const useruuid = req.headers.uuid;
        if (commentuuid)
            validator_1.validateCgi({ uuid: commentuuid }, validator_2.trendValidator.reflect);
        if (trenduuid)
            validator_1.validateCgi({ uuid: trenduuid }, validator_2.trendValidator.reflect);
        try {
            let obj = { state: "new", commentuuid, trenduuid, useruuid, reason };
            if (!obj.commentuuid && !obj.trenduuid)
                return response_1.sendErrMsg(res, "参数不对", 500);
            if (!obj.commentuuid)
                delete obj.commentuuid;
            if (!obj.trenduuid)
                delete obj.trenduuid;
            if (!obj.useruuid)
                delete obj.useruuid;
            yield reflect_1.insertReflect(obj);
            return response_1.sendOK(res, { msg: "举报成功" });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//打赏
exports.router.post('/reward', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { commentuuid, trenduuid } = req.body;
        validator_1.validateCgi({ commentuuid, trenduuid }, validator_2.trendValidator.reward);
        const info = req.loginInfo;
        const useruuid = info.getUuid();
        try {
            let trend = yield trend_1.findByTrendUUID(trenduuid);
            let user_ext = yield users_ext_1.findByPrimary(useruuid);
            if (trend.useruuid != useruuid)
                return response_1.sendErrMsg(res, "不是自己的动态", 500);
            if (user_ext.balance < trend.reward * 100)
                return response_1.sendErrMsg(res, "余额不足", 500);
            let com = yield trendcomment_1.findByPrimaryUUID(commentuuid);
            if (com.reward == true)
                return response_1.sendErrMsg(res, "不能重复打赏", 500);
            let comUser = yield users_1.findByPrimary(com.useruuid);
            let r1 = yield users_ext_1.recharge(com.useruuid, trend.reward * 100);
            let r2 = yield users_ext_1.exchange(useruuid, { points: 0, balance: trend.reward * 100 });
            if (r1 && r2) {
                yield trendcomment_1.updateReward(commentuuid, true);
                let obj = {
                    useruuid: com.useruuid,
                    username: comUser.username,
                    content: `您的评论被打赏了${trend.reward}元`,
                    state: 'send',
                    title: '打赏消息'
                };
                yield message_1.createMessage(obj);
                let obj2 = {
                    useruuid: com.useruuid,
                    amount: trend.reward,
                    mode: "reward",
                    time: winston_1.timestamps()
                };
                yield amountlog_1.insertAmountLog(obj2);
                return response_1.sendOK(res, "打赏成功");
            }
            else
                return response_1.sendErrMsg(res, "打赏失败", 500);
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//查看自己的全部动态
exports.router.get('/allTrend', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { page, count } = req.query;
        validator_1.validateCgi({ page, count }, validator_2.trendValidator.getTrend);
        const info = req.loginInfo;
        const useruuid = info.getUuid();
        try {
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let trends = yield trend_1.findByUserUUID(req.app.locals.sequelize, useruuid, cursor, limit);
            let arr = [];
            for (let i = 0; i < trends.length; i++) {
                trends[i].created = winston_1.timestamps(trends[i].created);
                let applaud = 0;
                if (useruuid)
                    applaud = yield applaud_1.findByUseruuidAndAdsuuid(trends[i].uuid, useruuid);
                arr.push({ trend: trends[i], applaud: applaud ? 1 : 0 });
            }
            return response_1.sendOK(res, arr);
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//增加分享数
exports.router.put('/addShare', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { trenduuid } = req.body;
        validator_1.validateCgi({ uuid: trenduuid }, validator_2.trendValidator.uuid);
        try {
            yield trend_1.trendUpdateShare(trenduuid);
            return response_1.sendOK(res, "");
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//查看某个动态的答题记录
exports.router.get('/:trenduuid', /* checkAppLogin, */ function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let trenduuid = req.params['trenduuid'];
        let { page, count } = req.query;
        validator_1.validateCgi({ trenduuid, page, count }, validator_2.trendValidator.getAnswer);
        try {
            /*  let trend = await findByTrendUUID(trenduuid)
             if (trend.useruuid != useruuid)
                 return sendErrMsg(res, "这不是您的动态", 500) */
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let logs = yield adslog_1.findByAdsuuid(req.app.locals.sequelize, trenduuid, cursor, limit);
            logs.forEach((r) => {
                r.created = winston_1.timestamps(r.created);
                r.name = utils_1.changeUsername(r.name);
            });
            return response_1.sendOK(res, logs);
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//上传动态视频
exports.router.post('/:trenduuid/movie', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let trenduuid = req.params["trenduuid"];
        winston.info(`------enter ------`);
        try {
            validator_1.validateCgi({ uuid: trenduuid }, validator_2.trendValidator.uuid);
            let newPath = yield upload_1.uploadAdsMovie(req, {
                uuid: trenduuid,
                glob: resource_1.trendMovOpt.glob,
                tmpDir: resource_1.trendMovOpt.tmpDir,
                maxSize: resource_1.trendMovOpt.maxSize,
                extnames: resource_1.trendMovOpt.extnames,
                maxFiles: resource_1.trendMovOpt.maxFiles,
                targetDir: resource_1.trendMovOpt.targetDir,
                fieldName: resource_1.trendMovOpt.fieldName,
            });
            let mediaName = path.join(resource_1.trendMovOpt.targetDir, newPath); //视频的路径
            let cmdthumb = mediaName.substring(0, mediaName.lastIndexOf('.'));
            cmdthumb += '.jpg'; //预览图，同名同路径，只是后缀是jpg
            let preview = newPath.substring(0, newPath.lastIndexOf('.'));
            preview += '.jpg';
            child_process.exec("ffmpeg -ss 00:00:01 -i " + mediaName + " -t 0.001 " + cmdthumb + "", () => __awaiter(this, void 0, void 0, function* () {
                let infoo = yield trend_1.modifilyMov(trenduuid, newPath, cmdthumb);
                return response_1.createdOk(res, { path: newPath, infoo, preview });
            }));
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//删除动态视频
exports.router.delete('/:trenduuid/movie', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let mediaName = req.query.mediaName;
        let trenduuid = req.params["trenduuid"];
        try {
            validator_1.validateCgi({ uuid: trenduuid }, validator_2.trendValidator.uuid);
            mediaName = path.join(resource_1.trendMovOpt.targetDir, /* trenduuid, */ mediaName);
            let preview = mediaName.substring(0, mediaName.lastIndexOf('.'));
            preview += '.jpg';
            yield fs_1.removeAsync(mediaName); //删除视频
            yield fs_1.removeAsync(preview); //删除预览图
            yield trend_1.modifilyMov(trenduuid, null, null);
            return response_1.sendOK(res, { msg: 'succ' });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//# sourceMappingURL=trend.js.map