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
const [schema, table] = ["pay", "alipay"];
const modelName = `${schema}.${table}`;
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        out_trade_no: {
            type: sequelize_1.DataTypes.TEXT,
            primaryKey: true,
        },
        useruuid: sequelize_1.DataTypes.UUID,
        orderuuids: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.UUID),
        state: {
            type: sequelize_1.DataTypes.ENUM,
            values: ["new", "fin", "abandon"]
        },
        total_amount: sequelize_1.DataTypes.FLOAT,
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME,
    }, {
        timestamps: false,
        schema: schema,
        freezeTableName: true,
        tableName: table,
    });
};
function insertOne(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create(obj);
        return res ? res.get() : undefined;
    });
}
exports.insertOne = insertOne;
function updateState(no, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let [num, res] = yield global_1.getModel(modelName).update({ state }, { where: { out_trade_no: no }, returning: true });
        return num > 0 ? res[0].get() : undefined;
    });
}
exports.updateState = updateState;
function findByPrimary(out_trade_no) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findByPrimary(out_trade_no);
        return res ? res.get() : undefined;
    });
}
exports.findByPrimary = findByPrimary;
//# sourceMappingURL=alipay.js.map