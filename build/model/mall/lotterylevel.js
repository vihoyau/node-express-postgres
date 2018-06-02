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
const modelName = "mall.lotterylevel";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        level: sequelize_1.DataTypes.INTEGER,
        prizeuuid: sequelize_1.DataTypes.UUID,
        num: sequelize_1.DataTypes.INTEGER,
        title: sequelize_1.DataTypes.CHAR(225),
        state: sequelize_1.DataTypes.ENUM('pointlottery', 'cashlottery'),
        receive: sequelize_1.DataTypes.ENUM('false', 'true'),
        awardnum: sequelize_1.DataTypes.INTEGER,
        limitcount: sequelize_1.DataTypes.INTEGER,
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME
    }, {
        timestamps: false,
        schema: "mall",
        freezeTableName: true,
        tableName: "lotterylevel"
    });
};
/**
 * 创建奖品等级
 */
function insertLotterylevel(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).create(obj, { returning: true });
    });
}
exports.insertLotterylevel = insertLotterylevel;
/**
 * 获得奖品等级详情
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
 * 获得奖品等级详情
 * @param uuid
 */
function findLotteryLevel(level, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { level: level, state: state } });
        return res ? res.get() : undefined;
    });
}
exports.findLotteryLevel = findLotteryLevel;
/**
 * 根据等级抽奖类型获得奖品等级详情
 * @param uuid
 * @param state
 */
function findByLevel(sequelize, level, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select sum(num) from mall.lotterylevel where "level"=${level} and state='${state}'`, { type: "select" });
        return res[0].sum;
    });
}
exports.findByLevel = findByLevel;
/**
 * 根据等级抽奖类型获得奖品等级详情
 * @param uuid
 * @param state
 */
function findnumcout(sequelize, level, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select sum(num) from mall.lotterylevel where "level"=${level} and state='${state}'`, { type: "select" });
        return res[0].sum;
    });
}
exports.findnumcout = findnumcout;
/**
 * 获得奖品等级列表
 */
function getLotterylevelList(cursor, limit, state) {
    return __awaiter(this, void 0, void 0, function* () {
        state = '%' + state + '%';
        let res = yield global_1.getModel(modelName).findAll({
            where: {
                state: { $like: state }
            },
            order: [['level', 'ASC'], ['modified', 'DESC']],
            limit: limit,
            offset: cursor
        });
        return res.map(r => r.get());
    });
}
exports.getLotterylevelList = getLotterylevelList;
/**
 * 获得奖品等级列表记录数
 */
function getCount(state) {
    return __awaiter(this, void 0, void 0, function* () {
        state = '%' + state + '%';
        let res = yield global_1.getModel(modelName).count({
            where: {
                state: { $like: state }
            }
        });
        return res ? res : undefined;
    });
}
exports.getCount = getCount;
/**
 * 获得各个等级的奖励
 */
function getLotterylevel(state) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { state: state }, order: [['level', 'asc']] });
        return res ? res.map(r => r.get()) : undefined;
    });
}
exports.getLotterylevel = getLotterylevel;
/**
 * 修改奖品等级信息
 * @param lotterylevel
 * @param uuid
 */
function updateLotterylevelInfo(lotterylevel, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update(lotterylevel, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateLotterylevelInfo = updateLotterylevelInfo;
/**
 * 删除奖品等级
 * @param uuid
 */
function deleteLotterylevel(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).destroy({ where: { uuid: uuid } });
    });
}
exports.deleteLotterylevel = deleteLotterylevel;
/**
 * 修改奖品状态
 * @param code
 * @param state
 */
function getLotterylevels(sequelize, code, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select * from mall.lotterylevel where level=${code} and state='${state}' and num >0`, { type: "select" });
        let random = Math.floor((Math.random() * res.length));
        return res[random];
    });
}
exports.getLotterylevels = getLotterylevels;
/**
 * 减少奖品数量
 * @param uuid
 */
function updateLotterylevelNum(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, resp] = yield global_1.getModel(modelName).update({ num: sequelize_1.Sequelize.literal(`num-1`) }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? resp[0].get() : undefined;
    });
}
exports.updateLotterylevelNum = updateLotterylevelNum;
//# sourceMappingURL=lotterylevel.js.map