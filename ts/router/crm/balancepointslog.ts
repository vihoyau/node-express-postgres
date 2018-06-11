
import { validateCgi } from "../../lib/validator"
import { checkLogin } from "../../redis/logindao"
import { balancePointLog } from "./validator"
import { sendOK, sendErrMsg } from "../../lib/response"
import { Router, Request, Response, NextFunction } from "express"
import { findPointByUserUUID, findBalanceByUserUUID,
     getPointCountByUser, getBalanceCountByUser,getOption,getInvite ,
     getAnswer,getWithdraw,getOptionpage,getAnswerpage,getInvitepage,getlottery,getlotterypage} from "../../model/users/amountlog"
export const router: Router = Router()

//获取用户的零钱积分流水
router.get('/', checkLogin, async function (req: Request, res: Response, next: NextFunction) {
    let { useruuid, start, length, starttime, endtime, type} = (req as any).query
    validateCgi({ useruuid, start, length }, balancePointLog.get)
    try {
        let recordsFiltered, logs
        if (type == 'point') {
            recordsFiltered = await getPointCountByUser(req.app.locals.sequelize, useruuid, starttime, endtime)
            logs = await findPointByUserUUID(req.app.locals.sequelize, useruuid, start, length, starttime, endtime)
        } else {
            recordsFiltered = await getBalanceCountByUser(req.app.locals.sequelize, useruuid, starttime, endtime)
            logs = await findBalanceByUserUUID(req.app.locals.sequelize, useruuid, start, length, starttime, endtime)
        }

        for (let i = 0; i < logs.length; i++) {
            switch (logs[i].mode) {
                case 'answer': logs[i].mode = '答题'; break;
                case 'invite': logs[i].mode = '邀请'; break;
                case 'lottery': logs[i].mode = '抽奖'; break;
                case 'collection': logs[i].mode = '集道具'; break;
                case 'reward': logs[i].mode = '打赏'; break;
                case 'recharge': logs[i].mode = '充值'; break;
                case 'withdraw': logs[i].mode = '提现'; break;
                default: break;
            }
        }
        return sendOK(res, { logs, recordsFiltered })
    } catch (e) {
        sendErrMsg(res, e, 500)
    }
})
//重构获取用户的零钱积分流水
router.get('/stream', checkLogin, async function (req: Request, res: Response, next: NextFunction) {
    let { useruuid, start, length, starttime, endtime,whatoption} = req.query
    validateCgi({ useruuid, start, length }, balancePointLog.get)
    //whatoption有邀请，答题，抽奖，集道具
    //option返回一个对应的选项结果
    //invite邀请';lottery抽奖'; collection集道具'; reward打赏'; recharge充值'; withdraw提现'; 
    let commonoption
    let log
    let content:string
    let recordsFiltered
    switch (whatoption) {
        case 'answer':
        log=await getAnswer(req.app.locals.sequelize,commonoption,start,length,useruuid, starttime, endtime)
        log.forEach(r => {
            r.amount = r.amount / 100
        })
        content="答题";
        recordsFiltered=await getAnswerpage(req.app.locals.sequelize,commonoption,useruuid, starttime, endtime) ;
        break;
        case 'invite':  
        log=await getInvite(req.app.locals.sequelize,start,length,useruuid, starttime, endtime) ;
        log.forEach(r => {
            r.amount = r.amount / 100
        })
        recordsFiltered=await getInvitepage(req.app.locals.sequelize,start,length,useruuid, starttime, endtime) ;
        break;
        case 'lottery': 
        commonoption="lottery"
        log=await getlottery(req.app.locals.sequelize,start,length,useruuid, starttime, endtime) ;
        content="抽奖";
        log.forEach(r => {
            r.content = (r.content).title
            r.amount = r.amount / 100
        })
        recordsFiltered=await getlotterypage(req.app.locals.sequelize,useruuid, starttime, endtime) ;
        break;
        case 'collection': 
        commonoption="collection"
        log=await getOption(req.app.locals.sequelize,commonoption,start,length,useruuid, starttime, endtime) ; 
        content="集道具";
        recordsFiltered=await getOptionpage(req.app.locals.sequelize,commonoption,useruuid, starttime, endtime) ;
        break;
        case 'reward': 
        commonoption="reward"
        log=await getOption(req.app.locals.sequelize,commonoption,start,length,useruuid, starttime, endtime) ; 
        content="打赏"
        recordsFiltered=await getOptionpage(req.app.locals.sequelize,commonoption,useruuid, starttime, endtime) ;
        break;
        case 'recharge': 
        commonoption="recharge"
        log=await getOption(req.app.locals.sequelize,commonoption,start,length,useruuid, starttime, endtime) ; 
        content="充值"
        recordsFiltered=await getOptionpage(req.app.locals.sequelize,commonoption,useruuid, starttime, endtime) ;
        break;
        case 'withdraw': 
        log=await getWithdraw(req.app.locals.sequelize,start,length,useruuid, starttime, endtime) ; 
        content="提现"
        recordsFiltered=await getOptionpage(req.app.locals.sequelize,commonoption,useruuid, starttime, endtime) ;
        break;
        default: break;
    }
    return sendOK(res, { log,recordsFiltered,content})
})