import { validateCgi } from "../../../lib/validator"
//用户基本信息校验
import { usersValidator } from "./validator"
//生成验证码图片
const captchapng = require("captchapng")
//发送手机验证码
import { sendSms } from "../../../lib/sms"
import { Router, Request, Response, NextFunction } from "express"
import { saveCaptchaCode, getCaptchaCode, saveSmsCode, getSmsCode, getInviteCode, saveInviteCode } from "../../../redis/users"
import { sendError as se, sendOk, sendErrMsg } from "../../../lib/response"
import { getwxOpenId, getqqOpenId } from "../../../lib/wxqqutil"
import { md5sum } from "../../../lib/utils"
//用户基本信息
import { selectUser, updateExceptionUser, insertUser } from "../../../model/users/userutil/user"
//邀请记录
import { insertInviteLog } from "../../../model/user_operation_record/invitelog"
//查询奖励规则
import { findSystemAward } from "../../../model/user_operation_record/invitelog"
export const router = Router()


/**
 * 用户注册模块
 * qiuweihao  
 * 2018.06.22
 */



//获得（或者刷新）图形验证码的图片 qiuweihao 06-25
router.get('/registered/verificationpic', async function (req: Request, res: Response, next: NextFunction) {
    let { username } = (req as any).query;
    validateCgi({ username }, usersValidator.phone);
    try {
        //生成验证码
        let code = parseInt(JSON.stringify(Math.random() * 9000 + 1000));
        //保存验证码->redis
        await saveCaptchaCode(username, JSON.stringify(code));
        //生成验证码图片
        let p = new captchapng(100, 30, code);
        p.color(0, 0, 0, 0);
        p.color(80, 80, 80, 255);
        let img = p.getBase64();
        let imgbase64 = new Buffer(img, 'base64');
        //返回响应头
        res.writeHead(200, {
            'Content-Type': 'image/png'
        })
        //返回图片
        return res.end(imgbase64);
    } catch (e) {
        return e.info(se, res, e)
    }
})

//图型验证码单独验证  qiuweihao 06-25
router.get('/registered/verificationcode', async function (req: Request, res: Response, next: NextFunction) {
    try {
        //piccode->图片验证码  username->用户手机号
        let { piccode, username } = (req as any).query;
        validateCgi({ username, piccode }, usersValidator.verificationcode);
        //获取缓存验证码
        let code = await getCaptchaCode(username);
        if (code === piccode) {
            //发送手机验证码
            let body = await sendSms(username);     // "{"code":200,"msg":"1501","obj":"1121"}"
            let m = JSON.parse(body);
            let cache = { body: body, code: m.obj }
            //手机验证码缓存3分钟
            saveSmsCode(username, JSON.stringify(cache)); // 不等待
            return sendOk(res, { msg: "ok" });
        } else {
            return sendErrMsg(res, "图形验证码错误", 502);
        }
    } catch (e) {
        return e.info(se, res, e);
    }
})

//手机验证码单独校验  qiuweihao 06-25
router.get('/registered/verificationphone', async function (req: Request, res: Response, next: NextFunction) {
    try {
        //piccode->图片验证码  username->用户手机号
        let { username, phonecode } = (req as any).query;
        validateCgi({ username, phonecode }, usersValidator.verificationphonecode);
        //获取手机验证码缓存
        let sms = await getSmsCode(username);
        if (!sms) {
            return sendErrMsg(res, "请先请求短信验证码", 500);
        }
        let message = JSON.parse(sms);
        if (phonecode == parseInt(message.code)) {
            return sendOk(res, { msg: "ok" });
        } else {
            return sendErrMsg(res, "手机验证码错误", 502);
        }
    } catch (e) {
        return e.info(se, res, e);
    }
})

// //用户注册    qiuweihao 06-25
router.post('/registered', async function (req: Request, res: Response, next: NextFunction) {
    try {
        //mode 注册用户入口方式：二维码，微信，qq，app主动注册    invitationcode 邀请码  微信授权：wxcode  qq授权：qqcode
        let { username, password, mode, invitationcode, wxcode, qqcode } = (req as any).query;
        //查询该邀请码对应的用户
        let inviteUser;
        if (invitationcode) {
            inviteUser = await selectUser(invitationcode);
            //判断该邀请码是否存在
            if (!inviteUser) {
                return sendErrMsg(res, "该邀请码不存在", 502);
            }
            //查询该邀请码对应的用户是否非法
            let legitimatestates = inviteUser.legitimatestate;
            if (legitimatestates === 'exception' || legitimatestates === 'illegal') {
                return sendErrMsg(res, "该邀请码出现异常", 502);
            };
            //2秒防刷
            let inv = await getInviteCode(invitationcode);
            if (inv) {
                return sendErrMsg(res, "邀请过于频繁,系统已开启防刷机制", 500);
            }
            //记录该用户为异常
            let legitimatestate = "exception";
            await updateExceptionUser(invitationcode, legitimatestate);
        }
        //查询手机号是否被注册
        let user = await selectUser(username);
        if (user) {
            return sendErrMsg(res, "该手机号已经被注册,若忘记密码请找回", 502);
        }
        //校验
        validateCgi({ username, mode, invitationcode, password }, usersValidator.verificationregistered);
        //获取手机验证码缓存
        let sms = await getSmsCode(username);
        if (!sms) {
            return sendErrMsg(res, "短信验证码过期", 501);
        }
        //密码md5加密
        let now = new Date()
        let md5password: any = md5sum(`${now.getTime()}_${password}`)
        //微信授权获取openid
        let wxopenid, qqopenid;
        if (wxcode) {
            let wx = await getwxOpenId(wxcode);
            wxopenid = wx.openid;
        }
        //qq授权获取openid
        if (qqcode) {
            qqopenid = await getqqOpenId(qqcode);
        }
        //插入用户
        let obj = {
            username,
            password: md5password,
            mode,
            openid: wxopenid,
            qqcode: qqopenid,
            created: now
        }
        let registerUser = await insertUser(obj);
        //防海量邀请保存缓存
        await saveInviteCode(invitationcode, "inviting");
        //被邀请人uuid
        let inviteduuid: string = registerUser.inviteduuid
        //邀请人uuid
        let useruuid = user.useruuid
        //被邀请人奖励现金
        let award = await findSystemAward();
        let invitedawardcash = award.invitedawardcash;
        let userawardcash = award.userawardcash;
        //被邀请人奖励的积分
        let invitedawardpoints = award.invitedawardpoints;
        let userawardpoints = award.userawardpoints;
        let inviteobj = {
            inviteduuid,
            useruuid,
            invitedawardcash,
            userawardcash,
            invitedawardpoints,
            userawardpoints
        }
        //插入邀请表
        await insertInviteLog(inviteobj)
        return sendOk(res, { msg: "ok" });
    } catch (e) {
        return e.info(se, res, e);
    }
})


