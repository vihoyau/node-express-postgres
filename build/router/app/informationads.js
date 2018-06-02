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
const response_1 = require("../../lib/response");
const informationads_1 = require("../../model/ads/informationads");
const winston_1 = require("../../config/winston");
const statistics_1 = require("../../model/users/statistics");
const infocomment_1 = require("../../model/ads/infocomment");
const favoriate_1 = require("../../model/ads/favoriate");
const history_1 = require("../../redis/history");
const users_ext_1 = require("../../model/users/users_ext");
const informationads_2 = require("../../model/ads/informationads");
const validator_1 = require("./validator");
const informationcategory_1 = require("../../model/ads/informationcategory");
const adslog_1 = require("../../model/ads/adslog");
const users_1 = require("../../model/users/users");
const amountmonitor_1 = require("../../lib/amountmonitor");
const reward_1 = require("../../model/users/reward");
const utils_1 = require("../../lib/utils");
const applaud_1 = require("../../model/ads/applaud");
const validator_2 = require("./validator");
const assert = require("assert");
const winston = require("winston");
const validator_3 = require("../../lib/validator");
exports.router = express_1.Router();
//获得banner资讯
exports.router.get('/banner', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let ads = yield informationads_2.getBanner();
            return response_1.sendOK(res, { banner: ads });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//查看全部资讯（按照类别）
exports.router.get('/info', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { category, page, count } = req.query;
        validator_3.validateCgi({ category, page, count }, validator_2.infoValidator.getInfo);
        try {
            let useruuid = req.headers.uuid;
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let arr = yield informationads_1.findByCategory(category, cursor, limit);
            for (let i = 0; i < arr.length; i++) {
                let read = false, answered = false;
                if (useruuid) {
                    let adslog = yield adslog_1.getByTwoUuid(arr[i].uuid, useruuid);
                    if (adslog) {
                        read = true;
                        if (adslog.state)
                            answered = true;
                    }
                }
                arr[i].read = read;
                arr[i].answered = answered;
            }
            return response_1.sendOK(res, { arr });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//资讯搜索关键字
exports.router.get('/keyword', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { keyword, page, count } = req.query;
        validator_3.validateCgi({ page, count }, validator_2.infoValidator.getKey);
        let useruuid = req.headers.uuid;
        try {
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let arr = yield informationads_1.findByKeyWord(req.app.locals.sequelize, keyword, cursor, limit);
            for (let i = 0; i < arr.length; i++) {
                let read = false, answered = false;
                if (useruuid) {
                    let adslog = yield adslog_1.getByTwoUuid(arr[i].uuid, useruuid);
                    if (adslog) {
                        read = true;
                        if (adslog.state)
                            answered = true;
                    }
                }
                arr[i].read = read;
                arr[i].answered = answered;
            }
            return response_1.sendOK(res, { arr });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//查看全部类别
exports.router.get('/category', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let arr = yield informationcategory_1.getAllInfoCate();
        return response_1.sendOK(res, { arr });
    });
});
//查看某个咨询的详情
exports.router.get('/detail', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { infouuid } = req.query;
        let useruuid = req.headers.uuid;
        try {
            validator_3.validateCgi({ uuid: infouuid }, validator_1.usersValidator.uuid);
            let info = yield informationads_1.findByPrimarys(infouuid);
            let answered = 0; //答题标记
            let applaud = null; //点赞标记
            let favo = "0"; //收藏标记
            if (useruuid) {
                let user = yield users_1.findByPrimary(useruuid);
                //获取答题记录
                let adslog = yield adslog_1.getByTwoUuid(infouuid, useruuid);
                if (adslog && adslog.state)
                    answered = 1;
                if (!adslog) {
                    let adlog = {
                        aduuid: infouuid,
                        useruuid: user.uuid,
                        username: user.username,
                        openid: user.openid
                    };
                    yield adslog_1.insertAdslog(adlog);
                }
                let laud = yield applaud_1.findByUseruuidAndAdsuuid(infouuid, useruuid); //点赞记录
                if (laud) {
                    applaud = laud.state;
                }
                //拿到广告收藏
                let favorite = yield favoriate_1.getByUserAds(infouuid, useruuid);
                if (favorite)
                    favo = "1";
            }
            let questionindex = null; //随机问题下标
            if (info.question_ext && info.question_ext.length != 0) {
                questionindex = Math.floor(Math.random() * (info.question_ext.length)); //产生随机数
                //***************************************数组随机排列函数******************************************* */
                /**
                 * 随机打乱数组顺序
                 * @param input
                 */
                function shuffle(input) {
                    return __awaiter(this, void 0, void 0, function* () {
                        for (let i = input.length - 1; i >= 0; i--) {
                            let randomIndex = Math.floor(Math.random() * (i + 1));
                            let itemAtIndex = input[randomIndex];
                            input[randomIndex] = input[i];
                            input[i] = itemAtIndex;
                        }
                        return input;
                    });
                }
                //************************************************************************************************* */
                let newquestion = yield shuffle(info.question_ext[questionindex].option);
                info.question_ext[questionindex].option = newquestion; //改变答案的位置
                info.question_ext = info.question_ext[questionindex]; //输出随机出的答案
            }
            info.totalbalance = info.totalbalance;
            info.balance = info.balance;
            info.allbalance = info.allbalance;
            return response_1.sendOK(res, { info, questionindex: questionindex, answer: answered, applaud, favorite: favo });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//点赞资讯
exports.router.post('/nice', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { infouuid } = req.body;
        try {
            const loginInfo = req.loginInfo;
            yield informationads_2.infoUpdateNice(infouuid);
            yield applaud_1.insertApplaud(infouuid, loginInfo.getUuid(), 'nice');
            return response_1.sendOK(res, { applaud: "nice" });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//取消点赞，踩
exports.router.put('/cancel/:infouuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { applaud } = req.body;
        const infouuid = req.params["infouuid"];
        try {
            const loginInfo = req.loginInfo;
            if (applaud === 'low') { //low/nice
                yield informationads_2.updateApplaud(infouuid, 1, 0); //减少差评
            }
            else {
                yield informationads_2.updateApplaud(infouuid, 0, 1); //减少好评
            }
            let laud = yield applaud_1.findByUseruuidAndAdsuuid(infouuid, loginInfo.getUuid()); //点赞记录
            yield applaud_1.deleteByAdsUuid(laud.uuid);
            return response_1.sendOK(res, { applaud: null });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//评论资讯
exports.router.post('/comment', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { content, infouuid, parent } = req.body;
        let useruuid = req.headers.uuid;
        try {
            if (parent != undefined && parent != null && parent != '') {
                validator_3.validateCgi({ content: content, useruuid: useruuid, adsuuid: infouuid, parent: parent }, validator_2.adscommentValidator.insertparentComment);
                let re = yield infocomment_1.insertParentComment(content, useruuid, infouuid, parent);
                assert(re != undefined, 'insert fail');
                return response_1.sendOK(res, { 'data': 'succ' });
            }
            else {
                validator_3.validateCgi({ content: content, useruuid: useruuid, adsuuid: infouuid }, validator_2.adscommentValidator.insertComment);
                let re = yield infocomment_1.insertadsComment(content, useruuid, infouuid);
                assert(re != undefined, 'insert fail');
                return response_1.sendOK(res, { 'data': 'succ2' });
            }
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//收藏资讯
exports.router.post('/favorite/:infouuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const infouuid = req.params["infouuid"];
        try {
            const loginInfo = req.loginInfo;
            //validateCgi({ adsuuid: adsuuid }, usersValidator.uuid)
            let user = yield users_1.findByPrimary(loginInfo.getUuid());
            if (!user) {
                return response_1.sendNotFound(res, "用户不存在！");
            }
            let info = yield informationads_1.findByPrimarys(infouuid);
            if (!info) {
                return response_1.sendNotFound(res, "广告不存在！");
            }
            let favorite = yield favoriate_1.getByUserAds(loginInfo.getUuid(), infouuid);
            let obj = {
                useruuid: loginInfo.getUuid(),
                loginnumber: 0,
                searchnumber: 0,
                favoritenumber: 1,
                type: 'ads',
            };
            yield statistics_1.insertStatistics(obj);
            let state;
            if (!favorite) {
                yield favoriate_1.favoriateInsert(user.uuid, infouuid);
                state = "1";
            }
            return response_1.createdOk(res, { favorite: state });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//取消收藏资讯
exports.router.delete('/favorite/:adsuuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const adsuuid = req.params["adsuuid"];
        try {
            const loginInfo = req.loginInfo;
            //validateCgi({ adsuuid: adsuuid }, usersValidator.uuid)
            yield favoriate_1.deleteByUserAds(adsuuid, loginInfo.getUuid());
            return response_1.sendOK(res, { favorite: "0" });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//获取某人全部的收藏资讯
exports.router.get('/favorite', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { page, count } = req.query;
        try {
            const loginInfo = req.loginInfo;
            validator_3.validateCgi({ page: page, count: count }, validator_1.usersValidator.pagecount);
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let favorite = yield favoriate_1.getAdsUuids(loginInfo.getUuid(), cursor, limit);
            let favo = new Array();
            let ads = new Array();
            if (favorite) {
                for (let i = 0; i < favorite.length; i++) {
                    favo[i] = favorite[i].aduuid;
                }
                if (favo.length > 0) {
                    ads = yield informationads_2.getFavoriteByUuid(req.app.locals.sequelize, favo);
                }
            }
            return response_1.sendOK(res, { ads: ads, page: parseInt(page) + 1, count: count });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
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
//答题
exports.router.post('/answer', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { answer, questionindex, infouuid } = req.body;
        try {
            const loginInfo = req.loginInfo;
            let opt = yield history_1.getAnswerAds(infouuid);
            if (opt && opt === loginInfo.getUuid()) {
                return response_1.sendNotFound(res, "不能重复提交");
            }
            else {
                yield history_1.saveAnswerAds(infouuid, loginInfo.getUuid());
            }
            winston.info(infouuid, loginInfo.getUuid(), "answer");
            //validator.validateCgi({ adsuuid: adsuuid, answer: answer }, adsValidator["answers"])
            let adslog = yield adslog_1.getByTwoUuid(infouuid, loginInfo.getUuid());
            if (adslog && adslog.state)
                return response_1.sendNotFound(res, "不能重复答题");
            let points = 0;
            let rebalance = 0;
            let appUser = yield users_1.findByPrimary(loginInfo.getUuid());
            let info = yield informationads_1.findByPrimarys(infouuid);
            let answerSet;
            let newAnswerSet;
            let union;
            let intersectionSet;
            //*********************************************答题*********************************************** */
            if (questionindex === null || questionindex === undefined) { //之前版本题目
                answerSet = Array.from(new Set(info.question.answer)); //正确答案
                newAnswerSet = Array.from(new Set(answer)); //回答的答案
                union = yield array_union(answerSet, newAnswerSet); //并集
                intersectionSet = yield array_intersection(answerSet, newAnswerSet); //交集
            }
            else {
                answerSet = Array.from(new Set(info.question_ext[questionindex].answer)); //真确答案
                newAnswerSet = Array.from(new Set(answer)); //回答的答案
                union = yield array_union(answerSet, newAnswerSet); //并集
                intersectionSet = yield array_intersection(answerSet, newAnswerSet); //交集
            }
            //*************************************************************************************************** */
            //全对用户加points广告totalpoints减广告points
            if (intersectionSet.length === answerSet.length && intersectionSet.length === newAnswerSet.length) {
                switch (info.mold) {
                    case "point":
                        points = info.points;
                        rebalance = 0;
                        break;
                    case "balance":
                        points = 0;
                        rebalance = info.balance;
                        break;
                    case "two":
                        points = info.points;
                        rebalance = info.balance;
                        break;
                }
            }
            else if ((union.length - intersectionSet.length) == (answerSet.length - newAnswerSet.length) && newAnswerSet.length > 0) {
                switch (info.mold) {
                    case "point":
                        points = Math.floor(info.points / 2);
                        rebalance = 0;
                        break;
                    case "balance":
                        points = 0;
                        rebalance = Math.floor(info.balance / 2);
                        break;
                    case "two":
                        points = Math.floor(info.points / 2);
                        rebalance = Math.floor(info.balance / 2);
                        break;
                }
            }
            let adstotalpoints = info.totalpoints - points;
            let adstotalbalance = info.totalbalance - rebalance;
            let upd = {
                totalpoints: adstotalpoints,
                totalbalance: adstotalbalance
            };
            let updateUser = {
                points: points,
                balance: rebalance * 100,
                exp: points
            };
            if (adstotalpoints >= 0 && adstotalbalance >= 0) { //修改后的积分和零钱大于零
                yield informationads_1.updateByUuid(upd, info.uuid); //广告减积分和零钱
                yield users_ext_1.updatePoints(appUser.uuid, updateUser); //用户加积分零钱和经验
            }
            else {
                points = -1;
                rebalance = -1;
            }
            //修改广告记录
            if (!adslog) { //不存在广告记录
                let newadslog = {
                    aduuid: infouuid,
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
            info.totalbalance = info.totalbalance - rebalance;
            info.balance = info.balance;
            info.allbalance = info.allbalance;
            info.totalpoints = info.totalpoints - points;
            if (questionindex != null && questionindex != undefined) {
                return response_1.createdOk(res, { answers: info.question_ext[questionindex].answer, points: points + '', balance: rebalance + '', info: info });
            }
            else {
                return response_1.createdOk(res, { answers: info.question.answer, points: points + '', balance: rebalance + '', info: info });
            }
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//广告踩（差评）
exports.router.put('/low/:infouuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const infouuid = req.params["infouuid"];
        try {
            const loginInfo = req.loginInfo;
            yield informationads_2.infoUpdateLow(infouuid);
            yield applaud_1.insertApplaud(infouuid, loginInfo.getUuid(), 'low');
            return response_1.sendOK(res, { applaud: "low" });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//查看某个资讯的全部评论
exports.router.get('/:infouuid/commentAll', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let infouuid = req.params['infouuid'];
        let commentarr = [];
        let useruuid = req.headers.uuid;
        try {
            validator_3.validateCgi({ commentUUID: infouuid }, validator_2.adscommentValidator.commentuuid);
            let re = yield infocomment_1.queryCommentParent(req.app.locals.sequelize, infouuid);
            for (let i = 0; i < re.length; i++) {
                re[i].created = winston_1.timestamps(re[i].created);
                let num = yield infocomment_1.queryCommentParentDownNum(req.app.locals.sequelize, infouuid, re[i].commentuuid);
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
//获得这个评论的全部子评论
exports.router.get('/:commentuuid/commentAllByuuid', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let commentuuid = req.params['commentuuid'];
        let useruuid = req.headers.uuid;
        let commentarr = [];
        try {
            validator_3.validateCgi({ commentUUID: commentuuid }, validator_2.adscommentValidator.commentuuid);
            let re = yield infocomment_1.queryCommentByparentuuid(req.app.locals.sequelize, commentuuid);
            for (let i = 0; i < re.length; i++) {
                re[i].created = winston_1.timestamps(re[i].created);
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
//这个评论的回复数
exports.router.get('/:commentuuid/repliedCount', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let commentuuid = req.params['commentuuid'];
        try {
            validator_3.validateCgi({ commentUUID: commentuuid }, validator_2.adscommentValidator.commentuuid);
            let re = yield infocomment_1.querycommentRepliedCount(req.app.locals.sequelize, commentuuid);
            return response_1.sendOK(res, { 'num': re[0] });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//找出最火的那个评论
exports.router.get('/:infouuid/commentOne', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let infouuid = req.params['infouuid'];
        let commentarr = [];
        let tempre = null;
        let tempdownre = null;
        try {
            validator_3.validateCgi({ commentUUID: infouuid }, validator_2.adscommentValidator.commentuuid);
            let num = yield infocomment_1.queryadsCommentNum(req.app.locals.sequelize, infouuid);
            let re = yield infocomment_1.queryadsCommentUpnumMAX(req.app.locals.sequelize, infouuid);
            let downre = undefined;
            if (re[0] != undefined) {
                tempre = re[0];
                downre = yield infocomment_1.queryCommentParentDownLastcomment(req.app.locals.sequelize, re[0].commentuuid);
            }
            for (let i = 0; i < re.length; i++) {
                re[i].created = winston_1.timestamps(re[i].created);
            }
            if (downre == undefined) {
                downre == null;
            }
            else {
                tempdownre = downre[0];
            }
            commentarr.push({
                'commentnum': num,
                'commentupnumMAX': tempre,
                'downcomment': tempdownre
            });
            return response_1.sendOK(res, { 'data': commentarr });
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
            validator_3.validateCgi({ commentUUID: commentuuid }, validator_2.adscommentValidator.commentuuid);
            let isexist = yield applaud_1.queryUphistory(loginInfo.getUuid(), commentuuid);
            let re = yield infocomment_1.queryCommentNum(commentuuid);
            if (!isexist) {
                re = yield infocomment_1.updateCommentNum(commentuuid, parseInt(re.getDataValue('upnum')) + 1);
                yield applaud_1.insertCommentApplaud(commentuuid, loginInfo.getUuid(), "nice");
                return response_1.sendOK(res, { "data": 'up' });
            }
            else {
                yield applaud_1.deleteByCommentUseruuid(loginInfo.getUuid(), commentuuid);
                re = yield infocomment_1.updateCommentNum(commentuuid, parseInt(re.getDataValue('upnum')) - 1);
                return response_1.sendOK(res, { "data": 'down' });
            }
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//# sourceMappingURL=informationads.js.map