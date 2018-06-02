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
const express_1 = require("express");
const response_1 = require("../../lib/response");
const hotkey_1 = require("../../model/ads/hotkey");
exports.router = express_1.Router();
/* GET adslog listing. */
exports.router.get('/searchkeys', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // 获取参数
        const { count, keyword } = req.query;
        try {
            validator_1.validateCgi({ count: count, keyword: keyword }, validator_2.usersValidator.keywords);
            let hotkey = yield hotkey_1.getKeywords(parseInt(count), keyword);
            return response_1.sendOK(res, { hotkey: hotkey });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=hotkey.js.map