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
//新添加
function findBymgruuids(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { uuid: uuid } });
        return res ? res.get() : undefined;
    });
}
exports.findBymgruuids = findBymgruuids;
function findByUsername(username) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { username: username, $or: [{ state: 'on' }, { state: null }] } });
        return res ? res.get() : undefined;
    });
}
exports.findByUsername = findByUsername;
//新添加
function findByAppUsername(username) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel("users.users").findOne({ where: { username: username, $or: [{ state: 'on' }, { state: null }] } });
        return res ? res.get() : undefined;
    });
}
exports.findByAppUsername = findByAppUsername;
function findByPassword(password, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { password: password, uuid: uuid } });
        return res ? res.get() : undefined;
    });
}
exports.findByPassword = findByPassword;
function modifiedPassword(password, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ password: password }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.modifiedPassword = modifiedPassword;
function findByUsernames(username) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { username: username } });
        return res ? res.get() : undefined;
    });
}
exports.findByUsernames = findByUsernames;
function findByPrimary(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { uuid: uuid } });
        return res ? res.get() : undefined;
    });
}
exports.findByPrimary = findByPrimary;
function findGoodsOW(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { uuid: uuid } });
        return res.map(r => r.get());
    });
}
exports.findGoodsOW = findGoodsOW;
function insertCrmUser(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create(obj);
        return res ? res.get() : undefined;
    });
}
exports.insertCrmUser = insertCrmUser;
function new_insertCrmUser(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create(obj);
        return res ? res.get() : undefined;
    });
}
exports.new_insertCrmUser = new_insertCrmUser;
function getCount(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).count({ where: obj });
        return res;
    });
}
exports.getCount = getCount;
function findAll(cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { $or: [{ state: 'on' }, { state: 'off' }] }, order: [['created', "DESC"]], offset: cursor, limit: limit });
        return res.map(r => r.get());
    });
}
exports.findAll = findAll;
function findMallUserInfo(cursor, limit, searchdata) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({
            // attributes: ["uuid", "username", "state", "phone", "perm", "mgruuids"],
            where: {
                $or: [{ perm: { "couponRW": 1 } }],
                state: { $in: ['on', 'off'] },
                $and: { $or: [{ username: { $like: '%' + searchdata + '%' } }, { phone: { $like: '%' + searchdata + '%' } }] }
            },
            order: [['created', "DESC"]], offset: cursor, limit: limit
        });
        return res.map(r => r.get());
    });
}
exports.findMallUserInfo = findMallUserInfo;
function findUserInfo(cursor, limit, searchdata) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({
            // attributes: ["uuid", "username", "state", "phone", "perm", "mgruuids"],
            where: {
                $or: [{ perm: { "adsRO": 1 } }, { perm: { "adsRW": 1 } }, { perm: { "adminRW": 1 } }, { perm: { "adminRO": 1 } }],
                state: { $in: ['on', 'off'] },
                $and: { $or: [{ username: { $like: '%' + searchdata + '%' } }, { phone: { $like: '%' + searchdata + '%' } }] }
            },
            order: [['created', "DESC"]], offset: cursor, limit: limit
        });
        return res.map(r => r.get());
    });
}
exports.findUserInfo = findUserInfo;
function findMallCount(searchdata) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).count({
            where: {
                $or: [{ perm: { "goodsRW": 1 } }, { perm: { "goodsRO": 1 } }, { perm: { "coupon": 1 } }],
                state: { $in: ['on', 'off'] },
                $and: { $or: [{ username: { $like: '%' + searchdata + '%' } }, { phone: { $like: '%' + searchdata + '%' } }] }
            }
        });
        return res;
    });
}
exports.findMallCount = findMallCount;
function findCount(searchdata) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).count({
            where: {
                $or: [{ perm: { "adsRO": 1 } }, { perm: { "adsRW": 1 } }, { perm: { "adminRW": 1 } }, { perm: { "adminRO": 1 } }],
                state: { $in: ['on', 'off'] },
                $and: { $or: [{ username: { $like: '%' + searchdata + '%' } }, { phone: { $like: '%' + searchdata + '%' } }] }
            }
        });
        return res;
    });
}
exports.findCount = findCount;
function findAdminrwUserInfo(cursor, limit, searchdata) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({
            where: {
                perm: { "adminRW": 1 },
                state: { $in: ['on', 'off'] },
                $and: { $or: [{ username: { $like: '%' + searchdata + '%' } }, { phone: { $like: '%' + searchdata + '%' } }] }
            },
            order: [['created', "DESC"]], offset: cursor, limit: limit
        });
        return res.map(r => r.get());
    });
}
exports.findAdminrwUserInfo = findAdminrwUserInfo;
function findGoodsOWUserInfo(cursor, limit, searchdata) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({
            where: {
                state: { $in: ['on', 'off'] },
                $or: [{ perm: { "goodsRO": 1 } }, { perm: { "goodsRW": 1 } }],
                $and: { $or: [{ username: { $like: '%' + searchdata + '%' } }, { phone: { $like: '%' + searchdata + '%' } }] }
            },
            order: [['created', "DESC"]], offset: cursor, limit: limit
        });
        return res.map(r => r.get());
    });
}
exports.findGoodsOWUserInfo = findGoodsOWUserInfo;
function findAdminrwCount(searchdata) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).count({
            where: {
                perm: { "adminRW": 1 },
                state: { $in: ['on', 'off'] },
                $or: [{ username: { $like: '%' + searchdata + '%' } }, { phone: { $like: '%' + searchdata + '%' } }]
            }
        });
        return res;
    });
}
exports.findAdminrwCount = findAdminrwCount;
function findGoodsOWCount(searchdata) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).count({
            where: {
                state: { $in: ['on', 'off'] },
                $or: [{ perm: { "goodsRO": 1 } }, { perm: { "goodsRW": 1 } }],
                $and: { $or: [{ username: { $like: '%' + searchdata + '%' } }, { phone: { $like: '%' + searchdata + '%' } }] }
            }
        });
        return res;
    });
}
exports.findGoodsOWCount = findGoodsOWCount;
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
function inserMgruuids(uuid, mgruuids) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ mgruuids: mgruuids }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.inserMgruuids = inserMgruuids;
function updateperm(uuid, perm) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ perm: perm }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateperm = updateperm;
function deleteCrmuser(useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).destroy({ where: { uuid: useruuid } });
    });
}
exports.deleteCrmuser = deleteCrmuser;
function queryCrmuser(crmuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { uuid: crmuuid } });
        return res.get('mgruuids') ? res.get('mgruuids') : null;
    });
}
exports.queryCrmuser = queryCrmuser;
function queryadvByuuid(crmuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { uuid: crmuuid } });
        return res ? res : undefined;
    });
}
exports.queryadvByuuid = queryadvByuuid;
//新添加
function findadv_ByPrimary(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel('ads.advertiser').findByPrimary(uuid);
        return res ? res.get() : undefined;
    });
}
exports.findadv_ByPrimary = findadv_ByPrimary;
//# sourceMappingURL=crmuser.js.map