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
const validator_1 = require("../../lib/validator");
const validator_2 = require("./validator");
//创建收集道具活动
const collectioncreate_1 = require("../../model/mall/collectioncreate");
const resource_1 = require("../../config/resource");
const upload_1 = require("../../lib/upload");
//创建收集活动信息
exports.router.post('/collect', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { ActivityName, Tag, Starttime, Endtime, Point, Gooduuid, rewardmethod, cardIdAmounts, RedPacket, Couponid, goodtitle, Coupontitle, chipIdAmounts, Reward, ActivityRule, isNoFortune, rewardNumber } = req.body;
        validator_1.validateCgi({
            ActivityName: ActivityName, Tag: Tag,
            Starttime: Starttime, Endtime: Endtime,
            Point: Point, Gooduuid: Gooduuid, rewardmethod: rewardmethod,
            cardIdAmounts: cardIdAmounts, RedPacket: RedPacket,
            Couponid: Couponid, goodtitle: goodtitle, Coupontitle: Coupontitle,
            chipIdAmounts: chipIdAmounts, Reward: Reward,
            ActivityRule: ActivityRule, isNoFortune: isNoFortune,
            rewardNumber: rewardNumber
        }, validator_2.collectionValidator.add);
        try {
            const info = req.loginInfo;
            if (!info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            let tmp = {
                ActivityName: ActivityName,
                Tag: Tag,
                Starttime: Starttime,
                Endtime: Endtime,
                Point: Point,
                Gooduuid: Gooduuid,
                RedPacket: RedPacket,
                Couponid: Couponid,
                goodtitle: goodtitle,
                Coupontitle: Coupontitle,
                CardIdAmounts: cardIdAmounts,
                ChipIdAmounts: chipIdAmounts,
                rewardmethod: rewardmethod,
                Reward: Reward,
                ActivityRule: ActivityRule,
                isNoFortune: isNoFortune,
                rewardNumber: rewardNumber //领奖人数
            };
            if (!Gooduuid) {
                delete tmp.Gooduuid;
            }
            if (!Couponid) {
                delete tmp.Couponid;
            }
            if (!Gooduuid && !Couponid) {
                delete tmp.Couponid;
                delete tmp.Gooduuid;
            }
            let ads_ActivityName = yield collectioncreate_1.find_ActivityName_Info(); //查找收集道具活动名称字段的所有值
            let num = ads_ActivityName.length;
            for (let i = 0; i < num; i++) {
                if (tmp.ActivityName == ads_ActivityName[i].ActivityName)
                    return response_1.sendErrMsg(res, "活动名称重复！", 409);
            }
            // validateCgi(tmp, advertiserValidator.advertiserInfo)
            let addcollections = yield collectioncreate_1.addcollection(tmp);
            return response_1.sendOK(res, addcollections);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//收集道具活动修改功能
exports.router.post('/modify/informationbase', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { uuid, Tag, Starttime, Endtime, Point, Gooduuid, RedPacket, Couponid, Coupontitle, goodtitle, rewardmethod, Reward, ActivityRule, isNoFortune, rewardNumber } = req.body;
        // validateCgi({
        //     ActivityName: ActivityName, Tag: Tag
        //     , Starttime: Starttime, Endtime: Endtime
        //     , Point: Point, Gooduuid: Gooduuid, rewardmethod: rewardmethod
        //     , cardIdAmounts: cardIdAmounts, RedPacket: RedPacket
        //     , Couponid: Couponid, goodtitle: goodtitle, Coupontitle: Coupontitle
        //     , chipIdAmounts: chipIdAmounts, Reward: Reward
        //     , ActivityRule: ActivityRule, isNoFortune: isNoFortune
        // }, collectionValidator.update)
        try {
            const info = req.loginInfo;
            if (!info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            let ads = yield collectioncreate_1.findByPrimary(uuid); //查找活动
            //更新活动
            ads.Tag = Tag,
                ads.Starttime = Starttime,
                ads.Endtime = Endtime,
                ads.Point = Point,
                ads.Gooduuid = Gooduuid,
                ads.RedPacket = RedPacket,
                ads.Couponid = Couponid,
                ads.Coupontitle = Coupontitle,
                ads.goodtitle = goodtitle,
                ads.Reward = Reward,
                ads.rewardmethod = rewardmethod,
                ads.ActivityRule = ActivityRule,
                ads.isNoFortune = isNoFortune,
                ads.rewardNumber = rewardNumber;
            if (!Gooduuid) {
                delete ads.Gooduuid;
            }
            if (!Couponid) {
                delete ads.Couponid;
            }
            if (!Gooduuid && !Couponid) {
                delete ads.Couponid;
                delete ads.Gooduuid;
            }
            // let ads_ActivityName = await find_ActivityName_Info()         //查找收集道具所有活动名字字段的所有值
            // let num = ads_ActivityName.length
            // for (let i = 0; i < num; i++) {
            //     if (ads.ActivityName == ads_ActivityName[i].ActivityName)
            //         return sendErrMsg(res, "活动名重复！", 409)
            // }
            let update = yield collectioncreate_1.updateCollectionActivity(ads, ads.uuid);
            return response_1.sendOK(res, update);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//收集道具活动删除功能
exports.router.post('/delete', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { uuid } = req.body;
        validator_1.validateCgi({ uuid }, validator_2.collectionValidator.del);
        try {
            const info = req.loginInfo;
            if (!info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            yield collectioncreate_1.deleteActivity(uuid); //删除活动
            return response_1.sendOK(res, { "data": "deleteOk" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//收集道具活动查看所有的活动管理功能
exports.router.get('/selectAll', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const info = req.loginInfo;
            //              validateCgi({ uuid: uuid }, advertiserValidator.UUID)
            if (!info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            let ac_ext = yield collectioncreate_1.find_All_Activity();
            return response_1.sendOK(res, { ac_ext: ac_ext }); //返回ac_ext的信息
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//一键激活
exports.router.post('/update', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { uuid, Starttime, Endtime } = req.body;
        // validateCgi({ uuid, Starttime, Endtime }, collectionValidator.restart)
        try {
            let tmp = {
                uuid: uuid,
                Starttime: Starttime,
                Endtime: Endtime
            };
            const info = req.loginInfo;
            if (!info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            let updatecollections = yield collectioncreate_1.updatecollection(tmp);
            return response_1.sendOK(res, updatecollections);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//crm展示
exports.router.get("/collectionInfo", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { start, length, search, State } = req.query;
        // validateCgi({ start, length, searchdata: search, Statedata: State }, collectionValidator.view)
        try {
            let searchdata = search.value;
            let Statedata = State;
            const info = req.loginInfo;
            if (!info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            let obj = {};
            obj = {
                $or: [
                    { ActivityName: { $like: '%' + searchdata + '%' } },
                    { Tag: { $like: '%' + searchdata + '%' } }
                ], State: Statedata
            };
            let obj1 = {};
            obj1 = {
                $or: [
                    { ActivityName: { $like: '%' + searchdata + '%' } },
                    { Tag: { $like: '%' + searchdata + '%' } }
                ]
            };
            if (!Statedata) {
                let recordsFiltered = yield collectioncreate_1.getCount1(searchdata);
                let collection = yield collectioncreate_1.findColInfo1(obj1, parseInt(start), parseInt(length));
                return response_1.sendOK(res, { collection: collection, recordsFiltered: recordsFiltered });
            }
            else {
                let recordsFiltered = yield collectioncreate_1.getCount(searchdata, Statedata);
                let collection = yield collectioncreate_1.findColInfo(obj, parseInt(start), parseInt(length));
                return response_1.sendOK(res, { collection: collection, recordsFiltered: recordsFiltered });
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//卡牌图片上传
exports.router.post('/:uuid/:index/image', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        let uuid = req.params["uuid"];
        let index = req.params["index"];
        // let index=1
        // let uuid='e0534c14-4eca-40c7-907f-54532ba571ae'
        if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
            return response_1.sendNoPerm(res);
        }
        try {
            let newPath = yield upload_1.uploadCollectionImage(req, {
                uuid: uuid,
                glob: resource_1.collectionCoverImgOpt.glob,
                tmpDir: resource_1.collectionCoverImgOpt.tmpDir,
                maxSize: resource_1.collectionCoverImgOpt.maxSize,
                extnames: resource_1.collectionCoverImgOpt.extnames,
                maxFiles: resource_1.collectionCoverImgOpt.maxFiles,
                targetDir: resource_1.collectionCoverImgOpt.targetDir,
                fieldName: resource_1.collectionCoverImgOpt.fieldName
            });
            let col = yield collectioncreate_1.findimgByPrimary(uuid);
            // col.Images = col.Images == null ? [] :col.Images
            if (!col.Images) {
                switch (col.CardIdAmounts) {
                    case 5:
                        col.Images = [0, 0, 0, 0, 0];
                        break;
                    case 6:
                        col.Images = [0, 0, 0, 0, 0, 0];
                        break;
                    case 7:
                        col.Images = [0, 0, 0, 0, 0, 0, 0];
                        break;
                    case 8:
                        col.Images = [0, 0, 0, 0, 0, 0, 0, 0];
                        break;
                    case 9:
                        col.Images = [0, 0, 0, 0, 0, 0, 0, 0, 0];
                        break;
                    case 10:
                        col.Images = [0, 0, 0, 0, 0, 0, 0, 0, 0];
                        break;
                }
                let img = col.Images;
                img[index] = newPath;
                yield collectioncreate_1.addcollectionimg(img, uuid);
                return response_1.createdOk(res, { path: newPath, pics: col.Images });
            }
            else {
                let img = col.Images;
                img[index] = newPath;
                yield collectioncreate_1.addcollectionimg(img, uuid);
                return response_1.createdOk(res, { path: newPath, pics: col.Images });
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//活动创建2
exports.router.post('/collectedcre', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { uuid, Filename, cardProbability, chipProbability } = req.body;
        // validateCgi({ uuid, Filename, cardProbability, chipProbability }, collectionValidator.add1)
        try {
            let tmp = {
                uuid: uuid,
                Filename: (JSON.parse(Filename)),
                // Filename: Filename,
                //  CardProbability: cardProbability,
                // ChipProbability:  chipProbability
                CardProbability: (JSON.parse(cardProbability)),
                ChipProbability: (JSON.parse(chipProbability))
            };
            const info = req.loginInfo;
            if (!info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            let createCardcollections = yield collectioncreate_1.createCardcollection(tmp);
            return response_1.sendOK(res, createCardcollections);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//收集道具活动卡牌修改功能
exports.router.post('/modify/informationcard', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { uuid, cardProbability, chipProbability, Filename } = req.body;
        try {
            const info = req.loginInfo;
            if (!info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            let ads = yield collectioncreate_1.findByPrimary(uuid); //查找活动
            //更新活动
            ads.CardProbability = (JSON.parse(cardProbability)),
                ads.ChipProbability = (JSON.parse(chipProbability)),
                ads.Filename = (JSON.parse(Filename)),
                yield collectioncreate_1.updateCollectionActivity(ads, ads.uuid);
            return response_1.sendOK(res, { "data": "收集道具活动信息修改成功" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//卡牌图片上传修改
exports.router.post('/:uuid/:index/jrayimage', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        let uuid = req.params["uuid"];
        let index = req.params["index"];
        if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
            return response_1.sendNoPerm(res);
        }
        try {
            let newPath = yield upload_1.uploadCollectionImage(req, {
                uuid: uuid,
                glob: resource_1.collectionCoverImgOpt.glob,
                tmpDir: resource_1.collectionCoverImgOpt.tmpDir,
                maxSize: resource_1.collectionCoverImgOpt.maxSize,
                extnames: resource_1.collectionCoverImgOpt.extnames,
                maxFiles: resource_1.collectionCoverImgOpt.maxFiles,
                targetDir: resource_1.collectionCoverImgOpt.targetDir,
                fieldName: resource_1.collectionCoverImgOpt.fieldName
            });
            let col = yield collectioncreate_1.findimgByPrimary(uuid);
            if (!col.jrayImages) {
                switch (col.CardIdAmounts) {
                    case 5:
                        col.jrayImages = [0, 0, 0, 0, 0];
                        break;
                    case 6:
                        col.jrayImages = [0, 0, 0, 0, 0, 0];
                        break;
                    case 7:
                        col.jrayImages = [0, 0, 0, 0, 0, 0, 0];
                        break;
                    case 8:
                        col.jrayImages = [0, 0, 0, 0, 0, 0, 0, 0];
                        break;
                    case 9:
                        col.jrayImages = [0, 0, 0, 0, 0, 0, 0, 0, 0];
                        break;
                    case 10:
                        col.jrayImages = [0, 0, 0, 0, 0, 0, 0, 0, 0];
                        break;
                }
                let img = col.jrayImages;
                img[index] = newPath;
                yield collectioncreate_1.addcollectionjrayimg(img, uuid);
                return response_1.createdOk(res, { path: newPath, pics: col.jrayImages });
            }
            else {
                let img = col.jrayImages;
                img[index] = newPath;
                yield collectioncreate_1.addcollectionjrayimg(img, uuid);
                return response_1.createdOk(res, { path: newPath, pics: col.jrayImages });
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//奖励图片上传修改
exports.router.post('/:uuid/rewardImage', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        let uuid = req.params["uuid"];
        if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
            return response_1.sendNoPerm(res);
        }
        try {
            let newPath = yield upload_1.uploadCollectionImage(req, {
                uuid: uuid,
                glob: resource_1.collectionCoverImgOpt.glob,
                tmpDir: resource_1.collectionCoverImgOpt.tmpDir,
                maxSize: resource_1.collectionCoverImgOpt.maxSize,
                extnames: resource_1.collectionCoverImgOpt.extnames,
                maxFiles: resource_1.collectionCoverImgOpt.maxFiles,
                targetDir: resource_1.collectionCoverImgOpt.targetDir,
                fieldName: resource_1.collectionCoverImgOpt.fieldName
            });
            let col = yield collectioncreate_1.findimgByPrimary(uuid);
            let img = col.rewardImages;
            img = newPath;
            yield collectioncreate_1.addcollectionrewardImage(img, uuid);
            return response_1.createdOk(res, { path: newPath, pics: col.rewardImages });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//奖励图片上传修改
exports.router.post('/:uuid/backImage', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        let uuid = req.params["uuid"];
        if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
            return response_1.sendNoPerm(res);
        }
        try {
            let newPath = yield upload_1.uploadCollectionImage(req, {
                uuid: uuid,
                glob: resource_1.collectionCoverImgOpt.glob,
                tmpDir: resource_1.collectionCoverImgOpt.tmpDir,
                maxSize: resource_1.collectionCoverImgOpt.maxSize,
                extnames: resource_1.collectionCoverImgOpt.extnames,
                maxFiles: resource_1.collectionCoverImgOpt.maxFiles,
                targetDir: resource_1.collectionCoverImgOpt.targetDir,
                fieldName: resource_1.collectionCoverImgOpt.fieldName
            });
            let col = yield collectioncreate_1.findimgByPrimary(uuid);
            let img = col.backImages;
            img = newPath;
            yield collectioncreate_1.addcollectionbackimg(img, uuid);
            return response_1.createdOk(res, { path: newPath, pics: col.rewardImages });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//奖励图片上传修改
exports.router.post('/:uuid/primaryImage', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        let uuid = req.params["uuid"];
        // validateCgi({ uuid }, collectionValidator.UUID)
        if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
            return response_1.sendNoPerm(res);
        }
        try {
            let newPath = yield upload_1.uploadCollectionImage(req, {
                uuid: uuid,
                glob: resource_1.collectionCoverImgOpt.glob,
                tmpDir: resource_1.collectionCoverImgOpt.tmpDir,
                maxSize: resource_1.collectionCoverImgOpt.maxSize,
                extnames: resource_1.collectionCoverImgOpt.extnames,
                maxFiles: resource_1.collectionCoverImgOpt.maxFiles,
                targetDir: resource_1.collectionCoverImgOpt.targetDir,
                fieldName: resource_1.collectionCoverImgOpt.fieldName
            });
            let col = yield collectioncreate_1.findimgByPrimary(uuid);
            let img = col.primaryImages;
            img = newPath;
            yield collectioncreate_1.addcollectionprimaryimg(img, uuid);
            return response_1.createdOk(res, { path: newPath, pics: col.rewardImages });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//运势开关
exports.router.post('/isNoFortune', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { isNoFortune, uuid } = req.body;
        // validateCgi({ uuid, Starttime, Endtime }, collectionValidator.restart)
        try {
            const info = req.loginInfo;
            if (!info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            let isNoFortunes = yield collectioncreate_1.getisNoFortune(isNoFortune, uuid);
            return response_1.sendOK(res, isNoFortunes);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//中途关闭活动
exports.router.post('/shutdown', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { uuid } = req.body;
        // validateCgi({ uuid, Starttime, Endtime }, collectionValidator.restart)
        try {
            const info = req.loginInfo;
            if (!info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            let Endtime = "2038-01-06 23:52:59";
            let Starttime = "2038-02-06 23:52:59";
            let stop = yield collectioncreate_1.shutdown(uuid, Endtime, Starttime);
            return response_1.sendOK(res, stop);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=collectioncreate.js.map