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
const modelName = "mall.goods";
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        title: sequelize_1.DataTypes.CHAR(1024),
        keyword: sequelize_1.DataTypes.TEXT,
        price: sequelize_1.DataTypes.INTEGER,
        realprice: sequelize_1.DataTypes.INTEGER,
        content: sequelize_1.DataTypes.TEXT,
        specification: sequelize_1.DataTypes.TEXT,
        category: sequelize_1.DataTypes.UUID,
        subcategory: sequelize_1.DataTypes.UUID,
        tags: sequelize_1.DataTypes.JSONB,
        association: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.UUID),
        pics: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
        points: sequelize_1.DataTypes.INTEGER,
        state: sequelize_1.DataTypes.ENUM("onsale", "offsale", "new", 'virtualproduct'),
        businessuuid: sequelize_1.DataTypes.UUID,
        postage: sequelize_1.DataTypes.INTEGER,
        deleted: sequelize_1.DataTypes.INTEGER,
        modified: sequelize_1.DataTypes.TIME,
        created: sequelize_1.DataTypes.TIME,
        deduction: sequelize_1.DataTypes.CHAR(36),
        businessmen: sequelize_1.DataTypes.CHAR(30),
        hot: sequelize_1.DataTypes.ENUM("yes", "no"),
        detailpics: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
        detailcontent: sequelize_1.DataTypes.TEXT //详情文字
    }, {
        timestamps: false,
        schema: "mall",
        freezeTableName: true,
        tableName: "goods"
    });
};
// ----------------------------- app -----------------------------
function findAll(cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({
            where: {
                state: "onsale",
                deleted: 0,
            },
            offset: cursor,
            limit: limit,
            order: [['created', 'DESC']]
        });
        return res.map(r => r.get());
    });
}
exports.findAll = findAll;
//更改抵扣标签
function changeTag(tag, gooduuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).update({ deduction: tag }, { where: { uuid: gooduuid } });
        return res;
    });
}
exports.changeTag = changeTag;
//查询商品抵扣资格
function searchpoints(gooduuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { uuid: gooduuid } });
        return res;
    });
}
exports.searchpoints = searchpoints;
function findByPrimary(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findByPrimary(uuid);
        return res ? res.get() : undefined;
    });
}
exports.findByPrimary = findByPrimary;
// 推荐商品列表
function findByRecommendGoods() {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { hot: 'yes', state: "onsale", deleted: 0 }, limit: 9, order: [['created', 'desc']] });
        return res ? res.map(r => r.get()) : undefined;
    });
}
exports.findByRecommendGoods = findByRecommendGoods;
// 根据商家名查询商品
function findByBusiness(businessmen, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({ where: { businessmen: businessmen, state: "onsale", deleted: 0 }, offset: cursor, limit: limit, order: [['created', 'desc']] });
        return res ? res.map(r => r.get()) : undefined;
    });
}
exports.findByBusiness = findByBusiness;
function findByState(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({ where: { uuid: uuid, state: 'onsale', deleted: 0 } });
        return res ? res.get() : undefined;
    });
}
exports.findByState = findByState;
/**
 *
 */
