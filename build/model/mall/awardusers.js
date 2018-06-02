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
const modelName = "mall.awardusers";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        useruuid: sequelize_1.DataTypes.UUID,
        username: sequelize_1.DataTypes.CHAR(225),
        level: sequelize_1.DataTypes.INTEGER,
        state: sequelize_1.DataTypes.ENUM('pointlottery', 'cashlottery'),
        receive: sequelize_1.DataTypes.ENUM('false', 'true'),
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME,
    }, {
        timestamps: false,
        schema: "mall",
        freezeTableName: true,
        tableName: "awardusers"
    });
};
/**
 * 设置一二等奖和黑名单人数
 */
function insertAwardusers(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).create(obj, { returning: true });
    });
}
exports.insertAwardusers = insertAwardusers;
/**
 * 获得设置的获奖人信息
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
 * 根据用户id和抽奖类型获得抽奖用户
 * @param useruuid
 * @param state
 */
function findByLotterytype(useruuid, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { useruuid: useruuid, state: state, } });
        return res ? res.get() : undefined;
    });
}
exports.findByLotterytype = findByLotterytype;
/**
 * 获得后台设置的获奖人信息
 */
function getAwardusersList(cursor, limit, searchdata, state, receive) {
    return __awaiter(this, void 0, void 0, function* () {
        searchdata = '%' + searchdata + '%';
        state = '%' + state + '%';
        receive = '%' + receive + '%';
        let res = yield global_1.getModel(modelName).findAll({
            where: {
                $or: [{ username: { $like: searchdata } }],
                receive: { $like: receive },
                state: { $like: state }
            },
            order: [['level', 'DESC'], ['created', 'DESC']],
            limit: limit,
            offset: cursor
        });
        return res ? res.map(r => r.get()) : undefined;
    });
}
exports.getAwardusersList = getAwardusersList;
/**
 * 获得后台设置的获奖人信息记录数
 */
function getCount(searchdata, state, receive) {
    return __awaiter(this, void 0, void 0, function* () {
        searchdata = '%' + searchdata + '%';
        state = '%' + state + '%';
        receive = '%' + receive + '%';
        let res = yield global_1.getModel(modelName).count({
            where: {
                $or: [{ username: { $like: searchdata } }],
                receive: { $like: receive },
                state: { $like: state }
            }
        });
        return res;
    });
}
exports.getCount = getCount;
/**
 * 查找该等级设置的中奖用户的数量
 */
function findAwardusersByLevelCount(sequelize, level, state, receive) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select count(*) from  mall.awardusers  where "level"=${level} and "state"='${state}' and receive = '${receive}'`, { type: "select" });
        return res[0].count;
    });
}
exports.findAwardusersByLevelCount = findAwardusersByLevelCount;
/**
 * 修改奖品获奖人或黑名单
 * @param awardusers
 * @param uuid
 */
function updateAwardusersInfo(awardusers, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update(awardusers, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateAwardusersInfo = updateAwardusersInfo;
/**
 * 删除获奖人和黑名单
 * @param uuid
 */
function deleteAwardusers(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).destroy({ where: { uuid: uuid } });
    });
}
exports.deleteAwardusers = deleteAwardusers;
/**
 * 根据useruuid查找设置的黑白名单用户
 * @param useruuid
 */
function findAwardusersByUseruuid(useruuid, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { useruuid: useruuid, state: state } });
        return res ? res.get() : undefined;
    });
}
exports.findAwardusersByUseruuid = findAwardusersByUseruuid;
/**
 * 根据等级和奖励类型查找设置的黑白名单用户
 * @param useruuid
 */
function findAwardusersBylevelAndstate(sequelize, level, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select count(*) from mall.awardusers where "level"=${level} and state='${state}'`, { type: "select" });
        return res[0].count;
    });
}
exports.findAwardusersBylevelAndstate = findAwardusersBylevelAndstate;
//设置每个用户的每次活动的每种类型的获奖奖品的最高上限 (现金：3次, 积分 ： 1次, 实物类： 1次, 优惠劵 ：1次)
function get_user_event_prizenum(sequelize, useruuid, state, eventname) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`SELECT
count(p.state) as  prizenum
FROM
users.userprize AS up
LEFT JOIN mall.prize AS p ON up.prizeuuid = p.uuid
WHERE
up.useruuid = '${useruuid}'
and p.state = '${state}'
and up.eventname = '${eventname}'
 `, { type: "select" });
        return res;
    });
}
exports.get_user_event_prizenum = get_user_event_prizenum;
//# sourceMappingURL=awardusers.js.map