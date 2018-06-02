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
const modelName = "mall.favoriate";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        useruuid: sequelize_1.DataTypes.UUID,
        gooduuid: sequelize_1.DataTypes.UUID,
        created: sequelize_1.DataTypes.TIME,
    }, {
        timestamps: false,
        schema: "mall",
        freezeTableName: true,
        tableName: "favoriate"
    });
};
/**
 * 收藏商品
 */
function insertFavoriate(useruuid, gooduuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create({ useruuid: useruuid, gooduuid: gooduuid }, { returning: true });
        return res ? res.get() : undefined;
    });
}
exports.insertFavoriate = insertFavoriate;
/**
 * 列表显示已收藏的商品
 * @param sequelize
 * @param useruuid
 * @param cursor
 * @param limit
 */
function getFavoriateByDeletedAndUseruuid(sequelize, useruuid, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select * from mall.favoriate f ,mall.goods g where f.gooduuid=g.uuid and f.useruuid='${useruuid}' order by f.created desc offset ${cursor} limit ${limit}`, { type: "select" });
        return res;
    });
}
exports.getFavoriateByDeletedAndUseruuid = getFavoriateByDeletedAndUseruuid;
/**
 * 取消收藏
 * @param uuid
 */
function deleteFavoriateByUuid(gooduuid, useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).destroy({ where: { gooduuid: gooduuid, useruuid: useruuid } });
    });
}
exports.deleteFavoriateByUuid = deleteFavoriateByUuid;
/**
 * 查询收藏列表中的商品
 * @param gooduuid
 * @param useruuid
 */
function findFavoriateByUuid(gooduuid, useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { gooduuid: gooduuid, useruuid: useruuid } });
        return res ? res.get() : undefined;
    });
}
exports.findFavoriateByUuid = findFavoriateByUuid;
//获取单个收藏记录数量
function getGoodsfavorCount(useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).count({ where: { useruuid: useruuid } });
        return res ? res : 0;
    });
}
exports.getGoodsfavorCount = getGoodsfavorCount;
//# sourceMappingURL=favoriate.js.map