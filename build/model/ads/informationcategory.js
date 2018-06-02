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
const modelName = "ads.informationcategory";
/**
 *
 * "uuid" uuid NOT NULL,
"name" text COLLATE "default",
"parent" text COLLATE "default",
"pic" text COLLATE "default",
"position" int4,
 */
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        name: {
            type: sequelize_1.DataTypes.TEXT,
            unique: true
        },
        pic: sequelize_1.DataTypes.TEXT,
        position: sequelize_1.DataTypes.INTEGER,
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME
    }, {
        timestamps: false,
        schema: "ads",
        freezeTableName: true,
        tableName: "informationcategory",
    });
};
function createInfoCate(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).create(obj);
    });
}
exports.createInfoCate = createInfoCate;
function delInfoCate(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield global_1.getModel(modelName).destroy({ where: { uuid } });
    });
}
exports.delInfoCate = delInfoCate;
function updateInfoCate(uuid, obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let [num, arr] = yield global_1.getModel(modelName).update(obj, { where: { uuid }, returning: true });
        return num > 0 ? arr[0] : undefined;
    });
}
exports.updateInfoCate = updateInfoCate;
function getAllInfoCate() {
    return __awaiter(this, void 0, void 0, function* () {
        let arr = yield global_1.getModel(modelName).findAll({ order: [['created', 'asc']] });
        return arr.map(r => r.get());
    });
}
exports.getAllInfoCate = getAllInfoCate;
//# sourceMappingURL=informationcategory.js.map