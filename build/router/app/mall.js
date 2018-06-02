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
const express_1 = require("express");
// import { findAll } from "../../model/mall/category"
const request_1 = require("../../lib/request");
const response_1 = require("../../lib/response");
const ads_view_1 = require("../../model/ads/ads_view");
const favoriate_1 = require("../../model/ads/favoriate");
const goods_view_1 = require("../../model/mall/goods_view");
const favoriate_2 = require("../../model/mall/favoriate");
exports.router = express_1.Router();
exports.router.get("/test", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // let categories = await findAll({})
            // return res.json({ categories: categories })
            let x = yield request_1.getAsync({ url: "http://127.0.0.1:12345/appuser/" });
            return res.json({ now: new Date(), data: x });
        }
        catch (e) {
            return res.json({ recommendAds: e.message });
        }
    });
});
exports.router.get("/counts", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let ads_views, ads_faor, goods_faor, goods_views;
            let useruuid = req.headers.uuid;
            ads_views = useruuid ? (yield ads_view_1.getAdsviewCount(useruuid)) : 0;
            ads_faor = useruuid ? (yield favoriate_1.getAdsfaorCount(useruuid)) : 0;
            goods_views = useruuid ? (yield goods_view_1.getGoodsviesrCount(useruuid)) : 0;
            goods_faor = useruuid ? (yield favoriate_2.getGoodsfavorCount(useruuid)) : 0;
            return response_1.sendOK(res, { ads_views: ads_views, ads_faor: ads_faor, goods_views: goods_views, goods_faor: goods_faor });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=mall.js.map