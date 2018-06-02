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
const modelName = "users.address";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        useruuid: sequelize_1.DataTypes.UUID,
        address: sequelize_1.DataTypes.TEXT,
        contact: sequelize_1.DataTypes.CHAR(36),
        phone: sequelize_1.DataTypes.CHAR(20),
        defaul: sequelize_1.DataTypes.ENUM("yes", "no"),
        created: sequelize_1.DataTypes.TIME
    }, {
        timestamps: false,
        schema: "users",
        freezeTableName: true,
        tableName: "address",
    });
};
function createAddress(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create(obj);
        return res.get();
    });
}
exports.createAddress = createAddress;
function updatedefaul(useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ defaul: "no" }, { where: { useruuid: useruuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updatedefaul = updatedefaul;
function getCount(useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).count({ where: { useruuid: useruuid } });
    });
}
exports.getCount = getCount;
function deleteAddress(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).destroy({ where: { uuid: uuid } });
    });
}
exports.deleteAddress = deleteAddress;
function updateAddress(uuid, obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update(obj, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateAddress = updateAddress;
function findByUuid(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findByPrimary(uuid);
        return res.get();
    });
}
exports.findByUuid = findByUuid;
function findByUseruuid(useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { useruuid: useruuid }, order: [['created', 'desc']] });
        return res.map(r => r.get());
    });
}
exports.findByUseruuid = findByUseruuid;
function updateState(seqz, useruuid, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield seqz.transaction((t) => __awaiter(this, void 0, void 0, function* () {
            yield global_1.getModel(modelName).update({ defaul: "no" }, { where: { useruuid: useruuid, defaul: "yes" }, transaction: t });
            let [number, res] = yield global_1.getModel(modelName).update({ defaul: "yes" }, { where: { uuid: uuid }, transaction: t, returning: true });
            return number > 0 ? res[0].get() : undefined;
        }));
    });
}
exports.updateState = updateState;
function getDefaultAddress(useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { useruuid: useruuid, defaul: 'yes' } });
        return res ? res.get() : undefined;
    });
}
exports.getDefaultAddress = getDefaultAddress;
//# sourceMappingURL=address.js.map