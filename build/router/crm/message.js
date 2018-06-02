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
//创建消息
exports.router.post('/', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { content, useruuid, title, username } = req.body;
        try {
            const info = req.loginInfo;
            if (!info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            let obj = {
                useruuid: useruuid,
                username: username,
                content: content,
                state: 'new',
                title: title
            };
            validator_1.validateCgi(obj, validator_2.messageValidator.info);
            let message = yield message_1.createMessage(obj);
            return response_1.sendOK(res, { message: message });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//根据类型获取消息
exports.router.get('/state', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { state, start, length, draw, search } = req.query;
        try {
            let searchdata = search.value;
            const info = req.loginInfo;
            if (!info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            validator_1.validateCgi({ state, start, length, searchdata: undefined }, validator_2.messageValidator.typeValidator);
            let obj = {};
            if (searchdata) {
                obj = {
                    state: state,
                    $or: [
                        { content: { $like: '%' + searchdata + '%' } }
                    ]
                };
            }
            else {
                obj = { state: state };
            }
            let recordsFiltered = yield message_1.getCount(obj);
            let message = yield message_1.getMessageByType(obj, parseInt(start), parseInt(length));
            return response_1.sendOK(res, { message: message, draw: draw, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { start, length, draw, search } = req.query;
        try {
            let searchdata = search.value;
            const info = req.loginInfo;
            if (!info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            validator_1.validateCgi({ start: start, length: length, searchdata: undefined }, validator_2.messageValidator.pagination);
            let obj = {};
            if (searchdata) {
                obj = {
                    $or: [
                        { content: { $like: '%' + searchdata + '%' } },
                        { title: { $like: '%' + searchdata + '%' } }
                    ]
                };
            }
            let recordsFiltered = yield message_1.getCount(obj);
            let message = yield message_1.getMessageByType(obj, parseInt(start), parseInt(length));
            message.forEach(message => message.created = winston_1.timestamps(message.created));
            return response_1.sendOK(res, { message: message, draw: draw, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//发送系统消息
exports.router.put('/type/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let uuid = req.params["uuid"];
        try {
            const info = req.loginInfo;
            if (!info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            validator_1.validateCgi({ uuid }, validator_2.messageValidator.uuid);
            let message = yield message_1.updateMessage(uuid);
            return response_1.sendOK(res, { message: message });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//修改消息内容
exports.router.put('/content/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { content, title, username, useruuid } = req.body;
        let uuid = req.params["uuid"];
        try {
            const info = req.loginInfo;
            if (!info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            validator_1.validateCgi({ uuid, content, title, username, useruuid }, validator_2.messageValidator.contentValidator);
            let message = yield message_1.updateContent(content, uuid, title, username, useruuid);
            return response_1.sendOK(res, { message: message });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=message.js.map