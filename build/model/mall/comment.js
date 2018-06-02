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
const modelName = "mall.comment";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        content: sequelize_1.DataTypes.TEXT,
        goodsuuid: sequelize_1.DataTypes.UUID,
        useruuid: sequelize_1.DataTypes.UUID,
        parent: sequelize_1.DataTypes.UUID,
        state: sequelize_1.DataTypes.ENUM("new", "on", "reject", "replied"),
        created: sequelize_1.DataTypes.TIME,
    }, {
        timestamps: false,
        schema: "mall",
        freezeTableName: true,
        tableName: "comment"
    });
};
/**
 * 添加评论
 */
function insertComment(content, goodsuuid, useruuid, parent, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create({ content: content, goodsuuid: goodsuuid, useruuid: useruuid, parent: parent, state: state }, { returning: true });
        return res ? res.get() : undefined;
    });
}
exports.insertComment = insertComment;
/**
 *对评论进行审批
 */
function updateComment(uuid, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ state: state }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateComment = updateComment;
/**
 *删除评论
 */
function deleteComment(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).destroy({ where: { uuid: uuid } });
    });
}
exports.deleteComment = deleteComment;
function getCount(sequelize, searchdata) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select count(*) from mall."comment" c,users.users u ,mall.goods g where c.parent IS NULL and  c.useruuid=u.uuid and c.goodsuuid=g.uuid and g.state='onsale' and g.deleted=0 and (u.username like '%${searchdata}%' or c.content like '%${searchdata}%')`, { type: "SELECT" });
        return parseInt(res[0].count);
    });
}
exports.getCount = getCount;
/**
 * 显示app端的评论列表
 */
function listAppComment(sequelize, goodsuuid, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select c.* ,a.content as reword,u.nickname from  mall."comment" as c LEFT JOIN mall."comment" as a  on c.uuid = a.parent LEFT JOIN users.users as u on c.useruuid=u.uuid where c."state" ='on' and c.parent is NULL and c.goodsuuid='${goodsuuid}' order by c.created offset ${cursor} limit ${limit}`, { type: "selelct" });
        return res;
    });
}
exports.listAppComment = listAppComment;
function getcomentByparent(parent) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { parent: parent } });
        return res.get();
    });
}
exports.getcomentByparent = getcomentByparent;
/**
 * 对客户评论进行列表显示
 */
function listComment(sequelize, searchdata, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select c.uuid, c."content", c.goodsuuid, c.useruuid ,c.parent ,c.state ,c.created ,
u.uuid uuuid, u.username uusername,
g.uuid guuid, g.title gtitle, g.keyword gkeyword, g.price gprice, g.realprice grealprice, g."content" gcontent, g.specification gspecification , g.category gcategory , g.subcategory gsubcategory , g.tags gtags, g.association gassociation , g.pics gpics, g.points gpoints, g.state gstate, g.deleted gdeleted , g.modified gmodified , g.created gcreated
 from mall."comment" c,users.users u ,mall.goods g where  c.parent IS NULL and  c.useruuid=u.uuid and c.goodsuuid=g.uuid and g.state='onsale' and g.deleted=0 and (u.username like '%${searchdata}%' or c.content like '%${searchdata}%') order by c.created desc offset ${cursor} limit ${limit}`, { type: "SELECT" });
        return res;
    });
}
exports.listComment = listComment;
/**
 * 管理员对客户的评论
 */
function findByParent(sequelize, parent) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`SELECT u.username,c."content",c.created,g.pics,g.title FROM mall."comment" c,mall.goods g,mall.crmuser u where c.goodsuuid=g.uuid  AND c.parent= '${parent}'  AND c.state='on' order by c.created desc  `, { type: "SELECT" });
        return res;
    });
}
exports.findByParent = findByParent;
//# sourceMappingURL=comment.js.map