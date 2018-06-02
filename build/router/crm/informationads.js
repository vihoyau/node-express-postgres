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
const logindao_1 = require("../../redis/logindao");
const upload_1 = require("../../lib/upload");
const advertiser_1 = require("../../model/ads/advertiser");
const winston_1 = require("../../config/winston");
const informationads_1 = require("../../model/ads/informationads");
const infocomment_1 = require("../../model/ads/infocomment");
const users_ext_1 = require("../../model/users/users_ext");
const crmuser_1 = require("../../model/ads/crmuser");
const informationcategory_1 = require("../../model/ads/informationcategory");
const resource_1 = require("../../config/resource");
const path = require("path");
exports.router = express_1.Router();
//新建一个资讯类
exports.router.post('/category', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { name, pic, position } = req.body;
        validator_1.validateCgi({ name, pic, position }, validator_2.infoValidator.newInfoCate);
        try {
            const info = req.loginInfo;
            if (!info.isAdvertiserRW() && !info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            yield informationcategory_1.createInfoCate({ name, pic, position });
            return response_1.sendOK(res, { msg: "创建成功" });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//上传资讯类图片
exports.router.post('/catePic', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let newPath = yield upload_1.uploadinfoImage(req, {
                glob: resource_1.infoCateImgOpt.glob,
                tmpDir: resource_1.infoCateImgOpt.tmpDir,
                maxSize: resource_1.infoCateImgOpt.maxSize,
                extnames: resource_1.infoCateImgOpt.extnames,
                maxFiles: resource_1.infoCateImgOpt.maxFiles,
                targetDir: resource_1.infoCateImgOpt.targetDir,
                fieldName: resource_1.infoCateImgOpt.fieldName,
            });
            return response_1.createdOk(res, { path: newPath });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//删除资讯类图片
exports.router.delete('/delInfoCataPic', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { uuid, mediaName } = req.body;
        try {
            mediaName = path.join(resource_1.infoCateImgOpt.targetDir, mediaName);
            yield fs_1.removeAsync(mediaName);
            yield informationcategory_1.updateInfoCate(uuid, { pic: "" });
            return response_1.sendOK(res, { msg: "succ" });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//删除一个资讯类
exports.router.delete("/info", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { uuid } = req.body;
        validator_1.validateCgi({ adsuuid: uuid }, validator_2.infoValidator.UUID);
        try {
            const info = req.loginInfo;
            if (!info.isAdvertiserRW() && !info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            yield informationcategory_1.delInfoCate(uuid);
            return response_1.sendOK(res, { msg: "删除成功" });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//修改一个资讯类
exports.router.put("/updateInfoCate", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { uuid, name, pic, position } = req.body;
        validator_1.validateCgi({ uuid, name, pic, position }, validator_2.infoValidator.updateInfoCate);
        try {
            const info = req.loginInfo;
            if (!info.isAdvertiserRW() && !info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            yield informationcategory_1.updateInfoCate(uuid, { name, pic, position });
            return response_1.sendOK(res, { msg: "修改成功" });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//修改一个资讯类下标
exports.router.put("/updatePosition", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { uuid, position } = req.body;
        validator_1.validateCgi({ uuid, position }, validator_2.infoValidator.updatePositon);
        try {
            const info = req.loginInfo;
            if (!info.isAdvertiserRW() && !info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            yield informationcategory_1.updateInfoCate(uuid, { position });
            return response_1.sendOK(res, { msg: "修改成功" });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//查询全部的资讯类，量少不做分页
exports.router.get("/infoCate", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let arr = yield informationcategory_1.getAllInfoCate();
        return response_1.sendOK(res, { arr });
    });
});
//查看资讯
exports.router.get('/info', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { adtype, state, start, length, draw, search } = req.query;
        state = state ? state : "";
        adtype = adtype ? adtype : "";
        try {
            const loginInfo = req.loginInfo;
            if (loginInfo.isAdsRO() || loginInfo.isAdsRW()) {
                return response_1.sendNoPerm(res);
            }
            let searchdata = search.value;
            if (loginInfo.isRoot()) {
                validator_1.validateCgi({ start: start, length: length, searchdata: undefined }, validator_2.infoValidator.pagination);
                let company = undefined;
                let recordsFiltered = yield informationads_1.getCount(res.app.locals.sequelize, searchdata, state, company);
                let ads = yield informationads_1.getByCompany(req.app.locals.sequelize, searchdata, state, company, parseInt(start), parseInt(length));
                ads.forEach(r => {
                    r.created = winston_1.timestamps(r.created);
                });
                return response_1.sendOK(res, { ads: ads, draw: draw, recordsFiltered: recordsFiltered });
            }
            else {
                validator_1.validateCgi({ start: start, length: length, searchdata: undefined }, validator_2.infoValidator.pagination);
                let advertiseruuid = new Array();
                let advertiser;
                let crmUser = yield crmuser_1.findByPrimary(loginInfo.getUuid());
                if (crmUser.mgruuids) {
                    for (let i = 0; i < crmUser.mgruuids.length; i++) {
                        advertiser = yield advertiser_1.findByPrimary(crmUser.mgruuids[i]);
                        if (advertiser) {
                            advertiseruuid.push(advertiser.uuid);
                        }
                    }
                }
                let recordsFiltered = yield informationads_1.getCount2(res.app.locals.sequelize, searchdata, state, advertiseruuid);
                let ads = yield informationads_1.getByAdvertiseruuid(req.app.locals.sequelize, searchdata, state, advertiseruuid, parseInt(start), parseInt(length));
                ads.forEach(r => {
                    r.created = winston_1.timestamps(r.created);
                });
                return response_1.sendOK(res, { ads: ads, draw: draw, recordsFiltered: recordsFiltered });
            }
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//预先 增加一条资讯
exports.router.post('/ads', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const loginInfo = req.loginInfo;
            if (!loginInfo.isAdvertiserRW()) {
                return response_1.sendNoPerm(res);
            }
            let crmUser = yield crmuser_1.findByPrimary(loginInfo.getUuid());
            if (!crmUser.mgruuids) {
                return response_1.sendNoPerm(res);
            }
            if (!crmUser.mgruuids[0]) {
                return response_1.sendNoPerm(res);
            }
            let company = null;
            let advertiseruuid = null;
            if (crmUser.mgruuids && crmUser.mgruuids.length > 0) {
                let advertiser = null;
                for (let i = 0; i < crmUser.mgruuids.length; i++) {
                    advertiser = yield advertiser_1.findByPrimary(crmUser.mgruuids[i]);
                    if (advertiser)
                        break;
                }
                if (!advertiser)
                    return response_1.sendErrMsg(res, "找不到广告商", 500);
                company = advertiser.company;
                advertiseruuid = advertiser.uuid;
                let adss = yield informationads_1.insertInfoAds(req.app.locals.sequelize, company, crmUser.username, advertiseruuid);
                return response_1.createdOk(res, adss);
            }
            return response_1.sendErrMsg(res, "找不到广告商", 500);
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//修改资讯
exports.router.put('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let body = req.body;
        let uuid = req.params["uuid"];
        let { title, content, sumcontent, address, addressinfo, balance, addbalance, question_ext, nice, low, category, coverpic, adsinfourl, points, addpoints, pics, video, mold, banner, pic_mode } = body;
        let state = 'wait-ack';
        addpoints = addpoints ? addpoints : 0;
        addbalance = addbalance ? addbalance : 0;
        points = points ? points : 0;
        balance = balance ? balance : 0;
        pics = pics ? pics : "[]";
        video = video ? video : "[]";
        question_ext = question_ext ? question_ext : "{}";
        coverpic = coverpic ? coverpic : "[]";
        address = address ? address : "{}";
        nice = nice ? nice : 0;
        low = low ? low : 0;
        banner = banner ? banner : 'off';
        pic_mode = pic_mode ? pic_mode : 'big';
        addressinfo = addressinfo ? addressinfo : "default";
        adsinfourl = adsinfourl ? adsinfourl : "default";
        mold = mold ? mold : "balance";
        validator_1.validateCgi({
            uuid, title, category, content, addressinfo, adsinfourl,
            points, addpoints, addbalance, nice, low, sumcontent, mold, banner, pic_mode
        }, validator_2.infoValidator.infoUpdate);
        try {
            const loginInfo = req.loginInfo;
            let ads = {
                state,
                title,
                content,
                sumcontent,
                pics: JSON.parse(pics),
                video: JSON.parse(video),
                category,
                coverpic: JSON.parse(coverpic),
                address: JSON.parse(address),
                addressinfo,
                question_ext: JSON.parse(question_ext),
                points: parseInt(points),
                adsinfourl: adsinfourl,
                balance: parseFloat(balance),
                nice: parseInt(nice),
                low: parseInt(low),
                banner,
                pic_mode,
                mold
            };
            if (!loginInfo.isAdvertiserRW())
                return response_1.sendNoPerm(res);
            let info = yield informationads_1.updateByUuid(ads, uuid);
            let advertiser = yield advertiser_1.findByPrimary(info.advertiseruuid);
            let crmuser = yield crmuser_1.findByPrimary(advertiser.crmuuid);
            let user_ext = yield users_ext_1.findByPrimary(crmuser.uuid);
            addbalance = parseFloat(addbalance);
            addpoints = parseFloat(addpoints);
            if (addbalance > 0 || addpoints > 0) {
                if (user_ext.crm_balance > (addbalance * 100) && user_ext.crm_points > addpoints) //给这个资讯增加总零钱，扣减广告商的积分和零钱
                    yield informationads_1.addPointsBalance(req.app.locals.sequelize, uuid, addbalance, addpoints, user_ext.uuid);
                else
                    return response_1.sendErrMsg(res, "零钱积分不足", 501);
            }
            return response_1.createdOk(res, info);
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//删除一个资讯
exports.router.delete('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const infouuid = req.params["uuid"];
        try {
            const loginInfo = req.loginInfo;
            validator_1.validateCgi({ adsuuid: infouuid }, validator_2.infoValidator.UUID);
            if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
                return response_1.sendNoPerm(res);
            }
            yield informationads_1.delet(infouuid);
            return response_1.sendOK(res, { ads: "succ" });
        }
        catch (e) {
            return response_1.deleteOK(res, e);
        }
    });
});
//审核一个资讯，审核通过则直接能再app看到，不用再自行投放
exports.router.patch('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let body = req.body;
        let { state, rejectmsg } = body;
        let uuid = req.params["uuid"];
        rejectmsg = rejectmsg ? rejectmsg : "";
        validator_1.validateCgi({ adsuuid: uuid, state, rejectmsg }, validator_2.infoValidator.adsState);
        try {
            const loginInfo = req.loginInfo;
            if (loginInfo.isAdminRO() || loginInfo.isAdsRO())
                return response_1.sendNoPerm(res);
            let ads = rejectmsg ? { state, rejectmsg } : { state };
            let adss = yield informationads_1.updateByUuid(ads, uuid);
            return response_1.createdOk(res, adss);
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//上传资讯封面图片
exports.router.post('/:infouuid/:index/coverimage', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
            return response_1.sendNoPerm(res);
        }
        let infouuid = req.params['infouuid'];
        let index = req.params['index'];
        index = parseInt(index); //上传的位置，in(0, 1, 2)
        try {
            let newPath = yield upload_1.uploadAdsImage(req, {
                uuid: infouuid,
                glob: resource_1.infoCoverImgOpt.glob,
                tmpDir: resource_1.infoCoverImgOpt.tmpDir,
                maxSize: resource_1.infoCoverImgOpt.maxSize,
                extnames: resource_1.infoCoverImgOpt.extnames,
                maxFiles: resource_1.infoCoverImgOpt.maxFiles,
                targetDir: resource_1.infoCoverImgOpt.targetDir,
                fieldName: resource_1.infoCoverImgOpt.fieldName
            });
            let info = yield informationads_1.findByPrimarys(infouuid);
            info.coverpic = info.coverpic == null ? [] : info.coverpic;
            info.coverpic.splice(index, 0, newPath); //把图片路径插到指定的index
            yield informationads_1.modifilyCoverpic(infouuid, info.coverpic);
            return response_1.createdOk(res, { path: newPath, pics: info.coverpic });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//删除资讯封面图片
exports.router.delete('/:infouuid/coverimage', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        if (loginInfo.isAdminRO() || loginInfo.isAdsRO())
            return response_1.sendNoPerm(res);
        let mediaName = req.body.mediaName;
        let infouuid = req.params["infouuid"];
        try {
            mediaName = path.join(resource_1.infoCoverImgOpt.targetDir, infouuid, mediaName);
            yield fs_1.removeAsync(mediaName);
            let info = yield informationads_1.findByPrimarys(infouuid);
            let coverArr = [];
            for (let i = 0; i < info.coverpic.length; i++) {
                if (-1 == mediaName.indexOf(info.coverpic[i].split('/')[1])) {
                    coverArr.push(info.coverpic[i]);
                }
            }
            //更新到数据库
            yield informationads_1.modifilyCoverpic(infouuid, coverArr);
            return response_1.sendOK(res, { msg: "succ" });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//删除资讯图片
exports.router.delete('/:infouuid/image', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        if (loginInfo.isAdminRO() || loginInfo.isAdsRO())
            return response_1.sendNoPerm(res);
        let { mediaName, sumcontent } = req.body;
        let infouuid = req.params["infouuid"];
        try {
            mediaName = path.join(resource_1.infoImgOpt.targetDir, infouuid, mediaName);
            yield fs_1.removeAsync(mediaName);
            let info = yield informationads_1.findByPrimarys(infouuid);
            let Arr = [];
            for (let i = 0; i < info.pics.length; i++) {
                if (-1 == mediaName.indexOf(info.pics[i].split('/')[1])) {
                    Arr.push(info.pics[i]);
                }
            }
            //更新到数据库
            yield informationads_1.updateByUuid({ pics: Arr, sumcontent }, infouuid);
            return response_1.sendOK(res, { msg: "succ" });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//上传资讯图片
exports.router.post('/:infouuid/image', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let infouuid = req.params["infouuid"];
        try {
            validator_1.validateCgi({ adsuuid: infouuid }, validator_2.infoValidator.UUID);
            let newPath = yield upload_1.uploadAdsImage(req, {
                uuid: infouuid,
                glob: resource_1.infoImgOpt.glob,
                tmpDir: resource_1.infoImgOpt.tmpDir,
                maxSize: resource_1.infoImgOpt.maxSize,
                extnames: resource_1.infoImgOpt.extnames,
                maxFiles: resource_1.infoImgOpt.maxFiles,
                targetDir: resource_1.infoImgOpt.targetDir,
                fieldName: resource_1.infoImgOpt.fieldName,
            });
            let info = yield informationads_1.findByPrimarys(infouuid);
            info.pics = info.pics ? info.pics : [];
            info.pics.push(newPath);
            yield informationads_1.modifilyPics(infouuid, info.pics);
            return response_1.createdOk(res, { path: newPath, pics: info.pics });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//上传资讯视频
exports.router.post('/:infouuid/movie', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let infouuid = req.params["infouuid"];
        try {
            validator_1.validateCgi({ adsuuid: infouuid }, validator_2.infoValidator.UUID);
            let newPath = yield upload_1.uploadAdsMovie(req, {
                uuid: infouuid,
                glob: resource_1.infoMovOpt.glob,
                tmpDir: resource_1.infoMovOpt.tmpDir,
                maxSize: resource_1.infoMovOpt.maxSize,
                extnames: resource_1.infoMovOpt.extnames,
                maxFiles: resource_1.infoMovOpt.maxFiles,
                targetDir: resource_1.infoMovOpt.targetDir,
                fieldName: resource_1.infoMovOpt.fieldName,
            });
            let info = yield informationads_1.findByPrimarys(infouuid);
            info.video = info.video ? info.video : [];
            info.video.push(newPath);
            let infoo = yield informationads_1.modifilyVideo(infouuid, info.video);
            return response_1.createdOk(res, { path: newPath, infoo });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//获得资讯视频列表
exports.router.get('/:infouuid/movie', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        return listAdsFiles(req, res, resource_1.infoMovOpt);
    });
});
//获得资讯图片列表
exports.router.get('/:infouuid/image', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        return listAdsFiles(req, res, resource_1.infoImgOpt);
    });
});
function listAdsFiles(req, res, opt) {
    return __awaiter(this, void 0, void 0, function* () {
        let infouuid = req.params["infouuid"];
        try {
            validator_1.validateCgi({ adsuuid: infouuid }, validator_2.infoValidator.UUID);
            let pattern = path.join(opt.targetDir, infouuid, opt.glob);
            let files = yield fs_1.listFilesAsync(pattern);
            for (let i = 0; i < files.length; i++) {
                files[i] = files[i].substr(opt.targetDir.length + 1);
            }
            return response_1.sendOK(res, { files: files });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
}
//删除资讯视频
exports.router.delete('/:infouuid/movie', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let mediaName = req.body.mediaName;
        let infouuid = req.params["infouuid"];
        try {
            validator_1.validateCgi({ adsuuid: infouuid }, validator_2.infoValidator.UUID);
            mediaName = path.join(resource_1.infoMovOpt.targetDir, infouuid, mediaName);
            yield fs_1.removeAsync(mediaName);
            yield informationads_1.modifilyVideo(infouuid, null);
            return response_1.sendOK(res, { msg: 'succ' });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//查看资讯的未审核的评论
exports.router.get('/commentinfo', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        let { start, length, state } = req.query;
        let commentarr = [];
        try {
            if (loginInfo.isAdsRO || loginInfo.isAdsRW || loginInfo.isRoot || loginInfo.isAdminRW || loginInfo.isAdminRO) {
                let com = yield infocomment_1.querycrmcomment(req.app.locals.sequelize, start, length, state);
                let recordsFiltered = yield infocomment_1.queryCountcrmcommnet(req.app.locals.sequelize, state);
                for (let j = 0; j < com.length; j++) {
                    com[j].created = winston_1.timestamps(com[j].created);
                    let e = com[j].state;
                    if (e == 'new') {
                        com[j].state = '待审核';
                    }
                    else if (e == 'on') {
                        com[j].state = '已通过';
                    }
                    else if (e == 'rejected') {
                        com[j].state = '未通过';
                    }
                    else if (e == 'replied') {
                        com[j].state = '已回复';
                    }
                }
                commentarr.push(com);
                return response_1.sendOK(res, { data: commentarr, recordsFiltered: parseInt(recordsFiltered) });
            }
            else
                return response_1.sendNoPerm(res);
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//审核评论
exports.router.post('/pending', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        let { commentuuid, state, rejectcontent } = req.body;
        try {
            validator_1.validateCgi({ commentuuid, state, rejectcontent }, validator_2.infoValidator.pending);
            if (loginInfo.isRoot || loginInfo.isAdminRW || loginInfo.isAdsRW) {
                yield infocomment_1.updatePendingcomment(commentuuid, state, rejectcontent);
                return response_1.sendOK(res, { 'data': 'succ' });
            }
            else
                return response_1.sendNoPerm(res);
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//# sourceMappingURL=informationads.js.map