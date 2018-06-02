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
//规格五张卡牌的情形下
const modelName = "mall.collectioncreate";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        ActivityName: sequelize_1.DataTypes.CHAR(225),
        Tag: sequelize_1.DataTypes.CHAR(225),
        Starttime: sequelize_1.DataTypes.CHAR(225),
        Endtime: sequelize_1.DataTypes.CHAR(225),
        State: sequelize_1.DataTypes.INTEGER,
        Point: sequelize_1.DataTypes.INTEGER,
        ChipIdAmounts: sequelize_1.DataTypes.INTEGER,
        CardIdAmounts: sequelize_1.DataTypes.INTEGER,
        Gooduuid: sequelize_1.DataTypes.UUID,
        RedPacket: sequelize_1.DataTypes.FLOAT,
        Couponid: sequelize_1.DataTypes.UUID,
        created: sequelize_1.DataTypes.TIME,
        modified: sequelize_1.DataTypes.TIME,
        Filename: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
        Images: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
        CardProbability: sequelize_1.DataTypes.JSONB,
        ChipProbability: sequelize_1.DataTypes.JSONB,
        rewardmethod: sequelize_1.DataTypes.INTEGER,
        goodtitle: sequelize_1.DataTypes.STRING,
        Coupontitle: sequelize_1.DataTypes.STRING,
        Reward: sequelize_1.DataTypes.TEXT,
        ActivityRule: sequelize_1.DataTypes.TEXT,
        jrayImages: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
        rewardImages: sequelize_1.DataTypes.CHAR(225),
        backImages: sequelize_1.DataTypes.CHAR(225),
        primaryImages: sequelize_1.DataTypes.CHAR(225),
        isNoFortune: sequelize_1.DataTypes.INTEGER,
        collectiondone: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
        rewardNumber: sequelize_1.DataTypes.INTEGER,
        rewardDone: sequelize_1.DataTypes.INTEGER //领奖人数
    }, {
        timestamps: false,
        schema: "mall",
        freezeTableName: true,
        tableName: "collectioncreate"
    });
};
//创建活动填写信息
function addcollection(addcollections) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(addcollections);
            let res = yield global_1.getModel(modelName).create(addcollections, { returning: true });
            return res ? res.get() : undefined;
        }
        catch (e) {
            console.log(1111111);
            throw new Error(e);
        }
    });
}
exports.addcollection = addcollection;
//查看收集卡牌活动名的信息
function find_ActivityName_Info() {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll();
        return res.map(r => r.get());
    });
}
exports.find_ActivityName_Info = find_ActivityName_Info;
//查找活动
function findByPrimary(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findByPrimary(uuid);
        return res ? res.get() : undefined;
    });
}
exports.findByPrimary = findByPrimary;
//一键激活
function updatecollection(tmp) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).update({ State: 0, Starttime: tmp.Starttime, Endtime: tmp.Endtime }, { where: { uuid: tmp.uuid } });
        return res ? res : undefined;
    });
}
exports.updatecollection = updatecollection;
//运势开关
function getisNoFortune(isNoFortune, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).update({ isNoFortune }, { where: { uuid } });
        return res ? res : undefined;
    });
}
exports.getisNoFortune = getisNoFortune;
//创建活动添加卡牌
function createCardcollection(tmp) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).update({
            ChipIds: tmp.ChipIds,
            Filename: tmp.Filename,
            CardProbability: tmp.CardProbability,
            ChipProbability: tmp.ChipProbability
        }, { where: { uuid: tmp.uuid }, returning: true });
        return res ? res : undefined;
    });
}
exports.createCardcollection = createCardcollection;
/**
 * 创建收集卡牌活动
 */
function createActivity(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).create(obj, { returning: true });
    });
}
exports.createActivity = createActivity;
/**
 * 自动过期
 */
function activityAutoExpired(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ State: 2 }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.activityAutoExpired = activityAutoExpired;
function activityAutoOpen(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ State: 1 }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.activityAutoOpen = activityAutoOpen;
/**
 * 删除活动
 * @param uuid
 */
function deleteActivity(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).destroy({ where: { uuid: uuid } });
    });
}
exports.deleteActivity = deleteActivity;
//查找查看所有的活动
function find_All_Activity() {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll();
        return res ? res.map(r => r.get()) : undefined;
    });
}
exports.find_All_Activity = find_All_Activity;
/**
 * 修改活动
 * @param
 * @param uuid
 */
function updateCollectionActivity(update, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        // let [number, res] = await getModel(modelName).update({update}, { where: { uuid: uuid }, returning: true })
        let [number, res] = yield global_1.getModel(modelName).update(update, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateCollectionActivity = updateCollectionActivity;
//模糊查询
function getCount(searchdata, Statedata) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).count({
            where: {
                $or: [
                    { ActivityName: { $like: '%' + searchdata + '%' } },
                    { Tag: { $like: '%' + searchdata + '%' } }
                ], State: Statedata
            }
        });
        return res;
    });
}
exports.getCount = getCount;
//查询内容
function findColInfo(obj, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: obj, order: [['created', "DESC"]], offset: cursor, limit: limit });
        return res.map(r => r.get());
    });
}
exports.findColInfo = findColInfo;
//模糊查询
function getCount1(searchdata) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).count({
            where: {
                $or: [
                    { ActivityName: { $like: '%' + searchdata + '%' } },
                    { Tag: { $like: '%' + searchdata + '%' } }
                ]
            }
        });
        return res;
    });
}
exports.getCount1 = getCount1;
//查询内容
function findColInfo1(obj1, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: obj1, order: [['created', "DESC"]], offset: cursor, limit: limit });
        return res.map(r => r.get());
    });
}
exports.findColInfo1 = findColInfo1;
//卡牌图片上传
function findimgByPrimary(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findByPrimary(uuid);
        return res ? res.get() : undefined;
    });
}
exports.findimgByPrimary = findimgByPrimary;
function addcollectionimg(Images, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ Images }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.addcollectionimg = addcollectionimg;
//黑白图片
function addcollectionjrayimg(jrayImages, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ jrayImages }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.addcollectionjrayimg = addcollectionjrayimg;
//奖励图片
function addcollectionrewardImage(rewardImages, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).update({ rewardImages }, { where: { uuid: uuid }, returning: true });
        return res;
    });
}
exports.addcollectionrewardImage = addcollectionrewardImage;
//背景图片
function addcollectionbackimg(backImages, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).update({ backImages }, { where: { uuid: uuid }, returning: true });
        return res;
    });
}
exports.addcollectionbackimg = addcollectionbackimg;
//主图图片
function addcollectionprimaryimg(primaryImages, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).update({ primaryImages }, { where: { uuid: uuid }, returning: true });
        return res;
    });
}
exports.addcollectionprimaryimg = addcollectionprimaryimg;
//一键激活
function shutdown(uuid, Endtime, Starttime) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).update({ State: 0, Endtime, Starttime }, { where: { uuid: uuid } });
        return res ? res : undefined;
    });
}
exports.shutdown = shutdown;
//# sourceMappingURL=collectioncreate.js.map