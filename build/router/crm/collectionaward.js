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
const logindao_1 = require("../../redis/logindao");
exports.router = express_1.Router();
const response_1 = require("../../lib/response");
// import { validateCgi } from "../../lib/validator"
// import { collectionValidator } from "./validator"
const collectionaward_1 = require("../../model/mall/collectionaward");
//�����ռ��������Ϣ
exports.router.post('/collectAward', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { fortune, emolument, longevity, property, happiness } = req.body;
        try {
            // const info: LoginInfo = (req as any).loginInfo
            // if (!info.isAdminRW() && !info.isRoot())
            //     return sendNoPerm(res)
            let tmp = {
                fortune: fortune,
                emolument: emolument,
                longevity: longevity,
                property: property,
                happiness: happiness
            };
            let uuid = "99e892f2-24b8-467c-bc68-c710a8b95206";
            // let addcollections = await awardcollection(tmp)
            let addcollections = yield collectionaward_1.awardcollection(tmp, uuid);
            return response_1.sendOK(res, addcollections);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//�ռ����߻�鿴���ƹ�����
exports.router.get('/selectAll', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const info = req.loginInfo;
            //              validateCgi({ uuid: uuid }, advertiserValidator.UUID)
            if (!info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            let ac_ext = yield collectionaward_1.find_All_award();
            return response_1.sendOK(res, ac_ext); //����ac_ext����Ϣ
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//�ռ����߻����ɾ������
exports.router.post('/delete', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const info = req.loginInfo;
            if (!info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            yield collectionaward_1.deleteAward(); //ɾ��
            return response_1.sendOK(res, { "data": "deleteOk" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=collectionaward.js.map