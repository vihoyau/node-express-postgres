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
const modelName = "ads.favorite";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        useruuid: sequelize_1.DataTypes.UUID,
        aduuid: sequelize_1.DataTypes.UUID,
        created: sequelize_1.DataTypes.TIME,
    }, {
        timestamps: false,
        schema: "ads",
        freezeTableName: true,
        tableName: "favorite",
    });
};
function getByUserAds(adsuuid, useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).find({ where: { useruuid: useruuid, aduuid: adsuuid } });
        return res ? res.get() : undefined;
    });
}
exports.getByUserAds = getByUserAds;
function getAdsUuids(useruuid, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { useruuid: useruuid }, offset: cursor, limit: limit, order: [['created', 'DESC']] });
        return res.map(r => r.get());
    });
}
exports.getAdsUuids = getAdsUuids;
function favoriateInsert(useruuid, adsuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).create({ useruuid: useruuid, aduuid: adsuuid }, { returning: true });
    });
}
exports.favoriateInsert = favoriateInsert;
function deleteByUserAds(adsuuid, useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        return global_1.getModel(modelName).destroy({ where: { aduuid: adsuuid, useruuid: useruuid } });
    });
}
exports.deleteByUserAds = deleteByUserAds;
//��ȡ�����ղؼ�¼����
function getAdsfaorCount(useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).count({ where: { useruuid: useruuid } });
        return res ? res : 0;
    });
}
exports.getAdsfaorCount = getAdsfaorCount;
//# sourceMappingURL=favoriate.js.map