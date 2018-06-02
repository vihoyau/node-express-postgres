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
const moment = require("moment");
const modelName = "evaluate.evaluategroup";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        useruuids: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.UUID),
        activityuuid: sequelize_1.DataTypes.UUID,
        state: sequelize_1.DataTypes.STRING,
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME
    }, {
        timestamps: false,
        schema: "evaluate",
        freezeTableName: true,
        tableName: "evaluategroup",
    });
};
function createGroup(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).create(obj);
        return res.get();
    });
}
exports.createGroup = createGroup;
function groupGetCount(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        if (obj)
            return yield global_1.getModel(modelName).count({ where: obj });
        return yield global_1.getModel(modelName).count();
    });
}
exports.groupGetCount = groupGetCount;
function updateGroup(uuid, obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update(obj, { where: { uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateGroup = updateGroup;
function findGroup(activityuuid, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { activityuuid }, offset: cursor, limit: limit });
        return res.map(r => r.get());
    });
}
exports.findGroup = findGroup;
function findByGroupUUID(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findByPrimary(uuid);
        return res ? res.get() : undefined;
    });
}
exports.findByGroupUUID = findByGroupUUID;
function findByState(act, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { activityuuid: act, state: state } });
        return res.map(r => r.get());
    });
}
exports.findByState = findByState;
//查找过期的团
function findExpiredGroup(seqz) {
    return __awaiter(this, void 0, void 0, function* () {
        let now = moment().format('YYYY-MM-DD HH:mm:ss');
        let res = yield seqz.query(`
        select g.* from evaluate.evaluategroup g, evaluate.evaluateactivity a
        where g.activityuuid = a.uuid
        and a.endtime <= '${now}'
        and g.state = 'processing'
    `, { type: 'select' });
        return res;
    });
}
exports.findExpiredGroup = findExpiredGroup;
//# sourceMappingURL=evaluategroup.js.map