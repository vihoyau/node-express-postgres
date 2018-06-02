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
const modelName = "mall.category";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        name: sequelize_1.DataTypes.TEXT,
        parent: sequelize_1.DataTypes.UUID,
        pic: sequelize_1.DataTypes.TEXT,
        position: sequelize_1.DataTypes.INTEGER
    }, {
        timestamps: false,
        schema: "mall",
        freezeTableName: true,
        tableName: "category"
    });
};
//
function getsearchAll(name) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { name: name } });
        return res ? res.get() : undefined;
    });
}
exports.getsearchAll = getsearchAll;
function getCategory() {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { parent: null, name: { $notIn: ['查看所有', '优惠券'] } }, order: [["position", "asc"]] });
        return res.map(r => r.get());
    });
}
exports.getCategory = getCategory;
function getSubcategory(parent) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { parent: parent } });
        return res.map(r => r.get());
    });
}
exports.getSubcategory = getSubcategory;
function getFormatStr(s) {
    return s ? s : null;
}
function insert(name, parent) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).create({ name: name, parent: getFormatStr(parent) });
    });
}
exports.insert = insert;
function getByName(name, parent) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).find({ where: { name: name, parent: getFormatStr(parent) } });
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
function updateName(name, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ name: name }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateName = updateName;
function deleteByCategory(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).destroy({ where: { parent: uuid } });
    });
}
exports.deleteByCategory = deleteByCategory;
function deleteCategory(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).destroy({ where: { uuid: uuid } });
    });
}
exports.deleteCategory = deleteCategory;
function modifilyPic(uuid, pic) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ pic: pic }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.modifilyPic = modifilyPic;
function updateOrder(uuid, position) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ position: position }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateOrder = updateOrder;
function querycategorypic(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { uuid: uuid } });
        return res.get("pic") ? res.get("pic") : null;
    });
}
exports.querycategorypic = querycategorypic;
//# sourceMappingURL=category.js.map