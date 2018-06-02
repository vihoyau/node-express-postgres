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
const [schema, table] = ["users", "users"];
const modelName = `${schema}.${table}`;
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        username: sequelize_1.DataTypes.TEXT,
        password: sequelize_1.DataTypes.TEXT,
        nickname: sequelize_1.DataTypes.CHAR(64),
        realname: sequelize_1.DataTypes.CHAR(64),
        idcard: sequelize_1.DataTypes.CHAR(36),
        address: sequelize_1.DataTypes.TEXT,
        headurl: sequelize_1.DataTypes.TEXT,
        state: sequelize_1.DataTypes.ENUM("on", "off"),
        sex: sequelize_1.DataTypes.CHAR(8),
        birthday: sequelize_1.DataTypes.CHAR(20),
        interest: sequelize_1.DataTypes.TEXT,
        description: sequelize_1.DataTypes.TEXT,
        ext: sequelize_1.DataTypes.JSONB,
        pointlottery: sequelize_1.DataTypes.INTEGER,
        cashlottery: sequelize_1.DataTypes.INTEGER,
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME,
    }, {
        timestamps: false,
        schema: schema,
        freezeTableName: true,
        tableName: table,
    });
};
function insertUsers(seqz, username, password, nickname, openid) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield seqz.transaction((t) => __awaiter(this, void 0, void 0, function* () {
            let user = yield global_1.getModel(modelName).create({ username, password, nickname }, { transaction: t, returning: true });
            let uuid = user.get("uuid");
            yield global_1.getModel("users.statistics").create({ uuid: uuid }, { transaction: t });
            let res = yield global_1.getModel("users.users_ext").create({ uuid: uuid, openid: openid }, { transaction: t });
            return !!res ? res.get() : undefined;
        }));
    });
}
exports.insertUsers = insertUsers;
function wxqqInsertUser(seqz, username, openid, qqcode, headurl, nickname, type, password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield seqz.transaction(function (t) {
            return __awaiter(this, void 0, void 0, function* () {
                let user = yield global_1.getModel(modelName).create({ username, headurl, nickname, password }, { transaction: t, returning: true });
                let uuid = user.get('uuid');
                yield global_1.getModel("users.statistics").create({ uuid }, { transaction: t });
                let res;
                if (openid) {
                    if (type == 'wxapp')
                        res = yield global_1.getModel("users.users_ext").create({ uuid, appopenid: openid }, { transaction: t });
                    else
                        res = yield global_1.getModel("users.users_ext").create({ uuid, openid: openid }, { transaction: t });
                }
                else
                    res = yield global_1.getModel("users.users_ext").create({ uuid, qqcode }, { transaction: t });
                return !!res ? res.get() : undefined;
            });
        });
    });
}
exports.wxqqInsertUser = wxqqInsertUser;
//新添加
function new_insertUsers(seqz, username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield seqz.transaction((t) => __awaiter(this, void 0, void 0, function* () {
            let user = yield global_1.getModel(modelName).create({ username: username, password: password }, { transaction: t, returning: true });
            let uuid = user.get("uuid");
            yield global_1.getModel("users.statistics").create({ uuid: uuid }, { transaction: t });
            let res = yield global_1.getModel("users.users_ext").create({ uuid: uuid }, { transaction: t });
            return !!res ? res.get() : undefined;
        }));
    });
}
exports.new_insertUsers = new_insertUsers;
function getByUsername(username) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { username: username } });
        return res ? res.get() : undefined;
    });
}
exports.getByUsername = getByUsername;
function updatePassword(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ password: password }, { where: { username: username }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updatePassword = updatePassword;
function getAll(cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ offset: cursor, limit: limit, });
        return res.map(r => r.get());
    });
}
exports.getAll = getAll;
function updateInformation(uuid, obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update(obj, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateInformation = updateInformation;
function checkUser(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { username: username, password: password } });
        return res ? res.get() : undefined;
    });
}
exports.checkUser = checkUser;
function updateOpenid(username, openid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ openid: openid }, { where: { username: username } });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateOpenid = updateOpenid;
//未使用？？？？
function updateStateToApp(uuid, appState) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ state: appState }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateStateToApp = updateStateToApp;
//？？？？？？？？？？？？？？？
function updatePoint(updateUser, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update(updateUser, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updatePoint = updatePoint;
function findByPrimary(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let user = yield global_1.getModel(modelName).findByPrimary(uuid);
        return user ? user.get() : undefined;
    });
}
exports.findByPrimary = findByPrimary;
function resetAppUserState(useruuid, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ state: state }, { where: { uuid: useruuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.resetAppUserState = resetAppUserState;
/**
 *  查询会员的积分
 */
function getAllUserPoints(sequelize, searchdata, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select * from users.users u, users.users_ext ue where u.uuid=ue.uuid and (u.username like '%${searchdata}%' ) order by ue.total_points desc offset ${cursor} limit ${limit}`, { type: "select" });
        return res;
    });
}
exports.getAllUserPoints = getAllUserPoints;
/**
 * 查询会员的所有信息
 */
function getAllUsers(sequelize, searchdata, cursor, limit, pointsort, balancesort) {
    return __awaiter(this, void 0, void 0, function* () {
        if (pointsort != "" || pointsort) {
            pointsort = ' ue.points ' + pointsort + ',';
        }
        else {
            pointsort = '';
        }
        if (balancesort != "" || balancesort) {
            balancesort = ' ue.balance ' + balancesort + ',';
        }
        else {
            balancesort = '';
        }
        let res = yield sequelize.query(`select * from users.users u,users.users_ext ue
    where u.uuid=ue.uuid
    and (u.username like '%${searchdata}%' or ue.openid like '%${searchdata}%' )
    order by ${pointsort} ${balancesort} u.created desc offset ${cursor} LIMIT ${limit}`, { type: "select" });
        return res;
    });
}
exports.getAllUsers = getAllUsers;
function getCount(sequelize, searchdata) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select count(*) from users.users u,users.users_ext ue
    where u.uuid=ue.uuid
    and (u.username like '%${searchdata}%'  or ue.openid like '%${searchdata}%' ) `, { type: "select" });
        return res[0].count;
    });
}
exports.getCount = getCount;
function deleteUser(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).destroy({ where: { uuid: uuid } });
    });
}
exports.deleteUser = deleteUser;
function getUserAndlevels(sequelize, searchdata, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`SELECT us.*,u.*,a.levels,a.fromexp,a.discount,a.modified
    FROM users.users us LEFT JOIN users.users_ext AS u ON u.uuid = us.uuid LEFT JOIN users.levels AS A ON A .fromexp @> u."exp"
    WHERE us.STATE = 'on' ORDER BY A.levels DESC OFFSET ${cursor} LIMIT ${limit}`, { type: "select" });
        return res;
    });
}
exports.getUserAndlevels = getUserAndlevels;
function finduserslevel(sequelize, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select * from users.users as u left join users.users_ext  as us on u.uuid =us.uuid left join users.levels as l on l.fromexp @> us."exp" where u.uuid ='${uuid}' limit 1`, { type: "select" });
        return res[0];
    });
}
exports.finduserslevel = finduserslevel;
function getUserAndlevelsCount(sequelize, searchdata) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select count(*) FROM users.users us
    LEFT JOIN users.users_ext AS u ON u.uuid = us.uuid
    LEFT JOIN users.levels AS A ON A .fromexp @> u."exp"
    WHERE us.STATE = 'on' `, { type: "select" });
        return parseInt(res[0].count);
    });
}
exports.getUserAndlevelsCount = getUserAndlevelsCount;
function deleteusers(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ state: 'off' }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.deleteusers = deleteusers;
function updatePointlottery(uuid, invite) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ pointlottery: sequelize_1.Sequelize.literal(`pointlottery+${invite}`) }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updatePointlottery = updatePointlottery;
/**
 * 修改修改积分抽奖次数和零钱抽奖次数
 * @param uuid
 * @param pointlottery
 * @param cashlottery
 */
