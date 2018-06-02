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
const category_1 = require("../../model/mall/category");
const goods_1 = require("../../model/mall/goods");
const category_2 = require("../../model/mall/category");
const resource_1 = require("../../config/resource");
const fs_1 = require("../../lib/fs");
const upload_1 = require("../../lib/upload");
const path = require("path");
exports.router = express_1.Router();
/* GET adtype listing. */
exports.router.get('/category', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let category = yield category_2.getCategory();
            let searchAll = yield category_1.getsearchAll("查看所有");
            let coupon = yield category_1.getsearchAll("优惠券");
            return response_1.sendOK(res, { category: category, searchAll: searchAll, coupon: coupon });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/* GET adslog listing. */
exports.router.get('/subcategory', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // 获取参数
        const { parent } = req.query;
        try {
            validator_1.validateCgi({ uuid: parent }, validator_2.categoryValidator.UUID);
            let subcategory = yield category_2.getSubcategory(parent);
            return response_1.sendOK(res, { subcategory: subcategory });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.post('/:categoryuuid/image', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let categoryuuid = req.params["categoryuuid"];
        try {
            validator_1.validateCgi({ uuid: categoryuuid }, validator_2.categoryValidator.UUID);
            let newPath = yield upload_1.uploadAdsImage(req, {
                uuid: categoryuuid,
                glob: resource_1.categoryImgOpt.glob,
                tmpDir: resource_1.categoryImgOpt.tmpDir,
                maxSize: resource_1.categoryImgOpt.maxSize,
                extnames: resource_1.categoryImgOpt.extnames,
                maxFiles: resource_1.categoryImgOpt.maxFiles,
                targetDir: resource_1.categoryImgOpt.targetDir,
                fieldName: resource_1.categoryImgOpt.fieldName,
            });
            yield category_2.modifilyPic(categoryuuid, newPath);
            return response_1.createdOk(res, { path: newPath });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.delete('/:categoryuuid/image', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let mediaName = req.body.mediaName;
        let categoryuuid = req.params["categoryuuid"];
        try {
            validator_1.validateCgi({ uuid: categoryuuid }, validator_2.categoryValidator.UUID);
            mediaName = path.join(resource_1.categoryImgOpt.targetDir, categoryuuid, mediaName);
            yield fs_1.removeAsync(mediaName);
            //更新到数据库
            yield category_2.modifilyPic(categoryuuid, null);
            return response_1.deleteOK(res, { msg: "删除成功！" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.post('/category', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let body = req.body;
        const { name, parentname } = body;
        try {
            const info = req.loginInfo;
            if (!info.isGoodsRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            validator_1.validateCgi({ name: name, parentname: parentname }, validator_2.categoryValidator.typaname);
            let category = yield category_2.getByName(parentname, null);
            if (!category)
                category = yield category_2.insert(parentname, undefined);
            let subcategory = yield category_2.getByName(name, category.uuid);
            if (!subcategory) {
                subcategory = yield category_2.insert(name, category.uuid);
            }
            return response_1.sendOK(res, { category: category, subcategory: subcategory });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // 获取参数
        let uuid = req.params["uuid"];
        try {
            validator_1.validateCgi({ uuid: uuid }, validator_2.categoryValidator.UUID);
            let subcategory = yield category_2.findByPrimary(uuid);
            return response_1.sendOK(res, { subcategory: subcategory });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.patch("/position", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { positions } = req.body;
        positions = JSON.parse(positions);
        try {
            for (let i = 0; i < positions.length; i++) {
                validator_1.validateCgi({ position: parseInt(positions[i].order), uuid: positions[i].uuid }, validator_2.categoryValidator.orderAndUuid);
                yield category_2.updateOrder(positions[i].uuid, parseInt(positions[i].order));
            }
            return response_1.sendOK(res, { category: "true" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.patch('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // 获取参数
        let uuid = req.params["uuid"];
        let { name } = req.body;
        try {
            const info = req.loginInfo;
            if (!info.isGoodsRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            validator_1.validateCgi({ uuid: uuid, name: name }, validator_2.categoryValidator.updateName);
            let subcategory = yield category_2.updateName(name, uuid);
            return response_1.sendOK(res, { subcategory: subcategory });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.delete("/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            const info = req.loginInfo;
            validator_1.validateCgi({ uuid: uuid }, validator_2.categoryValidator.UUID);
            if (!info.isRoot())
                return response_1.sendNoPerm(res);
            let category = yield category_2.findByPrimary(uuid);
            if (!category) {
                return response_1.sendOK(res, { category: "不存在该类" });
            }
            //判断是大类还是小类
            if (!category.parent) { //大类
                //删除大类，删除所对应的商品
                yield goods_1.deleteByCategory(uuid);
                //删除小类
                yield category_1.deleteByCategory(uuid);
                //删除大类
                yield category_1.deleteCategory(uuid);
            }
            else {
                //如果是小类，删除所对应的商品
                yield goods_1.deleteBySubcategory(uuid);
                //删除大类
                yield category_1.deleteCategory(uuid);
            }
            return response_1.sendOK(res, { category: "删除成功" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//
exports.router.post('/:subcategoryuuid/subimage', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let subcategoryuuid = req.params["subcategoryuuid"];
        try {
            validator_1.validateCgi({ uuid: subcategoryuuid }, validator_2.categoryValidator.UUID);
            let newPath = yield upload_1.uploadAdsImage(req, {
                uuid: subcategoryuuid,
                glob: resource_1.subcategoryImgOpt.glob,
                tmpDir: resource_1.subcategoryImgOpt.tmpDir,
                maxSize: resource_1.subcategoryImgOpt.maxSize,
                extnames: resource_1.subcategoryImgOpt.extnames,
                maxFiles: resource_1.subcategoryImgOpt.maxFiles,
                targetDir: resource_1.subcategoryImgOpt.targetDir,
                fieldName: resource_1.subcategoryImgOpt.fieldName,
            });
            yield category_2.modifilyPic(subcategoryuuid, newPath);
            return response_1.createdOk(res, { 'path': newPath });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/:subcategoryuuid/getsubimage', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let subcategoryuuid = req.params["subcategoryuuid"];
        try {
            validator_1.validateCgi({ uuid: subcategoryuuid }, validator_2.categoryValidator.UUID);
            let re = yield category_1.querycategorypic(subcategoryuuid);
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
//# sourceMappingURL=category.js.map