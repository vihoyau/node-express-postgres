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
const modelName = "orders.shopping_cart";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4
        },
        useruuid: sequelize_1.DataTypes.UUID,
        gooduuid: sequelize_1.DataTypes.UUID,
        number: sequelize_1.DataTypes.INTEGER,
        property: sequelize_1.DataTypes.CHAR(200),
        pic: sequelize_1.DataTypes.CHAR(255),
        goodpoint: sequelize_1.DataTypes.INTEGER,
        goodprice: sequelize_1.DataTypes.INTEGER,
        stock: sequelize_1.DataTypes.INTEGER,
        modified: sequelize_1.DataTypes.TIME,
        created: sequelize_1.DataTypes.TIME,
    }, {
        timestamps: false,
        schema: "orders",
        freezeTableName: true,
        tableName: "shopping_cart"
    });
};
/**
 * 查询购物车所有购物车信息
 */
function findByUseruuid(sequelize, useruuid, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select d.*,s.* from orders.shopping_cart as s, mall.goods as d where s.gooduuid=d.uuid and d.state='onsale' and d.deleted=0 and s.useruuid='${useruuid}' order by s.created desc offset ${cursor} limit ${limit}`, { type: "select" });
        return res;
    });
}
exports.findByUseruuid = findByUseruuid;
/**
 * 根据useruuid和gooduuid查询所对应的购物车表
 */
function findNumberByUseruuidGooduuid(useruuid, gooduuid, property) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ attributes: ["number"], where: { useruuid: useruuid, gooduuid: gooduuid, property: property } });
        return res ? res.get('number') : undefined;
    });
}
exports.findNumberByUseruuidGooduuid = findNumberByUseruuidGooduuid;
/**
 * 根据useruuid和gooduuid更新所对应的购物车的购买数量
 */
function updateByUseruuidAndGooduuid(useruuid, gooduuid, property, number) {
    return __awaiter(this, void 0, void 0, function* () {
        let [numbe, res] = yield global_1.getModel(modelName).update({ number: number }, { where: { useruuid: useruuid, gooduuid: gooduuid, property: property }, returning: true });
        return numbe > 0 ? res[0].get() : undefined;
    });
}
exports.updateByUseruuidAndGooduuid = updateByUseruuidAndGooduuid;
/**
 * 添加购物车商品信息
 */
function insertShoppingCart(useruuid, gooduuid, property, number, pic, goodpoint, goodprice, stock) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create({ useruuid: useruuid, gooduuid: gooduuid, property: property, number: number, pic: pic, goodpoint: goodpoint, goodprice: goodprice, stock: stock }, { returning: true });
        return res ? res.get() : undefined;
    });
}
exports.insertShoppingCart = insertShoppingCart;
/**
 * 根据主键修改购买的商品的数量
 */
function updateNumberByUuid(uuid, number) {
    return __awaiter(this, void 0, void 0, function* () {
        let [numbe, res] = yield global_1.getModel(modelName).update({ number: sequelize_1.Sequelize.literal(`number+${number}`), }, { where: { uuid: uuid }, returning: true });
        return numbe > 0 ? res[0].get() : undefined;
    });
}
exports.updateNumberByUuid = updateNumberByUuid;
/**
 * 删除购物车中指定主键的商品
 */
function deleteByUuid(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).destroy({ where: { uuid: uuid } });
    });
}
exports.deleteByUuid = deleteByUuid;
//# sourceMappingURL=shopping_cart.js.map