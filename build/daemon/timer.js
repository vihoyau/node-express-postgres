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
const orders_1 = require("../model/orders/orders");
const goods_1 = require("../model/mall/goods");
//import { findAdsByOn, updateByStateUuid, findadsByApproved, updateHeat } from "../model/ads/ads"
const puton_1 = require("../router/crm/puton");
const plan_1 = require("../model/puton/plan");
const unit_1 = require("../model/puton/unit");
const adslog_1 = require("../model/ads/adslog");
const users_ext_1 = require("../model/users/users_ext");
const coupon_1 = require("../model/mall/coupon");
const usercoupon_1 = require("../model/users/usercoupon");
const adsoperation_1 = require("../model/ads/adsoperation");
const system_1 = require("../model/system/system");
const ads_1 = require("../model/ads/ads");
const informationads_1 = require("../model/ads/informationads");
const advertiser_1 = require("../model/ads/advertiser");
const collectioncreate_1 = require("../model/mall/collectioncreate");
const daysum_1 = require("../model/ads/daysum");
const evaluategroup_1 = require("../model/evaluate/evaluategroup");
const evaluate_1 = require("../router/crm/evaluate");
const monthsum_1 = require("../model/ads/monthsum");
const logger = require("winston");
const moment = require("moment");
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
                        arr[j].stock = arr[j].stock + num + "";
                        return arr;
                    }
                }
            }
        }
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            setInterval(() => __awaiter(this, void 0, void 0, function* () {
                let tranction = yield system_1.findByName('transaction');
                let orders = yield orders_1.findWaitPay(tranction.content.waitpay);
                for (let i = 0; i < orders.length; i++) {
                    let good = orders[i].goods;
                    if (good) {
                        for (let i = 0; i < good.length; i++) {
                            //判断商品是否已下线
                            let newpropertySet = good[i].property.split(",");
                            if (good[i].tags) {
                                let arr = yield comparepro(good[i].tags, newpropertySet, good[i].number);
                                yield goods_1.updateNumber(arr, good[i].gooduuid);
                            }
                        }
                    }
                }
                yield orders_1.updateWaitPay(tranction.content.waitpay, 'cancel');
                yield orders_1.updateWaitRecv(tranction.content.waitrecv, 'wait-comment');
                yield orders_1.updateWaitComment(40, 'finish');
            }), 1000 * 60 * 60);
        }
        catch (e) {
            logger.error("auto update orders", e.message);
        }
    });
}
exports.run = run;
function actStateCheck() {
    return __awaiter(this, void 0, void 0, function* () {
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            let nowTime = new Date().getTime();
            let ac_ext = yield collectioncreate_1.find_All_Activity();
            for (let i = 0; i < ac_ext.length; i++) {
                let endtime = new Date(ac_ext[i].Endtime).getTime();
                let starttime = new Date(ac_ext[i].Starttime).getTime();
                if (ac_ext[i].State === 0) {
                    if (starttime <= nowTime) {
                        let uuid = ac_ext[i].uuid;
                        yield collectioncreate_1.activityAutoOpen(uuid);
                    }
                }
                if (ac_ext[i].State === 1) {
                    if (endtime <= nowTime) {
                        let uuid = ac_ext[i].uuid;
                        yield collectioncreate_1.activityAutoExpired(uuid);
                    }
                }
            }
        }), 10000);
    });
}
exports.actStateCheck = actStateCheck;
//自动上下架广告
// async function updatestate(adss: any) {
//     for (let i = 0; i < adss.length; i++) {
//         let ads = adss[i]
//         if (ads.tsrange[1] < (new Date())) {
//             await updateByStateUuid('off', ads.uuid)
//             await updateHeat(ads.uuid, 0)//取消推荐
//         }
//     }
// }
// export async function autoOffsale() {
//     setInterval(async () => {
//         //查询所有已上线的广告
//         let ads = await findAdsByOn()
//         await updatestate(ads)
//     }, 1000 * 60 * 30)
// }
// export async function autoAdsOn() {
//     try {
//         setInterval(async () => {
//             //查询所有已上线的广告
//             let adsOff = await findadsByApproved()
//             await updatestateon(adsOff)
//             let adsOn = await findAdsByOn()
//             await updatestate(adsOn)
//         }, 1000 * 60)
//     } catch (e) {
//         logger.error("auto on or off ads", e.message)
//     }
// }
// async function updatestateon(adss: any) {
//     for (let i = 0; i < adss.length; i++) {
//         let ads = adss[i]
//         if (ads.tsrange[0] < (new Date()) && ads.tsrange[1] > (new Date())) {
//             await updateByStateUuid('on', ads.uuid)
//         }
//     }
// }
//新版广告下架
function nautoAdsoff() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            setInterval(() => __awaiter(this, void 0, void 0, function* () {
                let plans = yield plan_1.findplanBystatus1();
                for (let i = 0; i < plans.length; i++) {
                    let plan = plans[i];
                    if (plan.enddate == undefined || plan.enddate == null) {
                        continue;
                    }
                    if (plan.enddate < (new Date())) {
                        puton_1.downadsStatus(plans[i].uuid);
                    }
                    let advertisers = yield advertiser_1.finddailybudgetisZERO();
                    if (advertisers.length != 0) {
                        ads_1.updateadsstatus(advertisers);
                    }
                }
            }), 1000 * 60);
        }
        catch (e) {
            logger.info('nautoAdsoff', e.message);
        }
    });
}
exports.nautoAdsoff = nautoAdsoff;
function deletebyEmptyads() {
    return __awaiter(this, void 0, void 0, function* () {
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            let date = new Date();
            date.setHours(date.getHours() - 1);
            ads_1.deleteEmptyads(date);
            informationads_1.deleteEmptyinfo(date);
        }), 1000 * 60);
    });
}
exports.deletebyEmptyads = deletebyEmptyads;
//新版广告因预存自动下架，到点自动上架
function upAdsBynextdat() {
    return __awaiter(this, void 0, void 0, function* () {
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            if (new Date('23:58:00') < new Date() || new Date('00:02:00') > new Date()) {
                advertiser_1.updatedailybudget();
                ads_1.updateAdstempStatus();
            }
        }), 1000 * 60 * 2);
    });
}
exports.upAdsBynextdat = upAdsBynextdat;
function delexp() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let punishment = yield system_1.findByName('punishment');
            setInterval(() => __awaiter(this, void 0, void 0, function* () {
                let useruuids = yield adslog_1.findPenMen(punishment.content.pentime);
                for (let i = 0; i < useruuids.length; i++) {
                    if (useruuids.indexOf(useruuids[i]) === i) {
                        let users_ext = yield users_ext_1.findByPrimary(useruuids[i]);
                        if (users_ext.exp > punishment.content.penexp) {
                            yield users_ext_1.delExp(useruuids[i], punishment.content.penexp);
                        }
                    }
                }
            }), punishment.content.pentime === 0 ? 1000 * 60 * 60 * 24 : 1000 * 60 * 60 * 24 * punishment.content.pentime);
        }
        catch (e) {
            logger.info('delexp', e.message);
        }
    });
}
exports.delexp = delexp;
/**
 * 自动过期or自动变更可用
 */
