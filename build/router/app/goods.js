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
const validator_1 = require("../../lib/validator");
const validator_2 = require("./validator");
const utils_1 = require("../../lib/utils");
const express_1 = require("express");
const response_1 = require("../../lib/response");
const goods_view_1 = require("../../model/mall/goods_view");
const favoriate_1 = require("../../model/mall/favoriate");
const statistics_1 = require("../../model/users/statistics");
const goods_1 = require("../../model/mall/goods");
const goods_ext_1 = require("../../model/mall/goods_ext");
exports.router = express_1.Router();
exports.router.get("/subcategory/sales", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { page, count, subcategory } = req.query;
        let useruuid = req.headers.uuid;
        try {
            validator_1.validateCgi({ page: page, count: count }, validator_2.goodsValidator.pagecount);
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let goods = yield goods_ext_1.orderBySubCategoryCSales(req.app.locals.sequelize, cursor, limit, subcategory);
            goods.forEach(r => {
                r.realprice = r.realprice / 100;
                r.price = r.price / 100;
                r.postage = r.postage / 100;
            });
            if (useruuid) {
                let obj = {
                    useruuid: useruuid,
                    loginnumber: 0,
                    searchnumber: 1,
                    favoritenumber: 0,
                    type: 'goods',
                };
                yield statistics_1.insertStatistics(obj);
            }
            return response_1.sendOK(res, { goods: goods, page: parseInt(page) + 1 + "", count: count });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get("/subcategory/price_range", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { fromPrice, toPrice, page, count, subcategory } = req.query;
        let useruuid = req.headers.uuid;
        try {
            validator_1.validateCgi({ fromPrice: fromPrice, toPrice: toPrice, page: page, count: count }, validator_2.goodsValidator.range_price);
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let toPrices;
            if (!toPrice) {
                toPrices = 0;
            }
            else {
                toPrices = parseInt(toPrice);
            }
            let goods = yield goods_1.findBySubcategoryPrice(parseInt(fromPrice) * 100, toPrices * 100, cursor, limit, subcategory);
            goods.forEach(r => {
                r.realprice = r.realprice / 100;
                r.price = r.price / 100;
                r.postage = r.postage / 100;
            });
            if (useruuid) {
                let obj = {
                    useruuid: useruuid,
                    loginnumber: 0,
                    searchnumber: 1,
                    favoritenumber: 0,
                    type: 'goods',
                };
                yield statistics_1.insertStatistics(obj);
            }
            return response_1.sendOK(res, { goods: goods, page: parseInt(page) + 1 + "", count: count });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get("/subcategory/price_sort", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { sort, page, count, subcategory } = req.query;
        let useruuid = req.headers.uuid;
        try {
            validator_1.validateCgi({ page: page, count: count }, validator_2.goodsValidator.pagecount);
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let goods = yield goods_1.orderBySubcategoryPrice(subcategory, sort, cursor, limit);
            goods.forEach(r => {
                r.realprice = r.realprice / 100;
                r.price = r.price / 100;
                r.postage = r.postage / 100;
            });
            if (useruuid) {
                let obj = {
                    useruuid: useruuid,
                    loginnumber: 0,
                    searchnumber: 1,
                    favoritenumber: 0,
                    type: 'goods',
                };
                yield statistics_1.insertStatistics(obj);
            }
            return response_1.sendOK(res, { goods: goods, page: parseInt(page) + 1 + "", count: count });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get("/keyword/sales", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { keyword, page, count } = req.query;
        let useruuid = req.headers.uuid;
        try {
            validator_1.validateCgi({ keyword: keyword, page: page, count: count }, validator_2.goodsValidator.keywords);
            let { cursor, limit } = utils_1.getPageCount(page, count);
            if (useruuid) {
                let obj = {
                    useruuid: useruuid,
                    loginnumber: 0,
                    searchnumber: 1,
                    favoritenumber: 0,
                    type: 'goods',
                };
                yield statistics_1.insertStatistics(obj);
            }
            let goods = yield goods_ext_1.findByKeywordSales(keyword, req.app.locals.sequelize, cursor, limit);
            goods.forEach(r => {
                r.realprice = r.realprice / 100;
                r.price = r.price / 100;
                r.postage = r.postage / 100;
            });
            return response_1.sendOK(res, { goods: goods, page: parseInt(page) + 1 + "", count: count });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get("/keyword/price_range", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { fromPrice, toPrice, keyword, page, count, } = req.query;
        let useruuid = req.headers.uuid;
        try {
            validator_1.validateCgi({ keyword: keyword, page: page, count: count }, validator_2.goodsValidator.keywords);
            let { cursor, limit } = utils_1.getPageCount(page, count);
            if (useruuid) {
                let obj = {
                    useruuid: useruuid,
                    loginnumber: 0,
                    searchnumber: 1,
                    favoritenumber: 0,
                    type: 'goods',
                };
                yield statistics_1.insertStatistics(obj);
            }
            let goods = yield goods_1.findByKeywordPriceRange(parseInt(fromPrice) * 100, parseInt(toPrice) * 100, keyword, cursor, limit);
            goods.forEach(r => {
                r.realprice = r.realprice / 100;
                r.price = r.price / 100;
                r.postage = r.postage / 100;
            });
            return response_1.sendOK(res, { goods: goods, page: parseInt(page) + 1 + "", count: count });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get("/keyword/price_sort", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { keyword, page, count, sort } = req.query;
        let useruuid = req.headers.uuid;
        try {
            validator_1.validateCgi({ keyword: keyword, page: page, count: count }, validator_2.goodsValidator.keywords);
            let { cursor, limit } = utils_1.getPageCount(page, count);
            if (useruuid) {
                let obj = {
                    useruuid: useruuid,
                    loginnumber: 0,
                    searchnumber: 1,
                    favoritenumber: 0,
                    type: 'goods',
                };
                yield statistics_1.insertStatistics(obj);
            }
            let goods = yield goods_1.findByKeywordPriceSort(keyword, sort, cursor, limit);
            goods.forEach(r => {
                r.realprice = r.realprice / 100;
                r.price = r.price / 100;
                r.postage = r.postage / 100;
            });
            return response_1.sendOK(res, { goods: goods, page: parseInt(page) + 1 + "", count: count });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get("/business", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { business, page, count } = req.query;
        try {
            validator_1.validateCgi({ business: business, page: page, count: count }, validator_2.goodsValidator.business);
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let goods = yield goods_1.findByBusiness(business, cursor, limit);
            goods.forEach(r => {
                r.realprice = r.realprice / 100;
                r.price = r.price / 100;
                r.postage = r.postage / 100;
            });
            return response_1.sendOK(res, { goods: goods, page: parseInt(page) + 1 + "", count: count });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// 热门商品列表
exports.router.get("/hotGoods", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let hotGoods = yield goods_ext_1.findByViews(res.app.locals.sequelize);
            hotGoods.forEach(r => {
                r.realprice = r.realprice / 100;
                r.price = r.price / 100;
                r.postage = r.postage / 100;
            });
            return response_1.sendOK(res, { hotGoods: hotGoods });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// 推荐商品列表
exports.router.get("/recommendGoods", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let goods = yield goods_1.findByRecommendGoods();
            goods.forEach(r => {
                r.realprice = r.realprice / 100;
                r.price = r.price / 100;
                r.postage = r.postage / 100;
            });
            return response_1.sendOK(res, { goods: goods });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get("/category", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { category, page, count } = req.query;
        try {
            validator_1.validateCgi({ page: page, count: count }, validator_2.goodsValidator.pagecount);
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let goods = yield goods_1.findByCategory(category, cursor, limit);
            goods.forEach(r => {
                r.realprice = r.realprice / 100;
                r.price = r.price / 100;
                r.postage = r.postage / 100;
            });
            return response_1.sendOK(res, { goods: goods, page: parseInt(page) + 1 + "", count: count });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get("/subcategory", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { subcategory, page, count } = req.query;
        try {
            validator_1.validateCgi({ page: page, count: count }, validator_2.goodsValidator.pagecount);
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let goods = yield goods_1.findBySubcategory(subcategory, cursor, limit);
            goods.forEach(r => {
                r.realprice = r.realprice / 100;
                r.price = r.price / 100;
                r.postage = r.postage / 100;
            });
            return response_1.sendOK(res, { goods: goods, page: parseInt(page) + 1 + "", count: count });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get("/price_range", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { fromPrice, toPrice, page, count, category } = req.query;
        let useruuid = req.headers.uuid;
        try {
            validator_1.validateCgi({ fromPrice: fromPrice, toPrice: toPrice, page: page, count: count }, validator_2.goodsValidator.range_price);
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let toPrices;
            if (!toPrice) {
                toPrices = 0;
            }
            else {
                toPrices = parseInt(toPrice);
            }
            let goods = yield goods_1.findByPrice(parseInt(fromPrice) * 100, toPrices * 100, cursor, limit, category);
            goods.forEach(r => {
                r.realprice = r.realprice / 100;
                r.price = r.price / 100;
                r.postage = r.postage / 100;
            });
            if (useruuid) {
                let obj = {
                    useruuid: useruuid,
                    loginnumber: 0,
                    searchnumber: 1,
                    favoritenumber: 0,
                    type: 'goods',
                };
                yield statistics_1.insertStatistics(obj);
            }
            return response_1.sendOK(res, { goods: goods, page: parseInt(page) + 1 + "", count: count });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get("/price_sort", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { sort, page, count, category } = req.query;
        let useruuid = req.headers.uuid;
        try {
            validator_1.validateCgi({ page: page, count: count }, validator_2.goodsValidator.pagecount);
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let goods = yield goods_1.orderByPrice(category, sort, cursor, limit);
            goods.forEach(r => {
                r.realprice = r.realprice / 100;
                r.price = r.price / 100;
                r.postage = r.postage / 100;
            });
            if (useruuid) {
                let obj = {
                    useruuid: useruuid,
                    loginnumber: 0,
                    searchnumber: 1,
                    favoritenumber: 0,
                    type: 'goods',
                };
                yield statistics_1.insertStatistics(obj);
            }
            return response_1.sendOK(res, { goods: goods, page: parseInt(page) + 1 + "", count: count });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get("/sales", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let useruuid = req.headers.uuid;
        const { page, count, category } = req.query;
        try {
            validator_1.validateCgi({ page: page, count: count }, validator_2.goodsValidator.pagecount);
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let goods = yield goods_ext_1.orderBySales(req.app.locals.sequelize, cursor, limit, category);
            goods.forEach(r => {
                r.realprice = r.realprice / 100;
                r.price = r.price / 100;
                r.postage = r.postage / 100;
            });
            if (useruuid) {
                let obj = {
                    useruuid: useruuid,
                    loginnumber: 0,
                    searchnumber: 1,
                    favoritenumber: 0,
                    type: 'goods',
                };
                yield statistics_1.insertStatistics(obj);
            }
            return response_1.sendOK(res, { goods: goods, page: parseInt(page) + 1 + "", count: count });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get("/:uuid", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let useruuid = req.headers.uuid;
        const uuid = req.params["uuid"];
        try {
            validator_1.validateCgi({ uuid: uuid }, validator_2.goodsValidator.uuid);
            let goods = yield goods_1.findByPrimary(uuid);
            yield goods_ext_1.updateViews(uuid);
            if (goods != undefined) {
                goods.realprice = goods.realprice / 100;
                goods.price = goods.price / 100;
                goods.postage = goods.postage / 100;
            }
            //根据useruuid和gooduuid查询浏览记录
            let favorite;
            if (useruuid != "undified") {
                let goodsviewuuid = yield goods_view_1.getGoodsviewByuuid(useruuid, uuid);
                let obj;
                if (goodsviewuuid) {
                    yield goods_view_1.updateGoodsView(goodsviewuuid);
                }
                else {
                    obj = {
                        useruuid: useruuid,
                        gooduuid: uuid
                    };
                    //添加商品浏览记录
                    yield goods_view_1.insertGoodsView(obj);
                }
                let favor = yield favoriate_1.findFavoriateByUuid(uuid, useruuid);
                favorite = favor ? 1 : 0;
            }
            return response_1.sendOK(res, { goods: goods, favorite: favorite });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get("/", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { page, count } = req.query;
        try {
            validator_1.validateCgi({ page: page, count: count }, validator_2.goodsValidator.pagecount);
            let { cursor, limit } = utils_1.getPageCount(page, count);
            let goods = yield goods_1.findAll(cursor, limit);
            goods.forEach(r => {
                r.realprice = r.realprice / 100;
                r.price = r.price / 100;
                r.postage = r.postage / 100;
            });
            return response_1.sendOK(res, { goods: goods, page: parseInt(page) + 1 + "", count: count });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=goods.js.map