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
const validator_1 = require("./validator");
const validator_2 = require("../../lib/validator");
const logindao_1 = require("../../redis/logindao");
const response_1 = require("../../lib/response");
const express_1 = require("express");
const userprize_1 = require("../../model/users/userprize");
const winston_1 = require("../../config/winston");
exports.router = express_1.Router();
//获奖列表
exports.router.get("/", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { start, length, draw, search } = req.query;
        let { state, lotterytype, receive } = req.query;
        try {
            let searchdata = search.value;
            validator_2.validateCgi({ start: start, length: length, searchdata: searchdata }, validator_1.crmuserValidator.pagination);
            validator_2.validateCgi({ state: state, lotterytype: lotterytype, receive }, validator_1.userprizeValidator.stateAndlotterytype);
            if (!state || state === 'undefined' || state == undefined)
                state = '';
            if (!searchdata || searchdata === 'undefined' || searchdata == undefined)
                searchdata = '';
            let recordsFiltered = yield userprize_1.getCount(req.app.locals.sequelize, searchdata, state, lotterytype, receive);
            let prize = yield userprize_1.getUserprizeList(req.app.locals.sequelize, parseInt(start), parseInt(length), searchdata, state, lotterytype, receive);
            if (prize.length === 0) {
                return response_1.sendOK(res, { draw: draw, prize: [], recordsFiltered: 0 });
            }
            else {
                for (let i = 0; i < prize.length; i++) {
                    prize[i].created = winston_1.timestamps(prize[i].created); //创建时间的格式转换
                }
                return response_1.sendOK(res, { draw: draw, prize: prize, recordsFiltered: recordsFiltered });
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=userprize.js.map