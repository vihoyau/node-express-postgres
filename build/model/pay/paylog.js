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
const [schema, table] = ["pay", "paylog"];
const modelName = `${schema}.${table}`;
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        re_user_name: sequelize_1.DataTypes.TEXT,
        amount: sequelize_1.DataTypes.INTEGER,
        description: sequelize_1.DataTypes.TEXT,
        ext: sequelize_1.DataTypes.JSONB,
        useruuid: sequelize_1.DataTypes.UUID,
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME,
    }, {
        timestamps: false,
        schema: schema,
        freezeTableName: true,
        tableName: table,
    });
};
function createdPaylog(paylog) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).create(paylog, { returning: true });
    });
}
exports.createdPaylog = createdPaylog;
function getByUseruuid(useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { useruuid: useruuid, created: { $gt: sequelize_1.Sequelize.literal(`now() - interval '${7} day'`) } } });
        return res.map(r => r.get());
    });
}
exports.getByUseruuid = getByUseruuid;
//# sourceMappingURL=paylog.js.map