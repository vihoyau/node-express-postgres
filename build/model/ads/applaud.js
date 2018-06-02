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
const modelName = "ads.applaud";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        useruuid: sequelize_1.DataTypes.UUID,
        adsuuid: sequelize_1.DataTypes.UUID,
        state: sequelize_1.DataTypes.ENUM('nice', 'low'),
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME,
        commentuuid: sequelize_1.DataTypes.UUID
    }, {
        timestamps: false,
        schema: "ads",
        freezeTableName: true,
        tableName: "applaud",
    });
};
/**
 *  根据adsuuid和useruuid查找点赞记录
 * @param adsuuid
 * @param useruuid
 */
function findByUseruuidAndAdsuuid(adsuuid, useruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { useruuid: useruuid, adsuuid: adsuuid } });
        return res ? res.get() : undefined;
    });
}
exports.findByUseruuidAndAdsuuid = findByUseruuidAndAdsuuid;
/**
 * 增加点赞记录
 * @param adsuuid
 * @param useruuid
 */
function insertApplaud(adsuuid, useruuid, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create({ adsuuid: adsuuid, useruuid: useruuid, state: state }, { returning: true });
        return res ? res.get() : undefined;
    });
}
exports.insertApplaud = insertApplaud;
/**
 * 取消点赞记录
 * @param uuid
 */
function deleteByAdsUuid(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).destroy({ where: { uuid: uuid } });
    });
}
exports.deleteByAdsUuid = deleteByAdsUuid;
function queryUphistory(useruuid, commentuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { useruuid: useruuid, commentuuid: commentuuid } });
        return res ? res.get() : undefined;
    });
}
exports.queryUphistory = queryUphistory;
function deleteByCommentUseruuid(useruuid, commentuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).destroy({ where: { useruuid: useruuid, commentuuid: commentuuid } });
    });
}
exports.deleteByCommentUseruuid = deleteByCommentUseruuid;
function insertCommentApplaud(commentuuid, useruuid, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create({ commentuuid: commentuuid, useruuid: useruuid, state: state }, { returning: true });
        return res ? res.get() : undefined;
    });
}
exports.insertCommentApplaud = insertCommentApplaud;
//# sourceMappingURL=applaud.js.map