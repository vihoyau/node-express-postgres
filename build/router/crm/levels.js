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
const logindao_1 = require("../../redis/logindao");
const express_1 = require("express");
const response_1 = require("../../lib/response");
const levels_1 = require("../../model/users/levels");
exports.router = express_1.Router();
// TODO
exports.router.post('/', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { levels, fromexp, discount } = req.body;
        try {
            validator_1.validateCgi({ levels: levels, discount: parseInt(discount) }, validator_2.levelsValidator.levels_add);
            let obj = {
                levels: levels,
                fromexp: JSON.parse(fromexp),
                discount: parseInt(discount)
            };
            let result = yield levels_1.createLevels(obj);
            return response_1.sendOK(res, result);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// TODO
exports.router.delete('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            validator_1.validateCgi({ uuid: uuid }, validator_2.levelsValidator.uuid);
            yield levels_1.deleteLevels(uuid);
            return response_1.sendOK(res, "删除成功");
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// TODO
exports.router.put('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        const { levels, fromexp, discount } = req.body;
        try {
            validator_1.validateCgi({ uuid: uuid, levels: levels, fromexp: fromexp, discount: parseInt(discount) }, validator_2.levelsValidator.levels_update);
            let obj = {
                levels: levels,
                fromexp: JSON.parse(fromexp),
                discount: parseInt(discount)
            };
            let result = yield levels_1.updateLevels(uuid, obj);
            return response_1.sendOK(res, result);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// TODO
exports.router.get('/user/:exp', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const exp = req.params["exp"];
        try {
            validator_1.validateCgi({ exp: exp }, validator_2.levelsValidator.levels_exp);
            let result = yield levels_1.findByExp(parseInt(exp));
            return response_1.sendOK(res, result);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// TODO
exports.router.get('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            validator_1.validateCgi({ uuid: uuid }, validator_2.levelsValidator.uuid);
            let result = yield levels_1.findByid(uuid);
            return response_1.sendOK(res, result);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// TODO
exports.router.get('/', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let { start, length, draw, search } = req.query;
            //TODO validateCgi
            let searchdata = search.value;
            let obj = {};
            if (searchdata) {
                obj = {
                    $or: [
                        { levels: { $like: '%' + searchdata + '%' } }
                    ]
                };
            }
            let recordsFiltered = yield levels_1.getCount(obj);
            let result = yield levels_1.findAll(obj, parseInt(start), parseInt(length));
            return response_1.sendOK(res, { result: result, draw: draw, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// TODO
exports.router.get('/user/:exp', /*checkLogin,*/ function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const exp = req.params["exp"];
        try {
            validator_1.validateCgi({ exp: exp }, validator_2.levelsValidator.levels_exp);
            let result = yield levels_1.findByExp(parseInt(exp));
            return response_1.sendOK(res, result);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=levels.js.map