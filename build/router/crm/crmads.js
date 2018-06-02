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
const response_1 = require("../../lib/response");
const fs_1 = require("../../lib/fs");
const unit_1 = require("../../model/puton/unit");
const logindao_1 = require("../../redis/logindao");
const upload_1 = require("../../lib/upload");
const ads_1 = require("../../model/ads/ads");
const ads_ext_1 = require("../../model/ads/ads_ext");
const crmuser_1 = require("../../model/ads/crmuser");
const advertiser_1 = require("../../model/ads/advertiser");
const resource_1 = require("../../config/resource");
const winston_1 = require("../../config/winston");
const ads_2 = require("../../model/ads/ads");
const ads_3 = require("../../router/app/ads");
const users_ext_1 = require("../../model/users/users_ext");
const ads_4 = require("../../model/ads/ads");
const unit_2 = require("../../model/puton/unit");
const adsoperation_1 = require("../../router/crm/adsoperation");
const adsoperation_2 = require("../../model/ads/adsoperation");
const path = require("path");
exports.router = express_1.Router();
//取消推荐广告（推荐页）
exports.router.put("/encommentads/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const uuid = req.params["uuid"];
            validator_1.validateCgi({ adsuuid: uuid }, validator_2.adsValidator.UUID);
            let ads = yield ads_1.encommentedads(req.app.locals.sequelize, uuid);
            return response_1.sendOK(res, { ads: ads });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//设为推荐广告（推荐页）
exports.router.put("/commentads/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const uuid = req.params["uuid"];
            const { category, subcategory } = req.body;
            validator_1.validateCgi({ uuid: uuid, category: category, subcategory: subcategory }, validator_2.adsValidator.commetads);
            let ads = yield ads_1.commentedads(req.app.locals.sequelize, category, subcategory, uuid);
            return response_1.sendOK(res, { ads: ads });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//修改推荐广告排列位置
exports.router.patch("/commentads", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { rise, drop } = req.body;
            validator_1.validateCgi({ uuid: drop }, validator_2.adsValidator.uuid);
            validator_1.validateCgi({ uuid: rise, }, validator_2.adsValidator.uuid);
            yield ads_1.updateCommentAds(req.app.locals.sequelize, rise, drop);
            return response_1.sendOK(res, { ads: '修改成功！' });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//推荐广告列表（推荐页）
exports.router.get("/commentlist", /*  checkLogin, */ function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { subcategory } = req.query;
            validator_1.validateCgi({ adsuuid: subcategory }, validator_2.adsValidator.UUID);
            let ads = yield ads_1.encommentedlist(subcategory);
            ads.forEach(r => {
                r.balance = r.balance;
                r.totalbalance = r.totalbalance;
                r.allbalance = r.allbalance;
                r.created = winston_1.timestamps(r.created);
                r.tsrange[0] = winston_1.timestamps(r.tsrange[0]);
                r.tsrange[1] = winston_1.timestamps(r.tsrange[1]);
                r.Ncommentcount = r.ncommentcount;
            });
            return response_1.sendOK(res, { ads: ads });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/*insert 废弃*/
exports.router.post('/ads', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const loginInfo = req.loginInfo;
            if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
                return response_1.sendNoPerm(res);
            }
            let crmUser = yield crmuser_1.findByPrimary(loginInfo.getUuid());
            if (loginInfo.isAdsRW() && !crmUser.mgruuids) {
                return response_1.sendNoPerm(res);
            }
            if (loginInfo.isAdsRW() && !crmUser.mgruuids[0]) {
                return response_1.sendNoPerm(res);
            }
            let company = null;
            let advertiseruuid = null;
            if (crmUser.mgruuids && crmUser.mgruuids.length > 0) {
                let advertiser = yield advertiser_1.findByPrimary(crmUser.mgruuids[0]);
                if (!advertiser)
                    return response_1.sendErrMsg(res, "找不到广告商", 500);
                company = advertiser.company;
                advertiseruuid = advertiser.uuid;
                let adss = yield ads_1.insertAds(req.app.locals.sequelize, company, crmUser.username, advertiseruuid);
                return response_1.createdOk(res, { adss: adss.dataValues });
            }
            return response_1.sendErrMsg(res, "找不到广告商", 500);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/* GET ads by. */
exports.router.get('/ads', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { adtype, state, subtype, start, length, draw, search } = req.query;
        state = state ? state : "";
        adtype = adtype ? adtype : "";
        subtype = subtype ? subtype : "";
        try {
            let searchdata = search.value;
            const loginInfo = req.loginInfo;
            if (loginInfo.isRoot()) {
                validator_1.validateCgi({ start: start, length: length, searchdata: undefined }, validator_2.adsValidator.pagination);
                let advertiseruuids = undefined;
                let recordsFiltered = yield ads_1.getCount(res.app.locals.sequelize, searchdata, state, advertiseruuids);
                let ads = yield ads_1.getByCompany(req.app.locals.sequelize, searchdata, state, advertiseruuids, parseInt(start), parseInt(length));
                for (let i = 0; i < ads.length; i++) {
                    ads[i].created = winston_1.timestamps(ads[i].created);
                    if (ads[i].tsrange != undefined && ads[i].tsrange.length != 0) {
                        ads[i].tsrange[0] = winston_1.timestamps(ads[i].tsrange[0]);
                        ads[i].tsrange[1] = winston_1.timestamps(ads[i].tsrange[1]);
                    }
                }
                return response_1.sendOK(res, { ads: ads, draw: draw, recordsFiltered: recordsFiltered });
            }
            else {
                validator_1.validateCgi({ start: start, length: length, searchdata: undefined }, validator_2.adsValidator.pagination);
                let advertiseruuids = new Array();
                let crmUser = yield crmuser_1.findByPrimary(loginInfo.getUuid());
                if (crmUser.mgruuids) {
                    for (let i = 0; i < crmUser.mgruuids.length; i++) {
                        advertiseruuids.push(crmUser.mgruuids[i]);
                    }
                }
                if (loginInfo.isAdsRO() && !advertiseruuids[0]) {
                    return response_1.sendNoPerm(res);
                }
                if (loginInfo.isAdsRW() && !advertiseruuids[0]) {
                    return response_1.sendNoPerm(res);
                }
                let recordsFiltered = yield ads_1.getCount(res.app.locals.sequelize, searchdata, state, advertiseruuids);
                let ads = yield ads_1.getByCompany(req.app.locals.sequelize, searchdata, state, advertiseruuids, parseInt(start), parseInt(length));
                for (let i = 0; i < ads.length; i++) {
                    ads[i].created = winston_1.timestamps(ads[i].created);
                    if (ads[i].tsrange != undefined && ads[i].tsrange.length != 0) {
                        ads[i].tsrange[0] = winston_1.timestamps(ads[i].tsrange[0]);
                        ads[i].tsrange[1] = winston_1.timestamps(ads[i].tsrange[1]);
                    }
                }
                return response_1.sendOK(res, { ads: ads, draw: draw, recordsFiltered: recordsFiltered });
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//获取banner图
exports.router.get('/banner', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let ads = yield ads_1.getBanner();
            ads.forEach(ads => ads.created = winston_1.timestamps(ads.created));
            return response_1.sendOK(res, { banner: ads });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//设置广告的position
exports.router.put('/position/:adsuuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let { position } = req.body;
            let adsuuid = req.params["adsuuid"];
            yield ads_1.updateByUuid({ position }, adsuuid);
            return response_1.sendOK(res, { msg: "succ" });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
exports.router.put('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let body = req.body;
        let uuid = req.params["uuid"];
        const { title, adtypeuuid, content, sumcontent, typedesc, addressinfo, keyword, address, balance, totalbalance, question, question_ext, option, answer, bonushint, nice, low, subtypeuuid, hot, mold, adsinfourl, points, totalpoint, tsrange, pics, video, virtviews, gooduuid, goodtitle } = body;
        try {
            const loginInfo = req.loginInfo;
            if (virtviews == undefined) {
                validator_1.validateCgi({
                    adsuuid: uuid,
                    title: title,
                    adtypeuuid: adtypeuuid,
                    subtypeuuid: subtypeuuid,
                    typedesc: typedesc,
                    address: address,
                    addressinfo: addressinfo,
                    question: question,
                    question_ext: question_ext,
                    answer: answer,
                    tsrange: tsrange,
                    keyword: keyword,
                    bonushint: bonushint,
                    points: points,
                    totalpoint: totalpoint,
                    nice: parseInt(nice),
                    low: parseInt(low)
                }, validator_2.adsValidator.adsinfo);
            }
            else {
                validator_1.validateCgi({
                    adsuuid: uuid,
                    title: title,
                    adtypeuuid: adtypeuuid,
                    subtypeuuid: subtypeuuid,
                    typedesc: typedesc,
                    address: address,
                    addressinfo: addressinfo,
                    question: question,
                    question_ext: question_ext,
                    answer: answer,
                    tsrange: tsrange,
                    keyword: keyword,
                    bonushint: bonushint,
                    points: points,
                    totalpoint: totalpoint,
                    virtviews: parseInt(virtviews),
                    nice: parseInt(nice),
                    low: parseInt(low),
                }, validator_2.adsValidator.adsinfo);
            }
            let ads = {
                state: 'new',
                title: title,
                content: content,
                sumcontent: sumcontent,
                pics: JSON.parse(pics),
                video: JSON.parse(video),
                category: adtypeuuid,
                subcategory: subtypeuuid,
                typedesc: typedesc,
                address: address,
                newaddress: address,
                addressinfo: addressinfo,
                question: { question: question, option: JSON.parse(option), answer: answer, bonushint: bonushint },
                question_ext: JSON.parse(question_ext),
                keyword: keyword,
                points: parseInt(points),
                // totalpoints: parseInt(totalpoint),
                hot: hot,
                tsrange: JSON.parse(tsrange),
                mold: mold,
                adsinfourl: adsinfourl,
                balance: parseFloat(balance),
                // totalbalance: parseFloat(totalbalance),
                // allbalance: parseFloat(totalbalance),
                // allpoint: parseInt(totalpoint),
                nice: parseInt(nice),
                low: parseInt(low),
                gooduuid: gooduuid === '' ? null : gooduuid,
                goodtitle: goodtitle === '' ? null : goodtitle
            };
            if (loginInfo.isAdminRO() || loginInfo.isAdsRO() /*|| loginInfo.isRoot()*/) {
                return response_1.sendNoPerm(res);
            }
            let adss = yield ads_1.updateByUuid(ads, uuid);
            let advertiser = yield advertiser_1.findByPrimary(adss.advertiseruuid);
            let crmuser = yield crmuser_1.findByPrimary(advertiser.crmuuid);
            let user_ext = yield users_ext_1.findByPrimary(crmuser.uuid);
            if (totalpoint > 0 || totalbalance > 0) {
                if (user_ext.crm_balance > (totalbalance * 100) && user_ext.crm_points > totalpoint) //给这个广告增加总零钱，扣减广告商的积分和零钱
                    yield ads_4.addPointsBalance(req.app.locals.sequelize, uuid, totalbalance, totalpoint, user_ext.uuid);
                else
                    return response_1.sendErrMsg(res, "零钱积分不足", 501);
            }
            //let adss = await updateByUuid(ads, uuid)
            if (virtviews != undefined)
                yield ads_ext_1.upateVirtviews(uuid, parseInt(virtviews));
            let ads_ext = yield ads_ext_1.findByPrimary(uuid);
            return response_1.createdOk(res, { adss: adss, ads_ext: ads_ext });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//修改热门广告排列位置
exports.router.patch("/position", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { rise, drop } = req.body;
            validator_1.validateCgi({ uuid: rise, }, validator_2.adsValidator.uuid);
            validator_1.validateCgi({ uuid: drop }, validator_2.adsValidator.uuid);
            yield ads_1.updateHotAdsPosition(req.app.locals.sequelize, rise, drop);
            return response_1.sendOK(res, { ads: '修改成功！' });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//广告置顶
exports.router.patch("/top/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const uuid = req.params['uuid'];
            validator_1.validateCgi({ uuid: uuid }, validator_2.adsValidator.uuid);
            yield ads_1.adsTop(req.app.locals.sequelize, uuid);
            return response_1.sendOK(res, { ads: '置顶成功！' });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//设为（取消热门广告）热门广告
exports.router.patch("/heat/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const uuid = req.params['uuid'];
            const { heat } = req.body;
            validator_1.validateCgi({ uuid: uuid }, validator_2.adsValidator.uuid);
            let ads = yield ads_1.updateHeat(uuid, parseInt(heat));
            return response_1.sendOK(res, { ads: ads });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.patch('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let body = req.body;
        let { state, rejectmsg } = body;
        let uuid = req.params["uuid"];
        rejectmsg = rejectmsg ? rejectmsg : "";
        try {
            const loginInfo = req.loginInfo;
            validator_1.validateCgi({
                adsuuid: uuid,
                state: state,
                rejectmsg: rejectmsg
            }, validator_2.adsValidator.adsState);
            let ads;
            if (rejectmsg) {
                ads = {
                    state: state,
                    rejectmsg: rejectmsg
                };
            }
            else {
                if (state == "off") {
                    ads = {
                        state: state,
                        banner: 'off',
                        heat: 0
                    };
                }
                else {
                    ads = {
                        state: state,
                    };
                }
            }
            if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
                return response_1.sendNoPerm(res);
            }
            let adss = yield ads_1.updateByUuid(ads, uuid);
            return response_1.createdOk(res, { adss: adss });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/*delete by uuid */
exports.router.delete('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const adsuuid = req.params["uuid"];
        try {
            const loginInfo = req.loginInfo;
            validator_1.validateCgi({ adsuuid: adsuuid }, validator_2.adsValidator.UUID);
            if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
                return response_1.sendNoPerm(res);
            }
            let ads = yield ads_1.delet(adsuuid);
            adsoperation_2.deleteadsByadsuuid(req.app.locals.sequelize, adsuuid);
            return response_1.sendOK(res, { ads: ads });
        }
        catch (e) {
            return response_1.deleteOK(res, e);
        }
    });
});
//获得热门广告列表
exports.router.get("/position", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { start, length, draw, search } = req.query;
        try {
            let searchdata = search.value;
            validator_1.validateCgi({ start: start, length: length, searchdata: searchdata }, validator_2.adsValidator.pagination);
            let recordsFiltered = yield ads_1.getCrmHotCount(req.app.locals.sequelize, searchdata);
            let ads = yield ads_1.getCrmHot(req.app.locals.sequelize, parseInt(start), parseInt(length), searchdata);
            ads.forEach(r => {
                r.tsrange[0] = winston_1.timestamps(r.tsrange[0]);
                r.tsrange[1] = winston_1.timestamps(r.tsrange[1]);
                r.created = winston_1.timestamps(r.created);
            });
            return response_1.sendOK(res, { ads: ads, draw: draw, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/* GET ads info. */
exports.router.get('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const adsuuid = req.params["uuid"];
        try {
            validator_1.validateCgi({ adsuuid: adsuuid }, validator_2.adsValidator.UUID);
            let ads = yield ads_1.findByPrimary(adsuuid);
            if (ads.tsrange && ads.tsrange[0]) {
                ads.tsrange[0] = winston_1.timestamps(ads.tsrange[0]);
                ads.tsrange[1] = winston_1.timestamps(ads.tsrange[1]);
            }
            let ads_ext = yield ads_ext_1.findByPrimary(adsuuid);
            return response_1.sendOK(res, { ads: ads, ads_ext: ads_ext });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.post('/:adsuuid/image', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let adsuuid = req.params["adsuuid"];
        try {
            validator_1.validateCgi({ adsuuid: adsuuid }, validator_2.adsValidator.UUID);
            let newPath = yield upload_1.uploadAdsImage(req, {
                uuid: adsuuid,
                glob: resource_1.adsImgOpt.glob,
                tmpDir: resource_1.adsImgOpt.tmpDir,
                maxSize: resource_1.adsImgOpt.maxSize,
                extnames: resource_1.adsImgOpt.extnames,
                maxFiles: resource_1.adsImgOpt.maxFiles,
                targetDir: resource_1.adsImgOpt.targetDir,
                fieldName: resource_1.adsImgOpt.fieldName,
            });
            let ads = yield ads_1.findByPrimary(adsuuid);
            ads.pics = ads.pics ? ads.pics : [];
            ads.pics.push(newPath);
            let adss = yield ads_1.modifilyPics(adsuuid, ads.pics);
            return response_1.createdOk(res, { path: newPath, pics: adss.pics });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.post('/:adsuuid/movie', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let adsuuid = req.params["adsuuid"];
        try {
            validator_1.validateCgi({ adsuuid: adsuuid }, validator_2.adsValidator.UUID);
            let newPath = yield upload_1.uploadAdsMovie(req, {
                uuid: adsuuid,
                glob: resource_1.adsMovOpt.glob,
                tmpDir: resource_1.adsMovOpt.tmpDir,
                maxSize: resource_1.adsMovOpt.maxSize,
                extnames: resource_1.adsMovOpt.extnames,
                maxFiles: resource_1.adsMovOpt.maxFiles,
                targetDir: resource_1.adsMovOpt.targetDir,
                fieldName: resource_1.adsMovOpt.fieldName,
            });
            let ads = yield ads_1.findByPrimary(adsuuid);
            ads.video = ads.video ? ads.video : [];
            ads.video.push(newPath);
            let adss = yield ads_1.modifilyVideo(adsuuid, ads.video);
            return response_1.createdOk(res, { path: newPath, adss: adss });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
function listAdsFiles(req, res, opt) {
    return __awaiter(this, void 0, void 0, function* () {
        let adsuuid = req.params["adsuuid"];
        try {
            validator_1.validateCgi({ adsuuid: adsuuid }, validator_2.adsValidator.UUID);
            let pattern = path.join(opt.targetDir, adsuuid, opt.glob);
            let files = yield fs_1.listFilesAsync(pattern);
            for (let i = 0; i < files.length; i++) {
                files[i] = files[i].substr(opt.targetDir.length + 1);
            }
            return response_1.sendOK(res, { files: files });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
}
exports.router.get('/:adsuuid/movie', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        return listAdsFiles(req, res, resource_1.adsMovOpt);
    });
});
exports.router.get('/:adsuuid/image', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        return listAdsFiles(req, res, resource_1.adsImgOpt);
    });
});
exports.router.delete('/:adsuuid/image', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { mediaName, pics } = req.body;
        let adsuuid = req.params["adsuuid"];
        try {
            validator_1.validateCgi({ adsuuid: adsuuid }, validator_2.adsValidator.UUID);
            mediaName = path.join(resource_1.adsImgOpt.targetDir, adsuuid, mediaName);
            yield fs_1.removeAsync(mediaName);
            yield ads_1.modifilyPics(adsuuid, JSON.parse(pics));
            return response_1.sendOK(res, { msg: "删除成功" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.delete('/:adsuuid/movie', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let mediaName = req.body.mediaName;
        let adsuuid = req.params["adsuuid"];
        try {
            validator_1.validateCgi({ adsuuid: adsuuid }, validator_2.adsValidator.UUID);
            mediaName = path.join(resource_1.adsMovOpt.targetDir, adsuuid, mediaName);
            yield fs_1.removeAsync(mediaName);
            yield ads_1.modifilyVideo(adsuuid, null);
            return response_1.sendOK(res, {});
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.delete('/banner/:adsuuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const adsuuid = req.params["adsuuid"];
        try {
            const loginInfo = req.loginInfo;
            validator_1.validateCgi({ adsuuid: adsuuid }, validator_2.adsValidator.UUID);
            if (loginInfo.isAdminRO() || loginInfo.isAdsRO() || loginInfo.isAdsRW()) {
                return response_1.sendNoPerm(res);
            }
            yield ads_1.deleteBanner(adsuuid);
            return response_1.sendOK(res, { move: "OK" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.put('/banner/:adsuuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const adsuuid = req.params["adsuuid"];
        try {
            const loginInfo = req.loginInfo;
            validator_1.validateCgi({ adsuuid: adsuuid }, validator_2.adsValidator.UUID);
            if (loginInfo.isAdminRO() || loginInfo.isAdsRO() || loginInfo.isAdsRW()) {
                return response_1.sendNoPerm(res);
            }
            let ads = yield ads_1.findByPrimary(adsuuid);
            if (ads.status == 0) {
                return response_1.sendOK(res, { data: "noopen" });
            }
            let adss = yield ads_1.getBanner();
            if (adss.length < 10) {
                yield ads_1.updateBanner(adsuuid);
                return response_1.sendOK(res, { add: "OK" });
            }
            return response_1.sendOK(res, { add: "false" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.patch("/:uuid/mgruuids", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const uuid = req.params["uuid"];
            const { mgruuids } = req.body;
            validator_1.validateCgi({ uuid: uuid, mgruuids: mgruuids }, validator_2.adsValidator.mgruuids);
            let mgruuid = JSON.parse(mgruuids);
            let crmuser = yield crmuser_1.inserMgruuids(uuid, mgruuid);
            return response_1.sendOK(res, { crmuser: crmuser });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.post('/NadscommentSort', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let adsuuid = req.body.adsuuid;
        let Ncommentcount = req.body.Ncommentcount;
        try {
            yield ads_2.updateAdsCommentsort(adsuuid, Ncommentcount);
            return response_1.sendOK(res, { 'data': 'succ' });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//新的提交广告的接口,加了虚拟点击
exports.router.post('/puton/updateAds', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
            return response_1.sendNoPerm(res);
        }
        let { adsuuid, title, description, url, quesMsg, type, awards, method, keyword, views, nice, gooduuid, goodtitle, sumcontent, pic_mode, showamount, pointmount, isads, low } = req.body;
        let click = pointmount;
        let state = 'wait-ack';
        try {
            let advertiseruuid = yield ads_2.queryadvertiserByadsuuid(req.app.locals.sequelize, adsuuid);
            type = JSON.parse(type);
            awards = JSON.parse(awards);
            let category = type.adtype;
            let subcategory = type.subtype;
            let point = 0, allpoint = 0, balance = 0, allbalance = 0, mold = '';
            let date = new Date();
            let date1 = new Date(1);
            let tsrange = [];
            tsrange.push(date1.toLocaleString());
            tsrange.push(date.toLocaleString());
            if (awards.point.length != 0) {
                point = awards.point[0];
                allpoint = awards.point[1];
                mold = 'point';
            }
            else if (awards.cash.length != 0) {
                balance = awards.cash[0];
                allbalance = awards.cash[1];
                mold = 'balance';
            }
            else {
                point = awards.two[0][0];
                allpoint = awards.two[0][1];
                balance = awards.two[1][0];
                allbalance = awards.two[1][1];
                mold = 'two';
            }
            if (method == 'cpe') {
                if (mold == 'point' || mold == 'two') {
                    if (point == 0 || point == undefined)
                        return response_1.sendErrMsg(res, "积分有误", 500);
                    if (allpoint == 0 || allpoint == undefined)
                        return response_1.sendErrMsg(res, "总积分有误", 500);
                }
                if (mold == 'balance' || mold == 'two') {
                    if (balance == 0 || balance == undefined)
                        return response_1.sendErrMsg(res, "零钱有误", 500);
                    if (allbalance == 0 || allbalance == undefined)
                        return response_1.sendErrMsg(res, "总零钱有误", 500);
                }
            }
            let ads;
            if (loginInfo.isRoot()) {
                if (method == 'cpe') {
                    ads = {
                        title: title,
                        description: description,
                        adsinfourl: url,
                        question_ext: quesMsg,
                        category: category,
                        subcategory: subcategory,
                        points: point,
                        balance: balance,
                        low: low,
                        nice: nice,
                        gooduuid: gooduuid,
                        showamount: showamount,
                        sumcontent: sumcontent,
                        goodtitle: goodtitle,
                        state: state,
                        advertiseruuid: advertiseruuid[0].advertiseruuid,
                        pointmount: click,
                        keyword: keyword,
                        deleted: 0,
                        pic_mode: pic_mode,
                        tsrange: tsrange,
                        mold: mold,
                        status: 0,
                        isads: isads,
                        commentcatg: null,
                        commentsubcatg: null //推荐广告小类备份字段
                    };
                    if (gooduuid == '' || goodtitle == '') {
                        delete ads.goodtitle;
                        delete ads.gooduuid;
                    }
                    ads.question_ext = JSON.parse(quesMsg);
                }
                else if (method == 'cpm') {
                    ads = {
                        title: title,
                        description: description,
                        adsinfourl: url,
                        question_ext: quesMsg,
                        category: category,
                        subcategory: subcategory,
                        keyword: keyword,
                        low: low,
                        nice: nice,
                        gooduuid: gooduuid,
                        sumcontent: sumcontent,
                        goodtitle: goodtitle,
                        showamount: showamount,
                        state: state,
                        advertiseruuid: advertiseruuid[0].advertiseruuid,
                        deleted: 0,
                        pointmount: click,
                        pic_mode: pic_mode,
                        tsrange: tsrange,
                        status: 0,
                        isads: isads,
                        commentcatg: null,
                        commentsubcatg: null //推荐广告小类备份字段
                    };
                    if (gooduuid == '' || goodtitle == '') {
                        delete ads.goodtitle;
                        delete ads.gooduuid;
                    }
                    ads.question_ext = JSON.parse(quesMsg);
                }
                else if (method == 'cpc') {
                    ads = {
                        title: title,
                        description: description,
                        adsinfourl: url,
                        category: category,
                        subcategory: subcategory,
                        question_ext: quesMsg,
                        keyword: keyword,
                        low: low,
                        nice: nice,
                        gooduuid: gooduuid,
                        sumcontent: sumcontent,
                        goodtitle: goodtitle,
                        showamount: showamount,
                        state: state,
                        advertiseruuid: advertiseruuid[0].advertiseruuid,
                        deleted: 0,
                        pointmount: click,
                        pic_mode: pic_mode,
                        tsrange: tsrange,
                        status: 0,
                        isads: isads,
                        commentcatg: null,
                        commentsubcatg: null,
                    };
                    if (gooduuid == '' || goodtitle == '') {
                        delete ads.goodtitle;
                        delete ads.gooduuid;
                    }
                    ads.question_ext = JSON.parse(quesMsg);
                }
                let oldads = yield ads_1.queryPutonadsByuuid(adsuuid);
                adsoperation_1.operationAcount(ads.showamount, ads.pointmount, adsuuid);
                ads.pointmount = parseInt(ads.pointmount) + parseInt(oldads.pointmount);
                ads.showamount = parseInt(ads.showamount) + parseInt(oldads.showamount);
            }
            else {
                if (method == 'cpe') {
                    ads = {
                        title: title,
                        description: description,
                        adsinfourl: url,
                        question_ext: quesMsg,
                        category: category,
                        subcategory: subcategory,
                        points: point,
                        balance: balance,
                        gooduuid: gooduuid,
                        sumcontent: sumcontent,
                        goodtitle: goodtitle,
                        state: state,
                        advertiseruuid: advertiseruuid[0].advertiseruuid,
                        keyword: keyword,
                        deleted: 0,
                        pic_mode: pic_mode,
                        tsrange: tsrange,
                        mold: mold,
                        status: 0,
                        isads: isads,
                        commentcatg: null,
                        commentsubcatg: null //推荐广告小类备份字段
                    };
                    if (gooduuid == '' || goodtitle == '') {
                        delete ads.goodtitle;
                        delete ads.gooduuid;
                    }
                    ads.question_ext = JSON.parse(quesMsg);
                }
                else if (method == 'cpm') {
                    ads = {
                        title: title,
                        description: description,
                        adsinfourl: url,
                        question_ext: quesMsg,
                        category: category,
                        subcategory: subcategory,
                        keyword: keyword,
                        gooduuid: gooduuid,
                        sumcontent: sumcontent,
                        goodtitle: goodtitle,
                        state: state,
                        advertiseruuid: advertiseruuid[0].advertiseruuid,
                        deleted: 0,
                        pic_mode: pic_mode,
                        tsrange: tsrange,
                        status: 0,
                        isads: isads,
                        commentcatg: null,
                        commentsubcatg: null //推荐广告小类备份字段
                    };
                    if (gooduuid == '' || goodtitle == '') {
                        delete ads.goodtitle;
                        delete ads.gooduuid;
                    }
                    ads.question_ext = JSON.parse(quesMsg);
                }
                else if (method == 'cpc') {
                    ads = {
                        title: title,
                        description: description,
                        adsinfourl: url,
                        category: category,
                        subcategory: subcategory,
                        question_ext: quesMsg,
                        keyword: keyword,
                        gooduuid: gooduuid,
                        sumcontent: sumcontent,
                        goodtitle: goodtitle,
                        state: state,
                        advertiseruuid: advertiseruuid[0].advertiseruuid,
                        deleted: 0,
                        pic_mode: pic_mode,
                        tsrange: tsrange,
                        status: 0,
                        isads: isads,
                        commentcatg: null,
                        commentsubcatg: null //推荐广告小类备份字段
                    };
                    if (gooduuid == '' || goodtitle == '') {
                        delete ads.goodtitle;
                        delete ads.gooduuid;
                    }
                    ads.question_ext = JSON.parse(quesMsg);
                }
            }
            let adss = yield ads_1.findByPrimary(adsuuid);
            let advertiser = yield advertiser_1.findByPrimary(advertiseruuid[0].advertiseruuid);
            let crmuser = yield crmuser_1.findByPrimary(advertiser.crmuuid);
            let user_ext = yield users_ext_1.findByPrimary(crmuser.uuid);
            let result = undefined;
            if (allbalance > 0 || allpoint > 0) {
                result = yield ads_4.addPointsBalance(req.app.locals.sequelize, adss.uuid, allbalance, allpoint, user_ext.uuid);
                if (result)
                    adss = yield ads_1.updatePutonads(adsuuid, ads);
                else
                    return response_1.sendErrMsg(res, "积分或者零钱不足", 501);
            }
            else {
                yield ads_1.updatePutonads(adsuuid, ads);
            }
            crmadsPay(req, adsuuid, parseInt((showamount / 1000).toString()), "show");
            crmadsPay(req, adsuuid, click, "point");
            if (loginInfo.isRoot()) {
                ads_ext_1.upateVirtviews(adsuuid, views);
            }
            return response_1.sendOK(res, adss);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/puton/getAdsByuuid', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let adsuuid = req.query.adsuuid;
        try {
            //let view = await findByPrimary(adsuuid)
            let re = yield ads_1.queryPutonadsByuuid(adsuuid);
            let unit = yield unit_1.queryunitone(re.unituuid);
            let view = yield ads_ext_1.findByPrimary(adsuuid);
            //in:[{"answer": ["1"], "option": ["1", "2", "3", "4"], "question": "1"}, {"answer": ["a", "b"], "option": ["a", "b", "c", "d"], "question": "ab"}]
            //our:[{question:'题目标题',"option":['a,'b','c','d'],"answer":'abcd'},{}]
            let quesarr = [];
            if (re.question_ext != undefined) {
                for (let i = 0; i < re.question_ext.length; i++) {
                    let answerarr = [];
                    for (let j = 0; j < re.question_ext[i].answer.length; j++) {
                        for (let x = 0; x < re.question_ext[i].option.length; x++) {
                            if (re.question_ext[i].option[x] == re.question_ext[i].answer[j]) {
                                if (x == 0) {
                                    answerarr.push('a');
                                }
                                else if (x == 1) {
                                    answerarr.push('b');
                                }
                                else if (x == 2) {
                                    answerarr.push('c');
                                }
                                else if (x == 3) {
                                    answerarr.push('d');
                                }
                            }
                        }
                    }
                    let obj = {
                        'question': re.question_ext[i].questions,
                        'option': re.question_ext[i].option,
                        'answer': answerarr
                    };
                    quesarr.push(obj);
                }
            }
            re.quesMsg_ext = quesarr;
            let cash = [];
            let point = [];
            let two = [];
            let awards = { cash, point, two };
            if (!re.points || !re.allpoint) {
                let two_cash = [];
                let two_point = [];
                cash.push(re.balance);
                cash.push(re.allbalance);
                awards.cash = cash;
                awards.two.push(two_cash);
                awards.two.push(two_point);
            }
            else if (!re.balance || !re.balance) {
                let two_cash = [];
                let two_point = [];
                point.push(re.points);
                point.push(re.allpoint);
                awards.point = point;
                awards.two.push(two_cash);
                awards.two.push(two_point);
            }
            else {
                let two_cash = [];
                let two_point = [];
                two_cash.push(re.balance);
                two_cash.push(re.allbalance);
                two_point.push(re.points);
                two_point.push(re.allpoint);
                awards.two.push(two_point);
                awards.two.push(two_cash);
            }
            re.awards = awards;
            let parentname = yield ads_2.queryplanunitByadsuuid(req.app.locals.sequelize, adsuuid);
            return response_1.sendOK(res, { re, unit, parentname: parentname[0], view: view.virtviews });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.post('/puton/updateadsStatus', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
            return response_1.sendNoPerm(res);
        }
        let { adsuuid, status } = req.body;
        try {
            if (parseInt(status) == 1) {
                let ads = yield ads_1.queryPutonadsByuuid(adsuuid);
                if (ads.state == 'on') {
                    if (!(yield ads_3.checkads(req, res, next, adsuuid))) {
                        yield ads_2.updateadsStatus(adsuuid, 0);
                        return response_1.sendOK(res, "notallow");
                    }
                    else {
                        let unit = yield unit_2.queryunitByadsuuid(req.app.locals.sequelize, adsuuid);
                        let plan = yield unit_2.queryplanByunituuid(req.app.locals.sequelize, unit.uuid);
                        if (unit.status != 1 || plan[0].status != 1) {
                            yield ads_2.updateadsStatus(adsuuid, 0);
                            return response_1.sendOK(res, "notxxx");
                        }
                        yield ads_2.updateadsStatus(adsuuid, 1);
                    }
                }
                else if (ads.state == 'wait-ack') {
                    return response_1.sendOK(res, "notread");
                }
            }
            else {
                yield ads_2.updateadsStatus(adsuuid, 0);
            }
            return response_1.sendOK(res, "succ");
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//预先新增一个广告
exports.router.get('/:unituuid/Outnewads', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let unituuid = req.params['unituuid'];
        try {
            let plan = yield unit_2.queryplanByunituuid(req.app.locals.sequelize, unituuid);
            let unit = yield unit_1.queryunitone(unituuid);
            if (plan[0].advertiseruuid == null) {
                return response_1.sendErrMsg(res, "找不到广告商", 500);
            }
            else {
                let advertiser = yield advertiser_1.findByPrimary(plan[0].advertiseruuid);
                if (!advertiser)
                    return response_1.sendErrMsg(res, "找不到广告商", 500);
                let crmuser = yield crmuser_1.findByPrimary(advertiser.crmuuid);
                if (!crmuser)
                    return response_1.sendErrMsg(res, "广告商crm帐号不存在", 500);
                let ads = yield ads_4.insertBeforePutonads(req.app.locals.sequelize, '个人用户', unituuid, advertiser, crmuser.username);
                return response_1.sendOK(res, { "unit": unit, "ads": ads.get() });
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.post('/:adsuuid/:index/coverimage', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
            return response_1.sendNoPerm(res);
        }
        let adsuuid = req.params['adsuuid'];
        let index = req.params['index'];
        index = parseInt(index); //上传的位置，in(0, 1, 2)
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
            let ads = yield ads_1.findByPrimary(adsuuid);
            ads.coverpic = ads.coverpic == null ? [] : ads.coverpic;
            ads.coverpic.splice(index, 0, newPath); //把图片路径插到指定的index
            let adss = yield ads_1.modifilyCoverpic(adsuuid, ads.coverpic);
            return response_1.createdOk(res, { path: newPath, pics: adss.coverpic });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.delete('/:adsuuid/coverimage', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
            return response_1.sendNoPerm(res);
        }
        let mediaName = req.body.mediaName;
        let adsuuid = req.params["adsuuid"];
        try {
            mediaName = path.join(resource_1.adsCoverImgOpt.targetDir, adsuuid, mediaName);
            yield fs_1.removeAsync(mediaName);
            let ads = yield ads_1.findByPrimary(adsuuid);
            let coverArr = [];
            for (let i = 0; i < ads.coverpic.length; i++) {
                if (-1 == mediaName.indexOf(ads.coverpic[i].split('/')[1])) {
                    coverArr.push(ads.coverpic[i]);
                }
            }
            //更新到数据库
            yield ads_1.modifilyCoverpic(adsuuid, coverArr);
            return response_1.deleteOK(res, { msg: "succ" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
function crmadsPay(req, adsuuid, amount, method) {
    return __awaiter(this, void 0, void 0, function* () {
        let ads = yield ads_1.queryBalanceByadsuuid(req.app.locals.sequelize, adsuuid);
        let bid = yield ads_1.queryBidByadsuuid(req.app.locals.sequelize, adsuuid);
        let dailybudget = yield advertiser_1.finddailybudgetByuuid(ads[0].advertiseruuid);
        let unitmethod = yield ads_2.queryunitByadauuid(req.app.locals.sequelize, adsuuid);
        if (dailybudget.dailybudget == -1) {
            let money = parseFloat(ads[0].crm_balance) - parseFloat(bid[0].bid) * 100 * amount;
            if (unitmethod[0].method == 'cpc' && method == "point") {
                yield ads_1.updateBalanceByadsuuid(req.app.locals.sequelize, adsuuid, money);
            }
            else if (unitmethod[0].method == 'cpm' && method == "show") {
                yield ads_1.updateBalanceByadsuuid(req.app.locals.sequelize, adsuuid, money);
            }
            else if (unitmethod[0].method == 'cpe') {
                if (method == "point") {
                    yield ads_1.updateBalanceByadsuuid(req.app.locals.sequelize, adsuuid, money);
                }
                else if (method == "show") {
                    yield ads_1.updateBalanceByadsuuid(req.app.locals.sequelize, adsuuid, money);
                }
            }
        }
        else {
            if (dailybudget.tempdailybudget > 0) {
                let tempmoney = (dailybudget.dailybudget * dailybudget.tempdailybudget / 100) - parseFloat(bid[0].bid) * amount;
                let money = 0;
                if (tempmoney <= 0) {
                    money = parseFloat(ads[0].crm_balance) - dailybudget.dailybudget * dailybudget.tempdailybudget / 100;
                    ads_2.updateadsStatus(adsuuid, 0);
                }
                else {
                    money = parseFloat(ads[0].crm_balance) - parseFloat(bid[0].bid) * 100 * amount;
                }
                if (unitmethod[0].method == 'cpc' && method == "point") {
                    yield ads_1.updateBalanceByadsuuid(req.app.locals.sequelize, adsuuid, money);
                }
                else if (unitmethod[0].method == 'cpm' && method == "show") {
                    yield ads_1.updateBalanceByadsuuid(req.app.locals.sequelize, adsuuid, money);
                }
                else if (unitmethod[0].method == 'cpe') {
                    if (method == "point") {
                        yield ads_1.updateBalanceByadsuuid(req.app.locals.sequelize, adsuuid, money);
                    }
                    else if (method == "show") {
                        yield ads_1.updateBalanceByadsuuid(req.app.locals.sequelize, adsuuid, money);
                    }
                }
            }
        }
    });
}
//# sourceMappingURL=crmads.js.map