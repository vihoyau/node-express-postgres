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
const modelName = "system.system";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4
        },
        name: sequelize_1.DataTypes.CHAR(50),
        content: sequelize_1.DataTypes.JSONB,
        modified: sequelize_1.DataTypes.TIME,
    }, {
        timestamps: false,
        schema: "system",
        freezeTableName: true,
        tableName: "system"
    });
};
function findByName(name) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { name: name } });
        return res ? res.get() : undefined;
    });
}
exports.findByName = findByName;
function updateSystem(content, name) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ content: content }, { where: { name: name }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateSystem = updateSystem;
function insertSystem(content, name) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create({ content: content, name: name }, { returning: true });
        return res ? res.get() : undefined;
    });
}
exports.insertSystem = insertSystem;
//# sourceMappingURL=system.js.map