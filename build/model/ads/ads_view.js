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
const sequelize_1 = require("sequelize");
const global_1 = require("../../lib/global");
const modelName = "ads.ads_view";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4
        },
        useruuid: sequelize_1.DataTypes.UUID,
        adsuuid: sequelize_1.DataTypes.UUID,
        ext: sequelize_1.DataTypes.JSONB,
        modified: sequelize_1.DataTypes.TIME
    }, {
        timestamps: false,
        schema: "ads",
        freezeTableName: true,
        tableName: "ads_view",
    });
};
//添加广告浏览记录
function insertAdsView(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).insertOrUpdate(obj);
        return res ? res : undefined;
    });
}
exports.insertAdsView = insertAdsView;
//根据useruuid 和adsuuid 获取查询
function getAdsviewByuuid(useruuid, adsuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ attributes: ['uuid'], where: { useruuid: useruuid, adsuuid: adsuuid } });
        return res ? res.get("uuid") : undefined;
    });
}
exports.getAdsviewByuuid = getAdsviewByuuid;
//删除单个浏览记录
function delelteAdsview(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).destroy({ where: { uuid: uuid } });
    });
}
exports.delelteAdsview = delelteAdsview;
//获取单个浏览记录数量
function getAdsviewCount(useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).count({ where: { useruuid: useruuid } });
        return res ? res : 0;
    });
}
exports.getAdsviewCount = getAdsviewCount;
//删除用户的全部浏览记录
function deleteAllbyuseruuid(useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).destroy({ where: { useruuid: useruuid } });
    });
}
exports.deleteAllbyuseruuid = deleteAllbyuseruuid;
//查询用户的广告浏览记录
function findAll(sequelize, useruuid, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`SELECT
	v.*, A ."content",
	A .pics,
	A .created AS adscreated,
	A.title,
    A.hot,
	ae.views,
	ae.virtviews
FROM
	ads.ads_view AS v
LEFT JOIN ads.ads AS A ON v.adsuuid = A .uuid
LEFT JOIN ads.ads_ext as ae on A.uuid=ae.uuid
WHERE
	v.useruuid = '${useruuid}'
AND A . STATE = 'on'
 AND A .deleted = 0 offset ${cursor}  limit ${limit}`, { type: "select" });
        return res;
    });
}
exports.findAll = findAll;
//# sourceMappingURL=ads_view.js.map