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
const modelName = "trend.reflect";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        useruuid: sequelize_1.DataTypes.UUID,
        trenduuid: sequelize_1.DataTypes.UUID,
        commentuuid: sequelize_1.DataTypes.UUID,
        state: sequelize_1.DataTypes.STRING,
        reason: sequelize_1.DataTypes.TEXT,
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME,
    }, {
        timestamps: false,
        schema: "trend",
        freezeTableName: true,
        tableName: "reflect",
    });
};
function insertReflect(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let t = yield global_1.getModel(modelName).create(obj, { returning: true });
        return t ? t.get() : undefined;
    });
}
exports.insertReflect = insertReflect;
function updateReflectState(uuid, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ state }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateReflectState = updateReflectState;
function findAllReflect(state, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { state }, offset: cursor, limit: limit });
        return res.map(r => r.get());
    });
}
exports.findAllReflect = findAllReflect;
function getCount(state) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).count({ where: { state } });
    });
}
exports.getCount = getCount;
//# sourceMappingURL=reflect.js.map