function autoExpired() {
    return __awaiter(this, void 0, void 0, function* () {
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            let couponons = yield coupon_1.getAllCoupon('on');
            if (couponons)
                yield updatecouponoff(couponons);
            let couponoffs = yield coupon_1.getAllCoupon('off');
            if (couponoffs)
                yield updatecouponon(couponoffs);
        }), 1000 * 60);
    });
}
exports.autoExpired = autoExpired;
function updatecouponoff(coupons) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < coupons.length; i++) {
            let coupon = coupons[i];
            if (coupon.tsrange[0] > (new Date()) || (new Date()) > coupon.tsrange[1]) {
                yield coupon_1.couponAutoExpired('off', coupon.uuid); //商家发放的优惠券自动过期
                yield usercoupon_1.usercouponAutoExpired('expired', coupon.uuid); //用户所领取对应的优惠券自动过期
            }
        }
    });
}
function updatecouponon(coupons) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < coupons.length; i++) {
            let coupon = coupons[i];
            if (coupon.tsrange[0] <= (new Date()) && (new Date()) <= coupon.tsrange[1]) {
                yield coupon_1.couponAutoExpired('on', coupon.uuid); //商家发放的优惠券自动变更为可用
                yield usercoupon_1.usercouponAutoExpired('new', coupon.uuid); //用户所领取对应的优惠券自动变更为可用
            }
        }
    });
}
//自动汇总广告浏览记录，每天汇总一次,每小时轮询
function autoSummaryAdsOperation(seqz) {
    return __awaiter(this, void 0, void 0, function* () {
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            let yesterdaydate = moment().subtract(1, 'days').format('YYYY-MM-DD');
            let todaydate = moment().format('YYYY-MM-DD');
            let advertiser = yield advertiser_1.findAlladvertiser();
            for (let i = 0; i < advertiser.length; i++) { //遍历全部的广告商
                let res = yield daysum_1.findByDateAndUUID(yesterdaydate, advertiser[i].uuid);
                if (!res) { //这个广告商昨日还未汇总
                    yield summary(seqz, advertiser[i].uuid, yesterdaydate + ' 00:00:00', todaydate + ' 00:00:00');
                }
            }
        }), 1000 * 60 * 60);
    });
}
exports.autoSummaryAdsOperation = autoSummaryAdsOperation;
//汇总广告商昨天的记录
function summary(seqz, advertiseruuid, yesterdaydate, todaydate) {
    return __awaiter(this, void 0, void 0, function* () {
        let plans = yield plan_1.findAllplanByadvertiseruuid(advertiseruuid);
        let unitinfo = yield unit_1.findAllunitByplanuuids(seqz, plans);
        let unit, adsinfo, adss, consume = 0, points = 0, show = 0;
        for (let i = 0; i < unitinfo.length; i++) {
            let unitshow = 0, unitpoints = 0;
            unit = yield unit_1.queryunitone(unitinfo[i].uuid);
            adsinfo = yield ads_1.queryAdsByunituuid(unitinfo[i].uuid);
            adss = yield adsoperation_1.findAlloperationByunituuid(seqz, adsinfo, new Date(yesterdaydate), new Date(todaydate));
            if (adss == undefined || adss.length == 0) {
                continue;
            }
            for (let j = 0; j < adss.length; j++) {
                if (adss[j].method == "adspoint" || adss[j].method == "adsurl") {
                    points++;
                    unitpoints++;
                }
                else {
                    show++;
                    unitshow++;
                }
            }
            if (unit.method == 'cpc') {
                consume += unitpoints * parseFloat(unit.bid);
            }
            else if (unit.method == 'cpm') {
                consume += parseInt((unitshow / 1000).toString()) * parseFloat(unit.bid);
            }
            else if (unit.method == 'cpe') {
                if (unit.cpe_type == 0) { //展示
                    consume += parseInt((unitshow / 1000).toString()) * parseFloat(unit.bid);
                }
                else if (unit.cpe_type == 1) { //点击
                    consume += unitpoints * parseFloat(unit.bid);
                }
                else { //租用
                    consume += 0.00;
                }
            }
            unitshow = 0, unitpoints = 0;
        }
        let obj = {
            advertiseruuid,
            date: moment(yesterdaydate).format('YYYY-MM-DD'),
            points,
            show,
            consume
        };
        yield daysum_1.insertDaySum(obj);
        return { points, show, consume };
    });
}
exports.summary = summary;
//汇总广告商某月的记录
function monthSummary(seqz, advertiseruuid, startmonth, nextmonth) {
    return __awaiter(this, void 0, void 0, function* () {
        let plans = yield plan_1.findAllplanByadvertiseruuid(advertiseruuid);
        let unitinfo = yield unit_1.findAllunitByplanuuids(seqz, plans);
        let unit, adsinfo, adss, consume = 0, points = 0, show = 0;
        for (let i = 0; i < unitinfo.length; i++) {
            let unitshow = 0, unitpoints = 0;
            unit = yield unit_1.queryunitone(unitinfo[i].uuid);
            adsinfo = yield ads_1.queryAdsByunituuid(unitinfo[i].uuid);
            adss = yield adsoperation_1.findAlloperationByunituuid(seqz, adsinfo, new Date(startmonth), new Date(nextmonth));
            if (adss == undefined || adss.length == 0) {
                continue;
            }
            for (let j = 0; j < adss.length; j++) {
                if (adss[j].method == "adspoint" || adss[j].method == "adsurl") {
                    points++;
                    unitpoints++;
                }
                else {
                    show++;
                    unitshow++;
                }
            }
            if (unit.method == 'cpc') {
                consume += unitpoints * parseFloat(unit.bid);
            }
            else if (unit.method == 'cpm') {
                consume += parseInt((unitshow / 1000).toString()) * parseFloat(unit.bid);
            }
            else if (unit.method == 'cpe') {
                if (unit.cpe_type == 0) { //展示
                    consume += parseInt((unitshow / 1000).toString()) * parseFloat(unit.bid);
                }
                else if (unit.cpe_type == 1) { //点击
                    consume += unitpoints * parseFloat(unit.bid);
                }
                else { //租用
                    consume += 0.00;
                }
            }
            unitshow = 0, unitpoints = 0;
        }
        let obj = {
            advertiseruuid,
            date: moment(startmonth).format('YYYY-MM'),
            points,
            show,
            consume
        };
        yield monthsum_1.insertMonthSum(obj);
        return { points, show, consume };
    });
}
exports.monthSummary = monthSummary;
//自动取消那些没拼成功的团，猜猜购
function autoCancelGroup(seqz) {
    return __awaiter(this, void 0, void 0, function* () {
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            let groups = yield evaluategroup_1.findExpiredGroup(seqz);
            for (let i = 0; i < groups.length; i++) {
                yield evaluate_1.cancelGroup(groups[i].uuid);
            }
        }), 1000 * 60 * 5);
    });
}
exports.autoCancelGroup = autoCancelGroup;
//# sourceMappingURL=timer.js.map