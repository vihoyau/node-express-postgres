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
const modelName = "users.usercoupon";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        useruuid: sequelize_1.DataTypes.UUID,
        couponuuid: sequelize_1.DataTypes.UUID,
        state: sequelize_1.DataTypes.ENUM('new', 'used', 'expired'),
        selected: sequelize_1.DataTypes.CHAR(225),
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME,
    }, {
        timestamps: false,
        schema: "users",
        freezeTableName: true,
        tableName: "usercoupon"
    });
};
/**
 * 用户购买获得优惠券
 * @param useruuid
 * @param couponuuid
 */
function createdUsercoupon(useruuid, couponuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).create({ useruuid: useruuid, couponuuid: couponuuid, state: 'new' });
    });
}
exports.createdUsercoupon = createdUsercoupon;
/**
 * 新增一条用户优惠券
 * @param useruuid
 * @param couponuuid
 * @param sequelize
 */
function insertusercoupon(sequelize, useruuid, couponuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield sequelize.transaction((t) => __awaiter(this, void 0, void 0, function* () {
            yield global_1.getModel(modelName).create({ useruuid: useruuid, couponuuid: couponuuid, state: 'new' }, { transaction: t, returning: true });
            yield global_1.getModel("mall.coupon").update({ num: sequelize_1.Sequelize.literal(`num-1`) }, { where: { uuid: couponuuid, num: { $gt: 0 } }, transaction: t, returning: true });
        }));
    });
}
exports.insertusercoupon = insertusercoupon;
/**
 * 根据useruuid,couponuuid查询
 * @param useruuid
 * @param couponuuid
 */
function getbyuseruuidandcouponuuid(useruuid, couponuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { useruuid: useruuid, couponuuid: couponuuid, state: 'new' } });
        return res ? res.get() : undefined;
    });
}
exports.getbyuseruuidandcouponuuid = getbyuseruuidandcouponuuid;
/**
 * 获得用户优惠券列表
 * @param useruuid
 */
function getusercouponlist(sequelize, useruuid, kind, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`SELECT
    C.*,
    uc.uuid as cuuid,
    uc.state as cstate
FROM
	users.usercoupon AS uc
LEFT JOIN mall.coupon AS C ON uc.couponuuid = C .uuid
WHERE
	uc.useruuid = '${useruuid}'
AND C .kind = '${kind}'
AND uc.state like '%${state}%'
ORDER BY
	uc.created DESC
    `, { type: "select" });
        return res ? res : undefined;
    });
}
exports.getusercouponlist = getusercouponlist;
/**
 * 获得所有用户优惠券列表(goodscrm)
 * @param useruuid
 */
function getcouponlistCount(sequelize, businessuuids, searchdata, coupontype, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let company1 = "and c.businessuuid in (";
        if (businessuuids) {
            for (let i = 0; i < businessuuids.length; i++) {
                if (i == businessuuids.length - 1) {
                    company1 = company1 + "'" + businessuuids[i] + "'";
                }
                else {
                    company1 = company1 + "'" + businessuuids[i] + "',";
                }
            }
            company1 = company1 + ")";
        }
        else {
            company1 = "";
        }
        let res = yield sequelize.query(`SELECT
    count(*)
FROM
	users.usercoupon AS uc
LEFT JOIN mall.coupon AS C ON uc.couponuuid = C .uuid
LEFT JOIN users.users AS u ON u.uuid = uc .useruuid
WHERE
1=1
  ${company1}
and (u.username like '%${searchdata}%' or c.business like '%${searchdata}%' or c.title like '%${searchdata}%' )
and  c.coupontype like '%${coupontype}%'
and  uc.state like '%${state}%'
    `, { type: "select" });
        return res ? res[0].count : 0;
    });
}
exports.getcouponlistCount = getcouponlistCount;
/**
 * 获得所有用户优惠券列表(goodscrm)
 * @param useruuid
 */
function getcouponlist(sequelize, businessuuids, cursor, limit, searchdata, coupontype, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let company1 = "and c.businessuuid in (";
        if (businessuuids) {
            for (let i = 0; i < businessuuids.length; i++) {
                if (i == businessuuids.length - 1) {
                    company1 = company1 + "'" + businessuuids[i] + "'";
                }
                else {
                    company1 = company1 + "'" + businessuuids[i] + "',";
                }
            }
            company1 = company1 + ")";
        }
        else {
            company1 = "";
        }
        let res = yield sequelize.query(`SELECT
    C.business,
    c.title,
    c.uuid as cuuid,
    c.content,
    uc.uuid,
    u.username,
    uc.state,
    c.coupontype
FROM
	users.usercoupon AS uc
LEFT JOIN mall.coupon AS C ON uc.couponuuid = C .uuid
LEFT JOIN users.users AS u ON u.uuid = uc .useruuid
WHERE
1=1
  ${company1}
  and (u.username like '%${searchdata}%' or c.business like '%${searchdata}%' or c.title like '%${searchdata}%' )
  and  c.coupontype like '%${coupontype}%'
  and  uc.state like '%${state}%'
ORDER BY
    uc.created DESC
offset ${cursor}
limit ${limit}
    `, { type: "select" });
        return res ? res : undefined;
    });
}
exports.getcouponlist = getcouponlist;
/**
 * 获得下单可用的优惠券
 * @param useruuid
 */
