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
const modelName = "ads.ads";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        state: sequelize_1.DataTypes.ENUM('new', 'on', 'off', 'approved', 'rejected', 'wait-ack'),
        deleted: sequelize_1.DataTypes.INTEGER,
        advertiseruuid: sequelize_1.DataTypes.UUID,
        title: sequelize_1.DataTypes.CHAR(256),
        username: sequelize_1.DataTypes.STRING,
        content: sequelize_1.DataTypes.TEXT,
        sumcontent: sequelize_1.DataTypes.TEXT,
        pics: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
        video: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
        category: sequelize_1.DataTypes.UUID,
        subcategory: sequelize_1.DataTypes.UUID,
        typedesc: sequelize_1.DataTypes.TEXT,
        company: sequelize_1.DataTypes.TEXT,
        address: sequelize_1.DataTypes.JSONB,
        addressinfo: sequelize_1.DataTypes.TEXT,
        question: sequelize_1.DataTypes.JSONB,
        question_ext: sequelize_1.DataTypes.JSONB,
        points: sequelize_1.DataTypes.DOUBLE,
        totalpoints: sequelize_1.DataTypes.DOUBLE,
        hot: sequelize_1.DataTypes.INTEGER,
        tsrange: sequelize_1.DataTypes.RANGE(sequelize_1.DataTypes.DATE),
        keyword: sequelize_1.DataTypes.TEXT,
        rejectmsg: sequelize_1.DataTypes.TEXT,
        ext: sequelize_1.DataTypes.JSONB,
        adsinfourl: sequelize_1.DataTypes.TEXT,
        mold: sequelize_1.DataTypes.ENUM('point', 'balance', 'two'),
        balance: sequelize_1.DataTypes.DOUBLE,
        banner: sequelize_1.DataTypes.ENUM('on', 'off'),
        totalbalance: sequelize_1.DataTypes.DOUBLE,
        allbalance: sequelize_1.DataTypes.DOUBLE,
        allpoint: sequelize_1.DataTypes.DOUBLE,
        newaddress: sequelize_1.DataTypes.TEXT,
        nice: sequelize_1.DataTypes.INTEGER,
        low: sequelize_1.DataTypes.INTEGER,
        position: sequelize_1.DataTypes.INTEGER,
        heat: sequelize_1.DataTypes.INTEGER,
        gooduuid: sequelize_1.DataTypes.UUID,
        goodtitle: sequelize_1.DataTypes.CHAR(50),
        commentsort: sequelize_1.DataTypes.INTEGER,
        commentcatg: sequelize_1.DataTypes.UUID,
        commentsubcatg: sequelize_1.DataTypes.UUID,
        modified: sequelize_1.DataTypes.TIME,
        created: sequelize_1.DataTypes.TIME,
        coverpic: sequelize_1.DataTypes.JSONB,
        ncommentcount: sequelize_1.DataTypes.INTEGER,
        unituuid: sequelize_1.DataTypes.UUID,
        showamount: sequelize_1.DataTypes.INTEGER,
        pointmount: sequelize_1.DataTypes.INTEGER,
        status: sequelize_1.DataTypes.INTEGER,
        description: sequelize_1.DataTypes.TEXT,
        pic_mode: sequelize_1.DataTypes.INTEGER,
        tempstatus: sequelize_1.DataTypes.INTEGER,
        isads: sequelize_1.DataTypes.INTEGER
    }, {
        timestamps: false,
        schema: "ads",
        freezeTableName: true,
        tableName: "ads",
    });
};
function findAdsByOn() {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { state: "on" } });
        return res.map(r => r.get());
    });
}
exports.findAdsByOn = findAdsByOn;
function findadsByApproved() {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { state: "approved" } });
        return res.map(r => r.get());
    });
}
exports.findadsByApproved = findadsByApproved;
function getByType(seque, subcategory, addressComponent, controltimeadsarr, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let r = yield seque.query(`SELECT
	adv.uuid
    FROM
	ads.advertiser adv,
	ads.crmuser crmu,
	users.users_ext uext
    WHERE
	adv.crmuuid = crmu.uuid
    AND crmu.uuid = uext.uuid
    AND uext.crm_balance > 0`, { type: "SELECT" });
        let advuuid = "(";
        for (let j = 0; j < r.length; j++) {
            if (j == r.length - 1) {
                advuuid = advuuid + "'" + r[j].uuid + "'";
            }
            else {
                advuuid = advuuid + "'" + r[j].uuid + "',";
            }
        }
        advuuid = advuuid + ")";
        let ctrl = "(";
        for (let i = 0; i < controltimeadsarr.length; i++) {
            if (i == controltimeadsarr.length - 1) {
                ctrl = ctrl + "'" + controltimeadsarr[i] + "'";
            }
            else {
                ctrl = ctrl + "'" + controltimeadsarr[i] + "',";
            }
        }
        ctrl = ctrl + ")";
        if (subcategory) {
            let res = yield seque.query(`select * from ads.ads a, ads.ads_ext b where a.uuid=b.uuid and subcategory='${subcategory}' and state = 'on'
         and deleted=0 and a.uuid in ${ctrl} and a.advertiseruuid in ${advuuid} order by a.created desc offset ${cursor} limit ${limit}`, { type: "SELECT" });
            return res;
        }
        let res = yield seque.query(`select * from ads.ads a, ads.ads_ext b where a.uuid=b.uuid  and state = 'on' and deleted=0
    and a.uuid in ${ctrl}  and a.advertiseruuid in ${advuuid} order by a.created desc offset ${cursor} limit ${limit}`, { type: "SELECT" });
        return res;
    });
}
exports.getByType = getByType;
function getByCategory(seque, category, addressComponent, controltimeadsarr, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let r = yield seque.query(`SELECT
	adv.uuid
    FROM
	ads.advertiser adv,
	ads.crmuser crmu,
	users.users_ext uext
    WHERE
	adv.crmuuid = crmu.uuid
    AND crmu.uuid = uext.uuid
    AND uext.crm_balance > 0`, { type: "SELECT" });
        let advuuid = "(";
        for (let j = 0; j < r.length; j++) {
            if (j == r.length - 1) {
                advuuid = advuuid + "'" + r[j].uuid + "'";
            }
            else {
                advuuid = advuuid + "'" + r[j].uuid + "',";
            }
        }
        advuuid = advuuid + ")";
        let ctrl = "(";
        for (let i = 0; i < controltimeadsarr.length; i++) {
            if (i == controltimeadsarr.length - 1) {
                ctrl = ctrl + "'" + controltimeadsarr[i] + "'";
            }
            else {
                ctrl = ctrl + "'" + controltimeadsarr[i] + "',";
            }
        }
        ctrl = ctrl + ")";
        if (category) {
            let res = yield seque.query(`select * from ads.ads a, ads.ads_ext b where a.uuid=b.uuid and category='${category}'
        and state = 'on' and deleted=0 and status=1 and a.uuid in ${ctrl}
        and a.advertiseruuid in ${advuuid} order by a.created desc offset ${cursor} limit ${limit}`, { type: "SELECT" });
            return res;
        }
        let res = yield seque.query(`select * from ads.ads a, ads.ads_ext b where a.uuid=b.uuid  and state = 'on'
    and deleted=0 and status=1 and a.uuid in ${ctrl} and a.advertiseruuid in ${advuuid} order by a.created desc offset ${cursor} limit ${limit}`, { type: "SELECT" });
        return res;
    });
}
exports.getByCategory = getByCategory;
/**
 * 推荐广告列表（推荐页）
 * @param subcategory
 */
