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
const modelName = "ads.inviterul";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        content: sequelize_1.DataTypes.TEXT,
        tsrange: sequelize_1.DataTypes.CHAR(36),
        invitepoint: sequelize_1.DataTypes.INTEGER,
        parentinvitepoint: sequelize_1.DataTypes.INTEGER,
        invitebalance: sequelize_1.DataTypes.INTEGER,
        parentinvitebalance: sequelize_1.DataTypes.INTEGER
    }, {
        timestamps: false,
        schema: "ads",
        freezeTableName: true,
        tableName: "inviterul"
    });
};
function updateInviteRule(inviterul) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update(inviterul, { where: {}, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateInviteRule = updateInviteRule;
function getInviteRule(sequelize) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select * from ads.inviterul`, { type: "select" });
        return res[0];
    });
}
exports.getInviteRule = getInviteRule;
//# sourceMappingURL=inviterule.js.map