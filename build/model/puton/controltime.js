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
const modelName = "puton.controltime";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        ads_week: sequelize_1.DataTypes.INTEGER,
        ads_hour: sequelize_1.DataTypes.INTEGER,
        planuuids: sequelize_1.DataTypes.JSONB
    }, {
        timestamps: false,
        schema: "puton",
        freezeTableName: true,
        tableName: "controltime",
    });
};
function querycontroltime(sequelize) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select * from puton.controltime order by ads_week`, { type: 'select' });
        return res ? res : undefined;
    });
}
exports.querycontroltime = querycontroltime;
function updatecomtrotimeByhour(controltime) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).update({ planuuids: controltime.planuuids }, { where: { ads_week: controltime.ads_week, ads_hour: controltime.ads_hour }, returning: true });
        return res ? res : undefined;
    });
}
exports.updatecomtrotimeByhour = updatecomtrotimeByhour;
function querycontroltimeByweek_hour(sequelize, week, hour) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select planuuids from puton.controltime where ads_week = ${week} and ads_hour = ${hour}`, { type: 'select' });
        return res ? res[0] : undefined;
    });
}
exports.querycontroltimeByweek_hour = querycontroltimeByweek_hour;
function queryunitbycontroltime(sequelize, week, hour) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select uuid from puton.unit where planuuid::varchar in (select t.* from puton.controltime as con, jsonb_array_elements_text(planuuids) as t where ads_week = ${week} and ads_hour = ${hour})`, { type: 'select' });
        return res ? res : [];
    });
}
exports.queryunitbycontroltime = queryunitbycontroltime;
//# sourceMappingURL=controltime.js.map