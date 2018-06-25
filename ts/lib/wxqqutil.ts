
import { getAsync, postAsync } from "../lib/request"
//微信开放平台参数
import {wxOpt} from "../config/wechat"
import { getAccessToken, saveAccessToken,getticket ,saveticket} from "../redis/wxshare"



/**
 * qq微信授权模块
 * qiuweihao  
 * 2018.06.25
 */



//微信code授权获取accesstoken和openid
export async function getwxOpenId(code:string) {
    let appid= wxOpt.appid;
    let secret=wxOpt.secret;
    let opt = {
        url: ` https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${secret}&code=${code}&grant_type=authorization_code`
    }
    let res = await getAsync(opt);
    res = JSON.parse(res);
    if (res){
        return res;
    }
}
//qq accesstoken授权获取openid
export async function getqqOpenId(qqcode:string) {
    let opt = {
        url: "https://graph.qq.com/oauth2.0/me?access_token=" + qqcode
    }
    let re = await getAsync(opt)
    let openid = re.substring(re.indexOf(`"openid":"`) + 10, re.lastIndexOf(`"`))
    return openid
}
export async function sendWxShare() {
    //获取缓存中token
    let access_token = await getAccessToken("access_token")
    if (!access_token) {
        access_token = await getToken()
        await saveAccessToken("access_token", access_token)
    }
    let opt1 = {
        url: `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${access_token}&type=jsapi`,
    }
    //获取缓存中的ticket
    let jsapiticket = await getticket("jsapiticket")
    if (!jsapiticket) {
        let jsticket = await postAsync(opt1)
        jsticket =  JSON.parse(jsticket)
        jsapiticket= jsticket.ticket
        await saveticket("jsapiticket", jsapiticket)
    }
    return jsapiticket
}

//生成当前时间戳
let createTimestamp = function () {
    let datetime = new Date().getTime()
    let timestam:any=datetime/1000
    return parseInt(timestam);
};

var createNonceStr = function () {
    return Math.random().toString(36).substr(2, 15);
  };
  

  
  var raw = function (args:any) {
    var keys = Object.keys(args);
    keys = keys.sort()
    var newArgs:any = [];
    keys.forEach(function (key) {
      newArgs[key.toLowerCase()] = args[key];
    });
  
    var string = '';
    for (var k in newArgs) {
      string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
  };
  
  /**
  * @synopsis 签名算法 
  *
  * @param jsapi_ticket 用于签名的 jsapi_ticket
  * @param url 用于签名的 url ，注意必须动态获取，不能 hardcode
  *
  * @returns
  */
  export async function getsign(jsapi_ticket: any, url: string) {
    let appid= wxOpt.appid
    var ret = {
        jsapi_ticket: jsapi_ticket,
        noncestr: createNonceStr(),
        timestamp: createTimestamp(),
        url: url
      };
      var string = raw(ret);
      
      // let shaObj = new jsSHA(string, "TEXT");
     let shaObj = new jsSHA("SHA-1", "TEXT");
 //let signature = shaObj.getHash('SHA-1', 'HEX');
 shaObj.update(string);
 let signature=shaObj.getHash("HEX");
      return {ret,signature,appid}
  }