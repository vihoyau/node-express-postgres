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
const modelName = "ads.informationads";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        state: sequelize_1.DataTypes.INTEGER,
        advertiseruuid: sequelize_1.DataTypes.UUID,
        username: sequelize_1.DataTypes.STRING,
        title: sequelize_1.DataTypes.TEXT,
        content: sequelize_1.DataTypes.TEXT,
        pics: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
        video: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
        category: sequelize_1.DataTypes.UUID,
        company: sequelize_1.DataTypes.TEXT,
        banner: sequelize_1.DataTypes.ENUM('on', 'off'),
        address: sequelize_1.DataTypes.JSONB,
        adsinfourl: sequelize_1.DataTypes.TEXT,
        addressinfo: sequelize_1.DataTypes.TEXT,
        rejectmsg: sequelize_1.DataTypes.TEXT,
        balance: sequelize_1.DataTypes.DOUBLE,
        totalbalance: sequelize_1.DataTypes.DOUBLE,
        totalpoints: sequelize_1.DataTypes.DOUBLE,
        points: sequelize_1.DataTypes.DOUBLE,
        question_ext: sequelize_1.DataTypes.JSONB,
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME,
        sumcontent: sequelize_1.DataTypes.TEXT,
        coverpic: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
        pic_mode: sequelize_1.DataTypes.ENUM('big', 'small', 'three'),
        low: sequelize_1.DataTypes.INTEGER,
        nice: sequelize_1.DataTypes.INTEGER,
        mold: sequelize_1.DataTypes.STRING //points balance two
    }, {
        timestamps: false,
        schema: "ads",
        freezeTableName: true,
        tableName: "informationads",
    });
};
function getCount(sequelize, searchdata, state, company) {
    return __awaiter(this, void 0, void 0, function* () {
        let selectads;
        if (company === undefined || company.length === 0) {
            if (state === "") {
                selectads = `SELECT
	count(*)
FROM
	ads.informationads AS A
WHERE
	A ."state" not In ('wait-ack')
AND (
	A .company LIKE '%${searchdata}%'
	OR title LIKE '%${searchdata}%'
	OR
 to_char(
		A .created,
		'YYYY-MM-DD HH24:MI:SS'
	) like '%${searchdata}%'
)`;
            }
            else {
                selectads = `SELECT
	count(*)
FROM
	ads.informationads AS A
WHERE
	A ."state" in ('${state}')
AND (
	A .company LIKE '%${searchdata}%'
	OR title LIKE '%${searchdata}%'
	OR
 to_char(
		A .created,
		'YYYY-MM-DD HH24:MI:SS'
	) like '%${searchdata}%'
)`;
            }
        }
        else {
            let company1 = "(";
            for (let i = 0; i < company.length; i++) {
                if (i == company.length - 1) {
                    company1 = company1 + "'" + company[i] + "'";
                }
                else {
                    company1 = company1 + "'" + company[i] + "',";
                }
            }
            company1 = company1 + ")";
            if (state === "") {
                selectads = `SELECT
	count(*)
FROM
	ads.informationads AS A
WHERE
	A ."state" not In ('wait-ack')
AND (
	A .company LIKE '%${searchdata}%'
	OR title LIKE '%${searchdata}%'
	OR
 to_char(
		A .created,
		'YYYY-MM-DD HH24:MI:SS'
	) like '%${searchdata}%'
)
and a.company in ${company1}`;
            }
            else {
                selectads = `SELECT
	count(*)
FROM
	ads.informationads AS A
WHERE
	A ."state" in ('${state}')
AND (
	A .company LIKE '%${searchdata}%'
	OR title LIKE '%${searchdata}%'
	OR
 to_char(
		A .created,
		'YYYY-MM-DD HH24:MI:SS'
	) like '%${searchdata}%'
)
and a.company in ${company1}`;
            }
        }
        let res = yield sequelize.query(selectads, { type: "select" });
        return parseInt(res[0].count);
    });
}
exports.getCount = getCount;
function getCount2(sequelize, searchdata, state, advertiseruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let selectads;
        if (advertiseruuid === undefined || advertiseruuid.length === 0) {
            if (state === "") {
                selectads = `SELECT
	count(*)
FROM
	ads.informationads AS A
WHERE
	A ."state" not In ('wait-ack')
AND (
	A .company LIKE '%${searchdata}%'
	OR title LIKE '%${searchdata}%'
	OR
 to_char(
		A .created,
		'YYYY-MM-DD HH24:MI:SS'
	) like '%${searchdata}%'
)`;
            }
            else {
                selectads = `SELECT
	count(*)
FROM
	ads.informationads AS A
WHERE
	A ."state" in ('${state}')
AND (
	A .company LIKE '%${searchdata}%'
	OR title LIKE '%${searchdata}%'
	OR
 to_char(
		A .created,
		'YYYY-MM-DD HH24:MI:SS'
	) like '%${searchdata}%'
)`;
            }
        }
        else {
            let advertiseruuid1 = "(";
            for (let i = 0; i < advertiseruuid.length; i++) {
                if (i == advertiseruuid.length - 1) {
                    advertiseruuid1 = advertiseruuid1 + "'" + advertiseruuid[i] + "'";
                }
                else {
                    advertiseruuid1 = advertiseruuid1 + "'" + advertiseruuid[i] + "',";
                }
            }
            advertiseruuid1 = advertiseruuid1 + ")";
            if (state === "") {
                selectads = `SELECT
	count(*)
FROM
	ads.informationads AS A
WHERE
	A ."state" not In ('wait-ack')
AND (
	A .company LIKE '%${searchdata}%'
	OR title LIKE '%${searchdata}%'
	OR
 to_char(
		A .created,
		'YYYY-MM-DD HH24:MI:SS'
	) like '%${searchdata}%'
)
and a.advertiseruuid in ${advertiseruuid1}`;
            }
            else {
                selectads = `SELECT
	count(*)
FROM
	ads.informationads AS A
WHERE
	A ."state" in ('${state}')
AND (
	A .company LIKE '%${searchdata}%'
	OR title LIKE '%${searchdata}%'
	OR
 to_char(
		A .created,
		'YYYY-MM-DD HH24:MI:SS'
	) like '%${searchdata}%'
)
and a.advertiseruuid in ${advertiseruuid1}`;
            }
        }
        let res = yield sequelize.query(selectads, { type: "select" });
        return parseInt(res[0].count);
    });
}
exports.getCount2 = getCount2;
function getByCompany(sequelize, searchdata, state, company, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let selectads;
        if (company === undefined || company.length === 0) {
            if (state === "") {
                selectads = `SELECT
	A.*
FROM
	ads.informationads AS A
WHERE
	A ."state" not In ('wait-ack')
AND (
	A .company LIKE '%${searchdata}%'
	OR title LIKE '%${searchdata}%'
	OR
 to_char(
		A .created,
		'YYYY-MM-DD HH24:MI:SS'
	) like '%${searchdata}%'
)

order by a.created desc
offset ${cursor}
limit ${limit}`;
            }
            else {
                selectads = `SELECT
	A.*
FROM
	ads.informationads AS A
WHERE
	A ."state" in ('${state}')
AND (
	A .company LIKE '%${searchdata}%'
	OR title LIKE '%${searchdata}%'
	OR
 to_char(
		A .created,
		'YYYY-MM-DD HH24:MI:SS'
	) like '%${searchdata}%'
)
order by a.created desc
offset ${cursor}
limit ${limit}`;
            }
        }
        else {
            let company1 = "(";
            for (let i = 0; i < company.length; i++) {
                if (i == company.length - 1) {
                    company1 = company1 + "'" + company[i] + "'";
                }
                else {
                    company1 = company1 + "'" + company[i] + "',";
                }
            }
            company1 = company1 + ")";
            if (state === "") {
                selectads = `SELECT
	A.*
FROM
	ads.informationads AS A
WHERE
	A ."state" not In ('wait-ack')
AND (
	A .company LIKE '%${searchdata}%'
    OR title LIKE '%${searchdata}%'
    OR
 to_char(
		A .created,
		'YYYY-MM-DD HH24:MI:SS'
	) like '%${searchdata}%'
)
and a.company in ${company1}
order by a.created desc
offset ${cursor}
limit ${limit}`;
            }
            else {
                selectads = `SELECT
	A.*
FROM
	ads.informationads AS A
WHERE
	A ."state"  in ('${state}')
AND (
	A .company LIKE '%${searchdata}%'
	OR title LIKE '%${searchdata}%'
	OR
 to_char(
		A .created,
		'YYYY-MM-DD HH24:MI:SS'
	) like '%${searchdata}%'
)
and a.company in ${company1}
order by a.created desc
offset ${cursor}
limit ${limit}`;
            }
        }
        let res = yield sequelize.query(selectads, { type: "select" });
        return res;
    });
}
exports.getByCompany = getByCompany;
function getByAdvertiseruuid(sequelize, searchdata, state, advertiseruuid, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let selectads;
        if (advertiseruuid === undefined || advertiseruuid.length === 0) {
            if (state === "") {
                selectads = `SELECT
	A.*
FROM
	ads.informationads AS A
WHERE
	A ."state" not In ('wait-ack')
AND (
	A .company LIKE '%${searchdata}%'
	OR title LIKE '%${searchdata}%'
	OR
 to_char(
		A .created,
		'YYYY-MM-DD HH24:MI:SS'
	) like '%${searchdata}%'
)

order by a.created desc
offset ${cursor}
limit ${limit}`;
            }
            else {
                selectads = `SELECT
	A.*
FROM
	ads.informationads AS A
WHERE
	A ."state" in ('${state}')
AND (
	A .company LIKE '%${searchdata}%'
	OR title LIKE '%${searchdata}%'
	OR
 to_char(
		A .created,
		'YYYY-MM-DD HH24:MI:SS'
	) like '%${searchdata}%'
)
order by a.created desc
offset ${cursor}
limit ${limit}`;
            }
        }
        else {
            let advertiseruuid1 = "(";
            for (let i = 0; i < advertiseruuid.length; i++) {
                if (i == advertiseruuid.length - 1) {
                    advertiseruuid1 = advertiseruuid1 + "'" + advertiseruuid[i] + "'";
                }
                else {
                    advertiseruuid1 = advertiseruuid1 + "'" + advertiseruuid[i] + "',";
                }
            }
            advertiseruuid1 = advertiseruuid1 + ")";
            if (state === "") {
                selectads = `SELECT
	A.*
FROM
	ads.informationads AS A
WHERE
	A ."state" not In ('wait-ack')
AND (
	A .company LIKE '%${searchdata}%'
    OR title LIKE '%${searchdata}%'
    OR
 to_char(
		A .created,
		'YYYY-MM-DD HH24:MI:SS'
	) like '%${searchdata}%'
)
and a.advertiseruuid in ${advertiseruuid1}
order by a.created desc
offset ${cursor}
limit ${limit}`;
            }
            else {
                selectads = `SELECT
	A.*
FROM
	ads.informationads AS A
WHERE
	A ."state"  in ('${state}')
AND (
	A .company LIKE '%${searchdata}%'
	OR title LIKE '%${searchdata}%'
	OR
 to_char(
		A .created,
		'YYYY-MM-DD HH24:MI:SS'
	) like '%${searchdata}%'
)
and a.advertiseruuid in ${advertiseruuid1}
order by a.created desc
offset ${cursor}
limit ${limit}`;
            }
        }
        let res = yield sequelize.query(selectads, { type: "select" });
        return res;
    });
}
exports.getByAdvertiseruuid = getByAdvertiseruuid;
function insertInfoAds(seqz, company, username, getAdvertiseruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let obj = { company: company, username, advertiseruuid: getAdvertiseruuid, title: '', totalbalance: 0, totalpoints: 0 };
        let info = yield global_1.getModel(modelName).create(obj, { returning: true });
        return info ? info.get() : undefined;
    });
}
exports.insertInfoAds = insertInfoAds;
function updateByUuid(upde, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update(upde, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateByUuid = updateByUuid;
function delet(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).destroy({ where: { uuid: uuid } });
    });
}
exports.delet = delet;
function findByPrimarys(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findByPrimary(uuid);
        return res.get();
    });
}
exports.findByPrimarys = findByPrimarys;
function modifilyCoverpic(uuid, coverpic) {
    return __awaiter(this, void 0, void 0, function* () {
        let [num, res] = yield global_1.getModel(modelName).update({ coverpic }, { where: { uuid }, returning: true });
        return num > 0 ? res[0].get() : undefined;
    });
}
exports.modifilyCoverpic = modifilyCoverpic;
function modifilyPics(uuid, pics) {
    return __awaiter(this, void 0, void 0, function* () {
        let [num, res] = yield global_1.getModel(modelName).update({ pics }, { where: { uuid }, returning: true });
        return num > 0 ? res[0].get() : undefined;
    });
}
exports.modifilyPics = modifilyPics;
function modifilyVideo(uuid, video) {
    return __awaiter(this, void 0, void 0, function* () {
        let [num, res] = yield global_1.getModel(modelName).update({ video }, { where: { uuid }, returning: true });
        return num > 0 ? res[0].get() : undefined;
    });
}
exports.modifilyVideo = modifilyVideo;
//如果修改资讯的时候有给资讯加钱，顺便给广告商扣钱，23333
function addPointsBalance(seqz, iuuid, balance, points, exuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield seqz.transaction(function (t) {
            return __awaiter(this, void 0, void 0, function* () {
                //获得广告商的积分零钱
                let advertiserModel = yield global_1.getModel('users.users_ext').findOne({ where: { uuid: exuuid } });
                let advertiser = advertiserModel.get();
                //获得广告的积分零钱
                let adsModel = yield global_1.getModel(modelName).findOne({ where: { uuid: iuuid } });
                let info = adsModel.get();
                if (info.totalbalance < balance) { //给广告加钱，给广告商扣钱
                    balance = balance - info.totalbalance;
                    if (advertiser.crm_balance < balance * 100) { //余额不足
                        return undefined;
                    }
                    yield global_1.getModel(modelName).update({
                        totalbalance: sequelize_1.Sequelize.literal(`totalbalance+${balance}`),
                    }, { where: { uuid: iuuid }, transaction: t });
                    yield global_1.getModel('users.users_ext').update({
                        crm_balance: sequelize_1.Sequelize.literal(`crm_balance-${balance * 100}`),
                    }, { where: { uuid: exuuid }, transaction: t, returning: true });
                }
                else if (info.totalbalance > balance) {
                    balance = info.totalbalance - balance;
                    yield global_1.getModel(modelName).update({
                        totalbalance: sequelize_1.Sequelize.literal(`totalbalance-${balance}`),
                    }, { where: { uuid: iuuid }, transaction: t });
                    yield global_1.getModel('users.users_ext').update({
                        crm_balance: sequelize_1.Sequelize.literal(`crm_balance+${balance * 100}`),
                    }, { where: { uuid: exuuid }, transaction: t, returning: true });
                }
                if (info.totalpoints < points) {
                    points = points - info.totalpoints;
                    if (advertiser.crm_points < points) {
                        return undefined;
                    }
                    yield global_1.getModel(modelName).update({
                        totalpoints: sequelize_1.Sequelize.literal(`totalpoints+${points}`),
                    }, { where: { uuid: iuuid }, returning: true, transaction: t });
                    yield global_1.getModel('users.users_ext').update({
                        crm_points: sequelize_1.Sequelize.literal(`crm_points-${points}`),
                    }, { where: { uuid: exuuid }, returning: true, transaction: t });
                }
                else if (info.totalpoints > points) {
                    points = info.totalpoints - points;
                    yield global_1.getModel(modelName).update({
                        totalpoints: sequelize_1.Sequelize.literal(`totalpoints-${points}`),
                    }, { where: { uuid: iuuid }, returning: true, transaction: t });
                    yield global_1.getModel('users.users_ext').update({
                        crm_points: sequelize_1.Sequelize.literal(`crm_points+${points}`),
                    }, { where: { uuid: exuuid }, returning: true, transaction: t });
                }
                return 1;
            });
        });
    });
}
exports.addPointsBalance = addPointsBalance;
//
function findByCategory(category, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { category, state: 'on' }, order: [['created', 'desc']], offset: cursor, limit: limit });
        return res.map(r => r.get());
    });
}
exports.findByCategory = findByCategory;
function findByKeyWord(seqz, keyword, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield seqz.query(`
    select i.* from ads.informationads i
    where i.state = 'on'
    and (i.content like '%${keyword}%' or i.title like '%${keyword}%')
    order by i.created desc
    offset ${cursor}
    limit ${limit}
    `, { type: "select" });
        return res;
    });
}
exports.findByKeyWord = findByKeyWord;
function infoUpdateNice(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ nice: sequelize_1.Sequelize.literal(`nice+ 1`) }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.infoUpdateNice = infoUpdateNice;
function infoUpdateLow(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ low: sequelize_1.Sequelize.literal(`low+ 1`) }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.infoUpdateLow = infoUpdateLow;
function updateApplaud(uuid, low, nice) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ low: sequelize_1.Sequelize.literal(`low- ${low}`), nice: sequelize_1.Sequelize.literal(`nice- ${nice}`) }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateApplaud = updateApplaud;
function getBanner() {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { state: "on", banner: 'on' }, order: [['created', 'DESC']] });
        return res.map(r => r.get());
    });
}
exports.getBanner = getBanner;
function deleteEmptyinfo(date) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).destroy({ where: { title: '', created: { $lt: date } } });
    });
}
exports.deleteEmptyinfo = deleteEmptyinfo;
function getFavoriteByUuid(seque, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        // let res = await getModel(modelName).findAll({ where: { uuid: { $in: uuid }, deleted: 0 } })
        let uuids = "(";
        for (let i = 0; i < uuid.length; i++) {
            if (i == uuid.length - 1) {
                uuids = uuids + "'" + uuid[i] + "'";
            }
            else {
                uuids = uuids + "'" + uuid[i] + "',";
            }
        }
        uuids = uuids + ")";
        let res = yield seque.query(`SELECT
        *
        FROM
	ads.informationads AS A
WHERE
	A .uuid IN ${uuids}
AND A ."state" = 'on'`, { type: "select" });
        return res;
    });
}
exports.getFavoriteByUuid = getFavoriteByUuid;
//# sourceMappingURL=informationads.js.map