function updatePointAndCashlottery(uuid, pointlottery, cashlottery) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({
            pointlottery: sequelize_1.Sequelize.literal(`pointlottery-${pointlottery}`),
            cashlottery: sequelize_1.Sequelize.literal(`cashlottery-${cashlottery}`)
        }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updatePointAndCashlottery = updatePointAndCashlottery;
/**
 * 修改修改积分抽奖次数和零钱抽奖次数
 * @param uuid
 * @param pointlottery
 * @param cashlottery
 */
function addPointAndCashlottery(uuid, pointlottery, cashlottery) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({
            pointlottery: sequelize_1.Sequelize.literal(`pointlottery+${pointlottery}`),
            cashlottery: sequelize_1.Sequelize.literal(`cashlottery+${cashlottery}`)
        }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.addPointAndCashlottery = addPointAndCashlottery;
function getOffCount() {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).count({ where: { state: "off" } });
        return res;
    });
}
exports.getOffCount = getOffCount;
function getAllOffUsers(cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { state: 'off' }, offset: cursor, limit: limit });
        return res ? res.map(r => r.get()) : undefined;
    });
}
exports.getAllOffUsers = getAllOffUsers;
/* export async function findNullPass(sequelize: Sequelize, ) {
    let res = await sequelize.query(`
    SELECT * from users.users where "password" is null;
    `, { type: "select" }) as any[]
    return res
} */
//# sourceMappingURL=users.js.map