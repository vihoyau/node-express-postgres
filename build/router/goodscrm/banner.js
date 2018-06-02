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
const logindao_1 = require("../../redis/logindao");
const upload_1 = require("../../lib/upload");
const resource_1 = require("../../config/resource");
const fs_1 = require("../../lib/fs");
const path = require("path");
const banner_1 = require("../../model/mall/banner");
exports.router = express_1.Router();
exports.router.get('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let uuid = req.params["uuid"];
        try {
            const info = req.loginInfo;
            if (!info.isGoodsRW() && !info.isRoot()) {
                return response_1.sendNoPerm(res);
            }
            else {
                validator_1.validateCgi({ uuid: uuid }, validator_2.goodsValidator.UUID);
                let adslogs = yield banner_1.findByPrimary(uuid);
                return response_1.sendOK(res, { adslogs: adslogs });
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/* GET adtype listing. */
exports.router.get('/', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // 获取参数
        const { start, length, draw, search } = req.query;
        try {
            let searchdata = search.value;
            const info = req.loginInfo;
            if (!info.isGoodsRO() && !info.isRoot() && !info.isGoodsRW()) {
                return response_1.sendNoPerm(res);
            }
            else {
                validator_1.validateCgi({ start, length, searchdata }, validator_2.goodsValidator.pagination);
                let obj = {
                    $or: [{
                            url: { $like: '%' + searchdata + '%' },
                            content: { $like: '%' + searchdata + '%' },
                            description: { $like: '%' + searchdata + '%' }
                        }]
                };
                let recordsFiltered = yield banner_1.getCount(obj);
                let adslogs = yield banner_1.getBannerAll(obj, parseInt(start), parseInt(length));
                return response_1.sendOK(res, { adslogs: adslogs, draw: draw, recordsFiltered: recordsFiltered });
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// router.post('/:uuid/image', checkLogin, async function (req: Request, res: Response, next: NextFunction) {
//     let uuid = req.params["uuid"] as string
//     try {
//         validateCgi({ uuid: uuid }, goodsValidator.UUID)
//         let newPath = await uploadAdsImage(req, {
//             uuid: uuid,
//             glob: goodsBannerImgOpt.glob,
//             tmpDir: goodsBannerImgOpt.tmpDir,
//             maxSize: goodsBannerImgOpt.maxSize,
//             extnames: goodsBannerImgOpt.extnames,
//             maxFiles: goodsBannerImgOpt.maxFiles,
//             targetDir: goodsBannerImgOpt.targetDir,
//             fieldName: goodsBannerImgOpt.fieldName,
//         })
//         return createdOk(res, { path: newPath })
//     } catch (e) {
//         e.info(se, res, e)
//     }
// })
exports.router.post('/', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let banners = yield banner_1.insertBanner();
            return response_1.sendOK(res, banners);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.put('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // 获取参数
        let uuid = req.params["uuid"];
        const { url, pic, content, state, description, position, externalurl } = req.body;
        try {
            let banner = {
                uuid: uuid,
                url: url,
                pic: pic,
                content: content,
                description: description,
                position: parseInt(position),
                state: state,
                externalurl: externalurl
            };
            validator_1.validateCgi(banner, validator_2.goodsValidator.bannerInfo);
            let getbanners = yield banner_1.getBanner(0, 10);
            if (state == "on" && getbanners.length > 4)
                return response_1.sendOK(res, { updatestate: "false" });
            let banners = yield banner_1.update(banner, uuid);
            return response_1.sendOK(res, banners);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.put('/url/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let body = req.body;
        const { uuid, url } = body;
        try {
            validator_1.validateCgi({ uuid: uuid, url: url }, validator_2.goodsValidator.bannerUrl);
            let banner = yield banner_1.updateUrl(url, uuid);
            return response_1.sendOK(res, banner);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.put('/pic/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // 获取参数
        let body = req.body;
        const { uuid, pic } = body;
        try {
            validator_1.validateCgi({ uuid: uuid }, validator_2.goodsValidator.UUID);
            let banner = yield banner_1.updatePic(pic, uuid);
            return response_1.sendOK(res, banner);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.put('/content/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // 获取参数
        let { content, uuid } = req.body;
        try {
            validator_1.validateCgi({ uuid: uuid }, validator_2.goodsValidator.UUID);
            let banner = yield banner_1.updateContent(content, uuid);
            return response_1.sendOK(res, banner);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.post('/:uuid/image', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let uuid = req.params["uuid"];
        try {
            validator_1.validateCgi({ uuid: uuid }, validator_2.goodsValidator.UUID);
            let newPath = yield upload_1.uploadAdsImage(req, {
                uuid: uuid,
                glob: resource_1.goodsBannerImgOpt.glob,
                tmpDir: resource_1.goodsBannerImgOpt.tmpDir,
                maxSize: resource_1.goodsBannerImgOpt.maxSize,
                extnames: resource_1.goodsBannerImgOpt.extnames,
                maxFiles: resource_1.goodsBannerImgOpt.maxFiles,
                targetDir: resource_1.goodsBannerImgOpt.targetDir,
                fieldName: resource_1.goodsBannerImgOpt.fieldName,
            });
            return response_1.createdOk(res, { path: newPath });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.delete('/:uuid/image', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let mediaName = req.body.mediaName;
        let uuid = req.params["uuid"];
        try {
            validator_1.validateCgi({ uuid: uuid }, validator_2.goodsValidator.UUID);
            mediaName = path.join(resource_1.goodsBannerImgOpt.targetDir, uuid, mediaName);
            yield fs_1.removeAsync(mediaName);
            return response_1.sendOK(res, {});
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
            yield banner_1.deleteByuuid(uuid);
            return response_1.deleteOK(res, {});
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=banner.js.map