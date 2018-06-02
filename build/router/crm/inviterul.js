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
const inviterule_1 = require("../../model/ads/inviterule");
const logindao_1 = require("../../redis/logindao");
exports.router = express_1.Router();
exports.router.put('/', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { content, invitepoint, parentinvitepoint, invitebalance, parentinvitebalance } = req.body;
        try {
            const info = req.loginInfo;
            if (!info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            let inviterul = {
                content: content,
                invitepoint: parseInt(invitepoint),
                parentinvitepoint: parseInt(parentinvitepoint),
                invitebalance: parseFloat(invitebalance) * 100,
                parentinvitebalance: parseFloat(parentinvitebalance) * 100
            };
            validator_1.validateCgi(inviterul, validator_2.invireRul.info);
            let inviteruls = yield inviterule_1.updateInviteRule(inviterul);
            if (inviteruls) {
                inviteruls.invitebalance = inviteruls.invitebalance / 100;
                inviteruls.parentinvitebalance = inviteruls.parentinvitebalance / 100;
            }
            return response_1.sendOK(res, { inviterul: inviteruls });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let inviteruls = yield inviterule_1.getInviteRule(req.app.locals.sequelize);
            if (inviteruls) {
                inviteruls.invitebalance = inviteruls.invitebalance / 100;
                inviteruls.parentinvitebalance = inviteruls.parentinvitebalance / 100;
            }
            return response_1.sendOK(res, { inviterul: inviteruls });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=inviterul.js.map