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
const modelName = "trend.trend";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        useruuid: sequelize_1.DataTypes.UUID,
        state: sequelize_1.DataTypes.INTEGER,
        content: sequelize_1.DataTypes.TEXT,
        pics: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
        mov: sequelize_1.DataTypes.TEXT,
        preview: sequelize_1.DataTypes.TEXT,
        reward: sequelize_1.DataTypes.FLOAT,
        question_ext: sequelize_1.DataTypes.JSONB,
        answer_mold: sequelize_1.DataTypes.JSONB,
        random: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.INTEGER),
        nice: sequelize_1.DataTypes.INTEGER,
        comment: sequelize_1.DataTypes.INTEGER,
        share: sequelize_1.DataTypes.INTEGER,
        mold: sequelize_1.DataTypes.STRING,
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME,
    }, {
        timestamps: false,
        schema: "trend",
        freezeTableName: true,
        tableName: "trend",
    });
};
function insertTrend(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let t = yield global_1.getModel(modelName).create(obj, { returning: true });
        return t ? t.get() : undefined;
    });
}
exports.insertTrend = insertTrend;
function countByState(state) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).count({ where: { state } });
    });
}
exports.countByState = countByState;
function deleteTrend(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).destroy({ where: { uuid: uuid } });
    });
}
exports.deleteTrend = deleteTrend;
function updateTrend(uuid, obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update(obj, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateTrend = updateTrend;
function findByTrendUUID(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findByPrimary(uuid);
        return res ? res.get() : undefined;
    });
}
exports.findByTrendUUID = findByTrendUUID;
function findAllTrend(sequelize, state, cursor, limit, shield) {
    return __awaiter(this, void 0, void 0, function* () {
        let res;
        if (shield) {
            let uuid = "(";
            for (let j = 0; j < shield.length; j++) {
                if (j == shield.length - 1) {
                    uuid = uuid + "'" + shield[j].shielduuid + "'";
                }
                else {
                    uuid = uuid + "'" + shield[j].shielduuid + "',";
                }
            }
            uuid += ")";
            res = (yield sequelize.query(`
        select t.*,u.username,u.headurl,u.nickname from trend.trend t,users.users u
        where t.useruuid = u.uuid
        and t.state = '${state}'
        and t.useruuid not in ${uuid}
        order by t.created desc
        offset ${cursor}
        limit ${limit}
        `, { type: "select" }));
        }
        else {
            res = (yield sequelize.query(`
        select t.*,u.username,u.headurl,u.nickname from trend.trend t,users.users u
        where t.useruuid = u.uuid
        and t.state = '${state}'
        order by t.created desc
        offset ${cursor}
        limit ${limit}
        `, { type: "select" }));
        }
        return res;
    });
}
exports.findAllTrend = findAllTrend;
function findAllTrendByKeyWord(sequelize, cursor, limit, keyword) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
    select t.*,u.username,u.headurl,u.nickname from trend.trend t,users.users u
    where t.useruuid = u.uuid
    and t.state = 'on'
    and t.content like '%${keyword}%'
    order by t.created desc
    offset ${cursor}
    limit ${limit}
    `, { type: "select" });
        return res;
    });
}
exports.findAllTrendByKeyWord = findAllTrendByKeyWord;
function trendUpdateNice(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ nice: sequelize_1.Sequelize.literal(`nice+ 1`) }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.trendUpdateNice = trendUpdateNice;
function trendCutNice(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ nice: sequelize_1.Sequelize.literal(`nice- 1`) }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.trendCutNice = trendCutNice;
function findByUserUUID(sequelize, useruuid, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
    select t.*,u.username,u.headurl,u.nickname from trend.trend t,users.users u
    where t.useruuid = u.uuid
    and t.state = 'on'
    and t.useruuid = '${useruuid}'
    order by t.created desc
    offset ${cursor}
    limit ${limit}
    `, { type: "select" });
        return res;
    });
}
exports.findByUserUUID = findByUserUUID;
function trendUpdateShare(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ share: sequelize_1.Sequelize.literal(`share+ 1`) }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.trendUpdateShare = trendUpdateShare;
function trendUpdateCom(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ comment: sequelize_1.Sequelize.literal(`comment+ 1`) }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.trendUpdateCom = trendUpdateCom;
function trendDownCom(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ comment: sequelize_1.Sequelize.literal(`comment- 1`) }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.trendDownCom = trendDownCom;
function modifilyMov(uuid, mov, preview) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ mov, preview }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.modifilyMov = modifilyMov;
//# sourceMappingURL=trend.js.map