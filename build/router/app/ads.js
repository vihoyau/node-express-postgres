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
const history_1 = require("../../redis/history");
const response_1 = require("../../lib/response");
const logindao_1 = require("../../redis/logindao");
const ads_1 = require("../../model/ads/ads");
const unit_1 = require("../../model/puton/unit");
const hotkey_1 = require("../../model/ads/hotkey");
const favoriate_1 = require("../../model/ads/favoriate");
const ads_view_1 = require("../../model/ads/ads_view");
const applaud_1 = require("../../model/ads/applaud");
const users_1 = require("../../model/users/users");
const users_ext_1 = require("../../model/users/users_ext");
const reward_1 = require("../../model/users/reward");
const applaud_2 = require("../../model/ads/applaud");
const statistics_1 = require("../../model/users/statistics");
//import { getSubcategory, getSubcategory2 } from "../../model/ads/category"
const category_1 = require("../../model/ads/category");
const system_1 = require("../../model/system/system");
const adslog_1 = require("../../model/ads/adslog");
const ads_ext_1 = require("../../model/ads/ads_ext");
const utils_1 = require("../../lib/utils");
//linux环境对不被使用的变量编译不通过。
//import { postAsync } from "../../lib/request"
const winston_1 = require("../../config/winston");
const logger = require("winston");
const resource_1 = require("../../config/resource");
const upload_1 = require("../../lib/upload");
const fs_1 = require("../../lib/fs");
const controltime_1 = require("../../model/puton/controltime");
const unit_2 = require("../../model/puton/unit");
const adsoperation_1 = require("../../model/ads/adsoperation");
const paymoney_1 = require("../../model/ads/paymoney");
const amountmonitor_1 = require("../../lib/amountmonitor");
//import { getrent } from "../../model/ads/ads"
const path = require("path");
exports.router = express_1.Router();
//推荐广告列表（推荐页）
exports.router.get("/commentlist", logindao_1.getLogininfo, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { category, page, count, ip } = req.query;
            let useruuid = req.headers.uuid;
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let subcategorys = yield category_1.getSubcategory2(category, cursor, limit);
            let adsarr = [];
            const loginInfo = req.loginInfo;
            if (!loginInfo) { //记录访客
                let obj = {
                    ip: ip ? ip : "IP"
                };
                yield statistics_1.insertStatistics(obj);
            }
            for (let i = 0; i < subcategorys.length; i++) {
                let ads = yield ads_1.encommentedlist(subcategorys[i].uuid);
                for (let i = 0; i < ads.length; i++) {
                    let answered = false, read = false;
                    if (useruuid) {
                        let adslog = yield adslog_1.getByTwoUuid(ads[i].uuid, useruuid);
                        if (adslog) {
                            read = true;
                            if (adslog.state)
                                answered = true;
                        }
                    }
                    ads[i].read = read;
                    ads[i].answered = answered;
                    yield checkads(req, res, next, ads[i].uuid);
                }
                let controltimeadsarr = yield encommentedListControl(req, res, next);
                ads = yield getshowads(req, res, next, ads, controltimeadsarr);
                ads.forEach(r => {
                    r.balance = r.balance;
                    r.totalbalance = r.totalbalance;
                    r.allbalance = r.allbalance;
                    r.created = winston_1.timestamps(r.created);
                    r.tsrange[0] = winston_1.timestamps(r.tsrange[0]);
                    r.tsrange[1] = winston_1.timestamps(r.tsrange[1]);
                });
                for (let i = 0; i < ads.length; i++) {
                    let unit = yield unit_2.queryunitByadsuuid(req.app.locals.sequelize, ads[i].uuid);
                    ads[i].method = unit.method;
                    ads[i].mode = unit.mode;
                }
                adsarr.push({
                    subcategory: subcategorys[i],
                    ad: ads
                });
            }
            return response_1.sendOK(res, { adsarr: adsarr, page: parseInt(page) + 1, count });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
function encommentedListControl(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let date = new Date();
        let hour = date.getHours();
        let day = date.getDay() ? date.getDay() : 7;
        let unituuid = yield controltime_1.queryunitbycontroltime(req.app.locals.sequelize, day, hour);
        let controltimeadsarr = new Array();
        let controltimeads = yield ads_1.queryPutonadsbyunituuid(req.app.locals.sequelize, unituuid);
        for (let i = 0; i < controltimeads.length; i++) {
            controltimeadsarr.push(controltimeads[i].uuid);
        }
        return controltimeadsarr;
    });
}
exports.encommentedListControl = encommentedListControl;
function encommentedListControl2(req, res, next, category) {
    return __awaiter(this, void 0, void 0, function* () {
        let date = new Date();
        let hour = date.getHours();
        let day = date.getDay() ? date.getDay() : 7;
        let unituuid = yield controltime_1.queryunitbycontroltime(req.app.locals.sequelize, day, hour);
        let controltimeadsarr = new Array();
        let controltimeads = yield ads_1.queryPutonadsbyunituuid2(req.app.locals.sequelize, unituuid, category);
        for (let i = 0; i < controltimeads.length; i++) {
            controltimeadsarr.push(controltimeads[i].uuid);
        }
        return controltimeadsarr;
    });
}
exports.encommentedListControl2 = encommentedListControl2;
function encommentedListControl3(req, res, next, category) {
    return __awaiter(this, void 0, void 0, function* () {
        let date = new Date();
        let hour = date.getHours();
        let day = date.getDay() ? date.getDay() : 7;
        let unituuid = yield controltime_1.queryunitbycontroltime(req.app.locals.sequelize, day, hour);
        let controltimeadsarr = new Array();
        let controltimeads = yield ads_1.queryPutonadsbyunituuid3(req.app.locals.sequelize, unituuid, category);
        for (let i = 0; i < controltimeads.length; i++) {
            controltimeadsarr.push(controltimeads[i].uuid);
        }
        return controltimeadsarr;
    });
}
exports.encommentedListControl3 = encommentedListControl3;
function compArea(userinfoArea, unitArea) {
    return __awaiter(this, void 0, void 0, function* () {
        if (unitArea == '全国型' || userinfoArea.city == '全国') {
            return true;
        }
        else {
            let unitAreas = unitArea.split('-');
            if (unitAreas[0] == unitArea) {
                if (unitArea == userinfoArea.area)
                    return true;
                else if (unitArea == userinfoArea.province)
                    return true;
            }
            if (unitArea[0] == userinfoArea.province && unitArea[1] == userinfoArea.city)
                return true;
        }
        return false;
    });
}
exports.compArea = compArea;
function getshowads(req, res, next, ads, controltimeads) {
    return __awaiter(this, void 0, void 0, function* () {
        let adsarr = [];
        for (let x = 0; x < ads.length; x++) {
            if (controltimeads.indexOf(ads[x].uuid) >= 0) {
                let unit = yield unit_1.queryunitone(ads[x].unituuid);
                if (unit) {
                    ads[x].method = unit.method;
                    ads[x].mode = unit.mode;
                    ads[x].cpe_type = unit.cpe_type;
                }
                adsarr.push(ads[x]);
                if (ads[x].showamount > 0 && ads[x].showamount % 1000 == 0 && ((ads[x].method == 'cpm') || (ads[x].method == 'cpe' && ads[x].cpe_type == 0))) {
                    appAdsPay(req, res, next, ads[x].uuid, '', ads[x].method, 'show');
                }
                else {
                    adsoperation_1.insertoperation(ads[x].uuid, "", "adsshow", new Date());
                }
                ads_1.updateshowamountByadsuuid(ads[x].uuid);
            }
        }
        return adsarr;
    });
}
exports.getshowads = getshowads;
//如果是展示扣费，这里就该扣广告商的钱了（cpm广告，cpe的展示扣费模式）
function getshowads2(req, res, next, ads, useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let adsarr = [];
        for (let x = 0; x < ads.length; x++) {
            let unit = yield unit_1.queryunitone(ads[x].unituuid);
            if (unit) {
                ads[x].method = unit.method;
                ads[x].mode = unit.mode;
                ads[x].cpe_type = unit.cpe_type;
            }
            if (ads[x].showamount > 0 && ads[x].showamount % 1000 == 0 && ((ads[x].method == 'cpm') || (ads[x].method == 'cpe' && ads[x].cpe_type == 0))) {
                appAdsPay(req, res, next, ads[x].uuid, '', ads[x].method, 'show');
            }
            else {
                adsoperation_1.insertoperation(ads[x].uuid, "", "adsshow", new Date());
            }
            ads_1.updateshowamountByadsuuid(ads[x].uuid);
            checkads(req, res, next, ads[x].uuid);
            let read = false; //阅读标记
            if (useruuid) {
                let adslog = yield adslog_1.getByTwoUuid(ads[x].uuid, useruuid);
                if (adslog)
                    read = true;
            }
            ads[x].read = read;
            adsarr.push(ads[x]);
        }
        return adsarr;
    });
}
exports.getshowads2 = getshowads2;
//没被调用2018-02-05
exports.router.get('/:adsuuid/geturl', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let adsuuid = req.params['adsuuid'];
        let useruuid = req.headers.uuid;
        try {
            //let re = await queryunitByadauuid(req.app.locals.sequelize, adsuuid);
            yield appAdsPay(req, res, next, adsuuid, useruuid, 'cpc', 'point');
            yield ads_1.upadsBrowser(adsuuid);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/* GET ads listing.
GET ads/ads?type=xxx&page=1&count=10
*/
//请求小类广告
exports.router.get('/type', logindao_1.getLogininfo, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { subtype, page, count, address } = req.query;
        try {
            let useruuid = req.headers.uuid;
            let addressComponent;
            if (address) {
                addressComponent = JSON.parse(address);
            }
            else {
                addressComponent = {
                    city: null,
                    province: null,
                    area: null
                };
            }
            validator_1.validateCgi({ subcategory: subtype, page: page, count: count }, validator_2.usersValidator.bytype);
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let controltimeadsarr = yield encommentedListControl3(req, res, next, subtype);
            let ads = yield ads_1.getByType(req.app.locals.sequelize, subtype, addressComponent, controltimeadsarr, cursor, limit);
            ads = yield getshowads2(req, res, next, ads, useruuid);
            return response_1.sendOK(res, { ads, page: parseInt(page) + 1 + "", count: count });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//请求大类广告
exports.router.get('/category', logindao_1.getLogininfo, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { category, page, count, address } = req.query;
        try {
            let useruuid = req.headers.uuid;
            let addressComponent;
            if (address) {
                addressComponent = JSON.parse(address);
            }
            else {
                addressComponent = {
                    city: null,
                    province: null,
                    area: null
                };
            }
            validator_1.validateCgi({ subcategory: category, page: page, count: count }, validator_2.usersValidator.bytype);
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let controltimeadsarr = yield encommentedListControl2(req, res, next, category);
            let ads = yield ads_1.getByCategory(req.app.locals.sequelize, category, addressComponent, controltimeadsarr, cursor, limit);
            ads = yield getshowads2(req, res, next, ads, useruuid);
            for (let i = 0; i < ads.length; i++) {
                let read = false, answered = false;
                if (useruuid) {
                    let adslog = yield adslog_1.getByTwoUuid(ads[i].uuid, useruuid);
                    if (adslog) {
                        read = true;
                        if (adslog.state)
                            answered = true;
                    }
                }
                ads[i].read = read;
                ads[i].answered = answered;
            }
            return response_1.sendOK(res, { ads, page: parseInt(page) + 1 + "", count: count });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/keyword', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { keyword, page, count, address } = req.query;
        let useruuid = req.headers.uuid;
        try {
            let addressComponent;
            if (address) {
                addressComponent = JSON.parse(address);
            }
            else {
                addressComponent = {
                    city: null,
                    province: null,
                    area: null
                };
            }
            validator_1.validateCgi({ keyword: keyword, page: page, count: count }, validator_2.usersValidator.keywords);
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let keywords = yield hotkey_1.getByKeywords(keyword);
            if (keywords && !!keywords.keyword) {
                yield hotkey_1.update(keywords.id);
            }
            else {
                yield hotkey_1.hotkeyInsert(keyword);
            }
            let ads = yield ads_1.getByKeyword(req.app.locals.sequelize, keyword, cursor, limit, addressComponent);
            if (useruuid) {
                let obj = {
                    useruuid: useruuid,
                    loginnumber: 0,
                    searchnumber: 1,
                    favoritenumber: 0,
                    type: 'ads',
                };
                yield statistics_1.insertStatistics(obj);
            }
            return response_1.sendOK(res, { ads: ads, page: parseInt(page) + 1 + "", count: count });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/hot', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { page, count, address } = req.query;
        try {
            let addressComponent;
            if (address) {
                addressComponent = JSON.parse(address);
            }
            else {
                addressComponent = {
                    city: null,
                    province: null,
                    area: null
                };
            }
            validator_1.validateCgi({ page: page, count: count }, validator_2.usersValidator.pagecount);
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let ads = yield ads_1.getHot(req.app.locals.sequelize, cursor, limit, addressComponent);
            return response_1.sendOK(res, { ads: ads, page: parseInt(page) + 1 + "", count: count });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/*
GET /favorite?page&limit
 */
exports.router.get('/favorite', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { page, count } = req.query;
        try {
            const loginInfo = req.loginInfo;
            validator_1.validateCgi({ page: page, count: count }, validator_2.usersValidator.pagecount);
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let favorite = yield favoriate_1.getAdsUuids(loginInfo.getUuid(), cursor, limit);
            let favo = new Array();
            let ads = new Array();
            if (favorite) {
                for (let i = 0; i < favorite.length; i++) {
                    favo[i] = favorite[i].aduuid;
                }
                if (favo.length > 0) {
                    ads = yield ads_1.getFavoriteByUuid(req.app.locals.sequelize, favo);
                    //ads = ads.map(r => new AdsVO(r))
                }
            }
            return response_1.sendOK(res, { ads: ads, page: parseInt(page) + 1, count: count });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//获取banner图
exports.router.get('/banner', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let ads = yield ads_1.getBanner();
            for (let i = 0; i < ads.length; i++) {
                yield checkads(req, res, next, ads[i].uuid);
            }
            let controltimeadsarr = yield encommentedListControl(req, res, next);
            ads = yield getshowads(req, res, next, ads, controltimeadsarr);
            for (let i = 0; i < ads.length; i++) {
                let unit = yield unit_2.queryunitByadsuuid(req.app.locals.sequelize, ads[i].uuid);
                ads[i].method = unit.method;
                ads[i].mode = unit.mode;
            }
            return response_1.sendOK(res, { banner: ads });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//没被调用2018-02-05
exports.router.put('/ads_ext/:uuid', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        let useruuid = req.headers.uuid;
        try {
            validator_1.validateCgi({ uuid: uuid }, validator_2.usersValidator.uuid);
            let ads_ext = yield ads_ext_1.updateNumber(uuid);
            yield appAdsPay(req, res, next, uuid, useruuid, 'cpc', 'point');
            return response_1.sendOK(res, { ads_ext: ads_ext });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/* GET ads info. 这时候应该扣点击扣费的广告*/
exports.router.get('/:uuid', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const adsuuid = req.params["uuid"];
        const { ip } = req.query;
        let useruuid = req.headers.uuid;
        try {
            validator_1.validateCgi({ uuid: adsuuid }, validator_2.usersValidator.uuid);
            let re = yield ads_1.queryunitByadauuid(req.app.locals.sequelize, adsuuid);
            if (re[0].method == 'cpc' || (re[0].method == 'cpe' && re[0].cpe_type == 1)) {
                appAdsPay(req, res, next, adsuuid, '', re[0].method, 'point');
            }
            else {
                adsoperation_1.insertoperation(adsuuid, useruuid, 'adspoint', new Date());
            }
            yield ads_1.updatepointamountByadsuuid(adsuuid);
            yield ads_ext_1.updateViews(adsuuid);
            let ads = yield ads_1.findByPrimary(adsuuid);
            let answered = 0;
            let views = 0;
            let applaud = null;
            let favo = "0";
            if (useruuid) {
                let user = yield users_1.findByPrimary(useruuid);
                //获取答题记录
                let adslog = yield adslog_1.getByTwoUuid(adsuuid, useruuid);
                if (adslog && adslog.state)
                    answered = 1;
                if (!adslog) {
                    let adlog = {
                        aduuid: adsuuid,
                        useruuid: user.uuid,
                        username: user.username,
                        openid: user.openid
                    };
                    yield adslog_1.insertAdslog(adlog);
                }
                //拿到该广告的浏览记录
                views = yield ads_ext_1.findByPrimary(ads.uuid);
                //拿到广告收藏
                let favorite = yield favoriate_1.getByUserAds(adsuuid, useruuid);
                if (favorite)
                    favo = "1";
                //let adsVo = new AdsVO(ads as any)
                //根据useruuid和adsviewuuid查询浏览记录
                let adsviewuuid = yield ads_view_1.getAdsviewByuuid(useruuid, adsuuid);
                let obj;
                if (adsviewuuid) {
                    obj = {
                        uuid: adsviewuuid,
                        useruuid: useruuid,
                        adsuuid: adsuuid,
                        modified: new Date
                    };
                }
                else {
                    obj = {
                        useruuid: useruuid,
                        adsuuid: adsuuid,
                        modified: new Date
                    };
                    yield users_ext_1.updateAdsViews(useruuid, 1); //增加用户的广告浏览数
                }
                //添加用户广告浏览记录
                yield ads_view_1.insertAdsView(obj);
                let users_ext = yield users_ext_1.findByPrimary(useruuid);
                let laud = yield applaud_1.findByUseruuidAndAdsuuid(adsuuid, useruuid); //点赞记录
                if (laud) {
                    applaud = laud.state;
                }
                let system = yield system_1.findByName('numcondition');
                if (users_ext.views >= parseInt(system.content.adsnum)) {
                    yield users_1.addPointAndCashlottery(useruuid, 1, 0); //增加一次免费抽奖机会
                    yield users_ext_1.modifiedAdsViews(useruuid, parseInt(system.content.adsnum)); //减少记录免费抽奖的广告数
                }
            }
            else { //没登陆的用户，记录访客
                let obj = {
                    aduuid: adsuuid,
                    ip: ip ? ip : "IP",
                };
                yield adslog_1.insertAdslog(obj);
            }
            let questionindex = null; //随机问题下标
            if (ads.question_ext) {
                questionindex = Math.floor(Math.random() * (ads.question_ext.length)); //产生随机数
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
                let newquestion = yield shuffle(ads.question_ext[questionindex].option);
                ads.question_ext[questionindex].option = newquestion; //改变答案的位置
                ads.question_ext = ads.question_ext[questionindex]; //输出随机出的答案
            }
            ads.totalbalance = ads.totalbalance;
            ads.balance = ads.balance;
            ads.allbalance = ads.allbalance;
            return response_1.sendOK(res, { ads: ads, views: views, questionindex: questionindex, favorite: favo, answer: answered, applaud: applaud, method: re[0].method });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
function appAdsPay(req, res, next, adsuuid, useruuid, method, mode) {
    return __awaiter(this, void 0, void 0, function* () {
        let re = yield ads_1.queryunitByadauuid(req.app.locals.sequelize, adsuuid);
        if (method == re[0].method) {
            let balance = yield ads_1.queryBalanceByadsuuid(req.app.locals.sequelize, adsuuid);
            let bid = yield ads_1.queryBidByadsuuid(req.app.locals.sequelize, adsuuid);
            let advertiser = yield ads_1.findadvertiserByadsuuid(req.app.locals.sequelize, adsuuid);
            if (advertiser.dailybudget == -1) {
                let money = parseFloat(balance[0].crm_balance) - parseFloat(bid[0].bid) * 100;
                if (method == 'cpc' && mode == "point") {
                    ads_1.updateBalanceByadsuuid(req.app.locals.sequelize, adsuuid, money);
                }
                else if (method == 'cpm' && mode == "show") {
                    ads_1.updateBalanceByadsuuid(req.app.locals.sequelize, adsuuid, money);
                }
                else if (method == 'cpe') {
                    if (mode == "point") {
                        ads_1.updateBalanceByadsuuid(req.app.locals.sequelize, adsuuid, money);
                    }
                    else if (mode == "show") {
                        ads_1.updateBalanceByadsuuid(req.app.locals.sequelize, adsuuid, money);
                    }
                }
            }
            else if (advertiser.tempdailybudget > 0) {
                let tempmoney = (advertiser.dailybudget * advertiser.tempdailybudget / 100) - parseFloat(bid[0].bid);
                let money = 0;
                if (tempmoney <= 0) {
                    money = parseFloat(balance[0].crm_balance) - advertiser.dailybudget * advertiser.tempdailybudget / 100;
                    ads_1.updateadsStatus(adsuuid, 0);
                }
                else {
                    money = parseFloat(balance[0].crm_balance) - parseFloat(bid[0].bid) * 100;
                }
                if (method == 'cpc' && mode == "point") {
                    ads_1.updateBalanceByadsuuid(req.app.locals.sequelize, adsuuid, money);
                }
                else if (method == 'cpm' && mode == "show") {
                    ads_1.updateBalanceByadsuuid(req.app.locals.sequelize, adsuuid, money);
                }
                else if (method == 'cpe') {
                    if (mode == "point") {
                        ads_1.updateBalanceByadsuuid(req.app.locals.sequelize, adsuuid, money);
                    }
                    else if (mode == "show") {
                        ads_1.updateBalanceByadsuuid(req.app.locals.sequelize, adsuuid, money);
                    }
                }
            }
            // //做流水
            let ree = yield ads_1.querycrmuuidByadsuuid(req.app.locals.sequelize, adsuuid);
            paymoney_1.insertpaymoney(ree[0].crmuuid, bid[0].bid, new Date(), 'ads');
            //增加广告操作表
            adsoperation_1.insertoperation(adsuuid, useruuid, 'ads' + mode, new Date());
        }
    });
}
exports.appAdsPay = appAdsPay;
function checkads(req, res, next, adsuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let balance = yield ads_1.queryBalanceByadsuuid(req.app.locals.sequelize, adsuuid);
        if (balance == null || balance == undefined || balance.length == 0) {
            return false;
        }
        else if (balance[0].crm_balance <= 0) {
            //让广告下架  展示时对投放 做过滤 这里就不做了
            yield ads_1.updateadsStatus(adsuuid, 0);
            ads_1.updateAdvertiserByadsuuid(req.app.locals.sequelize, adsuuid, 2);
            return false;
        }
        return true;
    });
}
exports.checkads = checkads;
/*
POST /favorite {adsuuid=xxx} & uuid
 */
exports.router.post('/favorite/:adsuuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const adsuuid = req.params["adsuuid"];
        try {
            const loginInfo = req.loginInfo;
            //validateCgi({ adsuuid: adsuuid }, usersValidator.uuid)
            let user = yield users_1.findByPrimary(loginInfo.getUuid());
            if (!user) {
                return response_1.sendNotFound(res, "用户不存在！");
            }
            let ads = yield ads_1.findByPrimary(adsuuid);
            if (!ads) {
                return response_1.sendNotFound(res, "广告不存在！");
            }
            let favorite = yield favoriate_1.getByUserAds(loginInfo.getUuid(), adsuuid);
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
                yield favoriate_1.favoriateInsert(user.uuid, adsuuid);
                state = "1";
            }
            return response_1.createdOk(res, { favorite: state });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/*
DELETE /favorite {adsuuid=xxx} & uuid
 */
exports.router.delete('/favorite/:adsuuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const adsuuid = req.params["adsuuid"];
        try {
            const loginInfo = req.loginInfo;
            //validateCgi({ adsuuid: adsuuid }, usersValidator.uuid)
            yield favoriate_1.deleteByUserAds(adsuuid, loginInfo.getUuid());
            return response_1.deleteOK(res, { favorite: "0" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
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
function array_union(a, b) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield array_remove_repeat(a.concat(b));
    });
}
/*answer question*/
exports.router.put('/answer/:adsuuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const adsuuid = req.params["adsuuid"];
        let { answer, questionindex } = req.body;
        try {
            const loginInfo = req.loginInfo;
            let opt = yield history_1.getAnswerAds(adsuuid);
            if (opt && opt === loginInfo.getUuid()) {
                return response_1.sendNotFound(res, "不能重复提交");
            }
            else {
                yield history_1.saveAnswerAds(adsuuid, loginInfo.getUuid());
            }
            logger.info(adsuuid, loginInfo.getUuid(), "answer");
            //validator.validateCgi({ adsuuid: adsuuid, answer: answer }, adsValidator["answers"])
            let adslog = yield adslog_1.getByTwoUuid(adsuuid, loginInfo.getUuid());
            if (adslog && adslog.state)
                return response_1.sendNotFound(res, "不能重复答题");
            let points = 0;
            let rebalance = 0;
            let appUser = yield users_1.findByPrimary(loginInfo.getUuid());
            let ads = yield ads_1.findByPrimary(adsuuid);
            let answerSet;
            let newAnswerSet;
            let union;
            let intersectionSet;
            //*********************************************答题*********************************************** */
            if (questionindex === null || questionindex === undefined) { //之前版本题目
                answerSet = Array.from(new Set(ads.question.answer)); //正确答案
                newAnswerSet = Array.from(new Set(answer)); //回答的答案
                union = yield array_union(answerSet, newAnswerSet); //并集
                intersectionSet = yield array_intersection(answerSet, newAnswerSet); //交集
            }
            else {
                answerSet = Array.from(new Set(ads.question_ext[questionindex].answer)); //真确答案
                newAnswerSet = Array.from(new Set(answer)); //回答的答案
                union = yield array_union(answerSet, newAnswerSet); //并集
                intersectionSet = yield array_intersection(answerSet, newAnswerSet); //交集
            }
            //*************************************************************************************************** */
            //全对用户加points广告totalpoints减广告points
            if (intersectionSet.length === answerSet.length && intersectionSet.length === newAnswerSet.length) {
                switch (ads.mold) {
                    case "point":
                        points = ads.points;
                        rebalance = 0;
                        break;
                    case "balance":
                        points = 0;
                        rebalance = ads.balance;
                        break;
                    case "two":
                        points = ads.points;
                        rebalance = ads.balance;
                        break;
                }
            }
            else if ((union.length - intersectionSet.length) == (answerSet.length - newAnswerSet.length) && newAnswerSet.length > 0) {
                switch (ads.mold) {
                    case "point":
                        points = Math.floor(ads.points / 2);
                        rebalance = 0;
                        break;
                    case "balance":
                        points = 0;
                        rebalance = Math.floor(ads.balance / 2);
                        break;
                    case "two":
                        points = Math.floor(ads.points / 2);
                        rebalance = Math.floor(ads.balance / 2);
                        break;
                }
            }
            let adstotalpoints = ads.totalpoints - points;
            let adstotalbalance = ads.totalbalance - rebalance;
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
                yield ads_1.updateByUuid(upd, ads.uuid); //广告减积分和零钱
                yield users_ext_1.updatePoints(appUser.uuid, updateUser); //用户加积分零钱和经验
            }
            else {
                points = -1;
                rebalance = -1;
            }
            //修改广告记录
            if (!adslog) { //不存在广告记录
                let newadslog = {
                    aduuid: adsuuid,
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
            /*  if (ads.mold == 'balance' || ads.mold == 'two') {
                 if (rebalance > 100) {
                     let form = {
                         amount: rebalance,
                         description: 'immediate'
                     }
                     let headers = {
                         uuid: loginInfo.getUuid(),
                         token: loginInfo.getToken()
                     }
                     let result = await postAsync({
                         form: form,
                         headers: headers,
                         //url: `https://192.168.0.130/app/api/payment/${loginInfo.getUuid()}`
                         // url: `https://www.shijinsz.net/app/api/payment/${loginInfo.getUuid()}`
                         url: `https://39.108.171.104/app/api/payment/${loginInfo.getUuid()}`
                     })
                     if (result && JSON.parse(result).msg === '已经发送请求！') {
                         let adslogstate = {
                             paytype: 'immediate'
                         }
                         await updateAdslog(adslogstate, adslog.uuid)
                     }
     
                 }
             } */
            ads.totalbalance = ads.totalbalance - rebalance;
            ads.balance = ads.balance;
            ads.allbalance = ads.allbalance;
            ads.totalpoints = ads.totalpoints - points;
            if (questionindex != null && questionindex != undefined) {
                return response_1.createdOk(res, { answers: ads.question_ext[questionindex].answer, points: points + '', balance: rebalance + '', ads: ads });
            }
            else {
                return response_1.createdOk(res, { answers: ads.question.answer, points: points + '', balance: rebalance + '', ads: ads });
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/*answer question*/
exports.router.put('/iosanswer/:adsuuid', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const adsuuid = req.params["adsuuid"];
        let { answer, questionindex } = req.body;
        try {
            //validator.validateCgi({ adsuuid: adsuuid, answer: answer }, adsValidator["answers"])
            let ads = yield ads_1.findByPrimary(adsuuid);
            let answerSet;
            let newAnswerSet;
            let union;
            let intersectionSet;
            if (questionindex === null || questionindex === undefined) { //之前的答题
                answerSet = Array.from(new Set(ads.question.answer));
                newAnswerSet = Array.from(new Set(answer));
                union = yield array_union(answerSet, newAnswerSet);
                intersectionSet = yield array_intersection(answerSet, newAnswerSet);
                //全对用户加points广告totalpoints减广告points
                if (intersectionSet.length === answerSet.length && intersectionSet.length === newAnswerSet.length) {
                    return response_1.createdOk(res, { answers: ads.question.answer, msg: '回答正确', ads: ads });
                }
                else if ((union.length - intersectionSet.length) == (answerSet.length - newAnswerSet.length) && newAnswerSet.length > 0) {
                    return response_1.createdOk(res, { answers: ads.question.answer, msg: '答对部分', ads: ads });
                }
                return response_1.createdOk(res, { answers: ads.question.answer, msg: '回答错误', ads: ads });
            }
            else { //v2.1答题
                answerSet = Array.from(new Set(ads.question_ext[questionindex].answer)); //真确答案
                newAnswerSet = Array.from(new Set(answer)); //回答的答案
                union = yield array_union(answerSet, newAnswerSet); //并集
                intersectionSet = yield array_intersection(answerSet, newAnswerSet); //交集
                //全对用户加points广告totalpoints减广告points
                if (intersectionSet.length === answerSet.length && intersectionSet.length === newAnswerSet.length) {
                    return response_1.createdOk(res, { answers: ads.question_ext[questionindex].answer, msg: '回答正确', ads: ads });
                }
                else if ((union.length - intersectionSet.length) == (answerSet.length - newAnswerSet.length) && newAnswerSet.length > 0) {
                    return response_1.createdOk(res, { answers: ads.question_ext[questionindex].answer, msg: '答对部分', ads: ads });
                }
                return response_1.createdOk(res, { answers: ads.question_ext[questionindex].answer, msg: '回答错误', ads: ads });
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/**
 * 广告点赞(好评)
 */
exports.router.put('/nice/:adsuuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const adsuuid = req.params["adsuuid"];
        try {
            const loginInfo = req.loginInfo;
            yield ads_1.updateNice(adsuuid);
            yield applaud_2.insertApplaud(adsuuid, loginInfo.getUuid(), 'nice');
            return response_1.sendOK(res, { applaud: "nice" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/**
 * 广告踩（差评）
 */
exports.router.put('/low/:adsuuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const adsuuid = req.params["adsuuid"];
        try {
            const loginInfo = req.loginInfo;
            yield ads_1.updateLow(adsuuid);
            yield applaud_2.insertApplaud(adsuuid, loginInfo.getUuid(), 'low');
            return response_1.sendOK(res, { applaud: "low" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/**
 * 取消点赞
 */
exports.router.put('/cancel/:adsuuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { applaud } = req.body;
        const adsuuid = req.params["adsuuid"];
        try {
            const loginInfo = req.loginInfo;
            if (applaud === 'low') {
                yield ads_1.updateApplaud(adsuuid, 1, 0); //减少差评
            }
            else {
                yield ads_1.updateApplaud(adsuuid, 0, 1); //减少好评
            }
            let laud = yield applaud_1.findByUseruuidAndAdsuuid(adsuuid, loginInfo.getUuid()); //点赞记录
            yield applaud_2.deleteByAdsUuid(laud.uuid);
            return response_1.sendOK(res, { applaud: null });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//返回标题图的相对路径
exports.router.get('/:adsuuid/getcoverimage', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let adsuuid = req.params['adsuuid'];
        try {
            //validateCgi({adsuuid : adsuuid} , adscoverValidator.adsuuid);
            let re = yield ads_1.queryCoverpic(adsuuid);
            if (re) {
                return response_1.sendOK(res, { 'data': re });
            }
            return response_1.sendOK(res, { 'data': 'null' });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.post('/:adsuuid/coverimage', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let adsuuid = req.params['adsuuid'];
        try {
            let newPath = yield upload_1.uploadAdsImage(req, {
                uuid: adsuuid,
                glob: resource_1.adsCoverImgOpt.glob,
                tmpDir: resource_1.adsCoverImgOpt.tmpDir,
                maxSize: resource_1.adsCoverImgOpt.maxSize,
                extnames: resource_1.adsCoverImgOpt.extnames,
                maxFiles: resource_1.adsCoverImgOpt.maxFiles,
                targetDir: resource_1.adsCoverImgOpt.targetDir,
                fieldName: resource_1.adsCoverImgOpt.fieldName
            });
            yield ads_1.modifilyCoverpic(adsuuid, newPath);
            return response_1.createdOk(res, { path: newPath });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.delete('/:adsuuid/coverimage', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let mediaName = req.body.mediaName;
        let adsuuid = req.params["adsuuid"];
        try {
            mediaName = path.join(resource_1.adsCoverImgOpt.targetDir, adsuuid, mediaName);
            yield fs_1.removeAsync(mediaName);
            //更新到数据库
            yield ads_1.modifilyCoverpic(adsuuid, null);
            return response_1.deleteOK(res, { msg: "succ" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//没被调用2018-02-05
exports.router.post('/CPCpay', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let adsuuid = req.body.adsuuid;
        try {
            yield ads_1.upadspoints(adsuuid);
            yield ads_ext_1.updateViews(adsuuid);
            yield appAdsPay(req, res, next, adsuuid, '', 'cpc', 'point');
            return response_1.sendOK(res, 'succ');
        }
        catch (e) {
            e.info(res, response_1.sendError, e);
        }
    });
});
//# sourceMappingURL=ads.js.map