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
const resource_1 = require("../../config/resource");
const request_1 = require("../../lib/request");
const wechat_1 = require("../../config/wechat");
const wxpay_1 = require("../../config/wxpay");
const express_1 = require("express");
const utils_1 = require("../../lib/utils");
const wxtrade_1 = require("../../model/pay/wxtrade");
const upload_1 = require("../../lib/upload");
const users_1 = require("../../redis/users");
const logindao_1 = require("../../redis/logindao");
const response_1 = require("../../lib/response");
const logindao_2 = require("../../redis/logindao");
const sms_1 = require("../../lib/sms");
const users_2 = require("../../model/users/users");
const smscode_1 = require("../../model/users/smscode");
const users_ext_1 = require("../../model/users/users_ext");
const statistics_1 = require("../../model/users/statistics");
const reward_1 = require("../../model/users/reward");
const system_1 = require("../../model/system/system");
const amountmonitor_1 = require("../../lib/amountmonitor");
const captchapng = require("captchapng");
const invitation_1 = require("../../model/ads/invitation");
const inviterule_1 = require("../../model/ads/inviterule");
const logger = require("winston");
//新添加的
const crmuser_1 = require("../../model/ads/crmuser");
exports.router = express_1.Router();
//wx获取openid
exports.router.get('/wxopenid', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { code, type } = req.query;
        validator_1.validateCgi({ code }, validator_2.usersValidator.wxcode);
        try {
            let opt = type ? {
                url: "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + wechat_1.wxOpt.appid +
                    "&secret=" + wechat_1.wxOpt.secret + "&code=" + code + "&grant_type=authorization_code"
            } : {
                url: "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + wxpay_1.wxPayOpt.appid +
                    "&secret=" + wxpay_1.wxPayOpt.key0 + "&code=" + code + "&grant_type=authorization_code"
            };
            let re = yield request_1.getAsync(opt);
            let { openid, access_token } = JSON.parse(re);
            let opt2 = {
                url: "https://api.weixin.qq.com/sns/userinfo?access_token=" + access_token + "&openid=" + openid
            };
            let re2 = yield request_1.getAsync(opt2);
            let { headimgurl, nickname } = JSON.parse(re2);
            let user_ext = type ? (yield users_ext_1.findByOpenid(openid)) : (yield users_ext_1.findByAppOpenid(openid));
            logger.info(`-----the openid is :` + openid + `,` + type + `,` + user_ext);
            if (user_ext && user_ext.length > 0) { //绑定过手机了
                // 生成token, key
                let [now, uuid] = [new Date(), user_ext[0].uuid];
                let [token, key] = [utils_1.md5sum(`${now.getTime()}_${Math.random()}`), utils_1.md5sum(`${now.getTime()}_${Math.random()}`)];
                let cache = new logindao_1.LoginInfo(uuid, key, token, now.toLocaleString());
                // 缓存用户登陆信息到redis：key=uuid, value = {key:key, token:token, login:time}，key是双方协商的密钥，token是临时访问令牌
                yield logindao_1.setAppLoginAsync(uuid, cache);
                let user = yield users_2.findByPrimary(uuid);
                if (user.headurl.substring(0, 4) == 'http' && (user.headurl != headimgurl || user.nickname != nickname)) {
                    yield users_2.updateInformation(uuid, { headurl: headimgurl, nickname });
                }
                return response_1.sendOK(res, { key: key, token: token, uuid: uuid });
            }
            return response_1.sendOK(res, { openid, headimgurl, nickname });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//qq获取openid
exports.router.get('/qqopenid', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { token } = req.query;
        validator_1.validateCgi({ token }, validator_2.usersValidator.token);
        try {
            let opt = {
                url: "https://graph.qq.com/oauth2.0/me?access_token=" + token
            };
            let re = yield request_1.getAsync(opt);
            let openid = re.substring(re.indexOf(`"openid":"`) + 10, re.lastIndexOf(`"`));
            let opt2 = {
                url: "https://graph.qq.com/user/get_simple_userinfo?" +
                    "access_token=" + token + "&oauth_consumer_key=1105949172&openid=" + openid + "&format=json"
            };
            let re2 = yield request_1.getAsync(opt2);
            let { figureurl_qq_1, nickname } = JSON.parse(re2);
            let user_ext = yield users_ext_1.findByQQcode(openid);
            if (user_ext && user_ext.length > 0) { //绑定过手机了
                // 生成token, key
                let [now, uuid] = [new Date(), user_ext[0].uuid];
                let [token, key] = [utils_1.md5sum(`${now.getTime()}_${Math.random()}`), utils_1.md5sum(`${now.getTime()}_${Math.random()}`)];
                let cache = new logindao_1.LoginInfo(uuid, key, token, now.toLocaleString());
                // 缓存用户登陆信息到redis：key=uuid, value = {key:key, token:token, login:time}，key是双方协商的密钥，token是临时访问令牌
                yield logindao_1.setAppLoginAsync(uuid, cache);
                let user = yield users_2.findByPrimary(uuid);
                if (user.headurl.substring(0, 4) == 'http' && (user.headurl != figureurl_qq_1) || user.nickname != nickname) {
                    yield users_2.updateInformation(uuid, { headurl: figureurl_qq_1, nickname });
                }
                return response_1.sendOK(res, { key: key, token: token, uuid: uuid });
            }
            return response_1.sendOK(res, { openid, headimgurl: figureurl_qq_1, nickname });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//获取wx qq绑定情况,三种绑定
exports.router.get('/bindstatus', logindao_2.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { useruuid } = req.query;
        try {
            let user_ext = yield users_ext_1.findByPrimary(useruuid);
            return response_1.sendOK(res, { wxapp: user_ext.appopenid ? true : false, wx: user_ext.openid ? true : false, qq: user_ext.qqcode ? true : false });
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
//解绑wx,qq
exports.router.put('/unbind', logindao_2.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { useruuid, type } = req.body;
        try {
            let r = null;
            if (type == 'wx') {
                r = yield users_ext_1.updateOpenid(useruuid, null);
            }
            else if (type == 'qq') {
                r = yield users_ext_1.updateQQcode(useruuid, null);
            }
            else {
                r = yield users_ext_1.updateAppOpenid(useruuid, null);
            }
            if (r)
                return response_1.sendOK(res, { msg: "succ" });
            return response_1.sendErrMsg(res, "failed", 500);
        }
        catch (e) {
            return response_1.sendErrMsg(res, e, 500);
        }
    });
});
exports.router.get("/userslevel", logindao_2.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const loginInfo = req.loginInfo;
            let userInfo = yield users_2.finduserslevel(req.app.locals.sequelize, loginInfo.getUuid());
            return response_1.sendOK(res, { userInfo: userInfo });
        }
        catch (e) {
        }
    });
});
//获得（或者刷新）图形验证码的图片
exports.router.get('/captcha', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { username } = req.query;
        validator_1.validateCgi({ username }, validator_2.usersValidator.code);
        try {
            /*
                    if (await getCaptchaCode2(username))
                        return sendErrMsg(res, "操作过于频繁", 500)
                    await saveCaptchaCode2(username) */
            let code = parseInt(JSON.stringify(Math.random() * 9000 + 1000));
            yield users_1.saveCaptchaCode(username, JSON.stringify(code));
            let p = new captchapng(100, 30, code);
            p.color(0, 0, 0, 0);
            p.color(80, 80, 80, 255);
            let img = p.getBase64();
            let imgbase64 = new Buffer(img, 'base64');
            res.writeHead(200, {
                'Content-Type': 'image/png'
            });
            return res.end(imgbase64);
        }
        catch (e) {
            return response_1.sendError(res, e);
        }
    });
});
//第三方绑定,openid和qqcode二选一；code是短信验证码；username手机号
exports.router.post('/wxqq', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { username, code, openid, qqcode, headimgurl, nickname, type, password } = req.body;
        let obj = {
            username: username,
            perm: { "appuser": 1 },
            uuid: "",
            password,
            mgruuids: new Array()
        };
        try {
            validator_1.validateCgi({ code: code, username: username }, validator_2.usersValidator.wxqq);
            let us = yield users_2.getByUsername(username);
            let us_ext = undefined;
            if (us) {
                us_ext = yield users_ext_1.findByPrimary(us.uuid);
                if (us.headurl == null)
                    yield users_2.updateInformation(us.uuid, { headurl: headimgurl });
                if (us.nickname == null)
                    yield users_2.updateInformation(us.uuid, { nickname });
            }
            if (!type) { //qq
                if (qqcode && us && us_ext.qqcode && us_ext.qqcode != qqcode)
                    return response_1.sendNotFound(res, "用户绑定了其他qq号");
            }
            else if (type == 'wx') { //微信公众号
                if (openid && us && us_ext.openid && us_ext.openid != openid)
                    return response_1.sendNotFound(res, "用户绑定了其他微信号");
            }
            else if (type == 'wxapp') { //app微信
                if (openid && us && us_ext.appopenid && us_ext.appopenid != openid)
                    return response_1.sendNotFound(res, "用户绑定了其他微信号");
            }
            let s = yield users_1.getSmsCode(username);
            if (!s) {
                return response_1.sendErrMsg(res, "请先请求短信验证码", 500);
            }
            let m = JSON.parse(s);
            if (code == parseInt(m.code)) {
                let appuser;
                if (!us && !us_ext) { //新用户，要插入数据
                    if (openid)
                        appuser = yield users_2.wxqqInsertUser(req.app.locals.sequelize, username, openid, undefined, headimgurl, nickname, type, password); //得到插入到appuser的信息
                    else
                        appuser = yield users_2.wxqqInsertUser(req.app.locals.sequelize, username, undefined, qqcode, headimgurl, nickname, undefined, password);
                    obj.uuid = appuser.uuid; //取得appuser的uuid
                    //插入记录到crm系统的用户中
                    yield crmuser_1.new_insertCrmUser(obj); //插入注册用户的记录到crm用户中,且uuid的值等于appuser
                    yield invitation_1.insertInvitation(appuser.uuid, username);
                }
                else { //旧用户，可能需要登记openid或者qqcode
                    if (openid && (!!!us_ext.openid || !!!us_ext.appopenid)) { //绑定微信号
                        if (type == 'wxapp')
                            yield users_ext_1.updateAppOpenid(us_ext.uuid, openid);
                        if (type == 'wx')
                            yield users_ext_1.updateOpenid(us_ext.uuid, openid);
                    }
                    else if (qqcode && us_ext.qqcode == null) { //绑定qq号
                        yield users_ext_1.updateQQcode(us_ext.uuid, qqcode);
                    }
                }
                users_1.removeSmsCode(username); // 不等待
                let users = yield users_2.getByUsername(username);
                // 生成token, key
                let [now, uuid] = [new Date(), users.uuid];
                let [token, key] = [utils_1.md5sum(`${now.getTime()}_${Math.random()}`), utils_1.md5sum(`${now.getTime()}_${Math.random()}`)];
                let cache = new logindao_1.LoginInfo(uuid, key, token, now.toLocaleString());
                // 缓存用户登陆信息到redis：key=uuid, value = {key:key, token:token, login:time}，key是双方协商的密钥，token是临时访问令牌
                yield logindao_1.setAppLoginAsync(uuid, cache);
                return response_1.sendOK(res, { key: key, token: token, uuid: uuid });
            }
            return response_1.sendNotFound(res, "验证码有误!");
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//app 用户注册
exports.router.post('/reg', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { username, password, code, invite, openid, nickname, platform } = req.body;
        let obj = {
            username,
            password,
            perm: { "appuser": 1 },
            uuid: "",
            mgruuids: new Array()
        };
        try {
            validator_1.validateCgi({ code: code, username: username, password: password }, validator_2.usersValidator.register);
            let us = yield users_2.getByUsername(username);
            if (us) {
                return response_1.sendNotFound(res, "用户已存在!");
            }
            let a = yield users_1.getCaptchaCode3(username);
            if (!a && !platform) {
                return response_1.sendErrMsg(res, "未通过图形验证", 500);
            }
            let s = yield users_1.getSmsCode(username);
            if (!s) {
                return response_1.sendErrMsg(res, "请先请求短信验证码", 500);
            }
            if (invite) {
                let inv = yield users_1.getInvite(invite);
                if (inv)
                    return response_1.sendErrMsg(res, "邀请过于频繁", 500);
            }
            let m = JSON.parse(s);
            if (code == parseInt(m.code)) {
                if (!openid)
                    openid = null;
                if (openid && openid !== undefined && openid !== 'undefined') {
                    let user_ext = yield users_ext_1.findByOpenid(openid);
                    if (user_ext && user_ext.length > 0) {
                        logger.error("openid 已存在,如需解绑请联系客服。" + openid);
                        return response_1.sendNotFound(res, "该微信用户已绑定，如需解绑请联系客服。");
                    }
                }
                if (password === "123456789") {
                    logger.error("invalid password", s, JSON.stringify(req.body));
                    return response_1.sendNotFound(res, "密码太简单!");
                }
                let appuser = yield users_2.insertUsers(req.app.locals.sequelize, username, password, nickname, openid); //得到插入到appuser的信息
                obj.uuid = appuser.uuid; //取得appuser的uuid
                //插入记录到crm系统的用户中
                yield crmuser_1.new_insertCrmUser(obj); //插入注册用户的记录到crm用户中,且uuid的值等于appuser
                users_1.removeSmsCode(username); // 不等待
                let users = yield users_2.getByUsername(username);
                let invtation = yield invitation_1.insertInvitation(users.uuid, username);
                if (invite && invite !== "undefined") {
                    const invitator = invite;
                    let oldinvtation = yield invitation_1.getByPhone(invite);
                    if (!oldinvtation) {
                        yield users_2.deleteUser(users.uuid);
                        return response_1.sendNotFound(res, "邀请码不存在!");
                    }
                    invite = oldinvtation.invite;
                    let parentinvtation = yield invitation_1.getByInvite(invite);
                    if (parentinvtation) {
                        let inviterul = yield inviterule_1.getInviteRule(req.app.locals.sequelize);
                        let points = inviterul.invitepoint ? inviterul.invitepoint : 0;
                        let parentpoints = inviterul.parentinvitepoint ? inviterul.parentinvitepoint : 0;
                        let balance = inviterul.invitebalance ? inviterul.invitebalance : 0;
                        let parentbalance = inviterul.parentinvitebalance ? inviterul.parentinvitebalance : 0;
                        yield users_ext_1.updatePoints(parentinvtation.useruuid, { points: parentpoints, balance: parentbalance, exp: 0 }); //邀请人得积分和零钱
                        yield amountmonitor_1.amountcheck(req.app.locals.sequelize, parentinvtation.useruuid, "invite", parentbalance / 100, parentpoints);
                        logger.debug(`用户${parentinvtation.useruuid}邀请手机号为${username}的用户注册获得points${parentpoints}balance${parentbalance}`);
                        yield users_ext_1.updatePoints(users.uuid, { points: points, balance: balance, exp: 0 }); //注册人得积分和零钱
                        logger.debug(`用户${users.uuid}通过注册获得points${points}balance${balance}`);
                        let system = yield system_1.findByName('numcondition');
                        yield users_2.updatePointlottery(parentinvtation.useruuid, parseInt(system.content.invite)); //邀请用户加抽奖机会
                        logger.debug(`用户${parentinvtation.useruuid}邀请手机号为${username}的用户注册获得${parseInt(system.content.invite)}次抽奖次数`);
                        yield invitation_1.updateInvitation(parseInt(invite), invtation.invite);
                        let reward = {
                            useruuid: users.uuid,
                            username: users.username,
                            realname: users.realname,
                            balance: balance,
                            point: inviterul.invitepoint,
                            type: 'register'
                        };
                        yield reward_1.insertReward(reward);
                        let rewardparent = {
                            useruuid: parentinvtation.useruuid,
                            balance: parentbalance,
                            point: inviterul.invitepoint,
                            type: 'registerparent'
                        };
                        yield reward_1.insertReward(rewardparent);
                        yield users_1.saveInvite(invitator, "inviting"); //防海量邀请
                    }
                }
                // 生成token, key
                let [now, uuid] = [new Date(), users.uuid];
                let [token, key] = [utils_1.md5sum(`${now.getTime()}_${Math.random()}`), utils_1.md5sum(`${now.getTime()}_${Math.random()}`)];
                let cache = new logindao_1.LoginInfo(uuid, key, token, now.toLocaleString());
                // 缓存用户登陆信息到redis：key=uuid, value = {key:key, token:token, login:time}，key是双方协商的密钥，token是临时访问令牌
                yield logindao_1.setAppLoginAsync(uuid, cache);
                return response_1.sendOK(res, { key: key, token: token, uuid: uuid });
            }
            return response_1.sendNotFound(res, "验证码有误!");
        }
        catch (e) {
            response_1.sendError(res, e);
        }
    });
});
// 发送短信
exports.router.get('/message', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { phone, type, code, username } = req.query;
        if (!phone) {
            phone = username;
        }
        try {
            validator_1.validateCgi({ phone: phone }, validator_2.usersValidator.phone);
            if (yield users_1.getSmsCode(phone)) {
                return response_1.sendOK(res, { msg: "ok" });
            }
            if (type && code) {
                let c = yield users_1.getCaptchaCode(phone);
                if (parseInt(c) != parseInt(code))
                    return response_1.sendErrMsg(res, "图形验证码错误", 502);
                yield users_1.saveCaptchaCode3(phone);
            }
            let body = yield sms_1.sendSms(phone); // "{"code":200,"msg":"1501","obj":"1121"}"
            // let body = JSON.stringify({ obj: "1234", "code": 200 })
            let m = JSON.parse(body);
            let cache = { body: body, code: m.obj };
            users_1.saveSmsCode(phone, JSON.stringify(cache)); // 不等待
            smscode_1.insertSmsCode(phone, { code: m.obj }); // 不等待
            return response_1.sendOK(res, { msg: "ok" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// 修改密码
exports.router.put('/username', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { username, password, code } = req.body;
        try {
            validator_1.validateCgi({ code: code, username: username, password: password }, validator_2.usersValidator.setPassword);
            let s = yield users_1.getSmsCode(username);
            if (!s) {
                return response_1.sendNotFound(res, "请先请求验证码!");
            }
            let m = JSON.parse(s);
            if (code === m.code) {
                yield users_2.updatePassword(username, password);
                users_1.removeSmsCode(username); // 不等待
                return response_1.sendOK(res, { msg: "ok" });
            }
            return response_1.sendNotFound(res, "验证码有误!");
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// 充值
exports.router.put('/recharge/:uuid', logindao_2.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { moment } = req.body;
        const uuid = req.params['uuid'];
        try {
            const loginInfo = req.loginInfo;
            let wxtrade = yield wxtrade_1.findByprimay(uuid);
            if (!wxtrade)
                return response_1.sendErrMsg(res, "不存在的UUID", 500);
            moment = wxtrade.total_fee;
            validator_1.validateCgi({
                uuid: loginInfo.getUuid(),
                moment: moment
            }, validator_2.usersValidator.moment);
            if (wxtrade.state != 'fin' || wxtrade.status == 1)
                return response_1.sendErrMsg(res, "已充值，或者还未支付成功", 500);
            yield users_ext_1.recharge(loginInfo.getUuid(), moment);
            yield wxtrade_1.updateStatusByUUID(wxtrade.uuid, 1);
            yield amountmonitor_1.amountcheck(req.app.locals.sequelize, loginInfo.getUuid(), "recharge", moment / 100, 0);
            let user_ext = yield users_ext_1.findByPrimary(loginInfo.getUuid());
            user_ext.balance = user_ext.balance / 100;
            user_ext.total_balance = user_ext.total_balance / 100;
            return response_1.sendOK(res, { user_ext: user_ext });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
function findUserInfo(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let user = yield users_2.findByPrimary(uuid);
        let user_ext = yield users_ext_1.findByPrimary(uuid);
        if (!(user && user_ext))
            throw new Error("用户不存在！");
        let exclude = new Set();
        exclude.add("password").add("modified");
        let merge = {};
        for (let k in user) {
            if (exclude.has(k))
                continue;
            merge[k] = user[k];
        }
        return merge;
    });
}
//获得用户信息
exports.router.get('/info', logindao_2.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const loginInfo = req.loginInfo;
            let users = yield users_2.findByPrimary(loginInfo.getUuid());
            let users_ext = yield users_ext_1.findByPrimary(loginInfo.getUuid());
            delete users.password;
            return response_1.sendOK(res, { users: users, users_ext });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//抽奖获得用户信息
exports.router.get('/userinfo', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let useruuid = req.headers.uuid;
            let users = null;
            if (useruuid) {
                users = yield users_2.findByPrimary(useruuid);
                delete users.password;
            }
            return response_1.sendOK(res, { users: users });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.put('/message/:uuid', logindao_2.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { nickname, address, headurl, sex, birthday } = req.body;
        let uuid = req.params["uuid"];
        try {
            let obj;
            if (nickname)
                obj = { uuid: uuid, nickname: nickname };
            if (address)
                obj = { uuid: uuid, address: address };
            if (headurl)
                obj = { uuid: uuid, headurl: headurl };
            if (sex)
                obj = { uuid: uuid, sex: sex };
            if (birthday)
                obj = { uuid: uuid, birthday: birthday };
            validator_1.validateCgi(obj, validator_2.usersValidator.patchInfo);
            delete obj.uuid;
            let merge = yield users_2.updateInformation(uuid, obj);
            return response_1.sendOK(res, merge);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// 修改个人信息
exports.router.put('/:uuid', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { nickname, realname, idcard, address, headurl, sex, birthday, interest, description } = req.body;
        let uuid = req.params["uuid"];
        try {
            let obj = {
                uuid: uuid,
                nickname: (nickname === "undefined" ? null : nickname),
                realname: (realname === "null" ? null : realname),
                idcard: idcard,
                address: (address === "undefined" ? null : address),
                headurl: headurl,
                sex: sex,
                birthday: (birthday === "undefined" ? null : birthday),
                interest: interest,
                description: description
            };
            validator_1.validateCgi(obj, validator_2.usersValidator.information);
            delete obj.uuid;
            yield users_2.updateInformation(uuid, obj);
            let merge = findUserInfo(uuid);
            return response_1.sendOK(res, merge);
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
            validator_1.validateCgi({ username: username, password: password }, validator_2.usersValidator.applogin);
            let user = yield users_2.getByUsername(username);
            if (!user)
                return response_1.sendNotFound(res, "用户不存在！");
            if (user.state === "off")
                return response_1.sendNotFound(res, "用户已被禁用,请联系管理员！");
            if (user.password == null)
                return response_1.sendErrMsg(res, "密码不存在，可能是第三方用户", 500);
            utils_1.checkPassword(user.password, password);
            let obj = {
                useruuid: user.uuid,
                loginnumber: 1,
                searchnumber: 0,
                favoritenumber: 0,
                type: 'ads',
            };
            validator_1.validateCgi({ loginnumber: obj.loginnumber, searchnumber: obj.searchnumber, favoritenumber: obj.favoritenumber, type: obj.type }, validator_2.usersValidator.obj);
            yield statistics_1.insertStatistics(obj);
            // 生成token, key
            let [now, uuid] = [new Date(), user.uuid];
            let [token, key] = [utils_1.md5sum(`${now.getTime()}_${Math.random()}`), utils_1.md5sum(`${now.getTime()}_${Math.random()}`)];
            let cache = new logindao_1.LoginInfo(uuid, key, token, now.toLocaleString());
            // 缓存用户登陆信息到redis：key=uuid, value = {key:key, token:token, login:time}，key是双方协商的密钥，token是临时访问令牌
            yield logindao_1.setAppLoginAsync(uuid, cache);
            return response_1.sendOK(res, { key: key, token: token, uuid: uuid });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// 登出
exports.router.post('/logout', logindao_2.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let loginInfo = req.loginInfo;
        logindao_1.delAppLogin(loginInfo.getUuid()); // 不等待
        return response_1.sendOK(res, { msg: "ok" });
    });
});
exports.router.get('/test', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        return response_1.sendOK(res, { msg: "test ok" });
    });
});
exports.router.post('/headimg', logindao_2.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const loginInfo = req.loginInfo;
            let newPath = yield upload_1.uploadHeadImg(req, {
                uuid: loginInfo.getUuid(),
                tmpDir: resource_1.headImgOpt.tmpDir,
                maxSize: resource_1.headImgOpt.maxSize,
                extnames: resource_1.headImgOpt.extnames,
                targetDir: resource_1.headImgOpt.targetDir,
                fieldName: resource_1.headImgOpt.fieldName,
            });
            return response_1.sendOK(res, newPath);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// 微信绑定时，请求微信授权
exports.router.get('/bind', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const code = req.query["code"];
        const tokenUrl = "https://api.weixin.qq.com/sns/oauth2/access_token";
        let url = `${tokenUrl}?appid=${wechat_1.wxOpt.appid}&secret=${wechat_1.wxOpt.secret}&code=${code}&grant_type=authorization_code`;
        try {
            let body = yield request_1.getAsync({ url: url });
            let m = JSON.parse(body);
            if (!m) {
                logger.info("wx oauth2 fail", body);
                return res.status(401);
            }
            const openid = m.openid;
            if (!openid) {
                logger.info("wx oauth2 fail", body);
                return res.status(401);
            }
            yield users_1.saveOpenid(openid);
            return res.redirect(`${wechat_1.wxOpt.bindRedirect}?openid=${openid}&t=${new Date().getTime()}`);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// 微信绑定时，请求微信授权
exports.router.get('/regiester/bind', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const code = req.query["code"];
        const tokenUrl = "https://api.weixin.qq.com/sns/oauth2/access_token";
        let url = `${tokenUrl}?appid=${wechat_1.wxOpt.appid}&secret=${wechat_1.wxOpt.secret}&code=${code}&grant_type=authorization_code`;
        try {
            let body = yield request_1.getAsync({ url: url });
            let m = JSON.parse(body);
            if (!m) {
                logger.info("wx oauth2 fail", body);
                return res.status(401);
            }
            const openid = m.openid;
            if (!openid) {
                logger.info("wx oauth2 fail", body);
                return res.status(401);
            }
            yield users_1.saveOpenid(openid);
            return res.redirect(`${wechat_1.wxOpt.registerBindRedirect}?openid=${openid}&t=${new Date().getTime()}`);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// 绑定用户微信openid
exports.router.post('/bind', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { openid } = req.query;
        const { username, password } = req.body;
        try {
            if (!openid)
                return response_1.sendNotFound(res, "openid不存在！");
            validator_1.validateCgi({ username: username, password: password }, validator_2.usersValidator.bind);
            const id = yield users_1.getOpenid(openid);
            if (!id)
                return response_1.sendNotFound(res, "openid不存在！");
            let user = yield users_2.checkUser(username, password);
            if (!user)
                return response_1.sendNotFound(res, "用户不存在！");
            let user_ext = yield users_ext_1.findByOpenid(openid);
            if (user_ext.length > 0)
                return response_1.sendNotFound(res, "openid 已存在,如需解绑请联系客服。");
            yield users_ext_1.updateOpenid(user.uuid, openid);
            return response_1.sendOK(res, { msg: "ok" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
// 查询用户信息
exports.router.get('/:uuid', logindao_2.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            validator_1.validateCgi({ uuid: uuid }, validator_2.usersValidator.uuid);
            let merge = yield findUserInfo(uuid);
            return response_1.sendOK(res, merge);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/appuser/:uuid', logindao_2.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            validator_1.validateCgi({ uuid: uuid }, validator_2.usersValidator.uuid);
            let user = yield users_2.findByPrimary(uuid);
            let user_ext = yield users_ext_1.findByPrimary(uuid);
            if (!(user && user_ext))
                throw new Error("用户不存在！");
            delete user.password;
            user_ext.balance = user_ext.balance / 100;
            user_ext.total_balance = user_ext.total_balance / 100;
            return response_1.sendOK(res, { user: user, user_ext: user_ext });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.patch('/appuser/:uuid', logindao_2.checkAppLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = req.params["uuid"];
        try {
            validator_1.validateCgi({ uuid: uuid }, validator_2.usersValidator.uuid);
            let user = yield users_2.findByPrimary(uuid);
            let user_ext = yield users_ext_1.findByPrimary(uuid);
            if (!(user && user_ext))
                throw new Error("用户不存在！");
            delete user.password;
            user_ext.balance = user_ext.balance / 100;
            user_ext.total_balance = user_ext.total_balance / 100;
            return response_1.sendOK(res, { user: user, user_ext: user_ext });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/* router.post('/abcd', async function (req: Request, res: Response, next: NextFunction) {
    let users = await findNullPass(req.app.locals.sequelize)
    let count = 0
    for (let i = 0; i < users.length; i++) {
        let res = await getByPhone(users[i].username)
        if (!res) {
            await insertInvitation(users[i].uuid, users[i].username)
            count++
        }
    }
    return sendOK(res, { count })
}) */ 
//# sourceMappingURL=users.js.map