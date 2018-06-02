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
const express_1 = require("express");
const global_1 = require("../../lib/global");
exports.router = express_1.Router();
const modelName = "mall.collectionaward";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        fortune: sequelize_1.DataTypes.JSONB,
        emolument: sequelize_1.DataTypes.JSONB,
        longevity: sequelize_1.DataTypes.JSONB,
        property: sequelize_1.DataTypes.JSONB,
        happiness: sequelize_1.DataTypes.JSONB,
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME,
    }, {
        timestamps: false,
        schema: "mall",
        freezeTableName: true,
        tableName: "collectionaward"
    });
};
function awardcollection(addcollections) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(addcollections);
            let res = yield global_1.getModel(modelName).create(addcollections, { returning: true });
            return res ? res.get() : undefined;
        }
        catch (e) {
            throw new Error(e);
        }
    });
}
exports.awardcollection = awardcollection;
// export async function awardcollection(addcollections: any,uuid:any) {
//     try {
//         let res = await getModel(modelName).update(addcollections, { where: { uuid: uuid }, returning: true })
//         return res 
//     } catch (e) {
//         throw new Error(e)
//     }
// }
function find_All_award() {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll();
        return res;
    });
}
exports.find_All_award = find_All_award;
function deleteAward() {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).destroy();
    });
}
exports.deleteAward = deleteAward;
//# sourceMappingURL=collectionaward.js.map