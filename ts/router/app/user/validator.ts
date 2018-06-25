/**
 * 验证码模块
 * qiuweihao  
 * 2018.06.22
 */

//手机号
const phone = {
    isMobilePhone: {
        errmsg: "手机号格式错误！",
        param: ["zh-CN"]
    }
}
//验证码
const code = {
    isLength: {
        errmsg: "验证码错误",
        param: [4, 4]
    }
}

//注册入口方式
const mode = {
    isLength: {
        errmsg: "mode长度错误",
        param: [2, 6]
    }
}
//注册入口方式
const password = {
    isLength: {
        errmsg: "password长度错误",
        param: [6, 16]
    }
}
//用户基本信息校验
export const usersValidator = {
    //校验码-手机号校验
    phone: {
        username: phone
    },
    //校验码校验-手机号，验证码
    verificationcode: {
        username: phone,
        piccode:code
    },
    //手机验证码校验-手机号，手机验证码
    verificationphonecode:{
        username: phone, 
        phonecode:code
    },
    //注册-微信，qq凭证，入口方式，邀请码,密码
    verificationregistered:{
        username: phone,
        mode:mode,
        invitationcode:code,
        password:password
    }
    
}
