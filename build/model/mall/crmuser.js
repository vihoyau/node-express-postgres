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
const [schema, table] = ["ads", "crmuser"];
const modelName = `${schema}.${table}`;
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        username: sequelize_1.DataTypes.CHAR(128),
        password: sequelize_1.DataTypes.CHAR(128),
        description: sequelize_1.DataTypes.TEXT,
        state: sequelize_1.DataTypes.ENUM("on", "off"),
        role: sequelize_1.DataTypes.CHAR(24),
        perm: sequelize_1.DataTypes.JSONB,
        phone: sequelize_1.DataTypes.CHAR(24),
        email: sequelize_1.DataTypes.CHAR(64),
        realname: sequelize_1.DataTypes.CHAR(64),
        address: sequelize_1.DataTypes.TEXT,
        mgruuids: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.UUID),
        ext: sequelize_1.DataTypes.JSONB,
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME,
    }, {
        timestamps: false,
        schema: schema,
        freezeTableName: true,
        tableName: table,
    });
};
function findByUsername(username) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { username: username, $or: [{ state: 'on' }, { state: null }, { state: 'off' }] } });
        return res ? res.get() : undefined;
    });
}
exports.findByUsername = findByUsername;
function findByPrimary(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { uuid: uuid } });
        return res ? res.get() : undefined;
    });
}
exports.findByPrimary = findByPrimary;
function insertCrmUser(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create(obj);
        return res ? res.get() : undefined;
    });
}
exports.insertCrmUser = insertCrmUser;
function findAllBy(sequelize, searchdata, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select * from "mall"."crmuser" where username like '%${searchdata}%' and phone like '%${searchdata}%' and email like '%${searchdata}%' and description like '%${searchdata}%' or state='on' or state='off' order by created desc offset ${cursor} limit ${limit}`, { type: "SELECT" });
        return res;
    });
}
exports.findAllBy = findAllBy;
function findAllByCount(sequelize, searchdata) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select count(*) from "mall"."crmuser" where username like '%${searchdata}%' or phone like '%${searchdata}%' or email like '%${searchdata}%' or description like '%${searchdata}%'`, { type: "SELECT" });
        return parseInt(res[0].count);
    });
}
exports.findAllByCount = findAllByCount;
function resetPassword(useruuid, password) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ password: password }, { where: { uuid: useruuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.resetPassword = resetPassword;
function resetState(useruuid, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ state: state }, { where: { uuid: useruuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.resetState = resetState;
function deleteGoodsUser(useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).destroy({ where: { uuid: useruuid } });
    });
}
exports.deleteGoodsUser = deleteGoodsUser;
//# sourceMappingURL=crmuser.js.map