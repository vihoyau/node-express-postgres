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
const modelName = "evaluate.evaluatelog";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        groupuuid: {
            primaryKey: true,
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        users: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.JSONB),
        activityuuid: sequelize_1.DataTypes.UUID,
        state: sequelize_1.DataTypes.STRING,
        goodtitle: sequelize_1.DataTypes.STRING,
        turnover: sequelize_1.DataTypes.FLOAT,
        created: sequelize_1.DataTypes.TIME //开团时间
    }, {
        timestamps: false,
        schema: "evaluate",
        freezeTableName: true,
        tableName: "evaluatelog",
    });
};
function insertEvaluateLog(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create(obj);
        return res.get();
    });
}
exports.insertEvaluateLog = insertEvaluateLog;
function findByState(act, state, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({
            where: { activityuuid: act, state: state }, offset: cursor, limit: limit
        });
        return res ? res.map(r => r.get()) : undefined;
    });
}
exports.findByState = findByState;
function getCountByStateAndActUUID(state, activityuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).count({ where: { state, activityuuid } });
        return res ? res : 0;
    });
}
exports.getCountByStateAndActUUID = getCountByStateAndActUUID;
//# sourceMappingURL=evaluatelog.js.map