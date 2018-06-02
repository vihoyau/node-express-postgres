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
const goods_1 = require("../../model/mall/goods");
// import { findByPrimary as findPrize, updatePrizeInfo, findAllPrize } from "../../model/mall/prize"
const resource_1 = require("../../config/resource");
const path = require("path");
exports.router = express_1.Router();
/*put*/
exports.router.patch('/:uuid/tags', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let body = req.body;
        let uuid = req.params["uuid"];
        const { tags, realprice, price, points } = body;
        try {
            //const loginInfo: LoginInfo = (req as any).loginInfo
            // if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
            //     return sendNoPerm(res)
            // }
            let goods = yield goods_1.updateGoodsTags(uuid, JSON.parse(tags), parseFloat(realprice) * 100, parseFloat(price) * 100, parseInt(points));
            /*let prizes = await findAllPrize()
            for (let i = 0; i < prizes.length; i++) {
                if (prizes[i].prize.uuid === uuid) {
                    let prize = await findPrize(prizes[i].uuid)
                    prize.prize.tags = JSON.parse(tags)
                    await updatePrizeInfo({ prize: prize }, prizes[i].uuid)//修改奖品成功
                }
            }*/
            return response_1.sendOK(res, { goods: goods });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// 添加推荐
exports.router.patch("/:uuid/addHot", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let uuid = req.params["uuid"];
        let { hot } = req.body;
        try {
            validator_1.validateCgi({ uuid: uuid, hot: hot }, validator_2.goodsValidator.setHot);
            let goodsUnmber = yield goods_1.findGoodsHotCount(req.app.locals.sequelize);
            let goods;
            if (goodsUnmber < 9) {
                goods = yield goods_1.updateGoodsHot(uuid, hot);
                if (goods) { }
                return response_1.sendOK(res, "true");
            }
            else {
                return response_1.sendOK(res, "false");
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// 取消推荐
exports.router.patch("/:uuid/removeHot", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let uuid = req.params["uuid"];
        let { hot } = req.body;
        try {
            validator_1.validateCgi({ uuid: uuid, hot: hot }, validator_2.goodsValidator.setHot);
            let goods = yield goods_1.updateGoodsHot(uuid, hot);
            return response_1.sendOK(res, { goods: goods });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get("/hot", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 查询热门商品的个数
            let goods = yield goods_1.findGoodsByHot(req.app.locals.sequelize);
            goods.forEach(r => {
                r.realprice = r.realprice / 100;
                r.price = r.price / 100;
            });
            return response_1.sendOK(res, { goods: goods });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/*insert*/
exports.router.post('/', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { volume } = req.body;
        try {
            let obj = {
                state: 'new',
                deleted: 0,
                volume: volume
            };
            //validateCgi({ volume: volume }, goodsValidator.creategoods)
            const loginInfo = req.loginInfo;
            if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
                return response_1.sendNoPerm(res);
            }
            let goodsuuid = yield goods_1.insertGoods(req.app.locals.sequelize, obj, parseInt(volume));
            return response_1.createdOk(res, { goodsuuid: goodsuuid });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// 商品标签修改
exports.router.post("/goodsTag", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let { tag, gooduuid } = req.body;
            let goods = yield goods_1.searchpoints(gooduuid);
            let points = goods.points;
            if (points > 0 && points) {
                return response_1.sendOK(res, { restag: "false" });
            }
            yield goods_1.changeTag(tag, gooduuid);
            return response_1.sendOK(res, { restag: "true" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.put('/detail', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { detailcontent, detailpics, uuid } = req.body;
        validator_1.validateCgi({ detailcontent, uuid }, validator_2.goodsValidator.detail);
        try {
            let r = yield goods_1.updateGoods(uuid, { detailcontent, detailpics: JSON.parse(detailpics) });
            if (r)
                return response_1.sendOK(res, { msg: "ok" });
            return response_1.sendErrMsg(res, "fail", 500);
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
        const { title, keyword, state, content, specification, category, subcategory } = body;
        let { pics, postage, businessmen, businessuuid } = body;
        postage = parseFloat(postage) * 100;
        try {
            let obj = {
                title: title,
                keyword: keyword,
                content: content,
                specification: specification,
                category: category,
                subcategory: subcategory,
                state: state,
                postage: postage,
                businessmen: businessmen,
                businessuuid: businessuuid,
                pics: JSON.parse(pics),
                hot: "no"
            };
            if (state == "onsale") {
                delete obj.hot;
            }
            // validateCgi(obj, goodsValidator.goodsInfo)
            const loginInfo = req.loginInfo;
            if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
                return response_1.sendNoPerm(res);
            }
            let goods = yield goods_1.updateGoods(uuid, obj);
            return response_1.sendOK(res, { goods: goods });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//上传详情图片
exports.router.post('/:goodsuuid/detailPics', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let goodsuuid = req.params["goodsuuid"];
        try {
            validator_1.validateCgi({ uuid: goodsuuid }, validator_2.goodsValidator.UUID);
            let newPath = yield upload_1.uploadAdsImage(req, {
                uuid: goodsuuid,
                glob: resource_1.goodsDetailImgOpt.glob,
                tmpDir: resource_1.goodsDetailImgOpt.tmpDir,
                maxSize: resource_1.goodsDetailImgOpt.maxSize,
                extnames: resource_1.goodsDetailImgOpt.extnames,
                maxFiles: resource_1.goodsDetailImgOpt.maxFiles,
                targetDir: resource_1.goodsDetailImgOpt.targetDir,
                fieldName: resource_1.goodsDetailImgOpt.fieldName,
            });
            let goods = yield goods_1.findByPrimary(goodsuuid);
            goods.detailpics = goods.detailpics ? goods.detailpics : [];
            goods.detailpics.push(newPath);
            yield goods_1.modifilyDetailPics(goodsuuid, goods.detailpics);
            return response_1.createdOk(res, { path: newPath });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//删除详情图片
exports.router.delete('/:goodsuuid/detailImg', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { mediaName, detailcontent, pics } = req.body;
        let goodsuuid = req.params["goodsuuid"];
        try {
            validator_1.validateCgi({ uuid: goodsuuid }, validator_2.goodsValidator.UUID);
            mediaName = path.join(resource_1.goodsDetailImgOpt.targetDir, goodsuuid, mediaName);
            yield fs_1.removeAsync(mediaName);
            let pic = pics ? JSON.parse(pics) : null;
            let goods = yield goods_1.updateGoods(goodsuuid, { detailpics: pic, detailcontent });
            return response_1.sendOK(res, { pics: goods.detailpics });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
exports.router.patch('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { state } = req.body;
        let uuid = req.params["uuid"];
        try {
            validator_1.validateCgi({ uuid: uuid, state: state }, validator_2.goodsValidator.setState);
            const loginInfo = req.loginInfo;
            if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
                return response_1.sendNoPerm(res);
            }
            let goods = yield goods_1.updateState(uuid, state);
            return response_1.sendOK(res, { goods: goods });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.delete('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let uuid = req.params["uuid"];
        try {
            validator_1.validateCgi({ uuid: uuid }, validator_2.goodsValidator.UUID);
            const loginInfo = req.loginInfo;
            if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
                return response_1.sendNoPerm(res);
            }
            yield goods_1.deleteGoods(uuid);
            return response_1.sendOK(res, {});
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.post('/:goodsuuid/image', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let goodsuuid = req.params["goodsuuid"];
        try {
            validator_1.validateCgi({ uuid: goodsuuid }, validator_2.goodsValidator.UUID);
            let newPath = yield upload_1.uploadAdsImage(req, {
                uuid: goodsuuid,
                glob: resource_1.goodsImgOpt.glob,
                tmpDir: resource_1.goodsImgOpt.tmpDir,
                maxSize: resource_1.goodsImgOpt.maxSize,
                extnames: resource_1.goodsImgOpt.extnames,
                maxFiles: resource_1.goodsImgOpt.maxFiles,
                targetDir: resource_1.goodsImgOpt.targetDir,
                fieldName: resource_1.goodsImgOpt.fieldName,
            });
            let goods = yield goods_1.findByPrimary(goodsuuid);
            if (goods.pics == null)
                goods.pics = [];
            goods.pics.push(newPath);
            yield goods_1.modifilyPics(goodsuuid, goods.pics);
            return response_1.createdOk(res, { path: newPath });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.post('/:goodsuuid/tagsImage', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let goodsuuid = req.params["goodsuuid"];
        try {
            validator_1.validateCgi({ uuid: goodsuuid }, validator_2.goodsValidator.UUID);
            let newPath = yield upload_1.uploadAdsImage(req, {
                uuid: goodsuuid,
                glob: resource_1.goodsTagsImgOpt.glob,
                tmpDir: resource_1.goodsTagsImgOpt.tmpDir,
                maxSize: resource_1.goodsTagsImgOpt.maxSize,
                extnames: resource_1.goodsTagsImgOpt.extnames,
                maxFiles: resource_1.goodsTagsImgOpt.maxFiles,
                targetDir: resource_1.goodsTagsImgOpt.targetDir,
                fieldName: resource_1.goodsTagsImgOpt.fieldName,
            });
            return response_1.createdOk(res, { path: newPath });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.patch("/:goodsuuid/image", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { pics } = req.body;
        let goodsuuid = req.params["goodsuuid"];
        if (pics != undefined) {
            let pic = JSON.parse(pics);
            if (pic) {
                yield goods_1.modifilyPics(goodsuuid, pic);
            }
        }
    });
});
exports.router.delete('/:goodsuuid/tagsImage', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let mediaName = req.body.mediaName;
        let goodsuuid = req.params["goodsuuid"];
        try {
            validator_1.validateCgi({ uuid: goodsuuid }, validator_2.goodsValidator.UUID);
            mediaName = path.join(resource_1.goodsTagsImgOpt.targetDir, goodsuuid, mediaName);
            yield fs_1.removeAsync(mediaName);
            return response_1.deleteOK(res, {});
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.delete('/:goodsuuid/image', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let pics = req.body.pics;
        let mediaName = req.body.mediaName;
        let goodsuuid = req.params["goodsuuid"];
        try {
            validator_1.validateCgi({ uuid: goodsuuid }, validator_2.goodsValidator.UUID);
            mediaName = path.join(resource_1.goodsImgOpt.targetDir, goodsuuid, mediaName);
            yield fs_1.removeAsync(mediaName);
            let pic;
            if (pics) {
                pic = JSON.parse(pics);
            }
            else {
                pic = null;
            }
            yield goods_1.modifilyPics(goodsuuid, pic);
            return response_1.deleteOK(res, {});
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// router.get('/title', checkLogin, async function (req: Request, res: Response, next: NextFunction) {
//     let { title, start, length, draw} = req.query
//     try {
//         // validateCgi({ title: title, page: page, count: count }, goodsValidator.titleAndPC)
//         // let { cursor, limit } = getPageCount(page, count)
//         let obj = {
//             state: "onsale",
//             deleted: 0,
//             $or: [{ title: { like: '%' + title + '%' } }, { keyword: { like: '%' + title + '%' } }],
//         }
//         let recordsFiltered = await getCount(obj)
//         let goods = await findByKeyword(title, parseInt(start), parseInt(length))
//         return sendOK(res, { goods: goods, draw: draw, recordsFiltered: recordsFiltered })
//     } catch (e) {
//         e.info(se, res, e)
//     }
// })
exports.router.get('/prize', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { start, length, draw, search } = req.query;
        try {
            let searchdata = search.value;
            validator_1.validateCgi({ start, length, searchdata }, validator_2.goodsValidator.pagination);
            let recordsFiltered = yield goods_1.getPrizeCount(req.app.locals.sequelize, searchdata);
            let goods = yield goods_1.findPrizeGoods(req.app.locals.sequelize, searchdata, parseInt(start), parseInt(length));
            goods.forEach(r => {
                r.realprice = r.realprice / 100;
                r.price = r.price / 100;
                r.postage = r.postage / 100;
            });
            return response_1.sendOK(res, { goods: goods, draw: draw, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get("/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let uuid = req.params["uuid"];
        try {
            validator_1.validateCgi({ uuid }, validator_2.goodsValidator.UUID);
            let goods = yield goods_1.findByPrimary(uuid);
            goods.realprice = goods.realprice / 100;
            goods.price = goods.price / 100;
            goods.postage = goods.postage / 100;
            return response_1.sendOK(res, { goods: goods });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { start, length, draw, search } = req.query;
        try {
            let searchdata = search.value;
            validator_1.validateCgi({ start, length, searchdata }, validator_2.goodsValidator.pagination);
            let recordsFiltered = yield goods_1.getCount(req.app.locals.sequelize, searchdata);
            let goods = yield goods_1.findGoods(req.app.locals.sequelize, searchdata, parseInt(start), parseInt(length));
            goods.forEach(r => {
                r.realprice = r.realprice / 100;
                r.price = r.price / 100;
                r.postage = r.postage / 100;
            });
            return response_1.sendOK(res, { goods: goods, draw: draw, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=goods.js.map