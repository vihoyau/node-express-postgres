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
const modelName = "puton.plan";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4
        },
        advertiseruuid: sequelize_1.DataTypes.UUID,
        name: sequelize_1.DataTypes.TEXT,
        putresource: sequelize_1.DataTypes.INTEGER,
        dailybudget: sequelize_1.DataTypes.DOUBLE,
        startdate: sequelize_1.DataTypes.DATE,
        enddate: sequelize_1.DataTypes.DATE,
        period: sequelize_1.DataTypes.JSONB,
        status: sequelize_1.DataTypes.INTEGER
    }, {
        timestamps: false,
        schema: "puton",
        freezeTableName: true,
        tableName: "plan",
    });
};
function insertplan(plan) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).create(plan, { returning: true });
    });
}
exports.insertplan = insertplan;
function queryplanselect(advertiseruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!advertiseruuid) {
            let res = yield global_1.getModel(modelName).findAll();
            return res ? res : undefined;
        }
        else {
            let res = yield global_1.getModel(modelName).findAll({ where: { advertiseruuid: advertiseruuid } });
            return res ? res : undefined;
        }
    });
}
exports.queryplanselect = queryplanselect;
//推广计划名称，推广资源，日预算，开始日期，结束日期，投放时间段
function updateplan(plan) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ name: plan.name, putresource: plan.putresource, dailybudget: plan.dailybudget, startdate: plan.startdate, enddate: plan.enddate, period: plan.period }, { where: { uuid: plan.planuuid }, returning: true });
        return number > 0 ? res : undefined;
    });
}
exports.updateplan = updateplan;
function queryplanone(planuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { uuid: planuuid } });
        return res ? res.get() : undefined;
    });
}
exports.queryplanone = queryplanone;
function queryplanperiod(sequelize, planuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select *  from puton.plan where uuid = '${planuuid}'`, { type: 'select' });
        return res ? res : undefined;
    });
}
exports.queryplanperiod = queryplanperiod;
function queryplanAll(advertiseruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!advertiseruuid) {
            let res = yield global_1.getModel(modelName).findAll();
            return res ? res.map(r => r.get()) : undefined;
        }
        else {
            let res = yield global_1.getModel(modelName).findAll({ where: { advertiseruuid: advertiseruuid } });
            return res ? res.map(r => r.get()) : undefined;
        }
    });
}
exports.queryplanAll = queryplanAll;
function queryplanAllBypage(searchdata, start, length, advertiseruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!advertiseruuid) {
            let res = yield global_1.getModel(modelName).findAll({ where: { $or: [
                        { name: { $like: '%' + searchdata + '%' } }
                    ] }, offset: start, limit: length, order: [['startdate', 'desc']] });
            return res ? res.map(r => r.get()) : undefined;
        }
        else {
            let res = yield global_1.getModel(modelName).findAll({ where: { advertiseruuid: advertiseruuid, $or: [
                        { name: { $like: '%' + searchdata + '%' } }
                    ] }, offset: start, limit: length, order: [['startdate', 'desc']] });
            return res ? res.map(r => r.get()) : undefined;
        }
    });
}
exports.queryplanAllBypage = queryplanAllBypage;
function queryplanAllcount(sequelize, advertiseruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!advertiseruuid) {
            let re = sequelize.query(`select count(*) as count from puton.plan`, { type: 'select' });
            return re ? re : undefined;
        }
        else {
            let re = sequelize.query(`select count(*) as count from puton.plan where advertiseruuid = '${advertiseruuid}'`, { type: 'select' });
            return re ? re : undefined;
        }
    });
}
exports.queryplanAllcount = queryplanAllcount;
function updateplanstatus(planuuid, status) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ status: status }, { where: { uuid: planuuid }, returning: true });
        return number > 0 ? res : undefined;
    });
}
exports.updateplanstatus = updateplanstatus;
function deleteplanByuuid(sequelize, planuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        sequelize.query(`delete from puton.plan where uuid = '${planuuid}'`);
    });
}
exports.deleteplanByuuid = deleteplanByuuid;
function findAllplanByadvertiseruuid(advertiseruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let plans = yield global_1.getModel(modelName).findAll({ where: { advertiseruuid: advertiseruuid } });
        return plans ? plans.map(r => r.get()) : [];
    });
}
exports.findAllplanByadvertiseruuid = findAllplanByadvertiseruuid;
function queryplanByunituuid(sequelize, unituuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let plan = yield sequelize.query(`select puton.plan.* from puton.unit ,puton.plan where puton.unit.planuuid = puton.plan.uuid  `, { type: 'select' });
        return plan ? plan[0] : undefined;
    });
}
exports.queryplanByunituuid = queryplanByunituuid;
function findplanBystatus1() {
    return __awaiter(this, void 0, void 0, function* () {
        let plan = yield global_1.getModel(modelName).findAll({ where: { status: 1 } });
        return plan ? plan.map(r => r.get()) : [];
    });
}
exports.findplanBystatus1 = findplanBystatus1;
//# sourceMappingURL=plan.js.map