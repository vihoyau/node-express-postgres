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
const modelName = "mall.prize";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        prize: sequelize_1.DataTypes.JSONB,
        title: sequelize_1.DataTypes.CHAR(225),
        state: sequelize_1.DataTypes.ENUM('goods', 'coupon', 'point', 'balance'),
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME,
    }, {
        timestamps: false,
        schema: "mall",
        freezeTableName: true,
        tableName: "prize"
    });
};
/**
 * 创建奖品
 */
function insertPrize(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).create(obj, { returning: true });
    });
}
exports.insertPrize = insertPrize;
/**
 * 获得奖品详情
 * @param uuid
 */
function findByPrimary(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findByPrimary(uuid);
        return res ? res.get() : undefined;
    });
}
exports.findByPrimary = findByPrimary;
/**
 * 获得奖品详情
 * @param uuid
 */
function findAllPrize() {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { state: "goods" } });
        return res ? res.map(r => r.get()) : undefined;
    });
}
exports.findAllPrize = findAllPrize;
/**
 * 获得奖品列表
 */
function getPrizeList(cursor, limit, searchdata, state) {
    return __awaiter(this, void 0, void 0, function* () {
        state = "%" + state + "%";
        searchdata = "%" + searchdata + "%";
        let res = yield global_1.getModel(modelName).findAll({
            where: {
                $or: { title: { $like: searchdata } },
                state: { $like: state }
            },
            order: [['created', 'DESC']],
            limit: limit,
            offset: cursor
        });
        return res.map(r => r.get());
    });
}
exports.getPrizeList = getPrizeList;
/**
 * 获得奖品列表记录数
 */
function getCount(searchdata, state) {
    return __awaiter(this, void 0, void 0, function* () {
        state = "%" + state + "%";
        searchdata = "%" + searchdata + "%";
        let res = yield global_1.getModel(modelName).count({
            where: {
                $or: { title: { $like: searchdata } },
                state: { $like: state }
            }
        });
        return res ? res : undefined;
    });
}
exports.getCount = getCount;
/**
 * 修改奖品信息
 * @param Prize
 * @param uuid
 */
function updatePrizeInfo(prize, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update(prize, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updatePrizeInfo = updatePrizeInfo;
/**
 * 删除奖品
 * @param uuid
 */
function deletePrize(sequelize, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield sequelize.transaction((t) => __awaiter(this, void 0, void 0, function* () {
            yield global_1.getModel(modelName).destroy({ where: { uuid: uuid }, transaction: t });
            yield global_1.getModel("users.userprize").destroy({ where: { prizeuuid: uuid }, transaction: t });
            yield global_1.getModel("mall.lotterylevel").destroy({ where: { prizeuuid: uuid }, transaction: t });
        }));
    });
}
exports.deletePrize = deletePrize;
//# sourceMappingURL=prize.js.map