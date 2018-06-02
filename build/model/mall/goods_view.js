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
const modelName = "mall.goods_view";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4
        },
        useruuid: sequelize_1.DataTypes.UUID,
        gooduuid: sequelize_1.DataTypes.UUID,
        num: sequelize_1.DataTypes.INTEGER,
        ext: sequelize_1.DataTypes.JSONB,
        modified: sequelize_1.DataTypes.TIME
    }, {
        timestamps: false,
        schema: "mall",
        freezeTableName: true,
        tableName: "goods_view",
    });
};
//添加商品浏览记录
function insertGoodsView(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create(obj);
        return res ? res : undefined;
    });
}
exports.insertGoodsView = insertGoodsView;
function updateGoodsView(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).update({ num: sequelize_1.Sequelize.literal(`num+${1}`) }, { where: { uuid: uuid }, returning: true });
        return res ? res : undefined;
    });
}
exports.updateGoodsView = updateGoodsView;
//根据useruuid 和 gooduuid 获取查询
function getGoodsviewByuuid(useruuid, gooduuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ attributes: ['uuid'], where: { useruuid: useruuid, gooduuid: gooduuid } });
        return res ? res.get("uuid") : undefined;
    });
}
exports.getGoodsviewByuuid = getGoodsviewByuuid;
//删除单个浏览记录
function delelteGoodsview(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).destroy({ where: { uuid: uuid } });
    });
}
exports.delelteGoodsview = delelteGoodsview;
//删除用户的全部浏览记录
function deleteAllbyuseruuid(useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).destroy({ where: { useruuid: useruuid } });
    });
}
exports.deleteAllbyuseruuid = deleteAllbyuseruuid;
//查询用户的浏览记录
function findAll(sequelize, useruuid, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        // let res = await getModel(modelName).findAll({ where: { useruuid: useruuid }, offset: cursor, limit: limit })
        let res = yield sequelize.query(`select v.*,g.title,g.realprice,g.price,g.points, g.pics,g.created as goodscreated from mall.goods_view as v left join mall.goods as g on v.gooduuid =g.uuid where v.useruuid ='${useruuid}' and g.state='onsale' and g.deleted=0 offset ${cursor}  limit ${limit}`, { type: "select" });
        return res;
    });
}
exports.findAll = findAll;
//获取单个收藏记录数量
function getGoodsviesrCount(useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).count({ where: { useruuid: useruuid } });
        return res ? res : 0;
    });
}
exports.getGoodsviesrCount = getGoodsviesrCount;
//# sourceMappingURL=goods_view.js.map