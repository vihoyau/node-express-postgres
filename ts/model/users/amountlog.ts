import { DataTypes, Sequelize } from "sequelize"
import { getModel } from "../../lib/global"
import * as moment from "moment"

const modelName = "users.amountlog"

export const defineFunction = function (sequelize: Sequelize) {
    return sequelize.define(modelName, {
        uuid: {                                 // UUID
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        useruuid: DataTypes.UUID,               // 对应的用户UUID
        amount: DataTypes.FLOAT,  //金额,单位是元
        points: DataTypes.INTEGER,  //积分
        mode: DataTypes.STRING, //方式
        time: DataTypes.STRING  //时间
    }, {
            timestamps: false,
            schema: "users",
            freezeTableName: true,
            tableName: "amountlog",
        })
}

export async function insertAmountLog(obj: any) {
    let res = await getModel(modelName).create(obj)
    return res.get()
}

export async function findTodayAmount(sequelize: Sequelize, useruuid: string) {
    let [now, zeroHour] = [moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD 00:00:00')]
    let res = await sequelize.query(`
        select
            sum(amount)
        from users.amountlog a
        where a.useruuid='${useruuid}'
        and a.time>'${zeroHour}'
        and a.time<'${now}'
        `, { type: 'SELECT' })
    return parseInt(res[0].sum)
}

export async function findPointByUserUUID(sequelize: Sequelize, useruuid: string, start: number, length: number, starttime: string, endtime: string) {
    let res = await sequelize.query(`
        select a.*,u.username from users.amountlog a, users.users u
        where a.useruuid=u.uuid
        and a.time>'${starttime}'
        and a.time<'${endtime}'
        and a.points is not null
        and a.points >0
        and a.useruuid = '${useruuid}'
        order by a.time desc
        offset ${start}
        limit ${length}
    `, { type: 'select' }) as any[]
    return res
}

export async function findBalanceByUserUUID(sequelize: Sequelize, useruuid: string, start: number, length: number, starttime: string, endtime: string) {
    let res = await sequelize.query(`
        select a.*,u.username from users.amountlog a, users.users u
        where a.useruuid=u.uuid
        and a.time>'${starttime}'
        and a.time<'${endtime}'
        and a.amount is not null
        and a.amount >0
        and a.useruuid = '${useruuid}'
        order by a.time desc
        offset ${start}
        limit ${length}
    `, { type: 'select' }) as any[]
    return res
}

//按模糊时间查询积分流水
export async function getPointCountByUser(sequelize: Sequelize, useruuid: string, starttime: string, endtime: string) {
    let res = await sequelize.query(`
        select count(*) from users.amountlog a
        where a.useruuid='${useruuid}'
        and a.time>'${starttime}'
        and a.time<'${endtime}'
        and a.points is not null
        and a.points >0
    `, { type: 'SELECT' }) as any[]
    return parseInt(res[0].sum)
}
//按模糊时间查询零钱流水
export async function getBalanceCountByUser(sequelize: Sequelize, useruuid: string, starttime: string, endtime: string) {
    let res = await sequelize.query(`
        select count(*) from users.amountlog a
        where a.useruuid='${useruuid}'
        and a.time>='${starttime}'
        and a.time<='${endtime}'
        and a.amount is not null
        and a.amount >0
    `, { type: 'SELECT' }) as any[]
    return res[0].count
}
//按指定时间查询积分流水
export async function getPointCountByUserAndBytime(sequelize: Sequelize, useruuid: string, timestamps: string) {
    let res = await sequelize.query(`
        select count(*) from users.amountlog a
        where a.useruuid='${useruuid}'
        and a.time='${timestamps}'
        and a.points is not null
        and a.points >0
    `, { type: 'SELECT' }) as any[]
    return res[0].count
}
//按指定时间查询零钱流水
export async function getBalanceCountByUserAndBytime(sequelize: Sequelize, useruuid: string, timestamps: string) {
    let res = await sequelize.query(`
        select count(*) from users.amountlog a
        where a.useruuid='${useruuid}'
        and a.time='${timestamps}'
        and a.amount is not null
        and a.amount >0
    `, { type: 'SELECT' }) as any[]
    return res[0].count
}

//按照邀请查询抽奖、集道具、打赏、充值
export async function getOption(sequelize: Sequelize, commonoption: string, start: string, length: string, useruuid: string, starttime: string, endtime: string) {
    let res = await sequelize.query(`
    select a.amount,a.points,b.openid,a.time as created from users.amountlog  a,users.users_ext b,users.users c where a.mode='${commonoption}' 
    and a.useruuid=b.uuid
    and c.uuid=b.uuid
    and a.useruuid='${useruuid}'
    and a.time>='${starttime}'
    and a.time<='${endtime}' 
    offset ${start}
    limit ${length}
    `, { type: 'SELECT' }) as any[]
    return res
}

export async function getOptionpage(sequelize: Sequelize, commonoption: string, useruuid: string, starttime: string, endtime: string) {
    let res = await sequelize.query(`
    select a.amount,a.points,b.openid,c.created from users.amountlog  a,users.users_ext b,users.users c where a.mode='${commonoption}' 
    and a.useruuid=b.uuid
    and c.uuid=b.uuid
    and a.useruuid='${useruuid}'
    and a.time>='${starttime}'
    and a.time<='${endtime}' 
    `, { type: 'SELECT' }) as any[]
    return res.length
}

//按照邀请获得奖励流水记录
export async function getInvite(sequelize: Sequelize,  start: string, length: string, useruuid: string, starttime: string, endtime: string) {
    let res = await sequelize.query(`
    select DISTINCT b.phone as content,d.openid,c.amount,c.points,c.time as created
    from users.amountlog as c 
    INNER JOIN ads.invitation as a on c.useruuid = a.useruuid 
	left JOIN ads.invitation as b on a.invite=b.parentinvite 
	left JOIN users.users_ext as d on d.uuid=b.useruuid and c.useruuid=d.uuid 
	where  c.useruuid='${useruuid}'  and mode='invite'
    and c.time>='${starttime}'
    and c.time<='${endtime}' 
    offset ${start}
    limit ${length}
    `, { type: 'SELECT' }) as any[]
    return res
}
//按照邀请获得奖励流水记录
export async function getInvitepage(sequelize: Sequelize, start: string, length: string, useruuid: string, starttime: string, endtime: string) {
    let res = await sequelize.query(`
    select DISTINCT b.phone as content,d.openid,c.amount,c.points
    from users.amountlog as c 
    INNER JOIN ads.invitation as a on c.useruuid = a.useruuid 
	left JOIN ads.invitation as b on a.invite=b.parentinvite 
	left JOIN users.users_ext as d on d.uuid=b.useruuid and c.useruuid=d.uuid 
	where  c.useruuid='${useruuid}'  and mode='invite'
    and c.time>='${starttime}'
    and c.time<='${endtime}' 
    `, { type: 'SELECT' }) as any[]
    return res.length
}


//按照所有奖励流水记录
export async function getall(sequelize: Sequelize, commonoption: string, start: string, length: string, useruuid: string, starttime: string, endtime: string) {
    let res = await sequelize.query(`
    select DISTINCT c.title as content,a.amount,a.points,d.openid,e.created from users.amountlog as a 
    INNER JOIN ads.adslog as b on
    a.useruuid=b.useruuid  and a.useruuid='${useruuid}' and (a.amount>0 or a.points>0)
    INNER JOIN users.users_ext as d on d.uuid=a.useruuid
    INNER JOIN users.users as e on e.uuid=d.uuid
    INNER JOIN ads.ads as c on c.uuid=b.aduuid
    and a.time>='${starttime}'
    and a.time<='${endtime}' 
    offset ${start}
    limit ${length}
    `, { type: 'SELECT' }) as any[]
    return res
}
//按照答题获得奖励流水记录
export async function getAnswer(sequelize: Sequelize, commonoption: string, start: string, length: string, useruuid: string, starttime: string, endtime: string) {
    let res = await sequelize.query(`
    select DISTINCT b.amount,b.points,d.openid,b.time as created  from users.amountlog as b 
    INNER JOIN users.users_ext as d on d.uuid=b.useruuid
	left JOIN users.users as e on e.uuid=d.uuid
    where b.useruuid='${useruuid}' and (b.amount>0 or b.points>0)
    offset ${start}
    limit ${length}
    `, { type: 'SELECT' }) as any[]
    return res
}
//按照答题获得奖励流水记录
export async function getAnswerpage(sequelize: Sequelize, commonoption: string, useruuid: string, starttime: string, endtime: string) {
    let res = await sequelize.query(`
    select DISTINCT b.amount,b.points,d.openid,b.time as created  from users.amountlog as b 
    INNER JOIN users.users_ext as d on d.uuid=b.useruuid
	left JOIN users.users as e on e.uuid=d.uuid
    where b.useruuid='${useruuid}' and (b.amount>0 or b.points>0)
    and e.created>='${starttime}'
    and e.created<='${endtime}' 
    `, { type: 'SELECT' }) as any[]
    return res.length
}

//按照提现流水记录
export async function getWithdraw(sequelize: Sequelize, start: string, length: string, useruuid: string, starttime: string, endtime: string) {
    let res = await sequelize.query(`
    select a.amount,a.points,c.openid,a.time as created from users.amountlog a 
    INNER JOIN users.users as b on 
    b.uuid=a.useruuid
    INNER JOIN users.users_ext as c on 
    c.uuid=b.uuid
	where a.mode='withdraw' and a.useruuid='${useruuid}'
    and a.time>='${starttime}'
    and a.time<='${endtime}' 
    offset ${start}
    limit ${length}
    `, { type: 'SELECT' }) as any[]
    return res
}
//按照购买流水记录
export async function getWithdrawpage(sequelize: Sequelize, start: string, length: string, useruuid: string, starttime: string, endtime: string) {
    let res = await sequelize.query(`
    select a.amount,a.points,c.openid,a.time as created from users.amountlog a 
    INNER JOIN users.users as b on 
    b.uuid=a.useruuid
    INNER JOIN users.users_ext as c on 
    c.uuid=b.uuid
	where a.mode='withdraw' and a.useruuid='${useruuid}'
    and a.time>='${starttime}'
    and a.time<='${endtime}' 
    offset ${start}
    limit ${length}
    `, { type: 'SELECT' }) as any[]
    return res.length
}

//按照购买流水记录
export async function getorderspage(sequelize: Sequelize, useruuid: string, starttime: string, endtime: string) {
    let res = await sequelize.query(`
    select a.amount,a.points,c.openid,b.created from users.amountlog a 
    INNER JOIN users.users as b on 
    b.uuid=a.useruuid
    INNER JOIN users.users_ext as c on 
    c.uuid=b.uuid
	where a.mode='withdraw' and a.useruuid='${useruuid}'
    and a.time>='${starttime}'
    and a.time<='${endtime}' 
    `, { type: 'SELECT' }) as any[]
    return res.length
}

//按指定时间查询零钱流水 write by wyho
export async function getBalanceorpoints(sequelize: Sequelize, option: string, useruuid: string, timestamps: string) {
    let res = await sequelize.query(`
        select a.points,a.amount,a.time as created,c.openid from users.amountlog a
        where a.useruuid='${useruuid}'
        INNER JOIN users.users as b on 
        b.uuid=a.useruuid
        INNER JOIN users.users_ext as c on 
        c.uuid=b.uuid
        and a.mode='${option}'
        and a.time ='${timestamps}'
        and a.amount is not null
        and a.amount >0
    `, { type: 'SELECT' }) as any[]
    return res
}
export async function getallBalanceorpoints(sequelize: Sequelize, useruuid: string, timestamps: string) {
    let res = await sequelize.query(`
        select a.points,a.amount,a.time as created,c.openid from users.amountlog a
        where a.useruuid='${useruuid}'
        INNER JOIN users.users as b on 
        b.uuid=a.useruuid
        INNER JOIN users.users_ext as c on 
        c.uuid=b.uuid
        and a.amount is not null
        and a.amount >0
    `, { type: 'SELECT' }) as any[]
    return res
}


//按照抽奖获得奖励流水记录
export async function getlottery(sequelize: Sequelize,  start: string, length: string, useruuid: string, starttime: string, endtime: string) {
    let res = await sequelize.query(`
    select DISTINCT b.prizeinfo as content,b.balance as amount,b.point  as points,d.openid,b.created as created from users.lotterylog as b 
    INNER JOIN users.users_ext as d on d.uuid=b.useruuid
    where b.useruuid='${useruuid}' and (b.balance>0 or b.point>0)
    and b.created>='${starttime}'
    and b.created<='${endtime}' 
    offset ${start}
    limit ${length}
    `, { type: 'SELECT' }) as any[]
    return res
}

//按照抽奖获得奖励流水记录
export async function getlotterypage(sequelize: Sequelize,  useruuid: string, starttime: string, endtime: string) {
    let res = await sequelize.query(`
    select DISTINCT b.prizeinfo as content,b.balance as amount,b.point as points,d.openid,b.created as created from users.lotterylog as b 
    INNER JOIN users.users_ext as d on d.uuid=b.useruuid
    where b.useruuid='${useruuid}' and (b.balance>0 or b.point>0)
    and b.created>='${starttime}'
    and b.created<='${endtime}' 
    `, { type: 'SELECT' }) as any[]
    return res.length
}