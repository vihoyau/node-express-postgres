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
const response_1 = require("../../lib/response");
const logindao_1 = require("../../redis/logindao");
const express_1 = require("express");
const statistics_1 = require("../../model/users/statistics");
exports.router = express_1.Router();
exports.router.get("/timeRange", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { timeRange } = req.query;
        const { start, length, draw } = req.query;
        try {
            let statistics = yield statistics_1.findAllByTimeRange(req.app.locals.sequelize, JSON.parse(timeRange), parseInt(start), parseInt(length));
            statistics.forEach(r => {
                delete r.password;
            });
            let recordsFiltered = yield statistics_1.findAllByTimeRangeCount(req.app.locals.sequelize, JSON.parse(timeRange));
            return response_1.sendOK(res, { statistics, draw, recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//app�ÿͼ�¼,��δ��¼�û������Ƽ����ӿ�Ϊһ�ηÿͽ���
exports.router.get('/visitors', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { start, length, timeRange } = req.query;
        try {
            let recordsFiltered = yield statistics_1.findCountVisitorByTimeRange(req.app.locals.sequelize, JSON.parse(timeRange));
            let visitors = yield statistics_1.findAllVisitorByTimeRange(req.app.locals.sequelize, JSON.parse(timeRange), parseInt(start), parseInt(length));
            return response_1.sendOK(res, { visitors, recordsFiltered });
        }
        catch (e) {
            response_1.sendError(res, e);
        }
    });
});
//# sourceMappingURL=statistics_ext.js.map