function encommentedlist(subcategory) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({
            where: {
                commentcatg: { $ne: null },
                commentsubcatg: { $ne: null },
                subcategory: subcategory,
                state: 'on',
                status: 1
            },
            order: [['ncommentcount', 'asc']]
        });
        return res ? res.map(r => r.get()) : undefined;
    });
}
exports.encommentedlist = encommentedlist;
function getCount(sequelize, searchdata, state, advertiseruuids) {
    return __awaiter(this, void 0, void 0, function* () {
        let selectads;
        if (advertiseruuids === undefined || advertiseruuids.length === 0) {
            if (state === "") {
                selectads = `SELECT
	count(*)
FROM
	ads.ads AS A
WHERE
	A ."state" not In ('wait-ack')
AND A .deleted = 0
AND (
	 title LIKE '%${searchdata}%'
	OR A .keyword LIKE '%${searchdata}%'
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
	ads.ads AS A
WHERE
	A ."state" in ('${state}')
AND A .deleted = 0
AND (
	 title LIKE '%${searchdata}%'
	OR A .keyword LIKE '%${searchdata}%'
	OR
 to_char(
		A .created,
		'YYYY-MM-DD HH24:MI:SS'
	) like '%${searchdata}%'
)`;
            }
        }
        else {
            let advertiseruuid = "(";
            for (let i = 0; i < advertiseruuids.length; i++) {
                if (i == advertiseruuids.length - 1) {
                    advertiseruuid = advertiseruuid + "'" + advertiseruuids[i] + "'";
                }
                else {
                    advertiseruuid = advertiseruuid + "'" + advertiseruuids[i] + "',";
                }
            }
            advertiseruuid = advertiseruuid + ")";
            if (state === "") {
                selectads = `SELECT
	count(*)
FROM
	ads.ads AS A
WHERE
	A ."state" not In ('wait-ack')
AND A .deleted = 0
AND (
	 title LIKE '%${searchdata}%'
	OR A .keyword LIKE '%${searchdata}%'
	OR
 to_char(
		A .created,
		'YYYY-MM-DD HH24:MI:SS'
	) like '%${searchdata}%'
)
and a.advertiseruuid in ${advertiseruuid}`;
            }
            else {
                selectads = `SELECT
	count(*)
FROM
	ads.ads AS A
WHERE
	A ."state" in ('${state}')
AND A .deleted = 0
AND (
	 title LIKE '%${searchdata}%'
	OR A .keyword LIKE '%${searchdata}%'
	OR
 to_char(
		A .created,
		'YYYY-MM-DD HH24:MI:SS'
	) like '%${searchdata}%'
)
and a.advertiseruuid in ${advertiseruuid}`;
            }
        }
        let res = yield sequelize.query(selectads, { type: "select" });
        return parseInt(res[0].count);
    });
}
exports.getCount = getCount;
function getadsAll(sequelize, searchdata, state, company, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let selectads;
        if (company === undefined || company.length === 0) {
            if (state === "") {
                selectads = `SELECT
	A.*,
    ae.views,
    ae.virtviews
FROM
	ads.ads AS A
    ,ads.ads_ext as ae
WHERE
a.uuid=ae.uuid
and
	A ."state" not In ('wait-ack')
AND A .deleted = 0
AND (
	A .company LIKE '%${searchdata}%'
	OR title LIKE '%${searchdata}%'
	OR A .keyword LIKE '%${searchdata}%'
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
	A.*,
    ae.views,
    ae.virtviews
FROM
	ads.ads AS A
    ,ads.ads_ext as ae
WHERE
a.uuid=ae.uuid
and
	A ."state" in ('${state}')
AND A .deleted = 0
AND (
	A .company LIKE '%${searchdata}%'
	OR title LIKE '%${searchdata}%'
	OR A .keyword LIKE '%${searchdata}%'
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
	A.*,
    ae.views,
    ae.virtviews
FROM
	ads.ads AS A
    ,ads.ads_ext as ae
WHERE
a.uuid=ae.uuid
and
	A ."state" not In ('wait-ack')
AND A .deleted = 0
AND (
	A .company LIKE '%${searchdata}%'
	OR title LIKE '%${searchdata}%'
	OR A .keyword LIKE '%${searchdata}%'
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
	A.*,
    ae.views,
    ae.virtviews
FROM
	ads.ads AS A
    ,ads.ads_ext as ae
WHERE
a.uuid=ae.uuid
and
	A ."state"  in ('${state}')
AND A .deleted = 0
AND (
	A .company LIKE '%${searchdata}%'
	OR title LIKE '%${searchdata}%'
	OR A .keyword LIKE '%${searchdata}%'
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
exports.getadsAll = getadsAll;
function getByCompany(sequelize, searchdata, state, advertiseruuids, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let selectads;
        if (advertiseruuids === undefined || advertiseruuids.length === 0) {
            if (state === "") {
                selectads = `SELECT
	A.*,
    ae.views,
    ae.virtviews
FROM
	ads.ads AS A
    ,ads.ads_ext as ae
WHERE
a.uuid=ae.uuid
and
	A ."state" not In ('wait-ack')
AND A .deleted = 0
AND (
	 title LIKE '%${searchdata}%'
	OR A .keyword LIKE '%${searchdata}%'
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
	A.*,
    ae.views,
    ae.virtviews
FROM
	ads.ads AS A
    ,ads.ads_ext as ae
WHERE
a.uuid=ae.uuid
and
	A ."state" in ('${state}')
AND A .deleted = 0
AND (
	 title LIKE '%${searchdata}%'
	OR A .keyword LIKE '%${searchdata}%'
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
            let advertiseruuid = "(";
            for (let i = 0; i < advertiseruuids.length; i++) {
                if (i == advertiseruuids.length - 1) {
                    advertiseruuid = advertiseruuid + "'" + advertiseruuids[i] + "'";
                }
                else {
                    advertiseruuid = advertiseruuid + "'" + advertiseruuids[i] + "',";
                }
            }
            advertiseruuid = advertiseruuid + ")";
            if (state === "") {
                selectads = `SELECT
	A.*,
    ae.views,
    ae.virtviews
FROM
	ads.ads AS A
    ,ads.ads_ext as ae
WHERE
a.uuid=ae.uuid
and
	A ."state" not In ('wait-ack')
AND A .deleted = 0
AND (
	 title LIKE '%${searchdata}%'
	OR A .keyword LIKE '%${searchdata}%'
	OR
 to_char(
		A .created,
		'YYYY-MM-DD HH24:MI:SS'
	) like '%${searchdata}%'
)
and a.advertiseruuid in ${advertiseruuid}
order by a.created desc
offset ${cursor}
limit ${limit}`;
            }
            else {
                selectads = `SELECT
	A.*,
    ae.views,
    ae.virtviews
FROM
	ads.ads AS A
    ,ads.ads_ext as ae
WHERE
a.uuid=ae.uuid
and
	A ."state"  in ('${state}')
AND A .deleted = 0
AND (
	 title LIKE '%${searchdata}%'
	OR A .keyword LIKE '%${searchdata}%'
	OR
 to_char(
		A .created,
		'YYYY-MM-DD HH24:MI:SS'
	) like '%${searchdata}%'
)
and a.advertiseruuid in ${advertiseruuid}
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
function getHot(seque, cursor, limit, addressComponent) {
    return __awaiter(this, void 0, void 0, function* () {
        let city = addressComponent.city;
        let province = addressComponent.province;
        let area = addressComponent.area;
        let sql = '';
        if (city === '全国') {
            city = null;
        }
        if (city && province && area) {
            sql = "AND(newaddress LIKE '%全国%' or newaddress LIKE '%" + city + "%'  or newaddress = '" + province + "' or newaddress LIKE '%" + area + "%')";
        }
        let res = yield seque.query(`SELECT
	*
FROM
	ads.ads A,
	ads.ads_ext b
WHERE
	A .uuid = b.uuid
AND STATE = 'on'
AND deleted = 0
${sql}
ORDER BY
	A .heat DESC,
        A.POSITION ASC
offset ${cursor} limit ${limit}`, { type: "SELECT" });
        return res;
    });
}
exports.getHot = getHot;
/**
 * 获得热门广告列表
 * @param seque
 * @param cursor
 * @param limit
 * @param searchdata
 */
function getCrmHotCount(seque, searchdata) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield seque.query(`select count(*) from ads.ads a, ads.ads_ext b where a.uuid = b.uuid and state = 'on' and deleted= 0 and a.heat = 1  and(newaddress like '%${searchdata}%' or title like '%${searchdata}%' or keyword like '%${searchdata}%' ) `, { type: "SELECT" });
        return res[0].count;
    });
}
exports.getCrmHotCount = getCrmHotCount;
/**
 * 获得热门广告列表
 * @param seque
 * @param cursor
 * @param limit
 * @param searchdata
 */
function getCrmHot(seque, cursor, limit, searchdata) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield seque.query(`select * from ads.ads a, ads.ads_ext b where a.uuid = b.uuid and state = 'on' and deleted= 0 and a.heat = 1 and(newaddress like '%${searchdata}%' or title like '%${searchdata}%' or keyword like '%${searchdata}%' ) order by  a.position asc offset ${cursor} limit ${limit}`, { type: "SELECT" });
        return res;
    });
}
exports.getCrmHot = getCrmHot;
function getByKeyword(seque, keyword, cursor, limit, addressComponent) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield seque.query(`SELECT
			A .*, ae.views,
        ae.virtviews
		FROM
			ads.ads AS A
		LEFT JOIN ads.ads_ext AS ae ON A .uuid = ae.uuid
		WHERE
			A .STATE = 'on'
		AND A .deleted = 0
        AND (A .keyword LIKE '%${keyword}%' or A.title like '%${keyword}%')
        order by A.created desc
         OFFSET ${cursor}
		LIMIT ${limit}`, { type: "SELECT" });
        return res;
    });
}
exports.getByKeyword = getByKeyword;
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
	ads.ads AS A
LEFT JOIN ads.ads_ext AS ae ON A .uuid = ae.uuid
WHERE
	A .uuid IN ${uuids}
AND A .deleted = 0
AND A ."state" = 'on'`, { type: "select" });
        return res;
    });
}
exports.getFavoriteByUuid = getFavoriteByUuid;
function findByPrimary(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findByPrimary(uuid);
        return res ? res.get() : undefined;
    });
}
exports.findByPrimary = findByPrimary;
function delet(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        //return await collection.update({ _id: new ObjectID(uuid) }, { $set: { del: 1 } })
        let [number] = yield global_1.getModel(modelName).update({ deleted: 1 }, { where: { uuid: uuid }, returning: true });
        return number;
    });
}
exports.delet = delet;
function insertAds(seqz, company, username, getAdvertiseruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield seqz.transaction((t) => __awaiter(this, void 0, void 0, function* () {
            let ads = yield global_1.getModel(modelName).create({ company, username, advertiseruuid: getAdvertiseruuid }, { transaction: t, returning: true });
            let uuid = ads.get("uuid");
            return global_1.getModel("ads.ads_ext").create({ uuid: uuid }, { transaction: t });
        }));
    });
}
exports.insertAds = insertAds;
function updateByUuid(upde, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update(upde, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateByUuid = updateByUuid;
function updateByStateUuid(state, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ state: state }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateByStateUuid = updateByStateUuid;
function updateBanner(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ banner: 'on' }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateBanner = updateBanner;
function deleteBanner(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ banner: 'off' }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.deleteBanner = deleteBanner;
function getBanner() {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { state: "on", deleted: 0, banner: 'on', status: 1 }, order: [['position', 'asc']] });
        return res.map(r => r.get());
    });
}
exports.getBanner = getBanner;
function updateDeletedsub(subcategory) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ deleted: 1, subcategory: null }, { where: { subcategory: subcategory }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateDeletedsub = updateDeletedsub;
function updateDeleted(category) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ deleted: 1, category: null, subcategory: null }, { where: { category: category }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateDeleted = updateDeleted;
function modifilyPics(uuid, pics) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ pics: pics }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.modifilyPics = modifilyPics;
function modifilyVideo(uuid, video) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ video: video }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.modifilyVideo = modifilyVideo;
/**
 * 广告点赞
 * @param uuid
 */
