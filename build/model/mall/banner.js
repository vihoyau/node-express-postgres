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
const modelName = "mall.banner";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        pic: sequelize_1.DataTypes.TEXT,
        url: sequelize_1.DataTypes.TEXT,
        state: sequelize_1.DataTypes.ENUM("on", "off"),
        content: sequelize_1.DataTypes.TEXT,
        description: sequelize_1.DataTypes.TEXT,
        ext: sequelize_1.DataTypes.JSONB,
        position: sequelize_1.DataTypes.INTEGER,
        externalurl: sequelize_1.DataTypes.ENUM("true", "false"),
        modified: sequelize_1.DataTypes.TIME,
        created: sequelize_1.DataTypes.TIME,
    }, {
        timestamps: false,
        schema: "mall",
        freezeTableName: true,
        tableName: "banner"
    });
};
function getBanner(cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({
            where: { state: 'on' },
            order: [['position', 'ASC'], ['modified', 'DESC']],
            limit: limit,
            offset: cursor
        });
        return res.map(r => r.get());
    });
}
exports.getBanner = getBanner;
function getBanners() {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({
            where: { state: 'on' },
            order: [['position', 'ASC'], ['modified', 'DESC']],
        });
        return res.map(r => r.get());
    });
}
exports.getBanners = getBanners;
function findByPrimary(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findByPrimary(uuid);
        return res ? res : undefined;
    });
}
exports.findByPrimary = findByPrimary;
function getCount(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).count({ where: obj });
        return res;
    });
}
exports.getCount = getCount;
function getBannerAll(obj, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({
            where: obj,
            order: [['position', 'ASC'], ['modified', 'DESC']],
            limit: limit,
            offset: cursor
        });
        return res.map(r => r.get());
    });
}
exports.getBannerAll = getBannerAll;
function deleteByuuid(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).destroy({ where: { uuid: uuid } });
    });
}
exports.deleteByuuid = deleteByuuid;
function insertBanner() {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create({ returning: true });
        return res ? res.get() : undefined;
    });
}
exports.insertBanner = insertBanner;
function update(banner, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update(banner, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.update = update;
function updatePosition(seqz, position, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield seqz.transaction((t) => __awaiter(this, void 0, void 0, function* () {
            let goods = yield global_1.getModel(modelName).findOne({ where: { state: 'on', position: position }, transaction: t });
            let goods1 = yield global_1.getModel(modelName).findByPrimary(uuid, { transaction: t });
            yield global_1.getModel(modelName).update({ position: goods1.get("position") }, { where: { uuid: goods.get("uuid") }, transaction: t, returning: true });
            let [number, res] = yield global_1.getModel(modelName).update({ position: position }, { where: { uuid: uuid }, transaction: t, returning: true });
            return number > 0 ? res[0].get() : undefined;
        }));
    });
}
exports.updatePosition = updatePosition;
function updateUrl(url, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ url: url }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateUrl = updateUrl;
function updatePic(pic, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ pic: pic }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updatePic = updatePic;
function updateContent(content, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ content: content }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateContent = updateContent;
//# sourceMappingURL=banner.js.map