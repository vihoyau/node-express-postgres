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
const modelName = "puton.unit";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4
        },
        planuuid: sequelize_1.DataTypes.UUID,
        name: sequelize_1.DataTypes.TEXT,
        mode: sequelize_1.DataTypes.INTEGER,
        area: sequelize_1.DataTypes.TEXT,
        sex: sequelize_1.DataTypes.INTEGER,
        age: sequelize_1.DataTypes.JSONB,
        method: sequelize_1.DataTypes.TEXT,
        status: sequelize_1.DataTypes.INTEGER,
        bid: sequelize_1.DataTypes.DOUBLE,
        cpe_type: sequelize_1.DataTypes.INTEGER //0展示 1点击
    }, {
        timestamps: false,
        schema: "puton",
        freezeTableName: true,
        tableName: "unit",
    });
};
function insertunit(unit) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).create(unit, { returning: true });
    });
}
exports.insertunit = insertunit;
function queryunit(planuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { planuuid: planuuid } });
        return res;
    });
}
exports.queryunit = queryunit;
function queryunitone(unituuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { uuid: unituuid } });
        return res ? res.get() : undefined;
    });
}
exports.queryunitone = queryunitone;
/**
 *
 * @param unit 单元名称，推广方式，投放地域，性别，年龄，计费方式，出价
 */
function updateunit(unit) {
    return __awaiter(this, void 0, void 0, function* () {
        let [num, res] = yield global_1.getModel(modelName).update({ name: unit.name, mode: unit.mode, area: unit.area, sex: unit.sex, age: unit.age, method: unit.method, bid: unit.bid }, { where: { uuid: unit.unituuid }, returning: true });
        return num > 0 ? res : undefined;
    });
}
exports.updateunit = updateunit;
function queryunitAll(searchdata, sequelize, planuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        if (planuuid != undefined && planuuid.length != 0) {
            let stringPlans = " (";
            for (let i = 0; i < planuuid.length; i++) {
                stringPlans = stringPlans + "'" + planuuid[i].uuid + "'";
                if (i != planuuid.length - 1) {
                    stringPlans = stringPlans + ",";
                }
            }
            stringPlans = stringPlans + ")";
            let res = yield sequelize.query(`select * from puton.unit where planuuid in ${stringPlans} and name like '%${searchdata}%'`, { type: 'select' });
            //getModel(modelName).findAll({where:{planuuid:planuuid}});
            return res ? res : undefined;
        }
        else {
            return undefined;
        }
    });
}
exports.queryunitAll = queryunitAll;
function queryunitAllBypage(start, length, planuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { planuuid: planuuid }, offset: start, limit: length });
        return res ? res.map(r => r.get()) : undefined;
    });
}
exports.queryunitAllBypage = queryunitAllBypage;
function queryunitAllcount(sequelize, planuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let re = yield sequelize.query(`select count(*) as count from puton.unit where planuuid = '${planuuid}'`, { type: 'select' });
        return re ? re : undefined;
    });
}
exports.queryunitAllcount = queryunitAllcount;
function updateunitstatus(planuuid, status) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ status: status }, { where: { uuid: planuuid }, returning: true });
        return number > 0 ? res : undefined;
    });
}
exports.updateunitstatus = updateunitstatus;
function queryplanByunituuid(sequelize, unituuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select plan.* from puton.plan as plan ,puton.unit as unit where unit.planuuid = plan.uuid and unit.uuid= '${unituuid}'`, { type: 'select' });
        return res ? res : undefined;
    });
}
exports.queryplanByunituuid = queryplanByunituuid;
function delelteunitByuuid(sequelize, unituuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield sequelize.query(`delete from puton.unit where uuid = '${unituuid}'`, { type: 'delete' });
    });
}
exports.delelteunitByuuid = delelteunitByuuid;
function queryunitByplan(planuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let re = yield global_1.getModel(modelName).findAll({ where: { planuuid: planuuid } });
        return re ? re.map(r => r.get()) : undefined;
    });
}
exports.queryunitByplan = queryunitByplan;
function queryunitByuuids(sequelize, unituuids) {
    return __awaiter(this, void 0, void 0, function* () {
        if (unituuids != undefined && unituuids.length != 0) {
            let stringUuids = "(";
            for (let i = 0; i < unituuids.length; i++) {
                stringUuids = stringUuids + "'" + unituuids[i].unituuid + "'";
                if (i != unituuids.length - 1) {
                    stringUuids = stringUuids + ",";
                }
            }
            stringUuids = stringUuids + ")";
            let unit = yield sequelize.query(`select * from puton.unit where uuid in ${stringUuids}`, { type: 'select' });
            return unit ? unit : undefined;
        }
        else {
            let unit = yield sequelize.query(`select * from puton.unit `, { type: 'select' });
            return unit ? unit : undefined;
        }
    });
}
exports.queryunitByuuids = queryunitByuuids;
function queryunitByadsuuid(sequelize, adsuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select * from ads.ads as ads ,puton.unit as unit where ads.unituuid = unit.uuid and ads.uuid = '${adsuuid}'`, { type: "select" });
        return res.length != 0 ? res[0] : undefined;
    });
}
exports.queryunitByadsuuid = queryunitByadsuuid;
function findAllunitByplanuuid(planuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { planuuid: planuuid } });
        return res ? res.map(r => r.get()) : undefined;
    });
}
exports.findAllunitByplanuuid = findAllunitByplanuuid;
function findAllunitByplanuuids(sequelize, planuuids) {
    return __awaiter(this, void 0, void 0, function* () {
        if (planuuids != undefined && planuuids.length != 0) {
            let planStr = "(";
            for (let i = 0; i < planuuids.length; i++) {
                planStr = planStr + "'" + planuuids[i].uuid + "'";
                if ((planuuids.length - 1) != i) {
                    planStr = planStr + ",";
                }
            }
            planStr = planStr + ")";
            let res = sequelize.query(`select * from puton.unit where planuuid in ${planStr}`, { type: 'select' });
            return res;
        }
        else {
            return [];
        }
    });
}
exports.findAllunitByplanuuids = findAllunitByplanuuids;
function findunitByplanuuid(planuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { planuuid: planuuid } });
        return res ? res.map(r => r.get()) : [];
    });
}
exports.findunitByplanuuid = findunitByplanuuid;
function updateunitStatusByplanuuid(planuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ status: '0' }, { where: { planuuid: planuuid }, returning: true });
        return number > 0 ? res.map(r => r.get()) : [];
    });
}
exports.updateunitStatusByplanuuid = updateunitStatusByplanuuid;
//# sourceMappingURL=unit.js.map