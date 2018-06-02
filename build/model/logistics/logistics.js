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
const global_1 = require("../../lib/global");
const sequelize_1 = require("sequelize");
const [schema, table] = ["logistics", "logistics"];
const modelName = `${schema}.${table}`;
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        logisticscode: sequelize_1.DataTypes.CHAR(64),
        ordercode: sequelize_1.DataTypes.CHAR(64),
        shippercode: sequelize_1.DataTypes.CHAR(64),
        traces: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.JSONB)
    }, {
        timestamps: false,
        schema: schema,
        freezeTableName: true,
        tableName: table,
    });
};
function insertLogistics(logistics) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).insertOrUpdate(logistics);
    });
}
exports.insertLogistics = insertLogistics;
function findByPrimary(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findByPrimary(uuid);
        return res ? res.get() : undefined;
    });
}
exports.findByPrimary = findByPrimary;
function updateTraces(shippercode, logisticscode, traces) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ traces: traces }, { where: { shippercode: shippercode, logisticscode: logisticscode }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateTraces = updateTraces;
function getByCode(shippercode, logisticscode) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { shippercode: shippercode, logisticscode: logisticscode } });
        return res ? res.get() : undefined;
    });
}
exports.getByCode = getByCode;
function deleteLogistics(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).destroy({ where: { uuid: uuid } });
    });
}
exports.deleteLogistics = deleteLogistics;
function getByOrderCode(ordercode) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { ordercode: ordercode } });
        return res ? res.get() : undefined;
    });
}
exports.getByOrderCode = getByOrderCode;
function getCount(sequelize, searchdata) {
    return __awaiter(this, void 0, void 0, function* () {
        let ordercode = ' ';
        if (searchdata.trim().length === 36 || searchdata.trim().length === 32) {
            ordercode = "or l.ordercode = '" + searchdata.trim() + "'";
        }
        let res = yield sequelize.query(`select count(*) from users.users c, logistics.logistics l, orders.orders o ,logistics.shipper s where c.uuid=o.useruuid and l.ordercode=o.uuid and s.shippercode=l.shippercode and (l.logisticscode like '%${searchdata}%' or c.username  like '%${searchdata}%'  ${ordercode})`, { type: "select" });
        return parseInt(res[0].count);
    });
}
exports.getCount = getCount;
function getAll(sequelize, searchdata, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let ordercode = ' ';
        if (searchdata.trim().length === 36 || searchdata.trim().length === 32) {
            ordercode = "or l.ordercode = '" + searchdata.trim() + "'";
        }
        let res = yield sequelize.query(`select l.uuid,l.logisticscode ,l.shippercode,s.shippername ,o.goods,c.username ,l.ordercode from users.users c, logistics.logistics l , orders.orders o ,logistics.shipper s where c.uuid=o.useruuid and l.ordercode=o.uuid and s.shippercode=l.shippercode and (l.logisticscode like '%${searchdata}%' or c.username  like '%${searchdata}%' ${ordercode}) order by o.created desc  offset ${cursor} LIMIT ${limit}`, { type: "select" });
        return res;
    });
}
exports.getAll = getAll;
//# sourceMappingURL=logistics.js.map