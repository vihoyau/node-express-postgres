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
const modelName = "ads.adsoperation";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        adsuuid: sequelize_1.DataTypes.UUID,
        useruuid: sequelize_1.DataTypes.UUID,
        method: sequelize_1.DataTypes.TEXT,
        created: sequelize_1.DataTypes.DATE
    }, {
        timestamps: false,
        schema: "ads",
        freezeTableName: true,
        tableName: "adsoperation",
    });
};
function insertoperation(adsuuid, useruuid, method, created) {
    return __awaiter(this, void 0, void 0, function* () {
        if (useruuid == null || useruuid == undefined || useruuid == '') {
            let operation = yield global_1.getModel(modelName).create({ adsuuid: adsuuid, method: method, created: created }, { returning: true });
            return operation;
        }
        let operation = yield global_1.getModel(modelName).create({ adsuuid: adsuuid, useruuid: useruuid, method: method, created: created }, { returning: true });
        return operation;
    });
}
exports.insertoperation = insertoperation;
function findAllplanByadveruuid(advertiseruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel('puton.plan').findAll({ where: { advertiseruuid: advertiseruuid }, order: [['uuid', 'asc']] });
        return res ? res : undefined;
    });
}
exports.findAllplanByadveruuid = findAllplanByadveruuid;
function findAllunitByplanuuid(planuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel('puton.unit').findAll({ where: { planuuid: planuuid }, order: [['uuid', 'asc']] });
        return res ? res : undefined;
    });
}
exports.findAllunitByplanuuid = findAllunitByplanuuid;
function findAlladsByunituuid(unituuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel('ads.ads').findAll({ where: { unituuid: unituuid }, order: [['uuid', 'asc']] });
        return res ? res : undefined;
    });
}
exports.findAlladsByunituuid = findAlladsByunituuid;
function findAlloperationByadsuuid(adsuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { adsuuid: adsuuid } });
        return res ? res.map(r => r.get()) : undefined;
    });
}
exports.findAlloperationByadsuuid = findAlloperationByadsuuid;
function findAlloperationByadsuuid_date(adsuuid, startdate, enddate) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { adsuuid: adsuuid, created: { $gt: startdate, $lt: enddate } } });
        return res ? res.map(r => r.get()) : undefined;
    });
}
exports.findAlloperationByadsuuid_date = findAlloperationByadsuuid_date;
function findAlloperationByunituuid(sequelize, adsuuids, startdate, enddate) {
    return __awaiter(this, void 0, void 0, function* () {
        if (adsuuids != undefined && adsuuids.length != 0) {
            let adsStr = "(";
            for (let i = 0; i < adsuuids.length; i++) {
                adsStr = adsStr + "'" + adsuuids[i].uuid + "'";
                if (adsuuids.length - 1 != i) {
                    adsStr = adsStr + ",";
                }
            }
            adsStr = adsStr + ")";
            let res = yield sequelize.query(`select o.* from ads.adsoperation o
        where o.created > '${startdate.toLocaleString()}'
        and o.created < '${enddate.toLocaleString()}'
        and o.adsuuid in ${adsStr}
        order by o.created desc`, { type: 'select' });
            return res;
        }
        else {
            return [];
        }
    });
}
exports.findAlloperationByunituuid = findAlloperationByunituuid;
function createdoperation(records) {
    return __awaiter(this, void 0, void 0, function* () {
        //getModel(modelName).create({adsuuid:adsuuid,method:method,created:new Date()})
        global_1.getModel(modelName).bulkCreate(records);
    });
}
exports.createdoperation = createdoperation;
function deleteadsByadsuuid(sequelize, adsuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        sequelize.query(`delete from ads.adsoperation where adsuuid = '${adsuuid}'`, { type: 'delete' });
    });
}
exports.deleteadsByadsuuid = deleteadsByadsuuid;
function deleteadsByadsuuids(sequelize, adsuuids) {
    return __awaiter(this, void 0, void 0, function* () {
        if (adsuuids != undefined && adsuuids.length != 0) {
            let adsStr = "(";
            for (let i = 0; i < adsuuids.length; i++) {
                adsStr = adsStr + "'" + adsuuids[i].uuid + "'";
                if (adsuuids.length - 1 != i) {
                    adsStr = adsStr + ",";
                }
            }
            adsStr = adsStr + ")";
            let res = yield sequelize.query(`delete from ads.adsoperation where adsuuid in ${adsStr}`, { type: 'delete' });
            return res;
        }
        else {
            return [];
        }
    });
}
exports.deleteadsByadsuuids = deleteadsByadsuuids;
//# sourceMappingURL=adsoperation.js.map