function updateNice(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ nice: sequelize_1.Sequelize.literal(`nice+ 1`) }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateNice = updateNice;
/**
 * 广告踩
 * @param uuid
 */
function updateLow(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ low: sequelize_1.Sequelize.literal(`low+ 1`) }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateLow = updateLow;
/**
 * 取消点赞
 * @param uuid
 * @param low
 * @param nice
 */
function updateApplaud(uuid, low, nice) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ low: sequelize_1.Sequelize.literal(`low- ${low}`), nice: sequelize_1.Sequelize.literal(`nice- ${nice}`) }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateApplaud = updateApplaud;
/**
 * 修改广告排列位置
 * @param sequelize
 * @param rise
 * @param drop
 */
function updateHotAdsPosition(sequelize, rise, drop) {
    return __awaiter(this, void 0, void 0, function* () {
        yield sequelize.transaction((t) => __awaiter(this, void 0, void 0, function* () {
            let before = yield global_1.getModel(modelName).findByPrimary(rise, { transaction: t });
            let beforeposition = before.get('position');
            let after = yield global_1.getModel(modelName).findByPrimary(drop, { transaction: t });
            let afterposition = after.get('position');
            yield global_1.getModel(modelName).update({ position: beforeposition }, { where: { uuid: drop }, returning: true });
            yield global_1.getModel(modelName).update({ position: afterposition }, { where: { uuid: rise }, returning: true });
        }));
    });
}
exports.updateHotAdsPosition = updateHotAdsPosition;
/**
 * 修改广告排列位置
 * @param sequelize
 * @param uuid
 */
