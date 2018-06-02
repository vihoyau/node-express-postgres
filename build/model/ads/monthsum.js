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
const [schema, table] = ["ads", "monthsum"];
const modelName = `${schema}.${table}`;
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        advertiseruuid: sequelize_1.DataTypes.UUID,
        date: sequelize_1.DataTypes.STRING,
        points: sequelize_1.DataTypes.INTEGER,
        show: sequelize_1.DataTypes.INTEGER,
        consume: sequelize_1.DataTypes.FLOAT,
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME,
    }, {
        timestamps: false,
        schema: schema,
        freezeTableName: true,
        tableName: table,
    });
};
//插入一条记录
function insertMonthSum(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let re = yield global_1.getModel(modelName).create(obj);
        return re ? re : undefined;
    });
}
exports.insertMonthSum = insertMonthSum;
//找这个广告商某天的汇总记录
function findByMonthAndUUID(date, advertiseruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { date, advertiseruuid } });
        return res ? res.get() : undefined;
    });
}
exports.findByMonthAndUUID = findByMonthAndUUID;
//# sourceMappingURL=monthsum.js.map