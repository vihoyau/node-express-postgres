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
const modelName = "ads.adslog";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        ip: sequelize_1.DataTypes.STRING,
        aduuid: sequelize_1.DataTypes.UUID,
        useruuid: sequelize_1.DataTypes.UUID,
        points: sequelize_1.DataTypes.INTEGER,
        paytype: sequelize_1.DataTypes.ENUM('immediate', 'balance'),
        state: sequelize_1.DataTypes.ENUM('on', 'fin', 'stop'),
        openid: sequelize_1.DataTypes.CHAR(64),
        keyword: sequelize_1.DataTypes.TEXT,
        answercount: sequelize_1.DataTypes.INTEGER,
        username: sequelize_1.DataTypes.CHAR(64),
        ext: sequelize_1.DataTypes.JSONB,
        balance: sequelize_1.DataTypes.INTEGER,
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME,
    }, {
        timestamps: false,
        schema: "ads",
        freezeTableName: true,
        tableName: "adslog",
    });
};
function getByTwoUuid(adsuuid, useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { useruuid: useruuid, aduuid: adsuuid } });
        return res ? res.get() : undefined;
    });
}
exports.getByTwoUuid = getByTwoUuid;
function getCount(sequelize, adsuuid, searchdata) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select count(*) from ads.adslog as a, users.users as b where a.useruuid=b.uuid and a.aduuid='${adsuuid}' and (b.username like '%${searchdata}%') `, { type: "SELECT" });
        return res[0].count;
    });
}
exports.getCount = getCount;
function getCount2(sequelize, adsuuid, searchdata) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select count(*) from ads.adslog where ip is not null and aduuid = '${adsuuid}'`, { type: "SELECT" });
        return res[0].count;
    });
}
exports.getCount2 = getCount2;
function getByAdsUuid(sequelize, adsuuid, searchdata, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
    select b.*,a.* from ads.adslog as a, users.users as b
    where a.useruuid=b.uuid  and a.aduuid='${adsuuid}'
    and (b.username like '%${searchdata}%')
    ORDER BY a.modified desc
    LIMIT ${limit} offset ${cursor} `, { type: "SELECT" });
        return res;
    });
}
exports.getByAdsUuid = getByAdsUuid;
function getByAdsUuid2(sequelize, adsuuid, searchdata, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
    select a.* from ads.adslog a
    where a.ip is not null and a.aduuid='${adsuuid}'
    ORDER BY a.modified desc
    LIMIT ${limit} offset ${cursor} `, { type: "SELECT" });
        return res;
    });
}
exports.getByAdsUuid2 = getByAdsUuid2;
function getByUserUuid(useruuid, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({
            where: { useruuid: useruuid },
            offset: cursor,
            limit: limit,
            order: [['created', 'DESC']]
        });
        return res.map(r => r.get());
    });
}
exports.getByUserUuid = getByUserUuid;
function insertAdslog(adlog) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).create(adlog, { returning: true });
    });
}
exports.insertAdslog = insertAdslog;
function updateAdslog(adlog, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update(adlog, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateAdslog = updateAdslog;
function getPayReadyLogs(page, count) {
    return __awaiter(this, void 0, void 0, function* () {
        const [p, c] = [parseInt(page), parseInt(count)];
        let res = yield global_1.getModel(modelName).findAll({ where: { payment: 0 }, offset: p, limit: c, order: [['modified', 'DESC']] });
        return res.map(r => r.get());
    });
}
exports.getPayReadyLogs = getPayReadyLogs;
function setPaymentDone(uuids) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ payment: 1 }, { where: { uuid: { $in: uuids } } });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.setPaymentDone = setPaymentDone;
function getStopAdsLogs() {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { state: 'stop' }, order: [['modified', 'DESC']] });
        return res.map(r => r.get());
    });
}
exports.getStopAdsLogs = getStopAdsLogs;
function findadslogs(sequelize, useruuid, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select * from ads.adslog l , ads.ads a where l.aduuid =a.uuid and l.useruuid =${useruuid} order by l.modified desc  offset ${cursor} limit ${limit}`);
        return res;
    });
}
exports.findadslogs = findadslogs;
function findPenMen(time) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { points: { $gt: 0 }, modified: { $gt: sequelize_1.Sequelize.literal(`now() - interval '${time} day'`) } } });
        let useruuids = res.map(r => r.get("useruuid"));
        let resss;
        if (useruuids.length > 0) {
            resss = yield global_1.getModel(modelName).findAll({ where: { modified: { $lt: sequelize_1.Sequelize.literal(`now() - interval '${time} day'`) }, useruuid: { $notIn: useruuids } } });
        }
        else {
            resss = yield global_1.getModel(modelName).findAll({ where: { modified: { $lt: sequelize_1.Sequelize.literal(`now() - interval '${time} day'`) } } });
        }
        return resss.map(r => r.get("useruuid"));
    });
}
exports.findPenMen = findPenMen;
function findByAdsuuid(sequelize, aduuid, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
    select l.*,u.headurl,u.nickname,u.username as name from ads.adslog l , users.users u
     where l.useruuid =u.uuid and l.state = 'fin'
     and l.aduuid = '${aduuid}'
     order by l.modified desc  offset ${cursor} limit ${limit}`, { type: "select" });
        return res;
    });
}
exports.findByAdsuuid = findByAdsuuid;
function getCountByAdsUUID(aduuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).count({ where: { aduuid, state: "fin" } });
        return res;
    });
}
exports.getCountByAdsUUID = getCountByAdsUUID;
//# sourceMappingURL=adslog.js.map