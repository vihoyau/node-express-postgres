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
const modelName = "ads.searchkey";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        id: sequelize_1.DataTypes.INTEGER,
        keyword: {
            type: sequelize_1.DataTypes.CHAR(256),
            primaryKey: true,
        },
        times: sequelize_1.DataTypes.INTEGER,
    }, {
        timestamps: false,
        schema: "ads",
        freezeTableName: true,
        tableName: "searchkey"
    });
};
function getKeywords(limit, keyword) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { keyword: { $like: '%' + keyword + '%' } }, limit: limit, order: [['times', 'DESC']] });
        return res.map(r => r.get());
    });
}
exports.getKeywords = getKeywords;
function getByKeywords(keyword) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findByPrimary(keyword);
        return res ? res.get() : undefined;
    });
}
exports.getByKeywords = getByKeywords;
function hotkeyInsert(keyword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).create({ keyword: keyword });
    });
}
exports.hotkeyInsert = hotkeyInsert;
function update(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number] = yield global_1.getModel(modelName).update({ times: sequelize_1.Sequelize.literal(`times+${1}`) }, { where: { id: id }, });
        if (number === 0)
            throw new Error("updateViews error");
    });
}
exports.update = update;
//# sourceMappingURL=hotkey.js.map