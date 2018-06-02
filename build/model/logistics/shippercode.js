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
const [schema, table] = ["logistics", "shipper"];
const modelName = `${schema}.${table}`;
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        shippercode: sequelize_1.DataTypes.CHAR(64),
        shippername: sequelize_1.DataTypes.CHAR(64),
    }, {
        timestamps: false,
        schema: schema,
        freezeTableName: true,
        tableName: table,
    });
};
function getShipperName(shippercode) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { shippercode: shippercode } });
        return res ? res.get() : undefined;
    });
}
exports.getShipperName = getShipperName;
function getByShipperName(shippername) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { shippername: shippername } });
        return res ? res.get() : undefined;
    });
}
exports.getByShipperName = getByShipperName;
function getShipper(sequelize) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select * from logistics.shipper s order by s.shippercode asc`, { type: "select" });
        return res;
    });
}
exports.getShipper = getShipper;
//# sourceMappingURL=shippercode.js.map