function findByStateVir(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findOne({
            where: {
                uuid: uuid,
                $or: [{ state: 'onsale' }, { state: 'virtualproduct' }],
                deleted: 0
            }
        });
        return res ? res.get() : undefined;
    });
}
exports.findByStateVir = findByStateVir;
function findByKeyword(keyword, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({
            where: {
                state: "onsale",
                deleted: 0,
                $or: [{ title: { like: '%' + keyword + '%' } }, { keyword: { like: '%' + keyword + '%' } }],
            },
            offset: cursor,
            limit: limit,
            order: [['created', 'DESC']]
        });
        return res.map(r => r.get());
    });
}
exports.findByKeyword = findByKeyword;
function findByCategory(category, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({
            where: {
                state: "onsale",
                deleted: 0,
                category: category,
            },
            offset: cursor,
            limit: limit,
            order: [['created', 'DESC']]
        });
        return res.map(r => r.get());
    });
}
exports.findByCategory = findByCategory;
function findBySubcategory(subcategory, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({
            where: {
                state: "onsale",
                deleted: 0,
                subcategory: subcategory,
            },
            offset: cursor,
            limit: limit,
            order: [['created', 'DESC']]
        });
        return res.map(r => r.get());
    });
}
exports.findBySubcategory = findBySubcategory;
function findBySubcategoryPrice(fromPrice, toPrice, cursor, limit, subcategory) {
    return __awaiter(this, void 0, void 0, function* () {
        let res;
        if (toPrice === 0) {
            res = yield global_1.getModel(modelName).findAll({
                where: {
                    state: "onsale",
                    deleted: 0,
                    subcategory: subcategory,
                    $and: [{ realprice: { $gte: fromPrice } }]
                },
                offset: cursor,
                limit: limit,
                order: [['created', 'DESC']]
            });
        }
        else {
            res = yield global_1.getModel(modelName).findAll({
                where: {
                    state: "onsale",
                    deleted: 0,
                    subcategory: subcategory,
                    $and: [{ realprice: { $gte: fromPrice } }, { realprice: { $lte: toPrice } }]
                },
                offset: cursor,
                limit: limit,
                order: [['created', 'DESC']]
            });
        }
        return res.map(r => r.get());
    });
}
exports.findBySubcategoryPrice = findBySubcategoryPrice;
function findByPrice(fromPrice, toPrice, cursor, limit, category) {
    return __awaiter(this, void 0, void 0, function* () {
        let res;
        if (toPrice === 0) {
            res = yield global_1.getModel(modelName).findAll({
                where: {
                    state: "onsale",
                    deleted: 0,
                    category: category,
                    $and: [{ realprice: { $gte: fromPrice } }]
                },
                offset: cursor,
                limit: limit,
                order: [['created', 'DESC']]
            });
        }
        else {
            res = yield global_1.getModel(modelName).findAll({
                where: {
                    state: "onsale",
                    deleted: 0,
                    category: category,
                    $and: [{ realprice: { $gte: fromPrice } }, { realprice: { $lte: toPrice } }]
                },
                offset: cursor,
                limit: limit,
                order: [['created', 'DESC']]
            });
        }
        return res.map(r => r.get());
    });
}
exports.findByPrice = findByPrice;
// sort：排序 desc-倒序 asc-正序
function findByKeywordPriceSort(keyword, sort, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({
            where: {
                state: "onsale",
                deleted: 0,
                keyword: { $like: '%' + keyword + '%' },
            },
            offset: cursor,
            limit: limit,
            order: [['realprice', sort]]
        });
        return res.map(r => r.get());
    });
}
exports.findByKeywordPriceSort = findByKeywordPriceSort;
// sort：排序 desc-倒序 asc-正序
function orderBySubcategoryPrice(subcategory, sort, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({
            where: {
                state: "onsale",
                deleted: 0,
                subcategory: subcategory
            },
            offset: cursor,
            limit: limit,
            order: [['realprice', sort]]
        });
        return res.map(r => r.get());
    });
}
exports.orderBySubcategoryPrice = orderBySubcategoryPrice;
// sort：排序 desc-倒序 asc-正序
function orderByPrice(category, sort, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield global_1.getModel(modelName).findAll({
            where: {
                state: "onsale",
                deleted: 0,
                category: category
            },
            offset: cursor,
            limit: limit,
            order: [['realprice', sort]]
        });
        return res.map(r => r.get());
    });
}
exports.orderByPrice = orderByPrice;
function findByKeywordPriceRange(fromPrice, toPrice, keyword, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res;
        if (toPrice === 0) {
            res = yield global_1.getModel(modelName).findAll({
                where: {
                    state: "onsale",
                    deleted: 0,
                    keyword: { $like: '%' + keyword + '%' },
                    $and: [{ realprice: { $gte: fromPrice } }]
                },
                offset: cursor,
                limit: limit,
                order: [['created', 'DESC']]
            });
        }
        else {
            res = yield global_1.getModel(modelName).findAll({
                where: {
                    state: "onsale",
                    deleted: 0,
                    keyword: { $like: '%' + keyword + '%' },
                    $and: [{ realprice: { $gte: fromPrice } }, { realprice: { $lte: toPrice } }]
                },
                offset: cursor,
                limit: limit,
                order: [['created', 'DESC']]
            });
        }
        return res.map(r => r.get());
    });
}
exports.findByKeywordPriceRange = findByKeywordPriceRange;
// ----------------------------- crm -----------------------------
function updateGoodsTags(uuid, tags, realprice, price, points) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ tags: tags, realprice: realprice, price: price, points: points }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateGoodsTags = updateGoodsTags;
function findGoodsByHot(sequelize) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select ge.volume,ge.sales,g.tags, c1."name" category,c2."name" subcategory,c1."name" category,
    c2."name" subcategory,g.hot,g.uuid,g.title,g.pics,g.keyword,g.realprice,g.price,g.points,g.association,g."state" ,g.detailpics,g.detailcontent
    from mall.goods_ext ge, mall.goods g,mall.category c1 ,mall.category c2 where g.category=c1.uuid and g.uuid=ge.uuid and
     g.subcategory=c2.uuid and g.state='onsale' and g.deleted=0 and g.hot='yes' order by g.created desc `, { type: "select" });
        return res;
    });
}
exports.findGoodsByHot = findGoodsByHot;
function findGoodsHotCount(sequelize) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select count(*) from mall.goods_ext ge, mall.goods g,mall.category c1 ,mall.category c2 where g.category=c1.uuid and g.uuid=ge.uuid and g.subcategory=c2.uuid and g.state='onsale' and g.deleted=0 and g.hot='yes' `, { type: "select" });
        return parseInt(res[0].count);
    });
}
exports.findGoodsHotCount = findGoodsHotCount;
function updateState(uuid, state) {
    return __awaiter(this, void 0, void 0, function* () {
        let obj;
        if (state != "onsale") {
            obj = {
                state: state,
                hot: "no",
            };
        }
        else {
            obj = {
                state: state
            };
        }
        let [number, res] = yield global_1.getModel(modelName).update(obj, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateState = updateState;
// 设置推荐商品
function updateGoodsHot(uuid, hot) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ hot: hot }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateGoodsHot = updateGoodsHot;
function updateGoods(uuid, obj) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update(obj, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateGoods = updateGoods;
function insertGoods(seqz, obj, volume) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield seqz.transaction((t) => __awaiter(this, void 0, void 0, function* () {
            let goods = yield global_1.getModel(modelName).create(obj, { transaction: t, returning: true });
            let uuid = goods.get("uuid");
            yield global_1.getModel("mall.goods_ext").create({ uuid: uuid, volume: volume }, { transaction: t });
            return uuid;
        }));
    });
}
exports.insertGoods = insertGoods;
function deleteGoods(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield global_1.getModel(modelName).update({ deleted: 1 }, { where: { uuid: uuid } });
    });
}
exports.deleteGoods = deleteGoods;
function findPrizeGoods(sequelize, searchdata, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
    select ge.volume,ge.sales,g.tags,g.postage, c1."name" category,c2."name" subcategory,g.hot,g.uuid,g.title,g.pics,g.keyword,
    g.realprice,g.price,g.businessmen,g.points,g.association,g."state",g.detailpics,g.detailcontent
    from mall.goods_ext ge, mall.goods g,mall.category c1 ,mall.category c2 where g.category=c1.uuid and
     g.uuid=ge.uuid and g.subcategory=c2.uuid and g.deleted=0 and
     (g.state='onsale' or g.state='virtualproduct' ) and
     (c1.name like '%${searchdata}%' or c2.name like '%${searchdata}%' or
      g.title like '%${searchdata}%' or g.keyword  like '%${searchdata}%' or
      g.businessmen  like '%${searchdata}%') ORDER BY g.created DESC OFFSET ${cursor}  LIMIT ${limit} `, { type: "select" });
        return res;
    });
}
exports.findPrizeGoods = findPrizeGoods;
function findGoods(sequelize, searchdata, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`
    select ge.volume,ge.sales,g.tags,g.postage, c1."name" category,c2."name" subcategory,g.hot,g.uuid,
    g.title,g.pics,g.keyword,g.realprice,g.price,g.businessmen,g.points,g.association,g."state",g.detailpics,g.detailcontent,g.deduction
    from mall.goods_ext ge, mall.goods g,mall.category c1 ,mall.category c2 where g.category=c1.uuid and
     g.uuid=ge.uuid and g.subcategory=c2.uuid and g.deleted=0 and
     (c1.name like '%${searchdata}%' or c2.name like '%${searchdata}%' or
      g.title like '%${searchdata}%' or g.keyword  like '%${searchdata}%' or
       g.businessmen  like '%${searchdata}%')
       ORDER BY g.created DESC OFFSET ${cursor}  LIMIT ${limit} `, { type: "select" });
        return res;
    });
}
exports.findGoods = findGoods;
function getPrizeCount(sequelize, searchdata) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select count(*) from  mall.goods g,mall.category c1 ,mall.category c2 where g.category=c1.uuid  and g.subcategory=c2.uuid and g.deleted=0 and(g.state='onsale' or g.state='virtualproduct' ) and (c1.name like '%${searchdata}%' or c2.name like '%${searchdata}%' or g.title like '%${searchdata}%' or g.keyword  like '%${searchdata}%' or g.businessmen  like '%${searchdata}%') `, { type: "select" });
        return parseInt(res[0].count);
    });
}
exports.getPrizeCount = getPrizeCount;
function getCount(sequelize, searchdata) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`select count(*) from  mall.goods g,mall.category c1 ,mall.category c2 where g.category=c1.uuid  and g.subcategory=c2.uuid and g.deleted=0 and (c1.name like '%${searchdata}%' or c2.name like '%${searchdata}%' or g.title like '%${searchdata}%' or g.keyword  like '%${searchdata}%' or g.businessmen  like '%${searchdata}%') `, { type: "select" });
        return parseInt(res[0].count);
    });
}
exports.getCount = getCount;
function modifilyPics(uuid, pics) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ pics: pics }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.modifilyPics = modifilyPics;
function modifilyDetailPics(uuid, pics) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ detailpics: pics }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.modifilyDetailPics = modifilyDetailPics;
function deleteByCategory(category) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ deleted: 1 }, { where: { category: category }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.deleteByCategory = deleteByCategory;
function deleteBySubcategory(subcategory) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ deleted: 1 }, { where: { subcategory: subcategory }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.deleteBySubcategory = deleteBySubcategory;
function updateNumber(tags, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let [number, res] = yield global_1.getModel(modelName).update({ tags: tags }, { where: { uuid: uuid }, returning: true });
        return number > 0 ? res[0].get() : undefined;
    });
}
exports.updateNumber = updateNumber;
//# sourceMappingURL=goods.js.map