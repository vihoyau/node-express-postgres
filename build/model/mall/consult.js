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
const modelName = "mall.consult";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        content: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.JSONB),
        goodsuuid: sequelize_1.DataTypes.UUID,
        useruuid: sequelize_1.DataTypes.UUID,
        state: sequelize_1.DataTypes.ENUM("new", "reply"),
        modified: sequelize_1.DataTypes.TIME,
        created: sequelize_1.DataTypes.TIME,
    }, {
        timestamps: false,
        schema: "mall",
        freezeTableName: true,
        tableName: "consult"
    });
};
/**
 * 添加
 */
function insertConsult(content, goodsuuid, useruuid, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create({ content: content, goodsuuid: goodsuuid, useruuid: useruuid, state: state });
        return res ? res : undefined;
    });
}
exports.insertConsult = insertConsult;
/**
 * 更新
 */
function updateConsult(content, goodsuuid, useruuid, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ content: content, state: state }, { where: { goodsuuid: goodsuuid, useruuid: useruuid }, returning: true });
        return number ? res[0].get() : undefined;
    });
}
exports.updateConsult = updateConsult;
function updateConsultByUuid(content, uuid, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ content: content, state: state }, { where: { uuid: uuid }, returning: true });
        return number ? res[0].get() : undefined;
    });
}
exports.updateConsultByUuid = updateConsultByUuid;
/**
 * 对客户咨询进行列表显示
 */
function listConsult(sequelize, goodsuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select c.*,u.nickname from mall.consult c left join users.users u on c.useruuid=u.uuid where goodsuuid= '${goodsuuid}'`, { type: "select" });
        return res;
    });
}
exports.listConsult = listConsult;
function findByPrimary(sequelize, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`SELECT u.username,c.uuid,c."content",c.state, c.modified,c.created,g.pics,g.title FROM mall."consult" c,mall.goods g,users.users u where c.goodsuuid=g.uuid AND C .useruuid = u.uuid and c.uuid='${uuid}'`, { type: "select" });
        return res;
    });
}
exports.findByPrimary = findByPrimary;
function deleteConsult(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).destroy({ where: { uuid: uuid } });
    });
}
exports.deleteConsult = deleteConsult;
function findByGoodsuuidAndUseruuid(goodsuuid, useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ attributes: ["content"], where: { goodsuuid: goodsuuid, useruuid: useruuid } });
        return res ? res.get("content") : undefined;
    });
}
exports.findByGoodsuuidAndUseruuid = findByGoodsuuidAndUseruuid;
function getCount(sequelize, searchdata) {
    return __awaiter(this, void 0, void 0, function* () {
        let state;
        switch (searchdata) {
            case '已回复':
                state = " or c.state='reply'";
                break;
            case '提问':
                state = " or c.state='new'";
                break;
            default:
                state = '';
        }
        let res = yield sequelize.query(`SELECT
	COUNT (*)
FROM
	mall."consult" C,
	mall.goods G,
	users.users u
WHERE
	C .goodsuuid = G .uuid
AND C .useruuid = u.uuid
AND (
	u.username LIKE '%${searchdata}%'
      ${state}
	OR G .title LIKE '%${searchdata}%'
)`, { type: "SELECT" });
        return parseInt(res[0].count);
    });
}
exports.getCount = getCount;
/**
 * 管理员对客户的评论
 */
function findBy(sequelize, searchdata, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let state;
        switch (searchdata) {
            case '已回复':
                state = " or c.state='reply'";
                break;
            case '提问':
                state = " or c.state='new'";
                break;
            default:
                state = '';
        }
        let res = yield sequelize.query(`SELECT u.username,c.uuid,c."content",c.state, c.modified,c.created,g.pics,g.title FROM mall."consult" c,mall.goods g,users.users u where c.goodsuuid=g.uuid AND C .useruuid = u.uuid and ( u.username like '%${searchdata}%'  ${state} or g.title like '%${searchdata}%') order by c.modified desc  OFFSET ${cursor} LIMIT ${limit}`, { type: "SELECT" });
        return res;
    });
}
exports.findBy = findBy;
//# sourceMappingURL=consult.js.map