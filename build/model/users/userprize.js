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
const system_1 = require("../../model/system/system");
const modelName = "users.userprize";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        useruuid: sequelize_1.DataTypes.UUID,
        username: sequelize_1.DataTypes.CHAR(225),
        prizeuuid: sequelize_1.DataTypes.UUID,
        level: sequelize_1.DataTypes.INTEGER,
        num: sequelize_1.DataTypes.INTEGER,
        lotterytype: sequelize_1.DataTypes.ENUM('pointlottery', 'cashlottery'),
        state: sequelize_1.DataTypes.ENUM('true', 'false'),
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME,
        eventname: sequelize_1.DataTypes.TEXT //活动名称
    }, {
        timestamps: false,
        schema: "users",
        freezeTableName: true,
        tableName: "userprize"
    });
};
/**
 * 创建奖品
 */
function insertUserprize(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create(obj, { returning: true });
        return res ? res.get() : undefined;
    });
}
exports.insertUserprize = insertUserprize;
/**
 * 获得奖品详情
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
 * app端获得某个用户奖品列表
 */
function getUserprizes(sequelize, useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`SELECT
	up.*,
    p.title,
    p.prize
FROM
	users.userprize AS up
LEFT JOIN mall.prize AS P ON up.prizeuuid = P .uuid
WHERE
up.useruuid ='${useruuid}'
ORDER BY
	up.created DESC`, { type: "select" });
        return res;
    });
}
exports.getUserprizes = getUserprizes;
/**
 * 获得当前活动获奖用户列表
 */
function getUserprizeList(sequelize, cursor, limit, searchdata, state, lotterytype, receive) {
    return __awaiter(this, void 0, void 0, function* () {
        let event = yield system_1.findByName('eventname'); //获得当前的活动名称记录
        let eventname = event.content.event;
        let res = yield sequelize.query(`SELECT
	up.uuid,
    up.username,
    up.level,
    up.state as receive,
    up.created,
    up.lotterytype,
    p.title,
    p.state
FROM
	users.userprize AS up
LEFT JOIN mall.prize AS p ON up.prizeuuid =p.uuid 
WHERE
    eventname = '${eventname}'
	and p.state like '%${state}%'
    and  up.state like '%${receive}%'
    and up.lotterytype like '%${lotterytype}%'
and(
	up.username LIKE '%${searchdata}%'
OR  p.title LIKE '%${searchdata}%'
)
ORDER BY
	
    up."created" DESC,
    up."level" ASC,
    up."username" ASC
    OFFSET ${cursor}
LIMIT ${limit}`, { type: "select" });
        return res;
    });
}
exports.getUserprizeList = getUserprizeList;
/**
 * 获奖用户名单
 * @param sequelize
 * @param cursor
 * @param limit
 * @param searchdata
 * @param state
 */
function getLotteryUserprizes(sequelize, lotterytype) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`SELECT
	*
FROM
	users.userprize AS up
LEFT JOIN mall.prize AS P ON up.prizeuuid = P .uuid
where up.lotterytype='${lotterytype}'
ORDER BY
	up.created DESC
LIMIT 10`, { type: "select" });
        return res;
    });
}
exports.getLotteryUserprizes = getLotteryUserprizes;
/**
 * 获得奖品列表记录数
 */
function getCount(sequelize, searchdata, state, lotterytype, receive) {
    return __awaiter(this, void 0, void 0, function* () {
        let event = yield system_1.findByName('eventname'); //获得当前的活动名称记录
        let eventname = event.content.event;
        let res = yield sequelize.query(`SELECT
	count(*)
FROM
	users.userprize AS up
LEFT JOIN mall.prize AS p ON up.prizeuuid = p.uuid
WHERE
    up.eventname = '${eventname}'
	and  p.state like '%${state}%'
    and  up.state like '%${receive}%'
    and up.lotterytype like '%${lotterytype}%'
and(
	up.username LIKE '%${searchdata}%'
OR p.title LIKE '%${searchdata}%'
)
`, { type: "select" });
        return res[0].count;
    });
}
exports.getCount = getCount;
//查找mall.lotterylevel表中某奖品的记录
function find_prize_state(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel('mall.prize').findOne({ where: { uuid: uuid } });
        return res ? res.get() : undefined;
    });
}
exports.find_prize_state = find_prize_state;
/**
 * 获得单个用户的获得单个奖品的数量
 * @param useruuid
 * @param prizeuuid
 */
function findPrizeCount(useruuid, prizeuuid, eventname) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).count({ where: { useruuid: useruuid, prizeuuid: prizeuuid, eventname: eventname } });
        return res;
    });
}
exports.findPrizeCount = findPrizeCount;
/**
 * 修改奖品信息
 * @param userprize
 * @param uuid
 */
function updateUserprizeInfo(userprize, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update(userprize, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateUserprizeInfo = updateUserprizeInfo;
/**
 * 修改奖品状态信息
 * @param uuid
 */
function updateUserprizeState(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ state: 'true' }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateUserprizeState = updateUserprizeState;
/**
 * 删除奖品
 * @param uuid
 */
function deleteUserprize(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).destroy({ where: { uuid: uuid } });
    });
}
exports.deleteUserprize = deleteUserprize;
//# sourceMappingURL=userprize.js.map