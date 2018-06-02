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
const invitation_1 = require("../../model/ads/invitation");
const inviterule_1 = require("../../model/ads/inviterule");
const logindao_1 = require("../../redis/logindao");
const response_1 = require("../../lib/response");
exports.router = express_1.Router();
/* GET adslog listing. */
exports.router.get('/', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // 获取参数
        try {
            const loginInfo = req.loginInfo;
            validator_1.validateCgi({ uuid: loginInfo.getUuid() }, validator_2.usersValidator.uuid);
            let phone = yield invitation_1.getByUserUuid(loginInfo.getUuid());
            let inviterule = yield inviterule_1.getInviteRule(req.app.locals.sequelize);
            return response_1.sendOK(res, { invite: phone, content: inviterule.content });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=invitation.js.map