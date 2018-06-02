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
const modelName = "mall.goods_ext";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4
        },
        views: sequelize_1.DataTypes.INTEGER,
        volume: sequelize_1.DataTypes.INTEGER,
        sales: sequelize_1.DataTypes.INTEGER // 已售数量
    }, {
        timestamps: false,
        schema: "mall",
        freezeTableName: true,
        tableName: "goods_ext"
    });
};
// 热门商品列表
function findByViews(sequelize) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
        select * from mall.goods a
        left join mall.goods_ext b on a.uuid = b.uuid
        where a.state = 'onsale' and a.deleted = 0
        order by b.views
        limit 3`, { type: "select" });
        return res;
    });
}
exports.findByViews = findByViews;
function orderBySales(seque, cursor, limit, category) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield seque.query(`select * from mall.goods a
        left join mall.goods_ext b on a.uuid = b.uuid
        where a.state = 'onsale' and a.deleted = 0
        and  a.category ='${category}'
        order by b.sales desc
        offset ${cursor} limit ${limit}`, { type: "SELECT" });
        return res;
    });
}
exports.orderBySales = orderBySales;
function orderBySubCategoryCSales(seque, cursor, limit, subcategory) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield seque.query(`select * from mall.goods a
        left join mall.goods_ext b on a.uuid = b.uuid
        where a.state = 'onsale' and a.deleted = 0
        and  a.subcategory ='${subcategory}'
        order by b.sales desc
        offset ${cursor} limit ${limit}`, { type: "SELECT" });
        return res;
    });
}
exports.orderBySubCategoryCSales = orderBySubCategoryCSales;
function findByKeywordSales(keyword, seque, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield seque.query(`select * from mall.goods a
        left join mall.goods_ext b on a.uuid = b.uuid
        where a.state = 'onsale' and a.deleted = 0
        and  (a.keyword like '%${keyword}%' or a.title like '%${keyword}%')
        order by b.sales desc
        offset ${cursor} limit ${limit}`, { type: "SELECT" });
        return res;
    });
}
exports.findByKeywordSales = findByKeywordSales;
function updateViews(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number] = yield global_1.getModel(modelName).update({
            exp: sequelize_1.Sequelize.literal(`views+1`)
        }, { where: { uuid: uuid }, returning: true });
        return number;
    });
}
exports.updateViews = updateViews;
function updateOnsales(uuid, sales) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number] = yield global_1.getModel(modelName).update({
            exp: sequelize_1.Sequelize.literal(`sales+${sales}`)
        }, { where: { uuid: uuid }, returning: true });
        return number;
    });
}
exports.updateOnsales = updateOnsales;
//# sourceMappingURL=goods_ext.js.map