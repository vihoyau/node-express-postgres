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
const modelName = "orders.orders";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4
        },
        useruuid: sequelize_1.DataTypes.UUID,
        goods: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.JSONB),
        total_fee: sequelize_1.DataTypes.INTEGER,
        real_fee: sequelize_1.DataTypes.INTEGER,
        fee_info: sequelize_1.DataTypes.JSONB,
        address: sequelize_1.DataTypes.JSONB,
        message: sequelize_1.DataTypes.TEXT,
        state: sequelize_1.DataTypes.ENUM('wait-pay', 'wait-send', 'wait-recv', 'wait-comment', 'wait-ack', 'cancel', 'finish'),
        fee_type: sequelize_1.DataTypes.ENUM('wait-pay', 'wxpay', 'alipay', 'pointpay', 'balancepay', 'cardpay'),
        logisticscode: sequelize_1.DataTypes.CHAR(64),
        shippingcode: sequelize_1.DataTypes.CHAR(64),
        postage: sequelize_1.DataTypes.INTEGER,
        businessmen: sequelize_1.DataTypes.CHAR(30),
        goodpoint: sequelize_1.DataTypes.INTEGER,
        couponuuid: sequelize_1.DataTypes.UUID,
        prize: sequelize_1.DataTypes.CHAR(50),
        modified: sequelize_1.DataTypes.TIME,
        created: sequelize_1.DataTypes.TIME,
    }, {
        timestamps: false,
        schema: "orders",
        freezeTableName: true,
        tableName: "orders"
    });
};
function findByUseruuid(useruuid, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({
            where: { useruuid: useruuid },
            offset: cursor,
            limit: limit,
            order: [['created', 'desc']]
        });
        return res.map(r => r.get());
    });
}
exports.findByUseruuid = findByUseruuid;
//支付方式
function modifiedFeeType(fee_type, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ fee_type: fee_type }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.modifiedFeeType = modifiedFeeType;
//积分支付方式
function modifiedBalancepay(fee_type, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ fee_type: fee_type }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.modifiedBalancepay = modifiedBalancepay;
//积分支付方式
function modifiedPointpay(fee_type, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ fee_type: fee_type }, { where: { uuid: uuid, real_fee: 0, postage: 0 }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.modifiedPointpay = modifiedPointpay;
function findAll(seque, obj, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let uuid;
        if (obj.searchdata.length == 32 || obj.searchdata.length == 36)
            uuid = `or o.uuid='${obj.searchdata}'`;
        else
            uuid = '';
        let res = yield seque.query(`select o.*,u.username from orders.orders o left join users.users u on o.useruuid =u.uuid where 1=1 and o.state like '%${obj.state}%' and (u.username like '%${obj.searchdata}%' ${uuid})  order by o.created desc offset ${cursor}  limit ${limit} `, { type: "select" });
        return res;
    });
}
exports.findAll = findAll;
function getOrderCount(seque, obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let uuid;
        if (obj.searchdata.length == 32 || obj.searchdata.length == 36)
            uuid = `or o.uuid='${obj.searchdata}'`;
        else
            uuid = '';
        let res = yield seque.query(`select count(*) from orders.orders o left join users.users u on o.useruuid =u.uuid where 1=1 and o.state like '%${obj.state}%' and (u.username like '%${obj.searchdata}%' ${uuid})`, { type: "select" });
        return res[0].count;
    });
}
exports.getOrderCount = getOrderCount;
function getCount(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).count({ where: obj });
        return res;
    });
}
exports.getCount = getCount;
//查询优惠券uuid
function searchgoodsuuid(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findByPrimary(uuid);
        return res ? res.get() : undefined;
    });
}
exports.searchgoodsuuid = searchgoodsuuid;
//查询用户积分
function searchPointNumber(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel("users.users_ext").findByPrimary(uuid);
        return res ? res.get() : undefined;
    });
}
exports.searchPointNumber = searchPointNumber;
//查询汇率
function searchdeduction(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel("mall.deduction").findByPrimary(uuid);
        return res ? res.get() : undefined;
    });
}
exports.searchdeduction = searchdeduction;
function insertOrder(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create(obj, { returning: true });
        return res ? res.get() : undefined;
    });
}
exports.insertOrder = insertOrder;
//查询商品属性
function seachGoodsProperty(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel("mall.goods").findByPrimary(uuid);
        return res ? res.get() : undefined;
    });
}
exports.seachGoodsProperty = seachGoodsProperty;
//保存优惠券
function inserordercouponuuid(usercouponuuid, ordersuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).update({ usergoodsuuid: usercouponuuid }, { where: { uuid: ordersuuid }, returning: true });
        return res;
    });
}
exports.inserordercouponuuid = inserordercouponuuid;
//保存抵扣金币
function inserpoint(deductionpoint, ordersuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel("orders.orders").update({ deductionpoint }, { where: { uuid: ordersuuid }, returning: true });
        return res;
    });
}
exports.inserpoint = inserpoint;
function updateState(state, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ state: state }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateState = updateState;
function updateLogistics(logisticscode, shippingcode, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ logisticscode: logisticscode, shippingcode: shippingcode, state: 'wait-recv' }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateLogistics = updateLogistics;
function modifiedLogistics(logisticscode, shippingcode, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ logisticscode: logisticscode, shippingcode: shippingcode, state: 'wait-send' }, { where: { uuid: uuid } });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.modifiedLogistics = modifiedLogistics;
function findByUserState(useruuid, state, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({
            where: { useruuid: useruuid, state: state },
            offset: cursor,
            limit: limit,
            order: [['created', 'desc']]
        });
        return res.map(r => r.get());
    });
}
exports.findByUserState = findByUserState;
function findByWaitSend(cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { state: 'wait-send' }, offset: cursor, limit: limit, order: [["created", "desc"]] });
        return res.map(r => r.get());
    });
}
exports.findByWaitSend = findByWaitSend;
function findByState(state, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({
            where: { state: state },
            offset: cursor,
            limit: limit,
            order: [['created', 'desc']]
        });
        return res.map(r => r.get());
    });
}
exports.findByState = findByState;
function findByPrimary(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findByPrimary(uuid);
        return res ? res.get() : undefined;
    });
}
exports.findByPrimary = findByPrimary;
function findOrders(seque, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield seque.query(`select o.*,u.username,s.shippername from orders.orders as o LEFT JOIN users.users as u on o.useruuid=u.uuid left join logistics.shipper as s on s.shippercode=o.shippingcode where o.uuid='${uuid}'`, { type: "select" });
        return res ? res[0] : undefined;
    });
}
exports.findOrders = findOrders;
function findWaitPay(time) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { state: "wait-pay", created: { $lt: sequelize_1.Sequelize.literal(`now() - interval '${time} hour'`) } } });
        return res.map(r => r.get());
    });
}
exports.findWaitPay = findWaitPay;
function updateWaitPay(time, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ state: state }, { where: { state: "wait-pay", created: { $lt: sequelize_1.Sequelize.literal(`now() - interval '${time} hour'`) } }, returning: true });
        return number > 0 ? res.map(r => r.get()) : undefined;
    });
}
exports.updateWaitPay = updateWaitPay;
function updateWaitRecv(time, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ state: state }, { where: { state: "wait-recv", created: { $lt: sequelize_1.Sequelize.literal(`now() - interval '${time} day'`) } }, returning: true });
        return number > 0 ? res.map(r => r.get()) : undefined;
    });
}
exports.updateWaitRecv = updateWaitRecv;
function updateWaitComment(time, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ state: state }, { where: { state: "wait-comment", created: { $lt: sequelize_1.Sequelize.literal(`now() - interval '${time} day'`) } }, returning: true });
        return number > 0 ? res.map(r => r.get()) : undefined;
    });
}
exports.updateWaitComment = updateWaitComment;
function deleteOrder(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).destroy({ where: { uuid: uuid } });
    });
}
exports.deleteOrder = deleteOrder;
/**
 * 将下单的商品按商家分类
 * @param goods
 */
function AutomaticSeparation(goods) {
    return __awaiter(this, void 0, void 0, function* () {
        let array = [];
        let businessmens = [];
        let goodss = [];
        for (let a = 0; a < goods.length; a++) { //遍历所有下单的商品
            if (businessmens.length === 0 || goods[a].businessmen === null) { //第一个商品默认为第一个商家
                businessmens = [];
                businessmens.push(goods[a]); //第一个商家
                array.push(businessmens);
                goodss.push(goods[a].businessmen);
            }
            else {
                for (let b = 0; b < array.length; b++) { //遍历每个商家
                    if (array[b][0].businessmen === goods[a].businessmen && goods[a].businessmen != null) { //判断购买的商品是否已经分配到商家中
                        businessmens = array[b];
                        businessmens.push(goods[a]);
                        array[b] = businessmens;
                    }
                }
                let index = goodss.indexOf(goods[a].businessmen); //判断商家是否存在
                if (index === -1) {
                    businessmens = [];
                    businessmens.push(goods[a]);
                    array.push(businessmens);
                    goodss.push(goods[a].businessmen);
                }
            }
        }
        return array;
    });
}
exports.AutomaticSeparation = AutomaticSeparation;
//# sourceMappingURL=orders.js.map