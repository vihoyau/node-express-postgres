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
const modelName = "ads.category";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        name: sequelize_1.DataTypes.CHAR(64),
        parent: sequelize_1.DataTypes.UUID,
        pic: sequelize_1.DataTypes.TEXT,
        position: sequelize_1.DataTypes.INTEGER,
    }, {
        timestamps: false,
        schema: "ads",
        freezeTableName: true,
        tableName: "category",
    });
};
function getCategory() {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { parent: null, name: { $notIn: ['查看所有', '优惠券', '推荐'] } }, order: [["position", "asc"]] });
        return res.map(r => r.get());
    });
}
exports.getCategory = getCategory;
function getSubcategory(parentUuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { parent: parentUuid }, order: [['position', 'asc']] });
        return res.map(r => r.get());
    });
}
exports.getSubcategory = getSubcategory;
function getSubcategory2(parentUuid, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({
            where: { parent: parentUuid }, order: [['position', 'asc']],
            offset: cursor, limit: limit
        });
        return res.map(r => r.get());
    });
}
exports.getSubcategory2 = getSubcategory2;
function getFormatStr(s) {
    return s ? s : null;
}
function insert(typeName, parentUuid, position) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).create({ name: typeName, parent: getFormatStr(parentUuid), position });
    });
}
exports.insert = insert;
function updatePositon(uuid, position) {
    return __awaiter(this, void 0, void 0, function* () {
        let [num, res] = yield global_1.getModel(modelName).update({ position }, { where: { uuid }, returning: true });
        return num > 0 ? res[0].get() : undefined;
    });
}
exports.updatePositon = updatePositon;
function getByName(typeName) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).find({ where: { name: typeName } });
        return res ? res.get() : undefined;
    });
}
exports.getByName = getByName;
function findByPrimary(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findByPrimary(uuid);
        return res ? res.get() : undefined;
    });
}
exports.findByPrimary = findByPrimary;
function modifilyPic(uuid, pic) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ pic: pic }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.modifilyPic = modifilyPic;
function updateNameAndPositon(name, position, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ name, position }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateNameAndPositon = updateNameAndPositon;
function updatePic(pic, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ pic: pic }, { where: { uuid: uuid } });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updatePic = updatePic;
function deleteCategory(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).destroy({ where: { uuid: uuid } });
    });
}
exports.deleteCategory = deleteCategory;
function deleteSubCategory(parent) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).destroy({ where: { parent: parent } });
    });
}
exports.deleteSubCategory = deleteSubCategory;
function updateOrder(uuid, position) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ position: position }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateOrder = updateOrder;
//
function getsearchAll(name) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { name: name } });
        return res ? res.get() : undefined;
    });
}
exports.getsearchAll = getsearchAll;
//# sourceMappingURL=category.js.map