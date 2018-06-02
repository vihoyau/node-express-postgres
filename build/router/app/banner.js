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
const response_1 = require("../../lib/response");
const banner_1 = require("../../model/mall/banner");
exports.router = express_1.Router();
/* GET banner listing. */
exports.router.get('/', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // 获取参数
        try {
            let adslogs = yield banner_1.getBanners();
            return response_1.sendOK(res, { adslogs: adslogs });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=banner.js.map