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
const logindao_2 = require("../../redis/logindao");
const express_1 = require("express");
const crmuser_1 = require("../../model/ads/crmuser");
const users_1 = require("../../model/users/users");
const users_ext_1 = require("../../model/users/users_ext");
const utils_1 = require("../../lib/utils");
const amountlog_1 = require("../../model/users/amountlog");
//import { timeformat } from "./puton";
const winston_1 = require("../../config/winston");
exports.router = express_1.Router();
function setSetSingleField(obj, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { uuid, field, value, func } = obj;
        let user = yield crmuser_1.findByPrimary(uuid);
        if (!user)
            return response_1.sendNotFound(res, "用户不存在！");
        if (user[field] === value)
            return response_1.sendOK(res, user);
        user = yield func(uuid, value);
        delete user.password;
        return response_1.sendOK(res, user);
    });
}
//显示crmUser基本信息
exports.router.get("/mallcrmsuer", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { start, length, draw, search } = req.query;
        try {
            // const info: LoginInfo = (req as any).loginInfo
            // if (!info.isRoot() && !info.isAdminRW())
            //     return sendNoPerm(res)
            let searchdata = search.value;
            validator_2.validateCgi({ start, length, searchdata }, validator_1.crmuserValidator.pagination);
            let recordsFiltered = yield crmuser_1.findMallCount(searchdata);
            let crmusers = yield crmuser_1.findMallUserInfo(parseInt(start), parseInt(length), searchdata);
            return response_1.sendOK(res, { crmusers: crmusers, draw: draw, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//显示crmUser基本信息
exports.router.get("/", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { start, length, draw, search } = req.query;
        try {
            // const info: LoginInfo = (req as any).loginInfo
            // if (!info.isRoot() && !info.isAdminRW())
            //     return sendNoPerm(res)
            let searchdata = search.value;
            validator_2.validateCgi({ start, length, searchdata }, validator_1.crmuserValidator.pagination);
            let recordsFiltered = yield crmuser_1.findCount(searchdata);
            let crmusers = yield crmuser_1.findUserInfo(parseInt(start), parseInt(length), searchdata);
            return response_1.sendOK(res, { crmusers: crmusers, draw: draw, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get("/adminrw", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { start, length, draw, search } = req.query;
        try {
            // const info: LoginInfo = (req as any).loginInfo
            // if (!info.isRoot())
            //     return sendNoPerm(res)
            let searchdata = search.value;
            validator_2.validateCgi({ start, length, searchdata }, validator_1.crmuserValidator.pagination);
            let recordsFiltered = yield crmuser_1.findAdminrwCount(searchdata);
            let crmusers = yield crmuser_1.findAdminrwUserInfo(parseInt(start), parseInt(length), searchdata);
            return response_1.sendOK(res, { crmusers: crmusers, draw: draw, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.patch("/root", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { oldpassword, newpassword, confirmpassword } = req.body;
        try {
            const info = req.loginInfo;
            if (confirmpassword != newpassword)
                return response_1.sendErrMsg(res, "两次输入密码不一致！", 409);
            let root = yield crmuser_1.findByPassword(oldpassword, info.getUuid());
            if (root) {
                yield crmuser_1.modifiedPassword(newpassword, info.getUuid());
                return response_1.sendOK(res, { msg: "修改密码成功！" });
            }
            else {
                return response_1.sendErrMsg(res, "密码输入错误！", 409);
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get("/goodsOW", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { start, length, draw, search } = req.query;
        try {
            const info = req.loginInfo;
            let searchdata = search.value;
            validator_2.validateCgi({ start, length, searchdata }, validator_1.crmuserValidator.pagination);
            let recordsFiltered;
            let crmusers;
            if (info.isRoot()) {
                recordsFiltered = yield crmuser_1.findGoodsOWCount(searchdata);
                crmusers = yield crmuser_1.findGoodsOWUserInfo(parseInt(start), parseInt(length), searchdata);
            }
            if (info.isGoodsRO() || info.isGoodsRW()) {
                recordsFiltered = 1;
                crmusers = yield crmuser_1.findGoodsOW(info.getUuid());
            }
            return response_1.sendOK(res, { crmusers: crmusers, draw: draw, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/**
 *重构  app用户信息管理 write by wyho
 */
exports.router.post('/userInfoOption', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { start, length, draw, search, pointsort, balancesort, option } = req.body;
        try {
            let searchdata = search.value;
            validator_2.validateCgi({ start, length, searchdata }, validator_1.crmuserValidator.pagination);
            //validateCgi({ pointsort: pointsort, balancesort: balancesort }, crmuserValidator.sort)
            let recordsFiltered = yield users_1.getCount(req.app.locals.sequelize, searchdata);
            if (pointsort === undefined || pointsort === null)
                pointsort = '';
            if (balancesort === undefined || balancesort === null)
                balancesort = '';
            let appuser = yield users_1.getAllUsers(req.app.locals.sequelize, searchdata, parseInt(start), parseInt(length), pointsort, balancesort);
            //循环加created等字段到appuser
            // appuser.forEach(r => {
            //     r.created = timestamps(r.created)
            //     r.balance = r.balance / 100
            //     r.total_balance = r.total_balance / 100
            // })
            for (let i = 0; i < appuser.length; i++) {
                let r = appuser[i];
                let uuid = r.uuid;
                r.created = winston_1.timestamps(r.created);
                //拿取时间戳
                let timestamp = winston_1.timestamps(r.created);
                r.balance = r.balance / 100;
                r.total_balance = r.total_balance / 100;
                //获取零钱积分数据
                let getpointsandamount = yield amountlog_1.getBalanceorpoints(req.app.locals.sequelize, option, uuid, timestamp);
                r.points = getpointsandamount.points;
                r.amountlog = getpointsandamount.amountlog;
            }
            return response_1.sendOK(res, { appuser: appuser, draw: draw, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/**
 *app用户信息管理
 */
exports.router.get('/userInfo', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { start, length, draw, search, pointsort, balancesort } = req.query;
        try {
            let searchdata = search.value;
            validator_2.validateCgi({ start, length, searchdata }, validator_1.crmuserValidator.pagination);
            //validateCgi({ pointsort: pointsort, balancesort: balancesort }, crmuserValidator.sort)
            let recordsFiltered = yield users_1.getCount(req.app.locals.sequelize, searchdata);
            if (pointsort === undefined || pointsort === null)
                pointsort = '';
            if (balancesort === undefined || balancesort === null)
                balancesort = '';
            let appuser = yield users_1.getAllUsers(req.app.locals.sequelize, searchdata, parseInt(start), parseInt(length), pointsort, balancesort);
            appuser.forEach(r => {
                r.created = winston_1.timestamps(r.created);
                r.balance = r.balance / 100;
                r.total_balance = r.total_balance / 100;
            });
            return response_1.sendOK(res, { appuser: appuser, draw: draw, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/**
 *微信解绑
 */
exports.router.put('/mvbind/:useruuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const appuuid = req.params["useruuid"];
        const { openid } = req.body;
        try {
            const info = req.loginInfo;
            if (!info.isRoot() && !info.isAdminRW())
                return response_1.sendNoPerm(res);
            let userext = yield users_ext_1.findByPrimary(appuuid);
            if (userext) {
                if (userext.openid === openid) {
                    yield users_ext_1.updateOpenid(appuuid, null);
                    return response_1.sendOK(res, "ok");
                }
            }
            return response_1.sendErrMsg(res, "openid 不存在！", 409);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/**
 * 账户积分管理
 */
exports.router.get('/points', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { start, length, draw, search } = req.query;
        try {
            let searchdata = search.value;
            validator_2.validateCgi({ start, length, searchdata }, validator_1.crmuserValidator.pagination);
            let recordsFiltered = yield users_1.getCount(req.app.locals.sequlize, searchdata);
            let appuser = yield users_1.getAllUserPoints(req.app.locals.sequlize, searchdata, parseInt(start), parseInt(length));
            return response_1.sendOK(res, { appuser: appuser, draw: draw, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//删除appuser
exports.router.delete('/appuser/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            const info = req.loginInfo;
            if (!info.isRoot())
                return response_1.sendNoPerm(res);
            validator_2.validateCgi({ uuid }, validator_1.crmuserValidator.uuid);
            let crmusers = yield users_1.deleteUser(uuid);
            return response_1.sendOK(res, crmusers);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//删除crmuser
exports.router.delete('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            const info = req.loginInfo;
            if (!info.isRoot())
                return response_1.sendNoPerm(res);
            validator_2.validateCgi({ uuid: uuid }, validator_1.crmuserValidator.uuid);
            yield crmuser_1.deleteCrmuser(uuid);
            return response_1.sendOK(res, "删除成功！");
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// 修改APP User状态
exports.router.patch('/appuser_state', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { useruuid, state } = req.body;
        try {
            validator_2.validateCgi({ useruuid, state }, validator_1.crmuserValidator.setState);
            return yield setSetSingleField({ uuid: useruuid, field: "state", value: state, func: users_1.resetAppUserState }, req, res);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// 修改crm状态
exports.router.patch('/state', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { useruuid, state } = req.body;
        try {
            validator_2.validateCgi({ useruuid, state }, validator_1.crmuserValidator.setState);
            let crmuser = yield setSetSingleField({ uuid: useruuid, field: "state", value: state, func: crmuser_1.resetState }, req, res);
            return response_1.sendOK(res, { crmuser: crmuser });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//AdminRW分配管理advertiser
exports.router.patch("/mgruuids/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        const { mgruuids } = req.body;
        try {
            const info = req.loginInfo;
            if (!info.isRoot())
                return response_1.sendNoPerm(res);
            validator_2.validateCgi({ uuid: uuid, mgruuids: mgruuids }, validator_1.crmuserValidator.setMgruuids);
            let crmuser = yield crmuser_1.inserMgruuids(uuid, JSON.parse(mgruuids));
            response_1.sendOK(res, { crmuser: crmuser });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//禁用crm用户
exports.router.patch("/:uuid/state", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        const { state } = req.body;
        try {
            validator_2.validateCgi({ uuid, state }, validator_1.crmuserValidator.setState);
            let crmuser = yield crmuser_1.resetState(uuid, state);
            response_1.sendOK(res, { crmuser: crmuser });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// 修改密码
exports.router.patch('/password', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { useruuid, password } = req.body;
        try {
            validator_2.validateCgi({ useruuid, password }, validator_1.crmuserValidator.setPassword);
            return yield setSetSingleField({ uuid: useruuid, field: "state", value: password, func: crmuser_1.resetPassword }, req, res);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// admin查看crm用户
exports.router.get('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        const info = req.loginInfo;
        try {
            if (!info.isAdminRO() || !info.isAdminRW())
                return response_1.sendNoPerm(res);
            validator_2.validateCgi({ uuid }, validator_1.crmuserValidator.uuid);
            let user = yield crmuser_1.findByPrimary(uuid);
            delete user.password;
            return response_1.sendOK(res, user);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// 添加用户
exports.router.post('/crm', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { username, password, description, state, role } = req.body;
        let { perm, phone, email, realname, address, company } = req.body;
        const info = req.loginInfo;
        try {
            if (!info.isRoot() && !info.isAdminRW() && !info.isGoodsRW())
                return response_1.sendNoPerm(res);
            let user = yield crmuser_1.findByUsernames(username);
            if (user)
                return response_1.sendErrMsg(res, "该用账号已存在！", 409);
            let obj = { username, password, description, state, role, perm, phone, email, realname, address };
            validator_2.validateCgi(obj, validator_1.crmuserValidator.create);
            if (company) {
                obj.mgruuids = [company];
            }
            if (perm === "adsRW" && !company) {
                return response_1.sendNotFound(res, "miss company");
            }
            obj.perm = { [obj.perm]: 1 };
            let crmuser = yield crmuser_1.insertCrmUser(obj);
            delete crmuser.password; // 不返回密码
            return response_1.sendOK(res, crmuser);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// 登陆
exports.router.post('/login', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { username, password } = req.body;
        try {
            //校验参数
            validator_2.validateCgi({ username, password }, validator_1.crmuserValidator.login);
            let user = yield crmuser_1.findByUsername(username); //"ads"."crmuser"是否存在该用户
            if (!user) {
                let APPUSER = yield crmuser_1.findByAppUsername(username); //"ads"."crmuser"不存在该用户的时候，判断该用户是否为app用户
                if (!APPUSER) //不是app用户
                    return response_1.sendNotFound(res, "用户不存在！");
                utils_1.checkPassword(APPUSER.password, password); //检查密码是否正确
                let obj = {
                    username,
                    password,
                    uuid: APPUSER.uuid,
                    perm: { "appuser": 1 },
                    mgruuids: new Array() //空数组
                };
                let crmuuid = yield crmuser_1.new_insertCrmUser(obj); //app用户的记录插入到crm用户中
                // 生成token, key
                let [now, uuid] = [new Date(), crmuuid.uuid];
                let [token, key] = [utils_1.md5sum(`${now.getTime()}_${Math.random()}`), utils_1.md5sum(`${now.getTime()}_${Math.random()}`)];
                /* 缓存用户登陆信息到redis：key=uuid, value = {key:key, token:token, login:time, perm:perm}，
                    key是双方协商的密钥，token是临时访问令牌, perm是权限列表 */
                let cache = new logindao_2.LoginInfo(uuid, key, token, now.toLocaleString(), JSON.stringify(crmuuid.perm));
                yield logindao_2.setLoginAsync(uuid, cache);
                res.cookie("token", token, { maxAge: 90000000, httpOnly: false })
                    .cookie("uuid", uuid, { maxAge: 90000000, httpOnly: false });
                return response_1.sendOK(res, { key: key, perm: JSON.stringify(crmuuid.perm), token: token, uuid: uuid });
            }
            else {
                utils_1.checkPassword(user.password, password);
                // 生成token, key
                let [now, uuid] = [new Date(), user.uuid];
                let [token, key] = [utils_1.md5sum(`${now.getTime()}_${Math.random()}`), utils_1.md5sum(`${now.getTime()}_${Math.random()}`)];
                /* 缓存用户登陆信息到redis：key=uuid, value = {key:key, token:token, login:time, perm:perm}，
                    key是双方协商的密钥，token是临时访问令牌, perm是权限列表 */
                let cache = new logindao_2.LoginInfo(uuid, key, token, now.toLocaleString(), JSON.stringify(user.perm));
                yield logindao_2.setLoginAsync(uuid, cache);
                res.cookie("token", token, { maxAge: 90000000, httpOnly: false })
                    .cookie("uuid", uuid, { maxAge: 90000000, httpOnly: false });
                return response_1.sendOK(res, { key: key, perm: JSON.stringify(user.perm), token: token, uuid: uuid });
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// 登出
exports.router.post('/logout', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let loginInfo = req.loginInfo;
        logindao_2.delLogin(loginInfo.getUuid()); // 不等待
        return response_1.sendOK(res, { msg: "ok" });
    });
});
//# sourceMappingURL=crmuser.js.map