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
const logger = require("winston");
const global_1 = require("../../lib/global");
const sequelize_1 = require("sequelize");
const [schema, table] = ["users", "statistics"];
const modelName = `${schema}.${table}`;
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        ip: sequelize_1.DataTypes.STRING,
        useruuid: sequelize_1.DataTypes.UUID,
        loginnumber: sequelize_1.DataTypes.INTEGER,
        searchnumber: sequelize_1.DataTypes.INTEGER,
        favoritenumber: sequelize_1.DataTypes.INTEGER,
        type: sequelize_1.DataTypes.ENUM('ads', 'goods'),
        ext: sequelize_1.DataTypes.JSONB,
        created: sequelize_1.DataTypes.TIME
    }, {
        timestamps: false,
        schema: schema,
        freezeTableName: true,
        tableName: table,
    });
};
/**
 * 记录某个用户的登录次数，对商品或产品的搜索，收藏，奖励次数
 */
function insertStatistics(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let res;
        try {
            res = yield global_1.getModel(modelName).create(obj);
        }
        catch (e) {
            logger.error("insertSmsCode error", e.message);
        }
        return res.get();
    });
}
exports.insertStatistics = insertStatistics;
//会员访问统计的详情
function findByPrimary(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findByPrimary(uuid);
        return res ? res.get() : undefined;
    });
}
exports.findByPrimary = findByPrimary;
//按时间段查询会员访问统计列表
function findAllByTimeRange(sequelize, timeRange, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`SELECT	A.*,b.* FROM	users.users AS A
right JOIN (
	SELECT
		"sum" (s.loginnumber) loginnumber,
		"sum" (favoritenumber) favoritenumber,
		"sum" (searchnumber) searchnumber,
		useruuid,
        type
	FROM
		users."statistics" s
	where '` + timeRange[0] + `'<  s.created and  '` + timeRange[1] + `'>  s.created
	GROUP BY
        type,
		useruuid
) AS b ON A .uuid = b.useruuid offset ${cursor} limit ${limit} `, { type: "select" });
        return res;
    });
}
exports.findAllByTimeRange = findAllByTimeRange;
//按时间段查询会员访问统计列表数量
function findAllByTimeRangeCount(sequelize, timeRange) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`SELECT count(*)	FROM	users.users AS A
right JOIN (
	SELECT
		"sum" (s.loginnumber) loginnumber,
		"sum" (favoritenumber) favoritenumber,
		"sum" (searchnumber) searchnumber,
		useruuid,
        type
	FROM
		users."statistics" s
	where '` + timeRange[0] + `'<  s.created and  '` + timeRange[1] + `'>  s.created
	GROUP BY
        type,
		useruuid
) AS b ON A .uuid = b.useruuid`, { type: "select" });
        return parseInt(res[0].count);
    });
}
exports.findAllByTimeRangeCount = findAllByTimeRangeCount;
function findCountVisitorByTimeRange(sequelize, timeRange) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select count(*) from users.statistics s
    where '` + timeRange[0] + `'<  s.created and  '` + timeRange[1] + `'>  s.created
    and s.ip is not null`, { type: "select" });
        return res[0].count;
    });
}
exports.findCountVisitorByTimeRange = findCountVisitorByTimeRange;
function findAllVisitorByTimeRange(sequelize, timeRange, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select * from users.statistics s
    where '` + timeRange[0] + `'<  s.created and  '` + timeRange[1] + `'>  s.created
    and s.ip is not null order by s.created desc offset ${cursor} limit ${limit}`, { type: "select" });
        return res;
    });
}
exports.findAllVisitorByTimeRange = findAllVisitorByTimeRange;
function getCountByUserAndTime(sequelize, useruuid, starttime, endtime) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
        select count(*) from users.statistics s
        where s.created > '${starttime.toLocaleString()}'
        and s.created < '${endtime.toLocaleString()}'
        and s.useruuid = '${useruuid}'
        and s.loginnumber = 1
    `, { type: "select" });
        return parseInt(res[0].count);
    });
}
exports.getCountByUserAndTime = getCountByUserAndTime;
function getLogsByUserAndTime(sequelize, useruuid, starttime, endtime, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
        select * from users.statistics s
        where s.created > '${starttime.toLocaleString()}'
        and s.created < '${endtime.toLocaleString()}'
        and s.useruuid = '${useruuid}'
        and s.loginnumber = 1
        order by s.created desc
        offset ${cursor}
        limit ${limit}
        `, { type: "select" });
        return res;
    });
}
exports.getLogsByUserAndTime = getLogsByUserAndTime;
//# sourceMappingURL=statistics.js.map