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
const modelName = "ads.paymoney";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        useruuid: sequelize_1.DataTypes.UUID,
        method: sequelize_1.DataTypes.STRING,
        money: sequelize_1.DataTypes.INTEGER,
        created: sequelize_1.DataTypes.DATE
    }, {
        timestamps: false,
        schema: "ads",
        freezeTableName: true,
        tableName: "paymoney",
    });
};
function insertpaymoney(useruuid, money, created, method) {
    return __awaiter(this, void 0, void 0, function* () {
        let re = yield global_1.getModel(modelName).create({ useruuid: useruuid, money: money, created: created, method: method });
        return re ? re : undefined;
    });
}
exports.insertpaymoney = insertpaymoney;
//# sourceMappingURL=paymoney.js.map