function adsTop(sequelize, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield sequelize.transaction((t) => __awaiter(this, void 0, void 0, function* () {
            let before = yield global_1.getModel(modelName).findAll({ order: [["position", "asc"]], limit: 1 });
            let minposition = before[0].get('position');
            yield global_1.getModel(modelName).update({ position: minposition - 1 }, { where: { uuid: uuid }, returning: true });
        }));
    });
}
exports.adsTop = adsTop;
/**
 * 设置热门广告
 * @param sequelize
 * @param uuid
 * @param heat
 */
function updateHeat(uuid, heat) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ heat: heat }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateHeat = updateHeat;
/**
 * 设置为推荐广告（推荐页）
 * @param sequelize
 * @param category
 * @param subcategory
 * @param uuid
 */
function commentedads(sequelize, category, subcategory, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield sequelize.transaction((t) => __awaiter(this, void 0, void 0, function* () {
            yield global_1.getModel(modelName).update({ commentcatg: sequelize_1.Sequelize.literal(`category`), commentsubcatg: sequelize_1.Sequelize.literal(`subcategory`) }, { where: { uuid: uuid }, returning: true, transaction: t });
            let [number, res] = yield global_1.getModel(modelName).update({ category: category, subcategory: subcategory }, { where: { uuid: uuid }, returning: true, transaction: t });
            return number > 0 ? res[0].get() : undefined;
        }));
    });
}
exports.commentedads = commentedads;
/**
 * 取消推荐广告（推荐页）
 * @param sequelize
 * @param uuid
 */
