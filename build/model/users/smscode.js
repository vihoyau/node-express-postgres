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
const logger = require("winston");
const global_1 = require("../../lib/global");
const sequelize_1 = require("sequelize");
const [schema, table] = ["users", "smscode"];
const modelName = `${schema}.${table}`;
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        id: {
            primaryKey: true,
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true
        },
        username: sequelize_1.DataTypes.CHAR(64),
        ext: sequelize_1.DataTypes.JSONB,
        created: sequelize_1.DataTypes.TIME
    }, {
        timestamps: false,
        schema: schema,
        freezeTableName: true,
        tableName: table,
    });
};
function insertSmsCode(username, obj) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield global_1.getModel(modelName).create({ username: username, ext: obj });
        }
        catch (e) {
            logger.error("insertSmsCode error", e.message);
        }
    });
}
exports.insertSmsCode = insertSmsCode;
//# sourceMappingURL=smscode.js.map