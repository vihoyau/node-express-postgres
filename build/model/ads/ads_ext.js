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
const modelName = "ads.ads_ext";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
        },
        views: sequelize_1.DataTypes.INTEGER,
        view: sequelize_1.DataTypes.INTEGER,
        clicknumber: sequelize_1.DataTypes.INTEGER,
        virtviews: sequelize_1.DataTypes.INTEGER
    }, {
        timestamps: false,
        schema: "ads",
        freezeTableName: true,
        tableName: "ads_ext",
    });
};
function updateViews(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({
            views: sequelize_1.Sequelize.literal(`views+${1}`), view: sequelize_1.Sequelize.literal(`view+${1}`), virtviews: sequelize_1.Sequelize.literal(`virtviews+${1}`)
        }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateViews = updateViews;
function updateView(uuid, view) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({
            view: sequelize_1.Sequelize.literal(`view-${view}`)
        }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateView = updateView;
function upateVirtviews(uuid, virtviews) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ virtviews: virtviews }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.upateVirtviews = upateVirtviews;
function updateNumber(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({
            clicknumber: sequelize_1.Sequelize.literal(`clicknumber+${1}`),
        }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateNumber = updateNumber;
function findByPrimary(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findByPrimary(uuid);
        return res ? res.get() : undefined;
    });
}
exports.findByPrimary = findByPrimary;
function getview() {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll();
        return res.map(r => r.get());
    });
}
exports.getview = getview;
//# sourceMappingURL=ads_ext.js.map