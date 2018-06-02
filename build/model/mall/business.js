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
const modelName = "mall.business";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        openid: sequelize_1.DataTypes.CHAR(48),
        business: sequelize_1.DataTypes.CHAR(128),
        contacts: sequelize_1.DataTypes.CHAR(128),
        phone: sequelize_1.DataTypes.CHAR(24),
        licence: sequelize_1.DataTypes.TEXT,
        state: sequelize_1.DataTypes.ENUM('on', 'off'),
        address: sequelize_1.DataTypes.JSONB,
        detailaddr: sequelize_1.DataTypes.STRING,
        description: sequelize_1.DataTypes.TEXT,
        ext: sequelize_1.DataTypes.JSONB,
        adminruuid: sequelize_1.DataTypes.UUID,
        mallcrmuuid: sequelize_1.DataTypes.UUID,
        commission: sequelize_1.DataTypes.INTEGER,
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME,
    }, {
        timestamps: false,
        schema: "mall",
        freezeTableName: true,
        tableName: "business"
    });
};
/**
 * 添加商家
 * @param obj
 */
function insertbusiness(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).create(obj, { returning: true });
    });
}
exports.insertbusiness = insertbusiness;
/**
 * 获得商家列表
 * @param cursor
 * @param limit
 * @param searchdata
 */
function getbusinesslist(cursor, limit, searchdata) {
    return __awaiter(this, void 0, void 0, function* () {
        searchdata = '%' + searchdata + '%';
        let res = yield global_1.getModel(modelName).findAll({
            where: {
                $or: [{ business: { $like: searchdata } }, { contacts: { $like: searchdata } }, { phone: { $like: searchdata } }],
            },
            order: [['modified', 'DESC']],
            limit: limit,
            offset: cursor
        });
        return res.map(r => r.get());
    });
}
exports.getbusinesslist = getbusinesslist;
/**
 * 获得商家列表记录数
 * @param searchdata
 */
function getCount(searchdata) {
    return __awaiter(this, void 0, void 0, function* () {
        searchdata = '%' + searchdata + '%';
        let res = yield global_1.getModel(modelName).count({
            where: {
                $or: [{ business: { $like: searchdata } }, { contacts: { $like: searchdata } }, { phone: { $like: searchdata } }],
            }
        });
        return res ? res : undefined;
    });
}
exports.getCount = getCount;
/**
 * 获得所有商家名称
 */
function getbusiness() {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ attributes: ['uuid', 'business'], order: [['business', 'asc']] });
        return res ? res.map(r => r.get()) : undefined;
    });
}
exports.getbusiness = getbusiness;
/**
 * 获得商家详情
 * @param uuid
 */
function getByPrimary(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { uuid: uuid } });
        return res ? res.get() : undefined;
    });
}
exports.getByPrimary = getByPrimary;
/**
 * 修改商家信息（or 禁用商家）
 * @param business
 * @param uuid
 */
function updatebusiness(business, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update(business, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updatebusiness = updatebusiness;
//# sourceMappingURL=business.js.map