function encommentedads(sequelize, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield sequelize.transaction((t) => __awaiter(this, void 0, void 0, function* () {
            yield global_1.getModel(modelName).update({ category: sequelize_1.Sequelize.literal(`commentcatg`), subcategory: sequelize_1.Sequelize.literal(`commentsubcatg`) }, { where: { uuid: uuid }, returning: true, transaction: t });
            let [number, res] = yield global_1.getModel(modelName).update({ commentcatg: null, commentsubcatg: null }, { where: { uuid: uuid }, returning: true, transaction: t });
            return number > 0 ? res[0].get() : undefined;
        }));
    });
}
exports.encommentedads = encommentedads;
/**
 * 修改推荐广告排列位置
 * @param sequelize
 * @param rise
 * @param drop
 */
function updateCommentAds(sequelize, rise, drop) {
    return __awaiter(this, void 0, void 0, function* () {
        yield sequelize.transaction((t) => __awaiter(this, void 0, void 0, function* () {
            let before = yield global_1.getModel(modelName).findByPrimary(rise, { transaction: t });
            let beforeposition = before.get('commentsort');
            let after = yield global_1.getModel(modelName).findByPrimary(drop, { transaction: t });
            let afterposition = after.get('commentsort');
            yield global_1.getModel(modelName).update({ commentsort: beforeposition }, { where: { uuid: drop }, returning: true });
            yield global_1.getModel(modelName).update({ commentsort: afterposition }, { where: { uuid: rise }, returning: true });
        }));
    });
}
exports.updateCommentAds = updateCommentAds;
function modifilyCoverpic(uuid, pic) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ coverpic: pic }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.modifilyCoverpic = modifilyCoverpic;
function queryCoverpic(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = global_1.getModel(modelName).findOne({ where: { uuid: uuid } });
        return res.get('coverpic') ? res.get('coverpic') : undefined;
    });
}
exports.queryCoverpic = queryCoverpic;
function updateAdsCommentsort(adsUuid, position) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ ncommentcount: position }, { where: { uuid: adsUuid }, returning: true });
        return number > 0 ? res : undefined;
    });
}
exports.updateAdsCommentsort = updateAdsCommentsort;
function insertBeforePutonads(sequelize, company, unituuid, advertiseruuid, username) {
    return __awaiter(this, void 0, void 0, function* () {
        let date = new Date();
        let date1 = new Date(1);
        let tsrange = [];
        tsrange.push(date1.toLocaleString());
        tsrange.push(date.toLocaleString());
        if (advertiseruuid == undefined) {
            let ads = yield global_1.getModel(modelName).create({ company: company, unituuid: unituuid, tsrange: tsrange, pic_mode: 1, state: 'off' }, { returning: true });
            let uuid = ads.get("uuid");
            global_1.getModel("ads.ads_ext").create({ uuid: uuid });
            return ads ? ads : undefined;
        }
        else {
            let ads = yield global_1.getModel(modelName).create({ username, company: advertiseruuid.company, advertiseruuid: advertiseruuid.uuid, unituuid: unituuid, tsrange: tsrange, pic_mode: 1, state: 'off' }, { returning: true });
            let uuid = ads.get("uuid");
            global_1.getModel("ads.ads_ext").create({ uuid: uuid });
            return ads ? ads : undefined;
        }
    });
}
exports.insertBeforePutonads = insertBeforePutonads;
function updatePutonads(adsuuid, ads) {
    return __awaiter(this, void 0, void 0, function* () {
        let [num, res] = yield global_1.getModel(modelName).update(ads, { where: { uuid: adsuuid }, returning: true });
        return num > 0 ? res[0].get() : undefined;
    });
}
exports.updatePutonads = updatePutonads;
function queryPutonadsByuuid(adsuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { uuid: adsuuid } });
        return res ? res.get() : undefined;
    });
}
exports.queryPutonadsByuuid = queryPutonadsByuuid;
function queryPutonadsbyunituuid(sequelize, unitarr) {
    return __awaiter(this, void 0, void 0, function* () {
        if (unitarr != undefined && unitarr.length != 0) {
            let stringunit = "(";
            for (let j = 0; j < unitarr.length; j++) {
                stringunit = stringunit + "'" + unitarr[j].uuid + "'";
                if (j != unitarr.length - 1) {
                    stringunit = stringunit + ",";
                }
            }
            stringunit = stringunit + ")";
            let res = yield sequelize.query(`select uuid from ads.ads where unituuid in ${stringunit}`, { type: 'select' });
            return res;
        }
        else {
            return [];
        }
    });
}
exports.queryPutonadsbyunituuid = queryPutonadsbyunituuid;
function queryPutonadsbyunituuid2(sequelize, unitarr, category) {
    return __awaiter(this, void 0, void 0, function* () {
        if (unitarr != undefined && unitarr.length != 0) {
            let stringunit = "(";
            for (let j = 0; j < unitarr.length; j++) {
                stringunit = stringunit + "'" + unitarr[j].uuid + "'";
                if (j != unitarr.length - 1) {
                    stringunit = stringunit + ",";
                }
            }
            stringunit = stringunit + ")";
            let res = yield sequelize.query(`select uuid from ads.ads where unituuid in ${stringunit} and category='${category}'`, { type: 'select' });
            return res;
        }
        else {
            return [];
        }
    });
}
exports.queryPutonadsbyunituuid2 = queryPutonadsbyunituuid2;
function queryPutonadsbyunituuid3(sequelize, unitarr, category) {
    return __awaiter(this, void 0, void 0, function* () {
        if (unitarr != undefined && unitarr.length != 0) {
            let stringunit = "(";
            for (let j = 0; j < unitarr.length; j++) {
                stringunit = stringunit + "'" + unitarr[j].uuid + "'";
                if (j != unitarr.length - 1) {
                    stringunit = stringunit + ",";
                }
            }
            stringunit = stringunit + ")";
            let res = yield sequelize.query(`select uuid from ads.ads where unituuid in ${stringunit} and subcategory='${category}'`, { type: 'select' });
            return res;
        }
        else {
            return [];
        }
    });
}
exports.queryPutonadsbyunituuid3 = queryPutonadsbyunituuid3;
function upadsBrowser(adsuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let ads = yield global_1.getModel(modelName).findOne({ where: { uuid: adsuuid } });
        let [number, res] = yield global_1.getModel(modelName).update({ showamount: ads.get('showamount') + 1 }, { where: { uuid: adsuuid } });
        return number > 0 ? res : undefined;
    });
}
exports.upadsBrowser = upadsBrowser;
function upadspoints(adsuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let ads = yield global_1.getModel(modelName).findOne({ where: { uuid: adsuuid } });
        let [number, res] = yield global_1.getModel(modelName).update({ pointmount: ads.get('pointmount') + 1 }, { where: { uuid: adsuuid } });
        return number > 0 ? res : undefined;
    });
}
exports.upadspoints = upadspoints;
function queryadvertiserAdsAll(advertiseruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        if (advertiseruuid) {
            let re = yield global_1.getModel(modelName).findAll({ where: { advertiseruuid: advertiseruuid, state: 'on' } });
            return re ? re : undefined;
        }
        else {
            let re = yield global_1.getModel(modelName).findAll({ where: { state: 'on' } });
            return re ? re : undefined;
        }
    });
}
exports.queryadvertiserAdsAll = queryadvertiserAdsAll;
function queryadvertiserAdsBypage(searchdata, start, length, advertiseruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        if (advertiseruuid) {
            let re = yield global_1.getModel(modelName).findAll({
                where: {
                    advertiseruuid: advertiseruuid,
                    $or: [{ state: 'on' }, { state: 'wait-ack' }, { state: 'rejected' }],
                    title: { $like: '%' + searchdata + '%' },
                    deleted: 0
                }, offset: start, limit: length
            });
            return re ? re.map(r => r.get()) : undefined;
        }
        else {
            let re = yield global_1.getModel(modelName).findAll({ where: { $or: [{ state: 'on' }, { state: 'wait-ack' }, { state: 'rejected' }], name: { $like: '%' + searchdata + '%' }, deleted: 0 }, offset: start, limit: length });
            return re ? re.map(r => r.get()) : undefined;
        }
    });
}
exports.queryadvertiserAdsBypage = queryadvertiserAdsBypage;
function queryadvertiserAdsBypagecount(sequelize, advertiseruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        if (advertiseruuid) {
            let re = yield sequelize.query(`select count(*) from ads.ads where advertiseruuid = '${advertiseruuid}' and(state = 'on' or state = 'wait-ack' or state = 'rejected') and deleted = 0 `, { type: 'select' });
            return re ? re : undefined;
        }
        else {
            let re = yield sequelize.query(`select count(*) from ads.ads where (state = 'on' or state = 'wait-ack' or state = 'rejected') and deleted = 0 `, { type: 'select' });
            return re ? re : undefined;
        }
    });
}
exports.queryadvertiserAdsBypagecount = queryadvertiserAdsBypagecount;
function queryadsByunituuid(start, length, unituuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let re = yield global_1.getModel(modelName).findAll({
            where: { unituuid: unituuid, $or: [{ state: 'on' }, { state: 'wait-ack' }, { state: 'rejected' }], deleted: 0 },
            order: [['created', 'desc']], offset: start, limit: length
        });
        return re ? re.map(r => r.get()) : undefined;
    });
}
exports.queryadsByunituuid = queryadsByunituuid;
function queryadsByunituuidcount(sequelize, unituuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let re = yield sequelize.query(`select count(*) as count from ads.ads where unituuid = '${unituuid}' and (state = 'on' or state = 'wait-ack' or state = 'rejected') and deleted = 0`, { type: 'select' });
        return re ? re : undefined;
    });
}
exports.queryadsByunituuidcount = queryadsByunituuidcount;
function queryBalanceByadsuuid(sequelize, adsuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let re = yield sequelize.query(`select ue.crm_balance,ads.advertiseruuid
    from users.users_ext as ue , ads.advertiser as ad, ads.ads as ads
    where ue.uuid = ad.crmuuid
    and ad.uuid = ads.advertiseruuid
    and ads.uuid = '${adsuuid}'`, { type: 'select' });
        return re ? re : undefined;
    });
}
exports.queryBalanceByadsuuid = queryBalanceByadsuuid;
function queryunitByadauuid(sequelize, adsuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let re = yield sequelize.query(`select unit.method,unit.cpe_type
    from puton.unit as unit, ads.ads as ads
    where unit.uuid = ads.unituuid and ads.uuid = '${adsuuid}'`, { type: 'select' });
        return re ? re : undefined;
    });
}
exports.queryunitByadauuid = queryunitByadauuid;
function updateadsStatus(adsuuid, status) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ status: status, tempstatus: status }, { where: { uuid: adsuuid } });
        return number > 0 ? res : undefined;
    });
}
exports.updateadsStatus = updateadsStatus;
function queryBidByadsuuid(sequelize, adsuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select unit.bid as bid from ads.ads as ads , puton.unit as unit where unit.uuid = ads.unituuid and ads.uuid = '${adsuuid}'`, { type: 'select' });
        return res ? res : undefined;
    });
}
exports.queryBidByadsuuid = queryBidByadsuuid;
function updateBalanceByadsuuid(sequelize, adsuuid, money) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`UPDATE users.users_ext
    SET crm_balance = ${money}
    WHERE
        users.users_ext.uuid IN (
            SELECT
                ad.crmuuid
            FROM
                ads.advertiser AS ad,
                ads.ads AS ads
            WHERE
                ad.uuid = ads.advertiseruuid
            AND ads.uuid = '${adsuuid}'
        ) `, { type: 'update' });
        return res ? res : undefined;
    });
}
exports.updateBalanceByadsuuid = updateBalanceByadsuuid;
function queryplanunitByadsuuid(sequelize, adsuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select plan.name as planname , unit.name as unitname from ads.ads as ads , puton.unit as unit ,puton.plan as plan where ads.unituuid = unit.uuid and unit.planuuid = plan.uuid and ads.uuid = '${adsuuid}'`, { type: 'select' });
        return res ? res : undefined;
    });
}
exports.queryplanunitByadsuuid = queryplanunitByadsuuid;
function deleteadsByunituuid(sequelize, unituuid) {
    return __awaiter(this, void 0, void 0, function* () {
        sequelize.query(`update  ads.ads set deleted = 1 , state = 'on' where unituuid = '${unituuid}'`, { type: 'update' });
    });
}
exports.deleteadsByunituuid = deleteadsByunituuid;
function queryadvertiserByadsuuid(sequelize, adsuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`SELECT
	puton.plan.advertiseruuid as advertiseruuid
FROM
	ads.ads ,
	puton.unit ,
	puton.plan 
WHERE
	unit.planuuid = plan.uuid
AND unit.uuid = ads.unituuid
AND ads.uuid = '${adsuuid}'`, { type: 'select' });
        return res ? res : undefined;
    });
}
exports.queryadvertiserByadsuuid = queryadvertiserByadsuuid;
function querycrmuuidByadsuuid(sequelize, adsuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let re = yield sequelize.query(`select ad.crmuuid from ads.ads as ads, ads.advertiser as ad where ad.uuid = ads.advertiseruuid and ads.uuid ='${adsuuid}'`, { type: 'select' });
        return re ? re : undefined;
    });
}
exports.querycrmuuidByadsuuid = querycrmuuidByadsuuid;
function queryviewsByadsuuid(sequelize, adsuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let re = yield sequelize.query(`select ads_e.virtviews from Ads.ads AS ads, ads.ads_ext as ads_e where ads.uuid = ads_e.uuid and ads.uuid = '${adsuuid}'`, { type: 'select' });
        return re ? re : undefined;
    });
}
exports.queryviewsByadsuuid = queryviewsByadsuuid;
function updateshowamountByadsuuid(adsuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let temp = yield global_1.getModel(modelName).findOne({ where: { uuid: adsuuid } });
        yield global_1.getModel(modelName).update({ showamount: temp.get('showamount') + 1 }, { where: { uuid: adsuuid } });
    });
}
exports.updateshowamountByadsuuid = updateshowamountByadsuuid;
function updatepointamountByadsuuid(adsuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let temp = yield global_1.getModel(modelName).findOne({ where: { uuid: adsuuid } });
        yield global_1.getModel(modelName).update({ pointmount: temp.get('pointmount') + 1 }, { where: { uuid: adsuuid } });
    });
}
exports.updatepointamountByadsuuid = updatepointamountByadsuuid;
function queryPutonadsByunituuids(sequelize, unituuids) {
    return __awaiter(this, void 0, void 0, function* () {
        if (unituuids != undefined && unituuids.length != 0) {
            let stringunit = "(";
            for (let i = 0; i < unituuids.length; i++) {
                stringunit = stringunit + "'" + unituuids[i].uuid + "'";
                if (i != unituuids.length - 1) {
                    stringunit = stringunit + ",";
                }
            }
            stringunit = stringunit + ")";
            let ads = yield sequelize.query(`select * from ads.ads where unituuid in ${stringunit}  and deleted = 0`, { type: 'select' });
            return ads ? ads : undefined;
        }
        else {
            return undefined;
        }
    });
}
exports.queryPutonadsByunituuids = queryPutonadsByunituuids;
function findadsByunituuid(unituuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { unituuid: unituuid } });
        return res ? res.map(r => r.get()) : undefined;
    });
}
exports.findadsByunituuid = findadsByunituuid;
function queryAdsByunituuid(unituuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let ads = yield global_1.getModel(modelName).findAll({ where: { unituuid: unituuid, deleted: 0 } });
        return ads ? ads.map(r => r.get()) : undefined;
    });
}
exports.queryAdsByunituuid = queryAdsByunituuid;
function updateAdsByunituuid(unituuid) {
    return __awaiter(this, void 0, void 0, function* () {
        global_1.getModel(modelName).update({ status: 0, tempstatus: 0 }, { where: { unituuid: unituuid } });
    });
}
exports.updateAdsByunituuid = updateAdsByunituuid;
function undateAdsstatusByunituuids(sequelize, unituuids) {
    return __awaiter(this, void 0, void 0, function* () {
        if (unituuids != undefined || unituuids.length != 0) {
            let stringunit = "(";
            for (let i = 0; i < unituuids.length; i++) {
                stringunit = stringunit + "'" + unituuids[i].uuid + "'";
                if (i != unituuids.length - 1) {
                    stringunit = stringunit + ",";
                }
            }
            stringunit = stringunit + ")";
            sequelize.query(`update ads.ads set status = 0, tempstatus = 0 where unituuid in ${stringunit}`, { type: 'update' });
        }
    });
}
exports.undateAdsstatusByunituuids = undateAdsstatusByunituuids;
function undateAdsstatusByunituuids1(unituuids) {
    return __awaiter(this, void 0, void 0, function* () {
        if (unituuids != undefined || unituuids.length != 0) {
            // let stringunit="";
            // for(let i=0;i<unituuids.length;i++){
            //     stringunit = stringunit + "'" +unituuids[i].uuid +"'";
            //     if(i!=unituuids.length-1){
            //         stringunit = stringunit + ",";
            //     }
            // }
            let stringunit = [];
            for (let i = 0; i < unituuids.length; i++) {
                stringunit.push(unituuids[i].uuid.toString());
            }
            global_1.getModel(modelName).update({ status: 0 }, { where: { unituuid: { $in: stringunit } } });
        }
    });
}
exports.undateAdsstatusByunituuids1 = undateAdsstatusByunituuids1;
function updateAdvertiserByadsuuid(sequelize, adsuuid, state) {
    return __awaiter(this, void 0, void 0, function* () {
        sequelize.query(`update ads.advertiser set balance_state = ${state} where uuid = (select advertiseruuid from ads.ads where uuid = '${adsuuid}')`, { type: 'update' });
    });
}
exports.updateAdvertiserByadsuuid = updateAdvertiserByadsuuid;
function findadvertiserByadsuuid(sequelize, adsuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let advertiser = yield sequelize.query(`select * from ads.ads as ads ,ads.advertiser as adv where adv.uuid = ads.advertiseruuid and ads.uuid = '${adsuuid}' `, { type: 'select ' });
        return advertiser[0] ? advertiser[0] : undefined;
    });
}
exports.findadvertiserByadsuuid = findadvertiserByadsuuid;
function updateAdstempStatus() {
    return __awaiter(this, void 0, void 0, function* () {
        global_1.getModel(modelName).update({ status: 1 }, { where: { tempstatus: 1 } });
    });
}
exports.updateAdstempStatus = updateAdstempStatus;
function updateadsstatus(advertiseruuids) {
    return __awaiter(this, void 0, void 0, function* () {
        if (advertiseruuids.length != 0) {
            let uuidStr;
            for (let i = 0; i < advertiseruuids.length; i++) {
                uuidStr = uuidStr + "'" + advertiseruuids[i] + "'";
                if (i != advertiseruuids.length - 1) {
                    uuidStr = uuidStr + ",";
                }
            }
            global_1.getModel(modelName).update({ status: 0 }, { where: { advertiseruuid: { $in: [uuidStr] } } });
        }
    });
}
exports.updateadsstatus = updateadsstatus;
function deleteEmptyads(date) {
    return __awaiter(this, void 0, void 0, function* () {
        global_1.getModel(modelName).update({ deleted: 1 }, { where: { title: '', created: { $lt: date } } });
    });
}
exports.deleteEmptyads = deleteEmptyads;
function getrent(sequelize, adsuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        if (adsuuid != undefined && adsuuid != null) {
            let res = yield sequelize.query(`select * from ads.ads as ads , ads.advertiser as adv where ads.advertiseruuid = adv.uuid and ads.uuid = '${adsuuid}'`, { type: 'select' });
            return res ? res : [];
        }
        else {
            let res = yield sequelize.query(`select * from ads.ads as ads , ads.advertiser as adv where ads.advertiseruuid = adv.uuid `, { type: 'select' });
            return res ? res : [];
        }
    });
}
exports.getrent = getrent;
function addPointsBalance(seqz, iuuid, balance, points, exuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield seqz.transaction(function (t) {
            return __awaiter(this, void 0, void 0, function* () {
                //获得广告商的积分零钱
                let advertiserModel = yield global_1.getModel('users.users_ext').findOne({ where: { uuid: exuuid } });
                let advertiser = advertiserModel.get();
                //获得广告的积分零钱
                let adsModel = yield global_1.getModel(modelName).findOne({ where: { uuid: iuuid } });
                let ads = adsModel.get();
                if (ads.allbalance < balance) { //给广告加钱，给广告商扣钱
                    balance = balance - ads.allbalance;
                    if (advertiser.crm_balance < balance * 100) { //余额不足
                        return undefined;
                    }
                    yield global_1.getModel(modelName).update({
                        totalbalance: sequelize_1.Sequelize.literal(`totalbalance+${balance}`),
                        allbalance: sequelize_1.Sequelize.literal(`allbalance+${balance}`),
                    }, { where: { uuid: iuuid }, transaction: t });
                    yield global_1.getModel('users.users_ext').update({
                        crm_balance: sequelize_1.Sequelize.literal(`crm_balance-${balance * 100}`),
                    }, { where: { uuid: exuuid }, transaction: t, returning: true });
                }
                else if (ads.allbalance > balance) { //给广告减钱，给广告商退钱
                    balance = ads.allbalance - balance;
                    yield global_1.getModel(modelName).update({
                        totalbalance: sequelize_1.Sequelize.literal(`totalbalance-${balance}`),
                        allbalance: sequelize_1.Sequelize.literal(`allbalance-${balance}`),
                    }, { where: { uuid: iuuid }, transaction: t });
                    yield global_1.getModel('users.users_ext').update({
                        crm_balance: sequelize_1.Sequelize.literal(`crm_balance+${balance * 100}`),
                    }, { where: { uuid: exuuid }, transaction: t, returning: true });
                }
                if (ads.allpoint < points) {
                    points = points - ads.allpoint;
                    if (advertiser.crm_points < points) { //积分不足
                        return undefined;
                    }
                    yield global_1.getModel(modelName).update({
                        totalpoints: sequelize_1.Sequelize.literal(`totalpoints+${points}`),
                        allpoint: sequelize_1.Sequelize.literal(`allpoint+${points}`)
                    }, { where: { uuid: iuuid }, transaction: t });
                    yield global_1.getModel('users.users_ext').update({
                        crm_points: sequelize_1.Sequelize.literal(`crm_points-${points}`),
                    }, { where: { uuid: exuuid }, transaction: t, returning: true });
                }
                else if (ads.allpoint > points) {
                    points = ads.allpoint - points;
                    yield global_1.getModel(modelName).update({
                        totalpoints: sequelize_1.Sequelize.literal(`totalpoints-${points}`),
                        allpoint: sequelize_1.Sequelize.literal(`allpoint-${points}`)
                    }, { where: { uuid: iuuid }, transaction: t });
                    yield global_1.getModel('users.users_ext').update({
                        crm_points: sequelize_1.Sequelize.literal(`crm_points+${points}`),
                    }, { where: { uuid: exuuid }, transaction: t, returning: true });
                }
                return 1;
            });
        });
    });
}
exports.addPointsBalance = addPointsBalance;
//# sourceMappingURL=ads.js.map