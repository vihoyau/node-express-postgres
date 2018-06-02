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
const [schema, table] = ["pay", "wxtrade"];
const modelName = `${schema}.${table}`;
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        orderuuids: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.UUID),
        useruuid: sequelize_1.DataTypes.UUID,
        out_trade_no: sequelize_1.DataTypes.TEXT,
        openid: sequelize_1.DataTypes.TEXT,
        prepay_id: sequelize_1.DataTypes.TEXT,
        state: {
            type: sequelize_1.DataTypes.ENUM,
            values: ["new", "fin", "abandon"]
        },
        appid: sequelize_1.DataTypes.TEXT,
        mch_id: sequelize_1.DataTypes.TEXT,
        body: sequelize_1.DataTypes.TEXT,
        total_fee: sequelize_1.DataTypes.INTEGER,
        spbill_create_ip: sequelize_1.DataTypes.TEXT,
        trade_type: {
            type: sequelize_1.DataTypes.ENUM,
            values: ["APP", "WEB", "NATIVE"]
        },
        ext: sequelize_1.DataTypes.JSONB,
        status: sequelize_1.DataTypes.INTEGER,
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME,
    }, {
        timestamps: false,
        schema: schema,
        freezeTableName: true,
        tableName: table,
    });
};
function insertNewTrade(order) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create(order);
        return res ? res.get() : undefined;
    });
}
exports.insertNewTrade = insertNewTrade;
function findByTradeNo(tradeNo) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { out_trade_no: tradeNo } });
        return res ? res.get() : undefined;
    });
}
exports.findByTradeNo = findByTradeNo;
function setWxTradeState(tradeNo, state) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).update({ state: state }, { where: { out_trade_no: tradeNo } });
    });
}
exports.setWxTradeState = setWxTradeState;
function findByprimay(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findByPrimary(uuid);
        return res ? res.get() : undefined;
    });
}
exports.findByprimay = findByprimay;
function updateStatusByUUID(uuid, status) {
    return __awaiter(this, void 0, void 0, function* () {
        let [num, res] = yield global_1.getModel(modelName).update({ status }, { where: { uuid }, returning: true });
        return num > 0 ? res[0].get() : undefined;
    });
}
exports.updateStatusByUUID = updateStatusByUUID;
//# sourceMappingURL=wxtrade.js.map