function getGoodsCouponList(sequelize, useruuid, business) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`SELECT
    c.*,
    uc.selected,
    uc.uuid as cuuid
FROM
	users.usercoupon AS uc
LEFT JOIN mall.coupon AS C ON uc.couponuuid = C .uuid
WHERE
	(
		(
			c."kind" = 'business'
			AND c."business" = '${business}'
		)
		OR c."kind" = 'mall'
	)
AND c."state" = 'on'
AND uc. STATE = 'new'
AND uc.useruuid='${useruuid}'
and (uc.selected is null or uc.selected ='${business}')
ORDER BY
	uc.created DESC`, { type: "select" });
        return res ? res : undefined;
    });
}
exports.getGoodsCouponList = getGoodsCouponList;
/**
 * 获得用户选中优惠券列表
 * @param useruuid
 */
function getUserSelectGoodsCoupon(sequelize, useruuid, business) {
    return __awaiter(this, void 0, void 0, function* () {
        let businesssman = "(";
        for (let i = 0; i < business.length; i++) {
            if (i == business.length - 1) {
                businesssman = businesssman + "'" + business[i] + "'";
            }
            else {
                businesssman = businesssman + "'" + business[i] + "',";
            }
        }
        businesssman = businesssman + ")";
        let res = yield sequelize.query(`SELECT
	c.*,
    uc.selected,
    uc.uuid as cuuid
FROM
	users.usercoupon AS uc
LEFT JOIN mall.coupon AS C ON uc.couponuuid = C .uuid
WHERE
	(
		(
			c."kind" = 'business'
			AND c."business" in ${businesssman}
		)
		OR c."kind" = 'mall'
	)
AND c."state" = 'on'
AND uc. STATE = 'new'
AND uc.useruuid='${useruuid}'
and uc.selected in ${businesssman}
ORDER BY
	uc.created DESC`, { type: "select" });
        return res ? res : undefined;
    });
}
exports.getUserSelectGoodsCoupon = getUserSelectGoodsCoupon;
/**
 * 获得用户选中优惠券列表
 * @param useruuid
 */
function getGoodsCouponLists(sequelize, useruuid, business) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`SELECT
	uc.*,
    uc.selected,
    uc.uuid as cuuid
FROM
	users.usercoupon AS uc
LEFT JOIN mall.coupon AS C ON uc.couponuuid = C .uuid
WHERE
	(
		(
			c."kind" = 'business'
			AND c."business" = '${business}'
		)
		OR c."kind" = 'mall'
	)
AND c."state" = 'on'
AND uc. STATE = 'new'
AND uc.useruuid='${useruuid}'
and uc.selected='${business}'
ORDER BY
	uc.created DESC`, { type: "select" });
        return res ? res : undefined;
    });
}
exports.getGoodsCouponLists = getGoodsCouponLists;
/**
 * 获得用户优惠券详情
 * @param uuid
 */
function getbyprimary(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { uuid: uuid } });
        return res ? res.get() : undefined;
    });
}
exports.getbyprimary = getbyprimary;
//获得用户优惠券状态
function searchCouponState(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { uuid: uuid } });
        return res ? res.get() : undefined;
    });
}
exports.searchCouponState = searchCouponState;
/**
 * 用户领取的优惠券自动过期
 */
function usercouponAutoExpired(state, couponuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ state: state }, { where: { couponuuid: couponuuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.usercouponAutoExpired = usercouponAutoExpired;
/**
 * 商家or用户手动使用
 */
function usedUsercoupon(state, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ state: state }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.usedUsercoupon = usedUsercoupon;
/**
 * 下单时选择优惠券
 */
function updateSelected(uuid, selected) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ selected: selected }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateSelected = updateSelected;
/**
 * 修改优惠券状态
 */
function updateCouponState(uuid, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ state: state }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateCouponState = updateCouponState;
/**
 * 根据用户优惠券uuid查找优惠券
 */
function findCouponByUsercouponuuid(cuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let usercoupon = yield global_1.getModel(modelName).findOne({ where: { uuid: cuuid } });
        let usercouponuuid = usercoupon.get('couponuuid');
        let coupon = yield global_1.getModel('mall.coupon').findOne({ where: { uuid: usercouponuuid } });
        return coupon ? coupon.get() : undefined;
    });
}
exports.findCouponByUsercouponuuid = findCouponByUsercouponuuid;
/**
 * 根据用户优惠券uuid查找优惠券
 */
function getusercouponuuid(couponuuid, useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let usercoupon = yield global_1.getModel(modelName).findOne({ where: { couponuuid, useruuid } });
        return usercoupon;
    });
}
exports.getusercouponuuid = getusercouponuuid;
//# sourceMappingURL=usercoupon.js.map