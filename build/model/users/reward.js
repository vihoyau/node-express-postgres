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
const [schema, table] = ["users", "reward"];
const modelName = `${schema}.${table}`;
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        useruuid: sequelize_1.DataTypes.UUID,
        username: sequelize_1.DataTypes.CHAR(240),
        reaname: sequelize_1.DataTypes.CHAR(240),
        point: sequelize_1.DataTypes.INTEGER,
        balance: sequelize_1.DataTypes.INTEGER,
        type: sequelize_1.DataTypes.ENUM('register', 'answer'),
        ext: sequelize_1.DataTypes.JSONB,
        created: sequelize_1.DataTypes.TIME
    }, {
        timestamps: false,
        schema: schema,
        freezeTableName: true,
        tableName: table,
    });
};
function insertReward(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield global_1.getModel(modelName).create(obj, { returning: true });
        }
        catch (e) {
            logger.error("insertSmsCode error", e.message);
        }
    });
}
exports.insertReward = insertReward;
function getCount(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).count({ where: obj });
        return res;
    });
}
exports.getCount = getCount;
function getRewardByType(obj, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: obj, offset: cursor, limit: limit });
        return res.map(r => r.get());
    });
}
exports.getRewardByType = getRewardByType;
function getRewardByUser(obj, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: obj, offset: cursor, limit: limit });
        return res.map(r => r.get());
    });
}
exports.getRewardByUser = getRewardByUser;
function getUserAndlevels(sequelize, searchdata, cursor, limit, timeRange) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`SELECT
	*
FROM
	users.users AS u
RIGHT JOIN (
	SELECT
		SUM (point) AS totalpoints,
		SUM (balance) AS totalbalance,
		useruuid,
		TYPE
	FROM
		users.reward AS r
	WHERE
		r.created >='` + timeRange[0] + `'
        and
		r.created <='` + timeRange[1] + `'
	GROUP BY
		useruuid,
		TYPE
) AS b ON u.uuid = b.useruuid and (u.username like '%${searchdata}%') order by u.created desc offset ${cursor} LIMIT ${limit}`, { type: "select" });
        return res;
    });
}
exports.getUserAndlevels = getUserAndlevels;
function getUserAndlevelsCount(sequelize, searchdata, timeRange) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`SELECT
	count(*)
FROM
	users.users AS u
RIGHT JOIN (
	SELECT
		SUM (point) AS totalpoint,
		SUM (balance) AS totalbalance,
		useruuid,
		TYPE
	FROM
		users.reward AS r
	WHERE
		r.created >='` + timeRange[0] + `'
        and
		r.created <='` + timeRange[1] + `'
	GROUP BY
		useruuid,
		TYPE
) AS b ON u.uuid = b.useruuid and (u.username like '%${searchdata}%')`, { type: "select" });
        return parseInt(res[0].count);
    });
}
exports.getUserAndlevelsCount = getUserAndlevelsCount;
//# sourceMappingURL=reward.js.map