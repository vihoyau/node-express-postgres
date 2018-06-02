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
const modelName = "evaluate.evaluatejoin";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        useruuid: sequelize_1.DataTypes.UUID,
        activityuuid: sequelize_1.DataTypes.UUID,
        bid: sequelize_1.DataTypes.FLOAT,
        addressuuid: sequelize_1.DataTypes.UUID,
        inputcount: sequelize_1.DataTypes.INTEGER,
        leader: sequelize_1.DataTypes.BOOLEAN,
        pay: sequelize_1.DataTypes.BOOLEAN,
        groupuuid: sequelize_1.DataTypes.UUID,
        property: sequelize_1.DataTypes.JSONB,
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME
    }, {
        timestamps: false,
        schema: "evaluate",
        freezeTableName: true,
        tableName: "evaluatejoin",
    });
};
function createEvaluatejoin(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create(obj, { returning: true });
        return res.get();
    });
}
exports.createEvaluatejoin = createEvaluatejoin;
function updateEvaluatejoin(uuid, obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update(obj, { where: { uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateEvaluatejoin = updateEvaluatejoin;
function findAllEvaluateJoinByActivityUUID(sequelize, activityuuid, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
    select * from evaluate.evaluatejoin a
    where a.activityuuid = '${activityuuid}'
    and a.pay = true
    offset ${cursor} limit ${limit}
    `, { type: "SELECT" });
        return res;
    });
}
exports.findAllEvaluateJoinByActivityUUID = findAllEvaluateJoinByActivityUUID;
function findByUseruuidAndActuuid(useruuid, activityuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { useruuid: useruuid, activityuuid: activityuuid } });
        return res ? res.get() : undefined;
    });
}
exports.findByUseruuidAndActuuid = findByUseruuidAndActuuid;
function findUserByGroupUUID(groupuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { groupuuid: groupuuid }, order: [['bid', 'asc']] });
        return res.map(r => r.get());
    });
}
exports.findUserByGroupUUID = findUserByGroupUUID;
function findJoinUUID(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findByPrimary(uuid);
        return res ? res.get() : undefined;
    });
}
exports.findJoinUUID = findJoinUUID;
function findByUserUUID(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { useruuid: uuid } });
        return res.map(r => r.get());
    });
}
exports.findByUserUUID = findByUserUUID;
function findByUseruuidAndGroupuuid(useruuid, groupuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { useruuid: useruuid, groupuuid: groupuuid } });
        return res ? res.get() : undefined;
    });
}
exports.findByUseruuidAndGroupuuid = findByUseruuidAndGroupuuid;
//# sourceMappingURL=evaluatejoin.js.map