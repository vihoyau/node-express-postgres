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
const validator_1 = require("./validator");
const validator_2 = require("../../lib/validator");
const express_1 = require("express");
const response_1 = require("../../lib/response");
const logindao_1 = require("../../redis/logindao");
const ads_1 = require("../../model/ads/ads");
const category_1 = require("../../model/ads/category");
const category_2 = require("../../model/ads/category");
const resource_1 = require("../../config/resource");
const fs_1 = require("../../lib/fs");
const upload_1 = require("../../lib/upload");
const path = require("path");
exports.router = express_1.Router();
exports.router.post('/:adtypeuuid/image', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let adtypeuuid = req.params["adtypeuuid"];
        try {
            validator_2.validateCgi({ uuid: adtypeuuid }, validator_1.adstypeValidator.UUID);
            let newPath = yield upload_1.uploadAdsImage(req, {
                uuid: adtypeuuid,
                glob: resource_1.adscategoryImgOpt.glob,
                tmpDir: resource_1.adscategoryImgOpt.tmpDir,
                maxSize: resource_1.adscategoryImgOpt.maxSize,
                extnames: resource_1.adscategoryImgOpt.extnames,
                maxFiles: resource_1.adscategoryImgOpt.maxFiles,
                targetDir: resource_1.adscategoryImgOpt.targetDir,
                fieldName: resource_1.adscategoryImgOpt.fieldName,
            });
            yield category_2.modifilyPic(adtypeuuid, newPath);
            return response_1.createdOk(res, { path: newPath });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.delete('/:adtypeuuid/image', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let mediaName = req.body.mediaName;
        let adtypeuuid = req.params["adtypeuuid"];
        try {
            validator_2.validateCgi({ uuid: adtypeuuid }, validator_1.adstypeValidator.UUID);
            mediaName = path.join(resource_1.adscategoryImgOpt.targetDir, adtypeuuid, mediaName);
            yield fs_1.removeAsync(mediaName);
            //更新到数据库
            yield category_2.modifilyPic(adtypeuuid, null);
            return response_1.deleteOK(res, { msg: "删除成功！" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/* GET adtype listing. */
exports.router.get('/adtype', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let ip = yield getClientIp(req);
            console.log("remoteAddress = " + req.connection.remoteAddress); // 未发生代理时，请求的ip
            console.log("ip===>", ip);
            let adtype = yield category_2.getCategory();
            let searchAll = yield category_2.getsearchAll("查看所有");
            let coupon = yield category_2.getsearchAll("优惠券");
            let recommend = yield category_2.getsearchAll("推荐");
            return response_1.sendOK(res, { adtype: adtype, searchAll: searchAll, coupon: coupon, recommend: [recommend] });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/* async function getClientIp(req: any) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
}; */
function getClientIp(req) {
    return __awaiter(this, void 0, void 0, function* () {
        var ip = req.headers['x-forwarded-for'] ||
            req.ip ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress || '';
        if (ip.split(',').length > 0) {
            ip = ip.split(',')[0];
        }
        return ip;
    });
}
;
/* GET adslog listing. */
exports.router.get('/subtype', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // 获取参数
        const { parentuuid } = req.query;
        try {
            validator_2.validateCgi({ uuid: parentuuid }, validator_1.crmuserValidator.uuid);
            let subtype = yield category_2.getSubcategory(parentuuid);
            return response_1.sendOK(res, { subtype });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.post('/type', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let body = req.body;
        const { name, parentname, position } = body;
        try {
            validator_2.validateCgi({ name, parentname }, validator_1.adstypeValidator.typaname);
            let adtype = yield category_2.getByName(parentname);
            if (!adtype)
                adtype = yield category_2.insert(parentname, undefined, position);
            let subtype;
            if (name) {
                subtype = yield category_2.insert(name, adtype.uuid, position);
            }
            return response_1.sendOK(res, { adtype, subtype });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//修改类的position,就是优先放前面
exports.router.put('/', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { uuid, position } = req.body;
        validator_2.validateCgi({ uuid, position }, validator_1.adstypeValidator.updatePo);
        try {
            let r = yield category_2.updatePositon(uuid, position);
            if (r)
                return response_1.sendOK(res, { msg: "succ" });
            return response_1.sendErrMsg(res, "failed", 500);
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
exports.router.get('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // 获取参数
        let uuid = req.params["uuid"];
        try {
            validator_2.validateCgi({ uuid }, validator_1.crmuserValidator.uuid);
            let subtype = yield category_2.findByPrimary(uuid);
            return response_1.sendOK(res, { subtype });
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
                validator_2.validateCgi({ position: parseInt(positions[i].order), uuid: positions[i].uuid }, validator_1.adstypeValidator.orderAndUuid);
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
        const { name, position } = req.body;
        try {
            validator_2.validateCgi({ uuid }, validator_1.crmuserValidator.uuid);
            const info = req.loginInfo;
            if (!info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            let subtype = yield category_2.updateNameAndPositon(name, position, uuid);
            return response_1.sendOK(res, { subtype });
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
            validator_2.validateCgi({ uuid }, validator_1.adstypeValidator.UUID);
            if (!info.isRoot())
                return response_1.sendNoPerm(res);
            let category = yield category_2.findByPrimary(uuid);
            if (!category)
                return response_1.sendOK(res, { category: "不存在该类" });
            //判断是大类还是小类
            if (!category.parent) {
                //删除大类，删除所对应的广告
                yield ads_1.updateDeleted(uuid);
                //删除小类
                yield category_1.deleteSubCategory(uuid);
                //删除大类
                yield category_1.deleteCategory(uuid);
            }
            else {
                //如果是小类，删除所对应的广告
                yield ads_1.updateDeletedsub(uuid);
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
//# sourceMappingURL=type.js.map