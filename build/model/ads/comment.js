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
const modelName = "ads.comment";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4
        },
        content: sequelize_1.DataTypes.TEXT,
        useruuid: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false
        },
        parent: sequelize_1.DataTypes.UUID,
        state: sequelize_1.DataTypes.CHAR(48),
        created: sequelize_1.DataTypes.TIME,
        adsuuid: sequelize_1.DataTypes.UUID,
        upnum: sequelize_1.DataTypes.INTEGER
    }, {
        timestamps: false,
        schema: "ads",
        freezeTableName: true,
        tableName: "comment"
    });
};
// export async function findcomment() {
//     let res = await getModel(modelName).findAll({});
//     return res.map(r => r.get());
// }
/**
 * 插入一条新的广告评论
 * @param content
 * @param useruuid
 * @param adsuuid
 */
function insertadsComment(content, useruuid, adsuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = global_1.getModel(modelName).create({ content: content, useruuid: useruuid, adsuuid: adsuuid }, { returning: true });
        return res;
    });
}
exports.insertadsComment = insertadsComment;
/**
 *
 * @param content
 * @param useruuid
 * @param adsuuid
 * @param parent
 */
function insertParentComment(content, useruuid, adsuuid, parent) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create({ content: content, useruuid: useruuid, adsuuid: adsuuid, parent: parent }, { returning: true });
        return res;
    });
}
exports.insertParentComment = insertParentComment;
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
function queryadsCommentNum(sequelize, adsuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select count(*) from ads.comment as comment where comment.adsuuid = '${adsuuid}' and comment.state not in ('new') and parent is null`, { type: 'select' });
        return res ? res : null;
    });
}
exports.queryadsCommentNum = queryadsCommentNum;
function querycommentRepliedCount(sequelize, commentUUID) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select count(comment.uuid) as count  from ads.comment as comment where parent = '${commentUUID}'`);
        return res ? res : undefined;
    });
}
exports.querycommentRepliedCount = querycommentRepliedCount;
function queryadsCommentUpnumMAX(sequelize, adsuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select comment.uuid as commentuuid, content, users.nickname,users.headurl ,comment.upnum, comment.created from  ads.comment as comment ,users.users as users ,
    (select max(comment.upnum) as max from ads.comment as comment where comment.parent is null  and comment.adsuuid = '${adsuuid}' and comment.state not in ('new')) as t1 
    where comment.parent is null  and  comment.useruuid = users.uuid and comment.state in ('on') and comment.adsuuid = '${adsuuid}' and t1.max = comment.upnum
    `, { type: 'select' });
        return res ? res : undefined;
    });
}
exports.queryadsCommentUpnumMAX = queryadsCommentUpnumMAX;
function queryCommentParentDownLastcomment(sequelize, commentuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        if (commentuuid == undefined) {
            return undefined;
        }
        let res = yield sequelize.query(`select comment.content, users.nickname  from ads.comment as comment ,users.users as users 
        where  comment.useruuid = users.uuid  and comment.state in ('on') and comment.parent = '${commentuuid}'
        and comment.created   = (select max(tcomment.created) from ads.comment as tcomment where tcomment.state in ('on') and tcomment.parent = '${commentuuid}' )`, { type: 'select' });
        return res ? res : undefined;
    });
}
exports.queryCommentParentDownLastcomment = queryCommentParentDownLastcomment;
function queryCommentParent(sequelize, adsuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select comment.uuid as commentuuid, content, users.nickname,users.headurl ,comment.upnum, comment.created from ads.comment as comment ,users.users as users where comment.parent is null  and  comment.useruuid = users.uuid and comment.state in ('on') and comment.adsuuid = '${adsuuid}' order by comment.created desc`, { type: 'select' });
        return res ? res : null;
    });
}
exports.queryCommentParent = queryCommentParent;
function queryCommentParentDownNum(sequelize, adsuuid, commentuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select count(*) as count from ads.comment as comment ,users.users as users where comment.parent = '${commentuuid}'  and  comment.useruuid = users.uuid and comment.state in ('on') and comment.adsuuid = '${adsuuid}'`, { type: 'select' });
        return res ? res[0].count : undefined;
    });
}
exports.queryCommentParentDownNum = queryCommentParentDownNum;
function queryCommentByparentuuid(sequelize, commentuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
    select "comment".uuid as commentuuid, content, users.nickname ,users.headurl ,"comment".created,"comment".upnum
    from ads."comment" as comment ,users.users as users
    where comment.useruuid = users.uuid
    and parent = '${commentuuid}'
    and comment.state in ('on') order by created desc`, { type: 'select' });
        return res ? res : null;
    });
}
exports.queryCommentByparentuuid = queryCommentByparentuuid;
function querycrmcomment(sequelize, cursor, limit, classify, advertiseruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        if (classify == undefined || classify == null || classify == "") {
            if (advertiseruuid != undefined) {
                let res = sequelize.query(`select comment.uuid, ads.title, users.nickname, comment.content, comment.downnum, comment.created, comment.state from  ads.ads as ads , users.users as users ,ads.comment as comment
            where  users.uuid = comment.useruuid and comment.adsuuid = ads.uuid    and ads.advertiseruuid = '${advertiseruuid}' order by comment.created desc  offset ${cursor} limit ${limit} `, { type: 'select' });
                return res ? res : undefined;
            }
            let res = sequelize.query(`select comment.uuid, ads.title, users.nickname, comment.content, comment.downnum, comment.created, comment.state from  ads.ads as ads , users.users as users ,ads.comment as comment
        where  users.uuid = comment.useruuid and comment.adsuuid = ads.uuid   order by comment.created desc  offset ${cursor} limit ${limit} `, { type: 'select' });
            return res ? res : undefined;
        }
        else {
            if (advertiseruuid != undefined) {
                let res = sequelize.query(`select comment.uuid, ads.title, users.nickname, comment.content, comment.downnum, comment.created, comment.state from  ads.ads as ads , users.users as users ,ads.comment as comment
            where  users.uuid = comment.useruuid and comment.adsuuid = ads.uuid  and comment.state = '${classify}'  and ads.advertiseruuid = '${advertiseruuid}' order by comment.created desc  offset ${cursor} limit ${limit} `, { type: 'select' });
                return res ? res : undefined;
            }
            let res = sequelize.query(`select comment.uuid, ads.title, users.nickname, comment.content, comment.downnum, comment.created, comment.state from  ads.ads as ads , users.users as users ,ads.comment as comment
        where  users.uuid = comment.useruuid and comment.adsuuid = ads.uuid   and comment.state = '${classify}'  order by comment.created desc  offset ${cursor} limit ${limit} `, { type: 'select' });
            return res ? res : undefined;
        }
    });
}
exports.querycrmcomment = querycrmcomment;
function queryCountcrmcommnet(sequelize, classify, advertiseruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        if (classify == undefined || classify == null || classify == "") {
            if (advertiseruuid != undefined) {
                let res = yield sequelize.query(`select count(comment.uuid) as count from  ads.ads as ads , users.users as users ,ads.comment as comment 
            where  users.uuid = comment.useruuid and comment.adsuuid = ads.uuid    and ads.advertiseruuid = '${advertiseruuid}'
            `, { type: 'select' });
                return res ? res[0].count : undefined;
            }
            else {
                let res = yield sequelize.query(`select count(comment.uuid) as count   from  ads.ads as ads , users.users as users ,ads.comment as comment 
            where  users.uuid = comment.useruuid and comment.adsuuid = ads.uuid `, { type: 'select' });
                return res ? res[0].count : undefined;
            }
        }
        else {
            if (advertiseruuid != undefined) {
                let res = yield sequelize.query(`select count(comment.uuid) as count   from  ads.ads as ads , users.users as users ,ads.comment as comment
            where  users.uuid = comment.useruuid and comment.adsuuid = ads.uuid  and comment.state = '${classify}'  and ads.advertiseruuid = '${advertiseruuid}' `, { type: 'select' });
                return res ? res[0].count : undefined;
            }
            else {
                let res = yield sequelize.query(`select count(comment.uuid) as count   from  ads.ads as ads , users.users as users ,ads.comment as comment
            where  users.uuid = comment.useruuid and comment.adsuuid = ads.uuid   and comment.state = '${classify}'`, { type: 'select' });
                return res ? res[0].count : undefined;
            }
        }
    });
}
exports.queryCountcrmcommnet = queryCountcrmcommnet;
/**
 *
 * @param commentuuid
 * @param state   postgres  check ' new 为未审核  on 审核通过  reject 审核没通过  replied 已回复 '
 */
function updatePendingcomment(commentuuid, state, rejectcontent) {
    return __awaiter(this, void 0, void 0, function* () {
        if (rejectcontent == undefined || rejectcontent == null) {
            let [number, res] = yield global_1.getModel(modelName).update({ state: state }, { where: { uuid: commentuuid } });
            return number > 0 ? res : undefined;
        }
        else {
            let [number, res] = yield global_1.getModel(modelName).update({ state: state, rejectcontent: rejectcontent }, { where: { uuid: commentuuid } });
            return number > 0 ? res : undefined;
        }
    });
}
exports.updatePendingcomment = updatePendingcomment;
//# sourceMappingURL=comment.js.map