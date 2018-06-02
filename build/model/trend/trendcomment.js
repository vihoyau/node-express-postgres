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
const modelName = "trend.trendcomment";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        useruuid: sequelize_1.DataTypes.UUID,
        trenduuid: sequelize_1.DataTypes.UUID,
        content: sequelize_1.DataTypes.TEXT,
        parent: sequelize_1.DataTypes.UUID,
        upnum: sequelize_1.DataTypes.INTEGER,
        reward: sequelize_1.DataTypes.BOOLEAN,
        state: sequelize_1.DataTypes.STRING,
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME,
    }, {
        timestamps: false,
        schema: "trend",
        freezeTableName: true,
        tableName: "trendcomment",
    });
};
function insertComment(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let t = yield global_1.getModel(modelName).create(obj, { returning: true });
        return t ? t.get() : undefined;
    });
}
exports.insertComment = insertComment;
function delTrendComment(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [num, res] = yield global_1.getModel(modelName).update({ state: 'rejected' }, { where: { uuid: uuid }, returning: true });
        return num > 0 ? res[0].get() : undefined;
    });
}
exports.delTrendComment = delTrendComment;
function findByParent(parent) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { parent, state: 'on' } });
        return res.map(r => r.get());
    });
}
exports.findByParent = findByParent;
function findByTrenduuid(sequelize, trenduuid, start, length) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
    select "comment".uuid as commentuuid, content, users.username ,users.nickname ,users.headurl ,"comment".created,"comment".upnum
    from trend."trendcomment" as comment ,users.users as users where comment.useruuid = users.uuid
    and comment.trenduuid='${trenduuid}' order by created desc
    offset ${start} limit ${length}`, { type: 'select' });
        return res ? res : null;
    });
}
exports.findByTrenduuid = findByTrenduuid;
function getCountByTrendUUID(trenduuid) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).count({ where: { trenduuid } });
    });
}
exports.getCountByTrendUUID = getCountByTrendUUID;
function findByPrimaryUUID(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findByPrimary(uuid);
        return res ? res.get() : undefined;
    });
}
exports.findByPrimaryUUID = findByPrimaryUUID;
function queryCommentNum(commentUUID) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findByPrimary(commentUUID, { attributes: ['upnum'] });
        return res;
    });
}
exports.queryCommentNum = queryCommentNum;
function updateCommentNum(commentUUID, num) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ upnum: num }, { where: { uuid: commentUUID }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateCommentNum = updateCommentNum;
function updateReward(commentUUID, reward) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ reward: reward }, { where: { uuid: commentUUID }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateReward = updateReward;
function querycommentRepliedCount(sequelize, commentUUID) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
    select count(comment.uuid) as count  from trend.trendcomment as comment where parent = '${commentUUID}' and state='on'`);
        return res ? res : undefined;
    });
}
exports.querycommentRepliedCount = querycommentRepliedCount;
function queryCommentByparentuuid(sequelize, commentuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
    select "comment".uuid as commentuuid, content, users.username ,users.nickname ,users.headurl ,"comment".created,"comment".upnum
    from trend."trendcomment" as comment ,users.users as users where comment.useruuid = users.uuid and parent = '${commentuuid}'
    and comment.state= 'on' order by created desc`, { type: 'select' });
        return res ? res : null;
    });
}
exports.queryCommentByparentuuid = queryCommentByparentuuid;
function queryCommentParent(sequelize, trenduuid, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
    select comment.uuid as commentuuid, content, users.username,users.nickname ,users.headurl ,comment.upnum, comment.created,comment.reward
    from trend.trendcomment as comment ,users.users as users where comment.parent is null  and
    comment.useruuid = users.uuid and comment.trenduuid = '${trenduuid}' and comment.state='on'
    order by comment.created desc
    offset ${cursor} limit ${limit}`, { type: 'select' });
        return res ? res : null;
    });
}
exports.queryCommentParent = queryCommentParent;
function queryCommentParentDownNum(sequelize, trenduuid, commentuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
    select count(*) as count from
    trend.trendcomment as comment ,users.users as users
    where comment.parent = '${commentuuid}'  and  comment.useruuid = users.uuid
    and comment.trenduuid = '${trenduuid}' and comment.state='on'`, { type: 'select' });
        return res ? res[0].count : undefined;
    });
}
exports.queryCommentParentDownNum = queryCommentParentDownNum;
function findFirstComByParent(sequelize, parent) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
    select t.*,u.username,u.nickname,u.headurl from trend.trendcomment t,users.users u
    where t.parent = '${parent}' and t.useruuid = u.uuid and t.state='on'
    order by created asc limit 1
    `, { type: 'select' });
        return res;
    });
}
exports.findFirstComByParent = findFirstComByParent;
//# sourceMappingURL=trendcomment.js.map