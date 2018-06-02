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
const message_1 = require("../../model/users/message");
const logindao_1 = require("../../redis/logindao");
const winston_1 = require("../../config/winston");
exports.router = express_1.Router();
//获取用户未读消息数
exports.router.get('/messagecount', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let useruuid = req.headers.uuid;
            let count = useruuid ? (yield message_1.getMyMessageCount(useruuid)) : 0;
            return response_1.sendOK(res, { count: count });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//获取新消息
exports.router.get('/state', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const info = req.loginInfo;
            let message = yield message_1.getMySendMessage(info.getUuid());
            return response_1.sendOK(res, { message: message });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//获取消息详情
exports.router.get('/:uuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            validator_1.validateCgi({ uuid: uuid }, validator_2.messageValidator.uuid);
            let message = yield message_1.findByPrimary(uuid);
            message.created = winston_1.timestamps(message.created);
            return response_1.sendOK(res, { message: message });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//获取我的消息
exports.router.get('/', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const info = req.loginInfo;
            let message = yield message_1.getMyMessage(info.getUuid());
            return response_1.sendOK(res, { message: message });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//发送系统消息
exports.router.put('/type/:uuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let uuid = req.params["uuid"];
        try {
            validator_1.validateCgi({ uuid: uuid }, validator_2.messageValidator.uuid);
            let message = yield message_1.updateMessage(uuid);
            return response_1.sendOK(res, { message: message });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//修改状态为已查看
exports.router.put('/:uuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let uuid = req.params["uuid"];
        try {
            validator_1.validateCgi({ uuid: uuid }, validator_2.messageValidator.uuid);
            let message = yield message_1.updateMessageSaw(uuid);
            return response_1.sendOK(res, { message: message });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//删除消息
exports.router.delete('/:uuid', logindao_1.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let uuid = req.params["uuid"];
        try {
            validator_1.validateCgi({ uuid: uuid }, validator_2.messageValidator.uuid);
            yield message_1.removemessage(uuid);
            return response_1.sendOK(res, { message: "删除成功！" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=message.js.map