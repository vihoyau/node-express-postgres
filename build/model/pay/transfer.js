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
const [schema, table] = ["pay", "transfer"];
const modelName = `${schema}.${table}`;
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        mch_appid: sequelize_1.DataTypes.TEXT,
        mchid: sequelize_1.DataTypes.TEXT,
        partner_trade_no: sequelize_1.DataTypes.TEXT,
        openid: sequelize_1.DataTypes.TEXT,
        check_name: sequelize_1.DataTypes.TEXT,
        re_user_name: sequelize_1.DataTypes.TEXT,
        amount: sequelize_1.DataTypes.INTEGER,
        description: sequelize_1.DataTypes.TEXT,
        spbill_create_ip: sequelize_1.DataTypes.TEXT,
        nonce_str: sequelize_1.DataTypes.TEXT,
        state: {
            type: sequelize_1.DataTypes.ENUM,
            values: ["new", "fin", "abandon"]
        },
        failcount: sequelize_1.DataTypes.INTEGER,
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
function findByPartnerTradeNo(no) {
    return __awaiter(this, void 0, void 0, function* () {
        let r = yield global_1.getModel(modelName).findOne({ where: { partner_trade_no: no } });
        return r ? r.get() : undefined;
    });
}
exports.findByPartnerTradeNo = findByPartnerTradeNo;
function transterAmount(seqz, useruuid, transfer) {
    return __awaiter(this, void 0, void 0, function* () {
        let amount = transfer.amount;
        yield seqz.transaction((t) => __awaiter(this, void 0, void 0, function* () {
            let [number, res] = yield global_1.getModel("users.users_ext").update({
                balance: sequelize_1.Sequelize.literal(`balance-${amount}`)
            }, {
                where: { uuid: useruuid },
                returning: true,
                transaction: t
            });
            if (number === 0)
                throw new Error("用户不存在！");
            let ext = res[0];
            if (ext.get("balance") < 0)
                throw new Error("余额不足！");
            return global_1.getModel(modelName).create(transfer, { transaction: t });
        }));
    });
}
exports.transterAmount = transterAmount;
function findNewUUIDs(limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { state: "new" }, attributes: ["uuid"], order: "created", limit: limit });
        return res.map(r => r.get("uuid"));
    });
}
exports.findNewUUIDs = findNewUUIDs;
function setTransferState(uuid, ext, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let [num, res] = yield global_1.getModel(modelName).update({ ext: ext, state: state }, { where: { uuid: uuid }, returning: true });
        return num > 0 ? res[0].get() : undefined;
    });
}
exports.setTransferState = setTransferState;
function setTransferStateAbandon(transfer, ext) {
    return __awaiter(this, void 0, void 0, function* () {
        let amount = transfer.amount;
        yield global_1.getModel("users.users_ext").update({
            balance: sequelize_1.Sequelize.literal(`balance+${amount}`)
        }, {
            where: { uuid: transfer.useruuid },
            returning: true,
        });
        yield global_1.getModel(modelName).update({ ext: ext, state: "abandon" }, { where: { uuid: transfer.uuid } });
    });
}
exports.setTransferStateAbandon = setTransferStateAbandon;
function findById(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let r = yield global_1.getModel(modelName).findByPrimary(uuid);
        return r ? r.get() : undefined;
    });
}
exports.findById = findById;
function findStateByTradeNos(tradeNos) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({
            where: { partner_trade_no: { $in: tradeNos } },
            attributes: ["partner_trade_no", "state"]
        });
        return res.map(r => r.get());
    });
}
exports.findStateByTradeNos = findStateByTradeNos;
//# sourceMappingURL=transfer.js.map