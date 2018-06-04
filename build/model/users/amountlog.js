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
const moment = require("moment");
const modelName = "users.amountlog";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        useruuid: sequelize_1.DataTypes.UUID,
        amount: sequelize_1.DataTypes.FLOAT,
        points: sequelize_1.DataTypes.INTEGER,
        mode: sequelize_1.DataTypes.STRING,
        time: sequelize_1.DataTypes.STRING //时间
    }, {
        timestamps: false,
        schema: "users",
        freezeTableName: true,
        tableName: "amountlog",
    });
};
function insertAmountLog(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create(obj);
        return res.get();
    });
}
exports.insertAmountLog = insertAmountLog;
function findTodayAmount(sequelize, useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [now, zeroHour] = [moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD 00:00:00')];
        let res = yield sequelize.query(`
        select
            sum(amount)
        from users.amountlog a
        where a.useruuid='${useruuid}'
        and a.time>'${zeroHour}'
        and a.time<'${now}'
        `, { type: 'SELECT' });
        return parseInt(res[0].sum);
    });
}
exports.findTodayAmount = findTodayAmount;
function findPointByUserUUID(sequelize, useruuid, start, length, starttime, endtime) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
        select a.*,u.username from users.amountlog a, users.users u
        where a.useruuid=u.uuid
        and a.time>'${starttime}'
        and a.time<'${endtime}'
        and a.points is not null
        and a.points >0
        and a.useruuid = '${useruuid}'
        order by a.time desc
        offset ${start}
        limit ${length}
    `, { type: 'select' });
        return res;
    });
}
exports.findPointByUserUUID = findPointByUserUUID;
function findBalanceByUserUUID(sequelize, useruuid, start, length, starttime, endtime) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
        select a.*,u.username from users.amountlog a, users.users u
        where a.useruuid=u.uuid
        and a.time>'${starttime}'
        and a.time<'${endtime}'
        and a.amount is not null
        and a.amount >0
        and a.useruuid = '${useruuid}'
        order by a.time desc
        offset ${start}
        limit ${length}
    `, { type: 'select' });
        return res;
    });
}
exports.findBalanceByUserUUID = findBalanceByUserUUID;
//按模糊时间查询积分流水
function getPointCountByUser(sequelize, useruuid, starttime, endtime) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
        select count(*) from users.amountlog a
        where a.useruuid='${useruuid}'
        and a.time>'${starttime}'
        and a.time<'${endtime}'
        and a.points is not null
        and a.points >0
    `, { type: 'SELECT' });
        return res[0].count;
    });
}
exports.getPointCountByUser = getPointCountByUser;
//按模糊时间查询零钱流水
function getBalanceCountByUser(sequelize, useruuid, starttime, endtime) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
        select count(*) from users.amountlog a
        where a.useruuid='${useruuid}'
        and a.time>='${starttime}'
        and a.time<='${endtime}'
        and a.amount is not null
        and a.amount >0
    `, { type: 'SELECT' });
        return res[0].count;
    });
}
exports.getBalanceCountByUser = getBalanceCountByUser;
//按指定时间查询积分流水
function getPointCountByUserAndBytime(sequelize, useruuid, timestamps) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
        select count(*) from users.amountlog a
        where a.useruuid='${useruuid}'
        and a.time='${timestamps}'
        and a.points is not null
        and a.points >0
    `, { type: 'SELECT' });
        return res[0].count;
    });
}
exports.getPointCountByUserAndBytime = getPointCountByUserAndBytime;
//按指定时间查询零钱流水
function getBalanceCountByUserAndBytime(sequelize, useruuid, timestamps) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
        select count(*) from users.amountlog a
        where a.useruuid='${useruuid}'
        and a.time='${timestamps}'
        and a.amount is not null
        and a.amount >0
    `, { type: 'SELECT' });
        return res[0].count;
    });
}
exports.getBalanceCountByUserAndBytime = getBalanceCountByUserAndBytime;
//按照邀请查询抽奖、集道具、打赏、充值
function getOption(sequelize, commonoption, start, length, useruuid, starttime, endtime) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
    select a.amount,a.point from users.amountlog  a where a.mode='${commonoption}' 
    and a.useruuid='${useruuid}'
    and a.time>='${starttime}'
    and a.time<='${endtime}' 
    order by a.time desc
    offset ${start}
    limit ${length}
    `, { type: 'SELECT' });
        return res;
    });
}
exports.getOption = getOption;
//按照邀请获得奖励流水记录
function getInvite(sequelize, commonoption, start, length, useruuid, starttime, endtime) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
    select  a.phone,c.openid,d.amount,d.points  from ads.invitation as a  
    INNER JOIN ads.invitation as b on a.parentinvite=b.invite and b.useruuid='${useruuid}' 
    INNER JOIN users.users_ext as c on c.uuid=a.useruuid
    INNER JOIN users.amountlog as d on d.useruuid='${useruuid}' and d.mode='invite'
    and a.time>='${starttime}'
    and a.time<='${endtime}' 
    order by a.time desc
    offset ${start}
    limit ${length}
    `, { type: 'SELECT' });
        return res;
    });
}
exports.getInvite = getInvite;
//按照答题获得奖励流水记录
function getAnswer(sequelize, commonoption, start, length, useruuid, starttime, endtime) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
    select c.title,a.amount,a.points from users.amountlog as a 
    INNER JOIN ads.adslog as b on
    a.useruuid=b.useruuid and a.mode='answer' and a.useruuid='${useruuid}'
    INNER JOIN ads.ads as c on c.uuid=b.aduuid
    and a.time>='${starttime}'
    and a.time<='${endtime}' 
    order by a.time desc
    offset ${start}
    limit ${length}
    `, { type: 'SELECT' });
        return res;
    });
}
exports.getAnswer = getAnswer;
//按照提现流水记录
function getWithdraw(sequelize, start, length, useruuid, starttime, endtime) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
    select a.amount from users.amountlog a where a.mode='withdraw' and a.useruuid='${useruuid}'
    and a.time>='${starttime}'
    and a.time<='${endtime}' 
    order by a.time desc
    offset ${start}
    limit ${length}
    `, { type: 'SELECT' });
        return res;
    });
}
exports.getWithdraw = getWithdraw;
//按指定时间查询零钱流水 write by wyho
function getBalanceorpoints(sequelize, option, useruuid, timestamps) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
        select a.points,a.amount from users.amountlog a
        where a.useruuid='${useruuid}'
        and a.mode='${option}'
        and a.amount is not null
        and a.amount >0
    `, { type: 'SELECT' });
        return res;
    });
}
exports.getBalanceorpoints = getBalanceorpoints;
//# sourceMappingURL=amountlog.js.map