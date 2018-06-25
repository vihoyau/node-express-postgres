import logger = require("winston")
import { getRedisClientAsync } from "../lib/redispool"
const [MessagesDbOpt, openidDbOpt] = [{ db: 1 }, { db: 2 }]



export async function getSmsCode(username: string) {
    return await getRedisClientAsync(async rds => await rds.getAsync(username), MessagesDbOpt)
}

export async function saveSmsCode(username: string, content: string) {
    try {
        await getRedisClientAsync(async rds => await rds.setAsync(username, content, "ex", 60*60*3), MessagesDbOpt)
    } catch (e) {
        logger.error("saveSmsCode error", e.message)
    }
}

//获取图形校验码
export async function getCaptchaCode(username: string) {
    return await getRedisClientAsync(async rds => await rds.getAsync("Captcha" + username), MessagesDbOpt)
}

//保存验证码->redis
export async function saveCaptchaCode(username: string, content: string) {
    try {
        await getRedisClientAsync(async rds => await rds.setAsync("Captcha" + username, content, "ex", 600), MessagesDbOpt)
    } catch (e) {
        logger.error("saveCaptchaCode error", e.message)
    }
}

export async function getCaptchaCode3(username: string) {
    return await getRedisClientAsync(async rds => await rds.getAsync("passCaptchaCode" + username), MessagesDbOpt)
}


export async function saveCaptchaCode3(username: string) {
    try {
        await getRedisClientAsync(async rds => await rds.setAsync("passCaptchaCode" + username, "captcha", "ex", 600), MessagesDbOpt)
    } catch (e) {
        logger.error("saveCaptchaCode error", e.message)
    }
}

//获取邀请码状态
export async function getInviteCode(invitationcode: string) {
    return await getRedisClientAsync(async rds => await rds.getAsync("invite" + invitationcode), MessagesDbOpt)
}

//设定邀请码防刷
export async function saveInviteCode(invitationcode: string, content: string) {
    try {
        await getRedisClientAsync(async rds => 
            await rds.setAsync("invite" + invitationcode, content, "ex", 60*2), MessagesDbOpt)
    } catch (e) {
        logger.error("saveInvite error", e.message)
    }
}

export async function removeSmsCode(username: string) {
    try {
        await getRedisClientAsync(async rds => await rds.delAsync(username), MessagesDbOpt)
    } catch (e) {
        logger.error("removeSmsCode error", e.message)
    }
}

export async function removeCaptchCode(username: string) {
    try {
        await getRedisClientAsync(async rds => await rds.delAsync("Captch" + username), MessagesDbOpt)
    } catch (e) {
        logger.error("removeCaptchCode error", e.message)
    }
}

function getOpenidKey(openid: string) {
    return "openid_" + openid
}

export async function saveOpenid(openid: string) {
    await getRedisClientAsync(async rds => await rds.setAsync(getOpenidKey(openid), new Date().getTime(), "ex", 120), openidDbOpt)
}

export async function getOpenid(openid: string) {
    return await getRedisClientAsync(async rds => await rds.getAsync(getOpenidKey(openid)), openidDbOpt)
}
