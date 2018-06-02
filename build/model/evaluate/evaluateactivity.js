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
const modelName = "evaluate.evaluateactivity";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        tag: sequelize_1.DataTypes.STRING,
        amount: sequelize_1.DataTypes.INTEGER,
        starttime: sequelize_1.DataTypes.STRING,
        endtime: sequelize_1.DataTypes.STRING,
        state: sequelize_1.DataTypes.STRING,
        gooduuid: sequelize_1.DataTypes.UUID,
        marketprice: sequelize_1.DataTypes.FLOAT,
        reserveprice: sequelize_1.DataTypes.FLOAT,
        freeprobability: sequelize_1.DataTypes.FLOAT,
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME
    }, {
        timestamps: false,
        schema: "evaluate",
        freezeTableName: true,
        tableName: "evaluateactivity",
    });
};
function createEvaluateActivity(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create(obj);
        return res.get();
    });
}
exports.createEvaluateActivity = createEvaluateActivity;
function delEvaluateActivity(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).destroy({ where: { uuid: uuid } });
    });
}
exports.delEvaluateActivity = delEvaluateActivity;
function actGetCount() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).count();
    });
}
exports.actGetCount = actGetCount;
function actGetCountByTag(sequelize, tag) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
    select count(*) from evaluate.evaluateactivity a
    where a.tag like '%${tag}%'`, { type: "SELECT" });
        return res[0].count;
    });
}
exports.actGetCountByTag = actGetCountByTag;
function findAllEvaluateActivityByTag(tag, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({
            where: {
                $or: [
                    { tag: { $like: '%' + tag + '%' } }
                ]
            }, offset: cursor, limit: limit, order: [['created', 'desc']]
        });
        return res ? res.map(r => r.get()) : undefined;
    });
}
exports.findAllEvaluateActivityByTag = findAllEvaluateActivityByTag;
function updateEvaluateActivity(uuid, obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update(obj, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateEvaluateActivity = updateEvaluateActivity;
function findAllEvaluateActivity(cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ offset: cursor, limit: limit, });
        return res.map(r => r.get());
    });
}
exports.findAllEvaluateActivity = findAllEvaluateActivity;
function findAllProcessingActivity(sequelize, cursor, limit, now) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
    select * from evaluate.evaluateactivity a
    where a.starttime<'${now}'
    and a.endtime>'${now}'
    and (a.state is null or a.state = '')
    offset ${cursor} limit ${limit}
    `, { type: "SELECT" });
        return res;
    });
}
exports.findAllProcessingActivity = findAllProcessingActivity;
function findByTag(sequelize, keyword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield sequelize.query(`
        select * from evaluate.evaluateactivity a
        where a.tag like '%${keyword}%'`);
    });
}
exports.findByTag = findByTag;
//克隆一个活动，并重新定义时间段，旧的活动并没有删除，是为了不混淆旧活动的参与者
function updateEvaluateActivityUUID(sequelize, uuid, starttime, endtime) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield sequelize.transaction((t) => __awaiter(this, void 0, void 0, function* () {
            let res = yield global_1.getModel(modelName).findByPrimary(uuid, { transaction: t });
            let obj = res.get();
            obj.starttime = starttime;
            obj.endtime = endtime;
            obj.state = '';
            delete obj.uuid;
            let newres = yield global_1.getModel(modelName).create(obj, { transaction: t });
            return newres.get();
        }));
    });
}
exports.updateEvaluateActivityUUID = updateEvaluateActivityUUID;
function findByPrimaryUUID(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findByPrimary(uuid);
        return res ? res.get() : undefined;
    });
}
exports.findByPrimaryUUID = findByPrimaryUUID;
//# sourceMappingURL=evaluateactivity.js.map