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
const global_1 = require("../../lib/global");
const sequelize_1 = require("sequelize");
const [schema, table] = ["users", "message"];
const modelName = `${schema}.${table}`;
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        useruuid: sequelize_1.DataTypes.UUID,
        username: sequelize_1.DataTypes.CHAR(120),
        content: sequelize_1.DataTypes.TEXT,
        state: sequelize_1.DataTypes.ENUM('new', 'send', 'saw'),
        ext: sequelize_1.DataTypes.JSONB,
        title: sequelize_1.DataTypes.CHAR(225),
        orderuuid: sequelize_1.DataTypes.UUID,
        created: sequelize_1.DataTypes.TIME
    }, {
        timestamps: false,
        schema: schema,
        freezeTableName: true,
        tableName: table,
    });
};
function createMessage(create) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create(create, { returning: true });
        return res ? res : undefined;
    });
}
exports.createMessage = createMessage;
function getCount(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).count({ where: obj });
        return res;
    });
}
exports.getCount = getCount;
function getMessageByType(obj, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: obj, order: [['created', "desc"]], offset: cursor, limit: limit });
        return res.map(r => r.get());
    });
}
exports.getMessageByType = getMessageByType;
function findByPrimary(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findByPrimary(uuid);
        return res ? res.get() : undefined;
    });
}
exports.findByPrimary = findByPrimary;
function getMySendMessage(useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { state: 'send', $or: [{ useruuid: null }, { useruuid: useruuid }] } });
        return res.map(r => r.get());
    });
}
exports.getMySendMessage = getMySendMessage;
function getMyMessage(useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { state: ['send', 'saw'], $or: [{ useruuid: null }, { useruuid: useruuid }] }, order: [['state', 'desc'], ['created', 'desc']] });
        return res.map(r => r.get());
    });
}
exports.getMyMessage = getMyMessage;
function getMyMessageCount(useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).count({ where: { state: 'send', useruuid: useruuid } });
        return res;
    });
}
exports.getMyMessageCount = getMyMessageCount;
function updateMessage(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).update({ state: 'send' }, { where: { uuid: uuid }, returning: true });
    });
}
exports.updateMessage = updateMessage;
function updateMessageSaw(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).update({ state: 'saw' }, { where: { uuid: uuid }, returning: true });
    });
}
exports.updateMessageSaw = updateMessageSaw;
function updateContent(content, uuid, title, username, useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).update({ content: content, title: title, username: username, useruuid: useruuid }, { where: { uuid: uuid }, returning: true });
    });
}
exports.updateContent = updateContent;
function getMessage(useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).findAll({ where: { useruuid: null } });
    });
}
exports.getMessage = getMessage;
function findAll(sequelize, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select m.*,u.username from users.message as m left join users.users as u on m.useruuid=u.uuid order by m.created desc offset ${cursor} limit ${limit}`, { type: "select" });
        return res;
    });
}
exports.findAll = findAll;
function deletemessage(orderuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).destroy({ where: { orderuuid: orderuuid } });
    });
}
exports.deletemessage = deletemessage;
/**
 *删除消息
 * @param uuid
 */
function removemessage(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).destroy({ where: { uuid: uuid } });
    });
}
exports.removemessage = removemessage;
//# sourceMappingURL=message.js.map