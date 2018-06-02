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
const logger = require("winston");
const [schema, table] = ["users", "users_ext"];
const modelName = `${schema}.${table}`;
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        openid: sequelize_1.DataTypes.CHAR(64),
        appopenid: sequelize_1.DataTypes.CHAR(64),
        qqcode: sequelize_1.DataTypes.STRING,
        points: sequelize_1.DataTypes.INTEGER,
        total_points: sequelize_1.DataTypes.INTEGER,
        balance: sequelize_1.DataTypes.INTEGER,
        total_balance: sequelize_1.DataTypes.INTEGER,
        crm_balance: sequelize_1.DataTypes.INTEGER,
        crm_total_balance: sequelize_1.DataTypes.INTEGER,
        crm_points: sequelize_1.DataTypes.INTEGER,
        crm_total_points: sequelize_1.DataTypes.INTEGER,
        exp: sequelize_1.DataTypes.INTEGER,
        views: sequelize_1.DataTypes.INTEGER,
        modified: sequelize_1.DataTypes.TIME,
        margin: sequelize_1.DataTypes.INTEGER,
        crm_balance_state: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.INTEGER)
    }, {
        timestamps: false,
        schema: schema,
        freezeTableName: true,
        tableName: table,
    });
};
function updatePoints(uuid, obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number] = yield global_1.getModel(modelName).update({
            exp: sequelize_1.Sequelize.literal(`exp+${obj.exp}`),
            points: sequelize_1.Sequelize.literal(`points+${obj.points}`),
            balance: sequelize_1.Sequelize.literal(`balance+${obj.balance}`),
            total_points: sequelize_1.Sequelize.literal(`total_points+${obj.points}`),
            total_balance: sequelize_1.Sequelize.literal(`total_balance+${obj.balance}`)
        }, { where: { uuid: uuid }, });
        logger.error(`用户${uuid}===>exp+${obj.exp}===>points+${obj.points}==>balance+${obj.balance}`);
        return number;
    });
}
exports.updatePoints = updatePoints;
//新添加
function updatebalance_and_total_balance(uuid, expenses) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number] = yield global_1.getModel(modelName).update({
            crm_balance: sequelize_1.Sequelize.literal(`crm_balance+${expenses * 100}`),
            crm_total_balance: sequelize_1.Sequelize.literal(`crm_total_balance+${expenses * 100}`),
        }, { where: { uuid: uuid }, });
        logger.error(`用户${uuid}====>crm_balance+${expenses * 100}`);
        return number;
    });
}
exports.updatebalance_and_total_balance = updatebalance_and_total_balance;
//添加
function update_crm_total_balance(uuid, crm_balance) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number] = yield global_1.getModel(modelName).update({
            crm_total_balance: sequelize_1.Sequelize.literal(`crm_total_balance+${crm_balance}`),
        }, { where: { uuid: uuid }, });
        logger.error(`用户${uuid}====>crm_total_balance+${crm_balance}`);
        return number;
    });
}
exports.update_crm_total_balance = update_crm_total_balance;
function cut_crm_total_balance(uuid, crm_balance) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number] = yield global_1.getModel(modelName).update({
            crm_total_balance: sequelize_1.Sequelize.literal(`crm_total_balance-${crm_balance}`),
        }, { where: { uuid: uuid }, });
        return number;
    });
}
exports.cut_crm_total_balance = cut_crm_total_balance;
function recharge(uuid, moment) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number] = yield global_1.getModel(modelName).update({
            balance: sequelize_1.Sequelize.literal(`balance+${moment}`),
            total_balance: sequelize_1.Sequelize.literal(`total_balance+${moment}`),
        }, { where: { uuid: uuid }, });
        logger.error(`用户${uuid}====>balance+${moment}`);
        return number;
    });
}
exports.recharge = recharge;
function exchange(uuid, obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number] = yield global_1.getModel(modelName).update({
            balance: sequelize_1.Sequelize.literal(`balance-${obj.balance}`),
            points: sequelize_1.Sequelize.literal(`points-${obj.points}`),
        }, { where: { uuid: uuid }, });
        logger.error(`用户${uuid}====>balance-${obj.balance}===>points-${obj.points}`);
        return number;
    });
}
exports.exchange = exchange;
function findByPrimary(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let user = yield global_1.getModel(modelName).findByPrimary(uuid);
        return user ? user.get() : undefined;
    });
}
exports.findByPrimary = findByPrimary;
function updateOpenid(uuid, openid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ openid: openid }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateOpenid = updateOpenid;
function updateAppOpenid(uuid, openid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ appopenid: openid }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateAppOpenid = updateAppOpenid;
function updateQQcode(uuid, qqcode) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ qqcode: qqcode }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateQQcode = updateQQcode;
//新添加  修改margin保证金字段的状态
function modifyMargin(uuid, margin) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ margin: margin + '00' }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.modifyMargin = modifyMargin;
//新添加  修改crm_balance总余额字段字段的状态
function modify_crm_balance(uuid, crm_balance) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({
            crm_balance: sequelize_1.Sequelize.literal(`crm_balance+${crm_balance}`)
        }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.modify_crm_balance = modify_crm_balance;
function cut_crm_balance(uuid, crm_balance) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({
            crm_balance: sequelize_1.Sequelize.literal(`crm_balance-${crm_balance}`)
        }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.cut_crm_balance = cut_crm_balance;
function modify_crm_point(uuid, crm_points) {
    return __awaiter(this, void 0, void 0, function* () {
        let [num, res] = yield global_1.getModel(modelName).update({
            crm_points: sequelize_1.Sequelize.literal(`crm_points+${crm_points}`),
            crm_total_points: sequelize_1.Sequelize.literal(`crm_total_points+${crm_points}`)
        }, { where: { uuid }, returning: true });
        return num > 0 ? res[0].get() : undefined;
    });
}
exports.modify_crm_point = modify_crm_point;
function cut_crm_point(uuid, crm_points) {
    return __awaiter(this, void 0, void 0, function* () {
        let [num, res] = yield global_1.getModel(modelName).update({
            crm_points: sequelize_1.Sequelize.literal(`crm_points-${crm_points}`),
            crm_total_points: sequelize_1.Sequelize.literal(`crm_total_points-${crm_points}`)
        }, { where: { uuid }, returning: true });
        return num > 0 ? res[0].get() : undefined;
    });
}
exports.cut_crm_point = cut_crm_point;
//新添加  修改crm_balance_state审核字段的状态
function modify_crm_balance_state(uuid, crm_balance_state) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ crm_balance_state: crm_balance_state }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.modify_crm_balance_state = modify_crm_balance_state;
function updateexp(uuid, exp) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ exp: exp }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateexp = updateexp;
function addExp(uuid, exp) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number] = yield global_1.getModel(modelName).update({
            exp: sequelize_1.Sequelize.literal(`exp+${exp}`)
        }, { where: { uuid: uuid }, });
        logger.error(`用户${uuid}====>exp+${exp}`);
        return number;
    });
}
exports.addExp = addExp;
function delExp(uuids, exp) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number] = yield global_1.getModel(modelName).update({
            exp: sequelize_1.Sequelize.literal(`exp-${exp}`)
        }, { where: { uuid: uuids }, });
        logger.error(`用户${uuids}====>exp-${exp}`);
        return number;
    });
}
exports.delExp = delExp;
function findByOpenid(openid) {
    return __awaiter(this, void 0, void 0, function* () {
        let user = yield global_1.getModel(modelName).findAll({ where: { openid: openid } });
        return user.map(r => r.get());
    });
}
exports.findByOpenid = findByOpenid;
function findByAppOpenid(openid) {
    return __awaiter(this, void 0, void 0, function* () {
        let user = yield global_1.getModel(modelName).findAll({ where: { appopenid: openid } });
        return user.map(r => r.get());
    });
}
exports.findByAppOpenid = findByAppOpenid;
function findByQQcode(qqcode) {
    return __awaiter(this, void 0, void 0, function* () {
        let user = yield global_1.getModel(modelName).findAll({ where: { qqcode: qqcode } });
        return user.map(r => r.get());
    });
}
exports.findByQQcode = findByQQcode;
//得到user_ext表的信息表
function finduuid(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { uuid: uuid } });
        return res ? res.get() : undefined;
    });
}
exports.finduuid = finduuid;
/**
 * 增加广告浏览次数
 */
function updateAdsViews(uuid, views) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ views: sequelize_1.Sequelize.literal(`views+${views}`) }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateAdsViews = updateAdsViews;
/**
 * 减少广告浏览次数
 * @param uuid
 * @param views
 */
function modifiedAdsViews(uuid, views) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ views: sequelize_1.Sequelize.literal(`views-${views}`) }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.modifiedAdsViews = modifiedAdsViews;
//# sourceMappingURL=users_ext.js.map