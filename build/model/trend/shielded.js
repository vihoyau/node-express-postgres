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
const modelName = "trend.shielded";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        useruuid: sequelize_1.DataTypes.UUID,
        shielduuid: sequelize_1.DataTypes.UUID,
        created: sequelize_1.DataTypes.TIME
    }, {
        timestamps: false,
        schema: "trend",
        freezeTableName: true,
        tableName: "shielded",
    });
};
function insertShielded(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create(obj, { returning: true });
        return res ? res.get() : undefined;
    });
}
exports.insertShielded = insertShielded;
function findAllByUserUUID(sequelize, useruuid, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
    select u.nickname,u.username,u.headurl,s.shielduuid,s.useruuid,s.created from users.users u,trend.shielded s
    where u.uuid = s.shielduuid
    and s.useruuid = '${useruuid}'
    order by s.created desc
    offset ${cursor} limit ${limit}
    `, { type: 'select' });
        return res;
    });
}
exports.findAllByUserUUID = findAllByUserUUID;
function findShielduuidByUserUUID(sequelize, useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
    select shielduuid from trend.shielded
    where useruuid = '${useruuid}'
    `, { type: 'select' });
        return res;
    });
}
exports.findShielduuidByUserUUID = findShielduuidByUserUUID;
function deleteShielded(useruuid, shielduuid) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).destroy({ where: { useruuid, shielduuid } });
    });
}
exports.deleteShielded = deleteShielded;
function findAllShielded(sequelize, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
    select u.nickname shieldnickname,u.username shieldusername,u.headurl shieldheadurl,s.created,s.useruuid
    from users.users u,trend.shielded s
    where u.uuid = s.shielduuid
    order by s.created desc
    offset ${cursor} limit ${limit}
    `, { type: 'select' });
        return res;
    });
}
exports.findAllShielded = findAllShielded;
function getCount() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).count();
    });
}
exports.getCount = getCount;
//# sourceMappingURL=shielded.js.map