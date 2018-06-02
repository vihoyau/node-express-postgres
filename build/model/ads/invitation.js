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
const modelName = "ads.invitation";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        invite: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        useruuid: sequelize_1.DataTypes.UUID,
        phone: sequelize_1.DataTypes.CHAR(24),
        parentinvite: sequelize_1.DataTypes.INTEGER,
        state: sequelize_1.DataTypes.ENUM('on', 'off'),
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME,
    }, {
        timestamps: false,
        schema: "ads",
        freezeTableName: true,
        tableName: "invitation",
    });
};
function getViews(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { uuid: uuid } });
        return res ? res.get() : undefined;
    });
}
exports.getViews = getViews;
function getByInvite(invite) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { invite: invite } });
        return res ? res.get() : undefined;
    });
}
exports.getByInvite = getByInvite;
function getByUserUuid(useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ attributes: ['phone'], where: { useruuid: useruuid } });
        return res ? res.get('phone') : undefined;
    });
}
exports.getByUserUuid = getByUserUuid;
function updateInvitation(parentinvite, invite) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ state: 'on', parentinvite: parentinvite }, { where: { invite: invite }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateInvitation = updateInvitation;
function insertInvitation(useruuid, phone) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create({ useruuid: useruuid, phone: phone }, { returning: true });
        return res ? res.get() : undefined;
    });
}
exports.insertInvitation = insertInvitation;
function getByPhone(phone) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { phone: phone } });
        return res ? res.get() : undefined;
    });
}
exports.getByPhone = getByPhone;
//# sourceMappingURL=invitation.js.map