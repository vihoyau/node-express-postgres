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
//import logger = require("winston")
const [schema, table] = ["ads", "incomemoney"];
const modelName = `${schema}.${table}`;
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4
        },
        useruuid: sequelize_1.DataTypes.UUID,
        money: sequelize_1.DataTypes.INTEGER,
        method: sequelize_1.DataTypes.TEXT,
        created: sequelize_1.DataTypes.TIME
    }, {
        timestamps: false,
        schema: schema,
        freezeTableName: true,
        tableName: table,
    });
};
//查看ads.incomemoney表的单个记录
function find_one_incomemoney(useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { useruuid: useruuid } });
        return res ? res.map(r => r.get()) : undefined;
    });
}
exports.find_one_incomemoney = find_one_incomemoney;
//查看ads.incomemoney表的单个记录
/* export async function find_oneadv_incomemoney(useruuid: string) {
  let res = await getModel(modelName).findOne({ where: { useruuid: useruuid } })
  return res ? res.get() : undefined
} */
//更新ads.incomemoney表的单个记录
/* export async function updateexp(uuid: string, exp: number) {
  let [number, res] = await getModel(modelName).update({ exp: exp }, { where: { uuid: uuid }, returning: true })
  return number > 0 ? res[0].get() : undefined
} */
//创建单个记录
function create_one_incomemoney(incomemoney) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(incomemoney);
            let res = yield global_1.getModel(modelName).create(incomemoney, { returning: true });
            return res ? res.get() : undefined;
        }
        catch (e) {
            //console.log(1111111)
            throw new Error(e);
        }
    });
}
exports.create_one_incomemoney = create_one_incomemoney;
//# sourceMappingURL=incomemoney.js.map