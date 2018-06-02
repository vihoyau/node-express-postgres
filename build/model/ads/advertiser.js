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
const [schema, table] = ["ads", "advertiser"];
const modelName = `${schema}.${table}`;
/* export const defineFunction = function (sequelize: Sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        company: DataTypes.CHAR(128),
        contacts: DataTypes.CHAR(128),
        phone: DataTypes.CHAR(24),
        licence: DataTypes.TEXT,
        state: DataTypes.ENUM('on', 'off'),
        address: DataTypes.TEXT,
        description: DataTypes.TEXT,
        points: DataTypes.INTEGER,
        totalpoints: DataTypes.INTEGER,
        ext: DataTypes.JSONB,
        created: DataTypes.TIME,
        modified: DataTypes.TIME,
    }, {
            timestamps: false,
            schema: schema,
            freezeTableName: true,
            tableName: table,
        })
} */
//新添加0922
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        contacts: sequelize_1.DataTypes.CHAR(128),
        description: sequelize_1.DataTypes.TEXT,
        phone: sequelize_1.DataTypes.CHAR(24),
        imgarr: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
        state: sequelize_1.DataTypes.ENUM('on', 'off'),
        address: sequelize_1.DataTypes.TEXT,
        points: sequelize_1.DataTypes.INTEGER,
        totalpoints: sequelize_1.DataTypes.INTEGER,
        qq: sequelize_1.DataTypes.CHAR(20),
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME,
        zipcode: sequelize_1.DataTypes.CHAR(30),
        email: sequelize_1.DataTypes.CHAR(30),
        types: sequelize_1.DataTypes.INTEGER,
        company: sequelize_1.DataTypes.CHAR(128),
        websitename: sequelize_1.DataTypes.CHAR(24),
        websiteaddr: sequelize_1.DataTypes.CHAR(30),
        licence: sequelize_1.DataTypes.TEXT,
        idcard: sequelize_1.DataTypes.CHAR(18),
        ext: sequelize_1.DataTypes.JSONB,
        //审核状态
        audit: sequelize_1.DataTypes.INTEGER,
        //备注             
        remark: sequelize_1.DataTypes.CHAR(30),
        crmuuid: sequelize_1.DataTypes.UUIDV4,
        dailybudget: sequelize_1.DataTypes.DOUBLE,
        tempdailybudget: sequelize_1.DataTypes.DOUBLE,
        rent: sequelize_1.DataTypes.INTEGER
    }, {
        timestamps: false,
        schema: schema,
        freezeTableName: true,
        tableName: table,
    });
};
function findByCompany(company) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).find({ where: { company: company } });
        return res ? res.get() : undefined;
    });
}
exports.findByCompany = findByCompany;
function getCount(searchdata, advertiseruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        if (advertiseruuid == undefined) {
            let res = yield global_1.getModel(modelName).count({ where: { $or: [
                        { company: { $like: '%' + searchdata + '%' } },
                        { contacts: { $like: '%' + searchdata + '%' } }
                    ], state: 'on' } });
            return res;
        }
        else {
            let res = yield global_1.getModel(modelName).count({ where: { $or: [
                        { company: { $like: '%' + searchdata + '%' } },
                        { contacts: { $like: '%' + searchdata + '%' } }
                    ], uuid: advertiseruuid } });
            return res;
        }
    });
}
exports.getCount = getCount;
function listAdvertiser() {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ attributes: ["uuid", "company"] });
        return res ? res.map(r => r.get()) : undefined;
    });
}
exports.listAdvertiser = listAdvertiser;
//新添加的查询广告商的全部记录 包括：待审核 审核通过 审核不通过的全部信息
function listallAdvertiser() {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll();
        return res ? res.map(r => r.get()) : undefined;
    });
}
exports.listallAdvertiser = listallAdvertiser;
function findAdvInfo(obj, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: obj, attributes: ["uuid", "contacts", "phone", "address", "company"], order: [['created', "DESC"]], offset: cursor, limit: limit });
        return res.map(r => r.get());
    });
}
exports.findAdvInfo = findAdvInfo;
//查看广告商公司名的信息
function findAdv_company_Info() {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ attributes: ["company"] });
        return res.map(r => r.get());
    });
}
exports.findAdv_company_Info = findAdv_company_Info;
//新添加的查询广告商的信息      audit : 0 待审核列表
function new_findAdvInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { audit: 0 } }); //待审核的信息
        return res.map(r => r.get());
    });
}
exports.new_findAdvInfo = new_findAdvInfo;
//新添加的adminRW和adminRO的查询广告商的信息      audit : 0 待审核列表
function find_perm_AdvInfo(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { uuid: uuid, audit: 0 } });
        return res ? res.get() : undefined;
    });
}
exports.find_perm_AdvInfo = find_perm_AdvInfo;
//新添加:通过crmuuid查询广告商的记录
function find_AdvInfo_by_crmuuid(crmuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { crmuuid: crmuuid } });
        return res ? res.get() : undefined;
    });
}
exports.find_AdvInfo_by_crmuuid = find_AdvInfo_by_crmuuid;
function addAdvertiser(advertiser) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(advertiser);
            let res = yield global_1.getModel(modelName).create(advertiser, { returning: true });
            return res ? res.get() : undefined;
        }
        catch (e) {
            console.log(1111111);
            throw new Error(e);
        }
    });
}
exports.addAdvertiser = addAdvertiser;
//在where的条件下，update字段point,returning为update的返回值,因为更新的是整个数组，所以res[0].get为取得数组第一个元素
function modifyPoint(uuid, points) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ points: points }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.modifyPoint = modifyPoint;
//新添加  修改audit审核字段的状态
function modifyAudit(uuid, audit) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ audit: audit }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.modifyAudit = modifyAudit;
//新添加  修改remark备注字段的状态
function modifyRemark(uuid, remark) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ remark: remark }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.modifyRemark = modifyRemark;
//新添加  修改balance总余额字段的状态
function modifybalance(uuid, balance) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ balance: balance }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.modifybalance = modifybalance;
//新添加  修改balance_state余额状态字段的状态
function modifybalance_state(uuid, balance_state) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ balance_state: balance_state }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.modifybalance_state = modifybalance_state;
function findByPrimary(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel('ads.advertiser').findByPrimary(uuid);
        return res ? res.get() : undefined;
    });
}
exports.findByPrimary = findByPrimary;
//新添加 查找users_ext的全部信息
function find_users_ext_table_information() {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel('users.users_ext').findAll();
        return res ? res.map(r => r.get()) : undefined;
    });
}
exports.find_users_ext_table_information = find_users_ext_table_information;
//新添加 查找users_ext的全部信息
function find_one_users_ext_table_information(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel('users.users_ext').findByPrimary(uuid);
        return res ? res.get() : undefined;
    });
}
exports.find_one_users_ext_table_information = find_one_users_ext_table_information;
function updateAdvertiser(advertiser, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update(advertiser, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateAdvertiser = updateAdvertiser;
function getAll(searchdata, cursor, limit, advertiseruuid) {
    return __awaiter(this, void 0, void 0, function* () {
        if (advertiseruuid == undefined) {
            let res = yield global_1.getModel(modelName).findAll({ where: { $or: [
                        { company: { $like: '%' + searchdata + '%' } },
                        { contacts: { $like: '%' + searchdata + '%' } },
                        { phone: { $like: '%' + searchdata + '%' } }
                    ] /* ,state:'on' */ }, offset: cursor, limit: limit });
            return res.map(r => r.get());
        }
        else {
            let res = yield global_1.getModel(modelName).findAll({ where: { $or: [
                        { company: { $like: '%' + searchdata + '%' } },
                        { contacts: { $like: '%' + searchdata + '%' } },
                        { phone: { $like: '%' + searchdata + '%' } }
                    ], uuid: advertiseruuid /* ,state:'on' */ }, offset: cursor, limit: limit });
            return res.map(r => r.get());
        }
    });
}
exports.getAll = getAll;
function findoneBycrmuuid(crmuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { crmuuid: crmuuid } });
        return res ? res.get() : undefined;
    });
}
exports.findoneBycrmuuid = findoneBycrmuuid;
function findAlladvertiser() {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll();
        return res ? res.map(r => r.get()) : [];
    });
}
exports.findAlladvertiser = findAlladvertiser;
function finddailybudgetByuuid(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let advertiser = yield global_1.getModel(modelName).findOne({ where: { uuid: uuid } });
        return advertiser.get();
    });
}
exports.finddailybudgetByuuid = finddailybudgetByuuid;
function updatedailybudget() {
    return __awaiter(this, void 0, void 0, function* () {
        global_1.getModel(modelName).update({ tempdailybudget: 100 }, { where: {}, returning: true });
    });
}
exports.updatedailybudget = updatedailybudget;
function finddailybudgetisZERO() {
    return __awaiter(this, void 0, void 0, function* () {
        let advertiser = yield global_1.getModel(modelName).findAll({ where: { dailybudget: 0 } });
        return advertiser ? advertiser.map(r => r.get()) : [];
    });
}
exports.finddailybudgetisZERO = finddailybudgetisZERO;
//# sourceMappingURL=advertiser.js.map