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
const response_1 = require("../../lib/response");
const logindao_1 = require("../../redis/logindao");
const express_1 = require("express");
const crmuser_1 = require("../../model/mall/crmuser");
const crmuser_2 = require("../../model/ads/crmuser");
const users_1 = require("../../model/users/users");
const users_ext_1 = require("../../model/users/users_ext");
const levels_1 = require("../../model/users/levels");
const utils_1 = require("../../lib/utils");
const crmuser_3 = require("../../model/ads/crmuser");
//新添加
const advertiser_1 = require("../../model/ads/advertiser");
exports.router = express_1.Router();
function setSetSingleField(obj, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const info = req.loginInfo;
        if (!info.isRoot())
            return response_1.sendNoPerm(res);
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
exports.router.patch("/exp/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { exp } = req.body;
        const uuid = req.params["uuid"];
        try {
            validator_2.validateCgi({ uuid, exp }, validator_1.crmuserValidator.expValidator);
            let users = yield users_ext_1.updateexp(uuid, exp);
            return response_1.sendOK(res, { users: users });
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
// 修改状态
exports.router.patch('/state', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { useruuid, state } = req.body;
        try {
            validator_2.validateCgi({ useruuid, state }, validator_1.crmuserValidator.setState);
            return yield setSetSingleField({ uuid: useruuid, field: "state", value: state, func: crmuser_1.resetState }, req, res);
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
exports.router.delete('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const useruuid = req.params['uuid'];
        try {
            const info = req.loginInfo;
            if (!info.isRoot())
                return response_1.sendNoPerm(res);
            validator_2.validateCgi({ useruuid }, validator_1.crmuserValidator.usruuid);
            yield crmuser_1.deleteGoodsUser(useruuid);
            return response_1.sendOK(res, { msg: "删除成功" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//查看所有会员的信息
exports.router.get("/users", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { start, length, draw, search } = req.query;
        try {
            let searchdata = search.value;
            validator_2.validateCgi({ start, length, searchdata }, validator_1.crmuserValidator.pagination);
            let maxexp = yield levels_1.getMaxExp(req.app.locals.sequelize);
            let users = yield users_1.getUserAndlevels(req.app.locals.sequelize, searchdata, parseInt(start), parseInt(length));
            let recordsFiltered = yield users_1.getUserAndlevelsCount(req.app.locals.sequelize, searchdata);
            users.forEach(r => {
                r.total_balance = r.total_balance / 100;
                r.balance = r.balance / 100;
            });
            return response_1.sendOK(res, { users: users, maxexp: maxexp, draw: draw, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.delete("/users/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            validator_2.validateCgi({ uuid }, validator_1.crmuserValidator.uuid);
            let users = yield users_1.deleteusers(uuid);
            return response_1.sendOK(res, { users: users });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.put("/users/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        const { state } = req.body;
        try {
            validator_2.validateCgi({ uuid }, validator_1.crmuserValidator.uuid);
            let users = yield users_1.resetAppUserState(uuid, state);
            return response_1.sendOK(res, { users: users });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// admin查询所有crm用户
// GET /users/?page&count[&created][&order&desc]
exports.router.get('/', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { order, desc, start, length, draw, search } = req.query;
        try {
            let searchdata = search.value;
            const info = req.loginInfo;
            if (!info.isRoot() && !info.isAdminRO() && !info.isAdminRW())
                return response_1.sendNoPerm(res);
            validator_2.validateCgi({ order, desc, start, length, searchdata }, validator_1.crmuserValidator.findAll);
            let recordsFiltered = yield crmuser_1.findAllByCount(req.app.locals.sequelize, searchdata);
            let crmUsers = yield crmuser_1.findAllBy(req.app.locals.sequelize, searchdata, parseInt(start), parseInt(length));
            return response_1.sendOK(res, { crmUsers: crmUsers, draw: draw, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// 添加用户
exports.router.post('/crm', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { username, password, description, state, perm, phone, email, realname } = req.body;
        const info = req.loginInfo;
        try {
            if (!info.isRoot() && !info.isAdminRW())
                return response_1.sendNoPerm(res);
            let obj = { username, password, description, state, perm, phone, email, realname };
            validator_2.validateCgi(obj, validator_1.crmuserValidator.create);
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
            //       validateCgi({ username: username, password: password }, crmuserValidator.login)
            let user = yield crmuser_1.findByUsername(username); //"ads"."crmuser"是否存在该用户
            if (!user) {
                let APPUSER = yield crmuser_3.findByAppUsername(username); //"ads"."crmuser"不存在该用户的时候，判断该用户是否为app用户
                if (!APPUSER) { //不是app用户
                    return response_1.sendNotFound(res, "用户不存在！");
                }
                utils_1.checkPassword(APPUSER.password, password); //检查密码是否正确
                let obj = {
                    username: username,
                    password: password,
                    uuid: APPUSER.uuid,
                    perm: { "appuser": 1 },
                    mgruuids: new Array() //空数组
                };
                let crmuuid = yield crmuser_3.new_insertCrmUser(obj); //app用户的记录插入到crm用户中
                // 生成token, key
                let [now, uuid] = [new Date(), crmuuid.uuid];
                let [token, key] = [utils_1.md5sum(`${now.getTime()}_${Math.random()}`), utils_1.md5sum(`${now.getTime()}_${Math.random()}`)];
                /* 缓存用户登陆信息到redis：key=uuid, value = {key:key, token:token, login:time, perm:perm}，
                    key是双方协商的密钥，token是临时访问令牌, perm是权限列表 */
                let cache = new logindao_1.LoginInfo(uuid, key, token, now.toLocaleString(), JSON.stringify(crmuuid.perm));
                yield logindao_1.setLoginAsync(uuid, cache);
                res.cookie("token", token, { maxAge: 90000000, httpOnly: false })
                    .cookie("uuid", uuid, { maxAge: 90000000, httpOnly: false });
                return response_1.sendOK(res, { key: key, perm: JSON.stringify(crmuuid.perm), token: token, uuid: uuid });
            }
            else {
                utils_1.checkPassword(user.password, password);
                utils_1.checkState('off', user.state);
                // 生成token, key
                let [now, uuid] = [new Date(), user.uuid];
                let [token, key] = [utils_1.md5sum(`${now.getTime()}_${Math.random()}`), utils_1.md5sum(`${now.getTime()}_${Math.random()}`)];
                /* 缓存用户登陆信息到redis：key=uuid, value = {key:key, token:token, login:time, perm:perm}，
                    key是双方协商的密钥，token是临时访问令牌, perm是权限列表 */
                let cache = new logindao_1.LoginInfo(uuid, key, token, now.toLocaleString(), JSON.stringify(user.perm));
                yield logindao_1.setLoginAsync(uuid, cache);
                let advertiseruuid = yield crmuser_2.queryadvByuuid(uuid);
                res.cookie("token", token, { maxAge: 90000000, httpOnly: false })
                    .cookie("uuid", uuid, { maxAge: 90000000, httpOnly: false });
                if (advertiseruuid.get('mgruuids') == undefined || advertiseruuid.get('mgruuids') == null || advertiseruuid.get('mgruuids').length == 0) {
                    return response_1.sendOK(res, { key: key, perm: JSON.stringify(user.perm), token: token, uuid: uuid });
                }
                else {
                    return response_1.sendOK(res, { key: key, perm: JSON.stringify(user.perm), token: token, uuid: uuid, advertiseruuid: advertiseruuid.get('mgruuids') });
                }
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
        logindao_1.delLogin(loginInfo.getUuid()); // 不等待
        return response_1.sendOK(res, { msg: "ok" });
    });
});
// admin查看crm用户
exports.router.get('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
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
//获取余额和余额状态的接口
exports.router.get('/adv_balance/:crmuuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const crmuuid = req.params["crmuuid"];
            let user_ext_info = yield advertiser_1.find_one_users_ext_table_information(crmuuid);
            user_ext_info.balance = ((user_ext_info.crm_balance) / 100).toFixed(2);
            user_ext_info.balance_state = user_ext_info.balance <= 0 ? 2 : 1;
            let advinfo = yield advertiser_1.find_AdvInfo_by_crmuuid(crmuuid);
            return response_1.sendOK(res, { balance: user_ext_info.balance, points: user_ext_info.crm_points, balance_state: user_ext_info.balance_state, dailybudget: advinfo.dailybudget });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=crmuser.js.map