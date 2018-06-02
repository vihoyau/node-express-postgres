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
const orders_1 = require("../../model/orders/orders");
const goods_1 = require("../../model/mall/goods");
const shopping_cart_1 = require("../../model/orders/shopping_cart");
const users_1 = require("../../model/users/users");
const users_ext_1 = require("../../model/users/users_ext");
const message_1 = require("../../model/users/message");
const usercoupon_1 = require("../../model/users/usercoupon");
const users_ext_2 = require("../../model/users/users_ext");
const logistics_1 = require("../../model/logistics/logistics");
const message_2 = require("../../model/users/message");
const logindao_1 = require("../../redis/logindao");
const validator_1 = require("../../lib/validator");
const system_1 = require("../../model/system/system");
const users_2 = require("../../model/users/users");
// import { updatePrizeInfo, findAllPrize } from "../../model/mall/prize"
const validator_2 = require("./validator");
const response_1 = require("../../lib/response");
const express_1 = require("express");
const utils_1 = require("../../lib/utils");
exports.router = express_1.Router();
exports.router.get('/', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { page, count } = req.query;
        try {
            validator_1.validateCgi({ page: page, count: count }, validator_2.shoppingCartValidator.pageAndCount);
            const loginInfo = req.loginInfo;
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let orders = yield orders_1.findByUseruuid(loginInfo.getUuid(), cursor, limit);
            orders.forEach(r => {
                r.total_fee = r.total_fee / 100;
                r.real_fee = r.real_fee / 100;
            });
            return response_1.sendOK(res, orders);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
function comparepro(arr, str, num) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let j = 0; j < arr.length; j++) {
            for (let i = 0; i < str.length; i++) {
                if (arr[j].type === str[i]) {
                    if (arr[j].data) {
                        arr[j].data = yield comparepro(arr[j].data, str, num);
                        return arr;
                    }
                    else {
                        if (parseInt(arr[j].stock) < num) {
                            return undefined;
                        }
                        console.log("arr[j].stockarr[j].stockarr[j].stock" + arr[j].stock);
                        if (arr[j].stock)
                            arr[j].stock = parseInt(arr[j].stock) - num + "";
                        return arr;
                    }
                }
            }
        }
    });
}
exports.comparepro = comparepro;
//查询商品的属性
exports.router.get('/checkgoods', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { goodsuuid } = req.query;
        if (Object.prototype.toString.apply(goodsuuid) === "[object Array]") {
            for (let i = 0; i < goodsuuid.length; i++) {
                let goodpro = yield orders_1.seachGoodsProperty(goodsuuid[i]);
                if (goodpro.deduction === "off") {
                    return response_1.sendOK(res, { goodsdeduction: "off" });
                }
            }
        }
        else {
            let goodpro = yield orders_1.seachGoodsProperty(goodsuuid);
            if (goodpro.deduction === "off") {
                return response_1.sendOK(res, { goodsdeduction: "off" });
            }
        }
        return response_1.sendOK(res, { goodsdeduction: "on" });
    });
});
//查询积分及计算付款金额
exports.router.post('/checkpoint', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const info = req.loginInfo;
        let useruuid = info.getUuid();
        let { coupons, goods } = req.body;
        let array = yield orders_1.AutomaticSeparation(goods);
        // coupons = JSON.parse(coupons)
        try {
            const loginInfo = req.loginInfo;
            let userLevel = yield users_1.finduserslevel(req.app.locals.sequelize, loginInfo.getUuid());
            let real_feeuse = 0;
            //判断积分数量
            let userpoint = yield orders_1.searchPointNumber(useruuid);
            let points = userpoint.points;
            //抵扣汇率deduction
            let deductionuuid = "0c163e52-f26d-4d77-ae71-dd3ae8184333";
            let deduction = yield orders_1.searchdeduction(deductionuuid);
            let deductiontext = deduction.deductiontext;
            let exchage = deduction.exchange;
            let usenumber = deduction.usenumber;
            //可用整数人民币
            let rmbdeduction = Math.floor(points / exchage);
            let real_use;
            let total_fee = 0;
            let postageall = 0;
            for (let i = 0; i < array.length; i++) { //遍历每个商家
                let total_fee1 = 0;
                let real_fee1 = 0;
                let goodpoint = 0;
                for (let j = 0; j < array[i].length; j++) { //遍历每个商家下的每个商品
                    if (array[i][j].number < 1 || array[i][j].goodprice < 0 || array[i][j].goodpoint < 0) {
                        return response_1.sendErrMsg(res, "商品价格或数量有误", 500);
                    }
                    real_fee1 += array[i][j].goodprice * 100 * array[i][j].number;
                    total_fee1 += array[i][j].goodprice * 100 * array[i][j].number;
                    goodpoint += array[i][j].goodpoint * 100 * array[i][j].number;
                }
                if (!goodpoint) { }
                let usercouponuuid;
                let couponuuid;
                let usercoupon;
                if (coupons && coupons.length > 0) {
                    couponuuid = yield usedCoupon(coupons, array[i]); //获得在该商家使用的优惠券
                    if (couponuuid) {
                        usercoupon = yield usercoupon_1.getusercouponuuid(couponuuid, useruuid);
                        usercouponuuid = usercoupon.uuid;
                    }
                }
                let real_fee = Math.round(real_fee1 * (userLevel.discount ? userLevel.discount : 100) / 100);
                if (usercouponuuid) {
                    let coupon = yield usercoupon_1.findCouponByUsercouponuuid(usercouponuuid);
                    switch (coupon.coupontype) {
                        case 'discount':
                            //如果是折扣券，先用折扣券打折后再会员打折
                            real_fee = Math.round(real_fee1 * (coupon.content.discount / 100) * (userLevel.discount ? userLevel.discount : 100) / 100);
                            break;
                        case 'fulldown':
                            //如果是满减券，先用减去优惠后再会员打折
                            real_fee = Math.round((real_fee1 - (coupon.content.condition * 100)) * (userLevel.discount ? userLevel.discount : 100) / 100);
                            break;
                        case 'cash':
                            //如果是现金券，先用减去优惠后再会员打折
                            real_fee = Math.round((real_fee1 - (coupon.content.cash * 100)) * (userLevel.discount ? userLevel.discount : 100) / 100);
                            break;
                        default:
                            break;
                    }
                }
                real_feeuse += real_fee;
                total_fee += total_fee1;
                postageall += array[i][0].postage * 100;
            }
            let usermb = 0;
            if (points === 0) {
                real_use = real_feeuse;
                return response_1.sendOK(res, { deductionpoint: 0, real_use, points, real_fee: real_feeuse, total_fee1: total_fee / 100, deductiontext, usenumber, usermb: 0 });
            }
            else {
                //最高抵扣50%,rmbdeduction为返回抵扣的价格，real_use抵扣后的价格，real_fee未抵扣的价格，points积分
                let maxfee = Math.floor(real_feeuse * 0.5);
                if (rmbdeduction <= maxfee / 100) {
                    real_use = (real_feeuse - rmbdeduction * 100 + postageall) / 100;
                    let real_feeall = (real_feeuse + postageall) / 100;
                    usermb = rmbdeduction;
                    return response_1.sendOK(res, { deductionpoint: rmbdeduction * exchage, real_use, real_fee: real_feeall, points, total_fee1: total_fee / 100, deductiontext, usenumber, usermb });
                }
                else {
                    maxfee = (Math.floor(maxfee / 100)) * 100;
                    real_use = (real_feeuse - maxfee + postageall) / 100;
                    let deductpoint = maxfee;
                    let real_feeall = (real_feeuse + postageall) / 100;
                    usermb = maxfee / exchage;
                    return response_1.sendOK(res, { deductionpoint: deductpoint, real_use, points, real_fee: real_feeall, total_fee1: total_fee / 100, deductiontext, usenumber, usermb });
                }
            }
        }
        catch (e) {
            return e;
        }
    });
});
//生成抵扣金币订单
exports.router.post('/deduction', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { fee_info, address, message, cartuuid } = req.body;
        let state = 'wait-pay';
        //最后的价格
        let { goods, coupons, deductionpoint } = req.body;
        let everypoint = 0;
        coupons = JSON.parse(coupons);
        let orderArr = [];
        goods = JSON.parse(goods);
        let array = yield orders_1.AutomaticSeparation(goods);
        try {
            const loginInfo = req.loginInfo;
            let userLevel = yield users_1.finduserslevel(req.app.locals.sequelize, loginInfo.getUuid());
            for (let i = 0; i < array.length; i++) { //遍历每个商家
                everypoint = Math.round(deductionpoint / (array.length));
                let total_fee1 = 0;
                let real_fee1 = 0;
                let goodpoint = 0;
                for (let j = 0; j < array[i].length; j++) { //遍历每个商家下的每个商品
                    if (array[i][j].number < 1 || array[i][j].goodprice < 0 || array[i][j].goodpoint < 0) {
                        return response_1.sendErrMsg(res, "商品价格或数量有误", 500);
                    }
                    real_fee1 += array[i][j].goodprice * 100 * array[i][j].number;
                    total_fee1 += array[i][j].goodprice * 100 * array[i][j].number;
                    goodpoint += array[i][j].goodpoint * array[i][j].number;
                }
                if (!goodpoint) { }
                let usercouponuuid = yield usedCoupon(coupons, array[i]); //获得在该商家使用的优惠券
                let real_fee = Math.round(real_fee1 * (userLevel.discount ? userLevel.discount : 100) / 100);
                if (usercouponuuid) {
                    //  await updateCouponState(usercouponuuid, 'used')//修改优惠券为已使用
                    //**************************************************计算实际价格****************************************************** */
                    let coupon = yield usercoupon_1.findCouponByUsercouponuuid(usercouponuuid);
                    switch (coupon.coupontype) {
                        case 'discount':
                            //如果是折扣券，先用折扣券打折后再会员打折
                            real_fee = Math.round(real_fee1 * (coupon.content.discount / 100) * (userLevel.discount ? userLevel.discount : 100) / 100);
                            break;
                        case 'fulldown':
                            //如果是满减券，先用减去优惠后再会员打折
                            real_fee = Math.round((real_fee1 - (coupon.content.condition * 100)) * (userLevel.discount ? userLevel.discount : 100) / 100);
                            break;
                        case 'cash':
                            //如果是现金券，先用减去优惠后再会员打折
                            real_fee = Math.round((real_fee1 - (coupon.content.cash * 100)) * (userLevel.discount ? userLevel.discount : 100) / 100);
                            break;
                        default:
                            break;
                    }
                    //***************************************************************************************************************** */
                }
                real_fee = real_fee / 100;
                //抵扣汇率deduction
                let deductionuuid = "0c163e52-f26d-4d77-ae71-dd3ae8184333";
                let deduction = yield orders_1.searchdeduction(deductionuuid);
                let exchage = deduction.exchange;
                real_fee = (real_fee - everypoint / exchage) * 100;
                let obj = {
                    useruuid: loginInfo.getUuid(),
                    goods: array[i],
                    total_fee: Math.round(total_fee1),
                    real_fee: real_fee,
                    fee_info: JSON.parse(fee_info),
                    address: JSON.parse(address),
                    message: message,
                    goodpoint: everypoint,
                    postage: array[i][0].postage * 100,
                    businessmen: array[i][0].businessmen,
                    state: state
                };
                if (cartuuid != 'undefined') {
                    let cartUuids = JSON.parse(cartuuid);
                    for (let i = 0; i < cartUuids.length; i++) {
                        //清空购物车表
                        yield shopping_cart_1.deleteByUuid(cartUuids[i]);
                    }
                }
                if (array[i]) {
                    let good = array[i];
                    for (let i = 0; i < good.length; i++) {
                        //判断商品是否已下线
                        let goods = yield goods_1.findByState(good[i].gooduuid);
                        let newpropertySet = good[i].property.split(",");
                        if (good[i].tags) {
                            let arr = yield comparepro(good[i].tags, newpropertySet, good[i].number);
                            if (!arr) {
                                return response_1.sendNotFound(res, "商品已售完！！");
                            }
                            for (let i = 0; i < arr.length; i++) {
                                if (newpropertySet.length > 1 && !arr[i].data) {
                                    return response_1.sendNotFound(res, "商品已售完！！");
                                }
                            }
                            yield goods_1.updateNumber(arr, good[i].gooduuid);
                        }
                        if (!goods)
                            return response_1.sendNotFound(res, good[i].title + "已删除或已下架");
                    }
                }
                else {
                    return response_1.sendNotFound(res, "商品已售完！！");
                }
                let orders = yield orders_1.insertOrder(obj);
                let ordersuuid = orders.uuid;
                //保存优惠券id
                yield orders_1.inserordercouponuuid(usercouponuuid, ordersuuid);
                //保存金币
                yield orders_1.inserpoint(deductionpoint, ordersuuid);
                orders.total_fee = orders.total_fee / 100;
                orders.real_fee = orders.real_fee / 100;
                let users = yield users_1.findByPrimary(loginInfo.getUuid());
                let objc = {
                    useruuid: users.uuid,
                    username: users.username,
                    content: '商家已接单！',
                    state: 'send',
                    orderuuid: orders.uuid,
                    title: '订单消息'
                };
                yield message_1.createMessage(objc); //发送消息
                orderArr.push(orders);
            }
            return response_1.sendOK(res, orderArr);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//生成订单
exports.router.post('/', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { fee_info, address, message, cartuuid } = req.body;
        let state = 'wait-pay';
        let { goods, coupons } = req.body;
        coupons = JSON.parse(coupons);
        let orderArr = [];
        goods = JSON.parse(goods);
        let array = yield orders_1.AutomaticSeparation(goods);
        try {
            const loginInfo = req.loginInfo;
            let userLevel = yield users_1.finduserslevel(req.app.locals.sequelize, loginInfo.getUuid());
            for (let i = 0; i < array.length; i++) { //遍历每个商家
                let total_fee1 = 0;
                let real_fee1 = 0;
                let goodpoint = 0;
                for (let j = 0; j < array[i].length; j++) { //遍历每个商家下的每个商品
                    if (array[i][j].number < 1 || array[i][j].goodprice < 0 || array[i][j].goodpoint < 0) {
                        return response_1.sendErrMsg(res, "商品价格或数量有误", 500);
                    }
                    real_fee1 += array[i][j].goodprice * 100 * array[i][j].number;
                    total_fee1 += array[i][j].goodprice * 100 * array[i][j].number;
                    goodpoint += array[i][j].goodpoint * array[i][j].number;
                }
                let usercouponuuid = yield usedCoupon(coupons, [i]); //获得在该商家使用的优惠券
                let real_fee = Math.round(real_fee1 * (userLevel.discount ? userLevel.discount : 100) / 100);
                if (usercouponuuid) {
                    //  await updateCouponState(usercouponuuid, 'used')//修改优惠券为已使用
                    //**************************************************计算实际价格****************************************************** */
                    let coupon = yield usercoupon_1.findCouponByUsercouponuuid(usercouponuuid);
                    switch (coupon.coupontype) {
                        case 'discount':
                            //如果是折扣券，先用折扣券打折后再会员打折
                            real_fee = Math.round(real_fee1 * (coupon.content.discount / 100) * (userLevel.discount ? userLevel.discount : 100) / 100);
                            break;
                        case 'fulldown':
                            //如果是满减券，先用减去优惠后再会员打折
                            real_fee = Math.round((real_fee1 - (coupon.content.condition * 100)) * (userLevel.discount ? userLevel.discount : 100) / 100);
                            break;
                        case 'cash':
                            //如果是现金券，先用减去优惠后再会员打折
                            real_fee = Math.round((real_fee1 - (coupon.content.cash * 100)) * (userLevel.discount ? userLevel.discount : 100) / 100);
                            break;
                        default:
                            break;
                    }
                    //***************************************************************************************************************** */
                }
                let obj = {
                    useruuid: loginInfo.getUuid(),
                    goods: array[i],
                    //total_fee: Math.round((total_fee1 +  (array[i][0].postage * 100)) * ((userLevel && userLevel.discount) ? userLevel.discount : 100) / 100),
                    total_fee: Math.round(total_fee1),
                    // real_fee: Math.round(real_fee1 * (userLevel.discount ? userLevel.discount : 100) / 100),
                    real_fee: real_fee,
                    fee_info: JSON.parse(fee_info),
                    address: JSON.parse(address),
                    message: message,
                    goodpoint: Math.round(goodpoint /* + array[i][0].postage * 10*/),
                    postage: array[i][0].postage * 100,
                    businessmen: array[i][0].businessmen,
                    state: state
                };
                if (cartuuid != 'undefined') {
                    let cartUuids = JSON.parse(cartuuid);
                    for (let i = 0; i < cartUuids.length; i++) {
                        //清空购物车表
                        yield shopping_cart_1.deleteByUuid(cartUuids[i]);
                    }
                }
                if (array[i]) {
                    let good = array[i];
                    for (let i = 0; i < good.length; i++) {
                        //判断商品是否已下线
                        let goods = yield goods_1.findByState(good[i].gooduuid);
                        let newpropertySet = good[i].property.split(",");
                        if (good[i].tags) {
                            let arr = yield comparepro(good[i].tags, newpropertySet, good[i].number);
                            if (!arr) {
                                return response_1.sendNotFound(res, "商品已售完！！");
                            }
                            for (let i = 0; i < arr.length; i++) {
                                if (newpropertySet.length > 1 && !arr[i].data) {
                                    return response_1.sendNotFound(res, "商品已售完！！");
                                }
                            }
                            yield goods_1.updateNumber(arr, good[i].gooduuid);
                        }
                        if (!goods)
                            return response_1.sendNotFound(res, good[i].title + "已删除或已下架");
                    }
                }
                else {
                    return response_1.sendNotFound(res, "商品已售完！！");
                }
                let orders = yield orders_1.insertOrder(obj);
                let ordersuuid = orders.uuid;
                //保存优惠券id
                yield orders_1.inserordercouponuuid(usercouponuuid, ordersuuid);
                orders.total_fee = orders.total_fee / 100;
                orders.real_fee = orders.real_fee / 100;
                let users = yield users_1.findByPrimary(loginInfo.getUuid());
                let objc = {
                    useruuid: users.uuid,
                    username: users.username,
                    content: '商家已接单！',
                    state: 'send',
                    orderuuid: orders.uuid,
                    title: '订单消息'
                };
                yield message_1.createMessage(objc); //发送消息
                orderArr.push(orders);
            }
            return response_1.sendOK(res, orderArr);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//修改订单状态，支付方式
exports.router.put('/:uuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { state, fee_type } = req.body;
        const uuid = req.params["uuid"];
        try {
            const loginInfo = req.loginInfo;
            validator_1.validateCgi({ state: state, uuid: uuid }, validator_2.shoppingCartValidator.uuid);
            let orders = yield orders_1.updateState(state, uuid);
            //*****************订单完成****************** */
            if (state === 'finish') {
                let users = yield users_1.findByPrimary(orders.useruuid);
                let objc = {
                    useruuid: users.uuid,
                    username: users.username,
                    content: '订单已完成！',
                    state: 'send',
                    orderuuid: uuid,
                    title: '物流注册消息'
                };
                yield message_1.createMessage(objc); //发送消息
            }
            //*****************订单待发货********************* */
            if (state === 'wait-send') {
                yield users_ext_2.addExp(loginInfo.getUuid(), orders.fee_info.paypoint);
            }
            //**********************订单已付款************************ */
            if (fee_type === "wxpay" || fee_type === "alipay" || fee_type === "cardpay") {
                orders = yield orders_1.modifiedFeeType(fee_type, uuid);
            }
            return response_1.sendOK(res, orders);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//微信支付和阿里支付的回调（修改支付类型，改变发货状态）；这个接口之前的外部接口，现在改成内部接口 by qizhibiao
function updateOrderState(orderuuids, fee_type, useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const uuids = orderuuids;
            validator_1.validateCgi({ fee_type: fee_type }, validator_2.ordersValidator.fee_type);
            let ordersTotal_fee = 0;
            let ordersgoodpoint = 0;
            for (let i = 0; i < orderuuids.length; i++) {
                // 校验订单号
                let order = yield orders_1.findByPrimary(orderuuids[i]);
                if (!order)
                    return "不存在订单！";
                ordersTotal_fee += order.real_fee + order.postage;
                ordersgoodpoint += order.goodpoint;
                let usergoodsuuid = order.usergoodsuuid;
                if (usergoodsuuid) {
                    yield usercoupon_1.updateCouponState(usergoodsuuid, 'used'); //修改优惠券为已使用
                }
            }
            yield users_ext_1.exchange(useruuid, { points: ordersgoodpoint, balance: 0 }); //减积分
            for (let i = 0; i < uuids.length; i++) {
                validator_1.validateCgi({ uuid: uuids[i] }, validator_2.shoppingCartValidator.uuid);
                //*****************订单完成****************** */
                let order = yield orders_1.findByPrimary(uuids[i]);
                ordersTotal_fee += order.real_fee + order.postage;
                //**********************订单已付款************************ */
                if (fee_type === "wxpay" || fee_type === "alipay" || fee_type === "cardpay") {
                    if (order.real_fee === 0 && order.postage === 0) {
                        yield orders_1.modifiedPointpay("pointpay", orderuuids[i]); //积分支付方式
                    }
                    else {
                        yield orders_1.modifiedFeeType(fee_type, uuids[i]); //其他支付模式
                    }
                }
                yield orders_1.updateState("wait-send", uuids[i]); //修改状态为待发货
                //await addExp(loginInfo.getUuid(), uuids[i].fee_info.paypoint)//??????????????????????
                let users = yield users_1.findByPrimary(order.useruuid);
                let objc = {
                    useruuid: users.uuid,
                    username: users.username,
                    content: '付款成功，正在为您火速发货中^_^。',
                    state: 'send',
                    orderuuid: uuids[i],
                    title: '订单消息'
                };
                yield message_1.createMessage(objc); //发送消息
            }
            let system = yield system_1.findByName('numcondition');
            if (ordersTotal_fee >= parseInt(system.content.minorder)) {
                yield users_2.addPointAndCashlottery(useruuid, 1, 0); //增加免费抽奖机会
            }
            return "状态修改成功！";
        }
        catch (e) {
            return e;
        }
    });
}
exports.updateOrderState = updateOrderState;
exports.router.get('/state', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { state, page, count } = req.query;
        try {
            validator_1.validateCgi({ page: page, count: count }, validator_2.shoppingCartValidator.pageAndCount);
            const loginInfo = req.loginInfo;
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let orders = yield orders_1.findByUserState(loginInfo.getUuid(), state, cursor, limit);
            orders.forEach(r => {
                r.total_fee = r.total_fee / 100;
                r.real_fee = r.real_fee / 100;
            });
            return response_1.sendOK(res, orders);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/:uuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            validator_1.validateCgi({ uuid: uuid }, validator_2.shoppingCartValidator.uuid);
            let orders = yield orders_1.findByPrimary(uuid);
            let users;
            let logistics;
            if (orders) {
                orders.total_fee = orders.total_fee / 100;
                orders.real_fee = orders.real_fee / 100;
                users = yield users_1.findByPrimary(orders.useruuid);
                if (orders.shippercode && orders.logisticscode) {
                    logistics = yield logistics_1.getByCode(orders.shippercode, orders.logisticscode);
                }
            }
            return response_1.sendOK(res, { orders: orders, users: users, logistics: logistics });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.delete('/:uuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            validator_1.validateCgi({ uuid: uuid }, validator_2.shoppingCartValidator.uuid);
            let order = yield orders_1.findByPrimary(uuid);
            if (order.state === "wait-pay") {
                let good = order.goods;
                if (good) {
                    for (let i = 0; i < good.length; i++) {
                        //判断商品是否已下线
                        let newpropertySet = good[i].property.split(",");
                        let goods = yield goods_1.findByPrimary(good[i].gooduuid);
                        if (goods.tags) {
                            let arr = yield restoregoodsnum(goods.tags, newpropertySet, good[i].number);
                            yield goods_1.updateNumber(arr, goods.uuid);
                        }
                    }
                }
            }
            yield message_2.deletemessage(uuid);
            yield orders_1.deleteOrder(uuid);
            return response_1.sendOK(res, { order: order });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
function restoregoodsnum(arr, str, num) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let j = 0; j < arr.length; j++) {
            for (let i = 0; i < str.length; i++) {
                if (arr[j].type === str[i]) {
                    if (arr[j].data) {
                        arr[j].data = yield restoregoodsnum(arr[j].data, str, num);
                        return arr;
                    }
                    else {
                        if (arr[j].stock)
                            arr[j].stock = parseInt(arr[j].stock) + num + "";
                        return arr;
                    }
                }
            }
        }
    });
}
/**
 * 找到在该商家使用的优惠券
 * @param coupons
 * @param businessmen
 */
function usedCoupon(coupons, businessmen) {
    return __awaiter(this, void 0, void 0, function* () {
        if (coupons != []) {
            for (let k = 0; k < coupons.length; k++) { //
                if (coupons[k].business === businessmen[0].businessmen) {
                    return coupons[k].uuid;
                }
            }
        }
        else {
            return null;
        }
    });
}
//# sourceMappingURL=orders.js.map