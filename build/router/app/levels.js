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
const logindao_1 = require("../../redis/logindao");
const express_1 = require("express");
const response_1 = require("../../lib/response");
const levels_1 = require("../../model/users/levels");
exports.router = express_1.Router();
// TODO
exports.router.get('/', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let { page, count } = req.query;
            let result = yield levels_1.findAlllevels(parseInt(page) - 1, parseInt(count));
            return response_1.sendOK(res, { result: result });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=levels.js.map