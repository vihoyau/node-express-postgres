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
    return res[0].count
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
export async function getOption(sequelize: Sequelize,commonoption:string,start:string, length:string, useruuid: string, starttime: string, endtime: string) {
    let res = await sequelize.query(`
    select a.amount,a.point from users.amountlog  a where a.mode='${commonoption}' 
    and a.useruuid='${useruuid}'
    and a.time>='${starttime}'
    and a.time<='${endtime}' 
    order by a.time desc
    offset ${start}
    limit ${length}
    `, { type: 'SELECT' }) as any[]
    return res
}

//按照邀请获得奖励流水记录
export async function getInvite(sequelize: Sequelize,commonoption:string,start:string, length:string, useruuid: string, starttime: string, endtime: string) {
    let res = await sequelize.query(`
    select  a.phone,c.openid,d.amount,d.points  from ads.invitation as a  
    INNER JOIN ads.invitation as b on a.parentinvite=b.invite and b.useruuid='${useruuid}' 
    INNER JOIN users.users_ext as c on c.uuid=a.useruuid
    INNER JOIN users.amountlog as d on d.useruuid='${useruuid}' and d.mode='invite'
    and a.time>='${starttime}'
    and a.time<='${endtime}' 
    order by a.time desc
    offset ${start}
    limit ${length}
    `, { type: 'SELECT' }) as any[]
    return res
}
//按照答题获得奖励流水记录
export async function getAnswer(sequelize: Sequelize,commonoption:string,start:string, length:string, useruuid: string, starttime: string, endtime: string) {
    let res = await sequelize.query(`
    select c.title,a.amount,a.points from users.amountlog as a 
    INNER JOIN ads.adslog as b on
    a.useruuid=b.useruuid and a.mode='answer' and a.useruuid='${useruuid}'
    INNER JOIN ads.ads as c on c.uuid=b.aduuid
    and a.time>='${starttime}'
    and a.time<='${endtime}' 
    order by a.time desc
    offset ${start}
    limit ${length}
    `, { type: 'SELECT' }) as any[]
    return res
}
//按照提现流水记录
export async function getWithdraw(sequelize: Sequelize,start:string, length:string, useruuid: string, starttime: string, endtime: string) {
    let res = await sequelize.query(`
    select a.amount from users.amountlog a where a.mode='withdraw' and a.useruuid='${useruuid}'
    and a.time>='${starttime}'
    and a.time<='${endtime}' 
    order by a.time desc
    offset ${start}
    limit ${length}
    `, { type: 'SELECT' }) as any[]
    return res
}
