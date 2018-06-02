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
const [schema, table] = ["users", "lotterylog"];
const modelName = `${schema}.${table}`;
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4
        },
        useruuid: sequelize_1.DataTypes.UUID,
        prizeinfo: sequelize_1.DataTypes.JSONB,
        point: sequelize_1.DataTypes.INTEGER,
        balance: sequelize_1.DataTypes.INTEGER,
        created: sequelize_1.DataTypes.TIME
    }, {
        timestamps: false,
        schema: schema,
        freezeTableName: true,
        tableName: table,
    });
};
//添加领奖记录
function insertLotterylog(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield global_1.getModel(modelName).create(obj);
        }
        catch (e) {
            logger.error("insertLotterylog error", e.message);
        }
    });
}
exports.insertLotterylog = insertLotterylog;
//# sourceMappingURL=lotterylog.js.map