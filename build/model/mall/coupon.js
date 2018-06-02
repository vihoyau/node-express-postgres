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
const modelName = "mall.coupon";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        businessuuid: sequelize_1.DataTypes.UUID,
        business: sequelize_1.DataTypes.CHAR(225),
        title: sequelize_1.DataTypes.CHAR(225),
        kind: sequelize_1.DataTypes.CHAR(25),
        content: sequelize_1.DataTypes.JSONB,
        price: sequelize_1.DataTypes.INTEGER,
        point: sequelize_1.DataTypes.INTEGER,
        tsrange: sequelize_1.DataTypes.RANGE(),
        coupontype: sequelize_1.DataTypes.CHAR(225),
        state: sequelize_1.DataTypes.CHAR(20),
        num: sequelize_1.DataTypes.INTEGER,
        description: sequelize_1.DataTypes.TEXT,
        goodsuuids: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.UUID),
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME,
    }, {
        timestamps: false,
        schema: "mall",
        freezeTableName: true,
        tableName: "coupon"
    });
};
/**
 * 创建优惠券
 */
function insertCoupon(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).create(obj, { returning: true });
    });
}
exports.insertCoupon = insertCoupon;
/**
 * 获得优惠券详情
 * @param uuid
 */
function findByPrimary(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findByPrimary(uuid);
        return res ? res.get() : undefined;
    });
}
exports.findByPrimary = findByPrimary;
/**
 * 获得APP优惠券列表
 * @param uuid
 */
function getAPPCouponList(cursor, limit, kind) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({
            where: {
                state: 'on',
                $or: [
                    { kind: 'entity', num: { $gt: 0 } },
                    { kind: { $in: ['mall', 'business'] } }
                ],
                kind: { $like: "%" + kind + "%" }
            },
            offset: cursor,
            limit: limit,
            order: [["created", "desc"]]
        });
        return res ? res.map(r => r.get()) : undefined;
    });
}
exports.getAPPCouponList = getAPPCouponList;
/**
 * 获得APP商家优惠券列表
 * @param uuid
 */
function getAPPBusinessCouponList(business) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({
            where: {
                $or: [
                    { kind: 'business', business: business },
                    { kind: 'mall' }
                ],
                state: 'on',
                num: { $gt: 0 }
            },
            order: [["created", "desc"]]
        });
        return res ? res.map(r => r.get()) : undefined;
        /*    let res = await sequelize.query(`SELECT
            "mall.coupon".*,
            uu.uuid as id
        FROM
            "mall"."coupon" AS "mall.coupon"
        left join users.usercoupon as uu
        on "mall.coupon".uuid = uu.couponuuid
        WHERE
            (
                (
                    "mall.coupon"."kind" = 'business'
                    AND "mall.coupon"."business" = '${business}'
                )
                OR "mall.coupon"."kind" = 'mall'
            )
        AND "mall.coupon"."state" = 'on'
        AND uu.useruuid = '${useruuid}'
        ORDER BY
            "mall.coupon"."created" DESC`, { type: 'select' }) as any[]
            return res*/
    });
}
exports.getAPPBusinessCouponList = getAPPBusinessCouponList;
/**
 * 获得优惠券列表
 */
function getCouponList(cursor, limit, searchdata, coupontype, kind, state) {
    return __awaiter(this, void 0, void 0, function* () {
        coupontype = '%' + coupontype + '%';
        searchdata = '%' + searchdata + '%';
        kind = '%' + kind + '%';
        state = '%' + state + '%';
        let res = yield global_1.getModel(modelName).findAll({
            /*  where: {
                 $and: [
                     { $or: [{ business: { $like: searchdata } }, { title: { $like: searchdata } }] },
                     { $and: [, { coupontype: { $like: coupontype } }, { kind: { $like: kind } }, { state: { $like: state } }] }
                 ]
             }, */
            where: {
                $or: [{ business: { $like: searchdata } }, { title: { $like: searchdata } }],
                coupontype: { $like: coupontype },
                kind: { $like: kind },
                state: { $like: state }
            },
            order: [['created', 'DESC']],
            limit: limit,
            offset: cursor
        });
        return res ? res.map(r => r.get()) : undefined;
    });
}
exports.getCouponList = getCouponList;
/**
 * 获得优惠券列表记录数
 */
function getCount(searchdata, coupontype, kind, state) {
    return __awaiter(this, void 0, void 0, function* () {
        coupontype = '%' + coupontype + '%';
        searchdata = '%' + searchdata + '%';
        kind = '%' + kind + '%';
        state = '%' + state + '%';
        let res = yield global_1.getModel(modelName).count({
            where: {
                $or: [{ business: { $like: searchdata } }, { title: { $like: searchdata } }],
                coupontype: { $like: coupontype },
                kind: { $like: kind },
                state: { $like: state }
            }
        });
        return res;
    });
}
exports.getCount = getCount;
/**
 * 获得所有优惠券
 */
function getAllCoupon(state) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { tsrange: { $ne: null }, state: state } });
        return res ? res.map(r => r.get()) : undefined;
    });
}
exports.getAllCoupon = getAllCoupon;
/**
 * 修改优惠券信息
 * @param coupon
 * @param uuid
 */
function updateCouponInfo(coupon, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update(coupon, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateCouponInfo = updateCouponInfo;
/**
 * 修改优惠券信息
 * @param coupon
 * @param uuid
 */
function updateCouponNum(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ num: sequelize_1.Sequelize.literal(`num-1`) }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateCouponNum = updateCouponNum;
/**
 * 自动过期
 */
function couponAutoExpired(state, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ state: state }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.couponAutoExpired = couponAutoExpired;
/**
 * 删除优惠券
 * @param uuid
 */
function deleteCoupon(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).destroy({ where: { uuid: uuid } });
    });
}
exports.deleteCoupon = deleteCoupon;
//# sourceMappingURL=coupon.js.map