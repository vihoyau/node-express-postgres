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
const modelName = "users.levels";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        levels: sequelize_1.DataTypes.CHAR(20),
        fromexp: sequelize_1.DataTypes.RANGE,
        discount: sequelize_1.DataTypes.INTEGER,
        modified: sequelize_1.DataTypes.TIME,
    }, {
        timestamps: false,
        schema: "users",
        freezeTableName: true,
        tableName: "levels",
    });
};
function createLevels(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create(obj);
        return res.get();
    });
}
exports.createLevels = createLevels;
function deleteLevels(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).destroy({ where: { uuid: uuid } });
    });
}
exports.deleteLevels = deleteLevels;
function updateLevels(uuid, obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update(obj, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateLevels = updateLevels;
function findByid(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findByPrimary(uuid);
        return res.get();
    });
}
exports.findByid = findByid;
function getCount(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).count({ where: obj });
        return res;
    });
}
exports.getCount = getCount;
function findAll(obj, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: obj, order: [["levels", "asc"]], offset: cursor, limit: limit });
        return res.map(r => r.get());
    });
}
exports.findAll = findAll;
function findAlllevels(cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ order: [["levels", "asc"]], offset: cursor, limit: limit });
        return res.map(r => r.get());
    });
}
exports.findAlllevels = findAlllevels;
function findByExp(exp) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { fromexp: { $containsin: exp } } });
        return res.get();
    });
}
exports.findByExp = findByExp;
function getMaxExp(sequelize) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select "max"(upper(l.fromexp) )from users.levels l`, { type: "select" });
        return res;
    });
}
exports.getMaxExp = getMaxExp;
//# sourceMappingURL=levels.js.map